const mongoose = require('mongoose');

const auctionSchema = mongoose.Schema({
    title: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ 
        name: String, 
        quantity: String 
    }],
    status: { type: String, enum: ['open', 'processing', 'closed'], default: 'open' },
    auctionEndTime: { type: Date, required: true },
    startPrice: { type: Number, required: true }, // Starting price PER UNIT
    currentPrice: { type: Number, required: true },
    // We will need this for delivery failure logic. Let's assume a 12-hour delivery window for now.
    deliveryTimeframe: { type: Number, default: 12 }, // Time in hours for delivery after win
    location: { 
        lat: { type: Number }, 
        lng: { type: Number } 
    },
    winner: {
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        price: Number
    },
    bids: [{ // The bid history
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sellerName: String,
        price: { type: Number, required: true }, // The unit price they bid
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);