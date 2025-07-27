const express = require('express');
const router = express.Router();
const { getMyOrders, getBuyerDashboardStats } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-orders', protect, getMyOrders);
router.get('/buyer-stats', protect, getBuyerDashboardStats);

module.exports = router;