const express = require('express');
const router = express.Router();
const { 
    createAuction, 
    getAllAuctions, 
    getAuctionById, 
    decrementBid  // <-- ADD THIS FUNCTION
} = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAllAuctions).post(protect, createAuction);
router.route('/:id').get(getAuctionById);
router.route('/:id/decrement-bid').post(protect, decrementBid);


module.exports = router;