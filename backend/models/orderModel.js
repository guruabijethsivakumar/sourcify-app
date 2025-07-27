const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    auction: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Auction', 
        required: true 
    },
    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    buyer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending_payment', 'paid', 'delivered', 'cancelled', 'failed'], 
        default: 'pending_payment' 
    },
    paymentDeadline: { type: Date },
    deliveryDeadline: { type: Date },
    fineApplied: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);