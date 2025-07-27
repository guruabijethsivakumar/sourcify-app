const Auction = require('../models/auctionModel.js');

exports.createAuction = async (req, res) => {
    const { title, products, hours, lat, lng, startPrice } = req.body;
    if (!startPrice) {
        return res.status(400).json({ message: 'A starting price per unit is required.' });
    }
    const auctionEndTime = new Date(Date.now() + Number(hours) * 60 * 60 * 1000);
    const auction = await Auction.create({ 
        title, 
        products, 
        auctionEndTime, 
        postedBy: req.user.id, 
        location: { lat, lng },
        startPrice: Number(startPrice),
        currentPrice: Number(startPrice) // Initially, current price is the start price
    });
    res.status(201).json(auction);
};

exports.getAllAuctions = async (req, res) => {
    const auctions = await Auction.find({ status: 'open' }).populate('postedBy', 'name').sort({ createdAt: -1 });
    res.json(auctions);
};

exports.getAuctionById = async (req, res) => {
    const auction = await Auction.findById(req.params.id).populate('postedBy', 'name');
    if (auction) res.json(auction); else res.status(404).json({ message: 'Auction not found' });
};

exports.decrementBid = async (req, res) => {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'open') return res.status(400).json({ message: 'Auction is not open for bidding.' });

    // Decrement by 10
    const newPrice = auction.currentPrice - 5;
    
    // --- VALIDATION ADDED ---
    // Prevent the bid from going to 0 or below
    if (newPrice < 1) {
        return res.status(400).json({ message: 'The bid cannot go any lower.' });
    }
    
    // Create the new bid record
    const newBid = { 
        seller: req.user.id, 
        sellerName: req.user.name, 
        price: newPrice 
    };

    // Update the auction
    auction.currentPrice = newPrice;
    auction.bids.unshift(newBid); // Add to the beginning of the array
    await auction.save();

    // Notify everyone in the auction room about the new price
    req.io.to(auction._id.toString()).emit('bid_update', {
        currentPrice: auction.currentPrice,
        bids: auction.bids
    });
    
    res.status(200).json({ message: 'Bid placed successfully', currentPrice: auction.currentPrice });
};