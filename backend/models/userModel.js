const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
    rating: { type: Number, default: 5.0 },
    // Link to a community, only relevant for buyers
    community: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Community' 
    },
    location: { 
        lat: { type: Number },
        lng: { type: Number }
    },
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);