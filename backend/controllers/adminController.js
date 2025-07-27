const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Auction = require('../models/auctionModel');

// Middleware to check if user is admin
exports.checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

exports.getDashboardStats = async (req, res) => {
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const openAuctions = await Auction.countDocuments({ status: 'open' });
    res.json({ userCount, orderCount, openAuctions });
};

exports.getAllUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
};