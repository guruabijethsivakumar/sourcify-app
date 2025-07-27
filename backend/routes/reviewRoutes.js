const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Buyers can only create reviews
router.route('/').post(protect, createReview);

module.exports = router;