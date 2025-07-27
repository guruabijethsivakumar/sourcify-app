const Order = require('../models/orderModel');
const User = require('../models/userModel');

// @desc    Get orders for the logged-in user (both as buyer and seller)
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ buyer: req.user.id }, { seller: req.user.id }]
        })
        .populate('auction', 'title')
        .populate('buyer', 'name')
        .populate('seller', 'name')
        .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get dashboard stats for a buyer
// @route   GET /api/orders/buyer-stats
// @access  Private
exports.getBuyerDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({ buyer: req.user.id });
        const pendingPayment = await Order.countDocuments({ buyer: req.user.id, status: 'pending_payment' });
        
        // Aggregate to calculate total fines for the buyer
        const fineResult = await Order.aggregate([
            { $match: { buyer: req.user._id } },
            { $group: { _id: null, totalFines: { $sum: "$fineApplied" } } }
        ]);

        const outstandingFines = fineResult.length > 0 ? fineResult[0].totalFines : 0;

        res.json({ totalOrders, pendingPayment, outstandingFines });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};