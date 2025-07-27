const cron = require('node-cron');
const Auction = require('../models/auctionModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const { sendSms } = require('./notificationService'); // Assuming notificationService is also in 'services'

const start = (io) => {
    // This job runs every minute to check for auctions that have ended
    cron.schedule('* * * * *', async () => {
        console.log('Checking for ended auctions...');
        const now = new Date();
        
        // Find auctions that are still 'open' but their end time has passed
        const endedAuctions = await Auction.find({ 
            status: 'open', 
            auctionEndTime: { $lte: now } 
        });

        for (const auction of endedAuctions) {
            try {
                // --- ROBUSTNESS CHECK ADDED ---
                // If the auction from the DB is missing required fields, skip it and mark as failed.
                if (!auction.startPrice || !auction.currentPrice || !auction.postedBy) {
                    console.error(`Skipping corrupt auction ${auction._id}: Missing required fields.`);
                    auction.status = 'closed'; // or 'failed'
                    await auction.save({ validateBeforeSave: false }); // Save without validation to close it.
                    continue; // Move to the next auction
                }

                auction.status = 'processing'; // Mark as processing to prevent it from being picked up again
                
                // The winning bid is the first one in the sorted array (lowest price)
                const winningBid = auction.bids.length > 0 ? auction.bids[0] : null;

                if (winningBid) {
                    auction.winner = {
                        seller: winningBid.seller,
                        price: winningBid.price
                    };

                    await Order.create({
                        auction: auction._id,
                        seller: winningBid.seller,
                        buyer: auction.postedBy,
                        amount: winningBid.price,
                    });
                    
                    const buyer = await User.findById(auction.postedBy);
                    const seller = await User.findById(winningBid.seller);

                    if (buyer && seller) {
                        const buyerMessage = `Auction Won! Your requirement "${auction.title}" was won at a final price of ₹${winningBid.price}/unit. You can now proceed to payment.`;
                        const sellerMessage = `You Won! You won the bid for "${auction.title}" at ₹${winningBid.price}/unit. The order has been created and is awaiting payment from the buyer.`;

                        io.to(buyer._id.toString()).emit('notification', { message: buyerMessage });
                        io.to(seller._id.toString()).emit('notification', { message: sellerMessage });

                        sendSms(buyer.phoneNumber, buyerMessage);
                        sendSms(seller.phoneNumber, sellerMessage);
                    } else {
                        console.error(`Could not find buyer or seller for notification on auction: ${auction._id}`);
                    }
                    
                } else {
                    auction.status = 'closed';
                    const buyer = await User.findById(auction.postedBy);
                    if (buyer) {
                        const noBidMessage = `Your requirement "${auction.title}" has ended without any bids.`;
                        io.to(buyer._id.toString()).emit('notification', { message: noBidMessage });
                        sendSms(buyer.phoneNumber, noBidMessage);
                    }
                }

                await auction.save();

            } catch (err) {
                console.error(`Error processing auction ${auction._id}:`, err);
            }
        }
    });
};

module.exports = { start };