const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

// @desc    Create a new review for an order
// @route   POST /api/reviews
// @access  Private (for buyers)
exports.createReview = async (req, res) => {
    const { orderId, rating, comment } = req.body;
    const buyerId = req.user.id;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.buyer.toString() !== buyerId) {
            return res.status(403).json({ message: 'You are not authorized to review this order.' });
        }
        
        // Prevent duplicate reviews
        const existingReview = await Review.findOne({ order: orderId, buyer: buyerId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this order.' });
        }

        const review = await Review.create({
            order: orderId,
            buyer: buyerId,
            seller: order.seller,
            rating,
            comment
        });

        // After creating the review, we should update the seller's average rating.
        const stats = await Review.aggregate([
            { $match: { seller: order.seller } },
            { $group: { _id: '$seller', avgRating: { $avg: '$rating' } } }
        ]);

        if (stats.length > 0) {
            await User.findByIdAndUpdate(order.seller, { rating: stats[0].avgRating });
        }

        res.status(201).json(review);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error while creating review.' });
    }
};