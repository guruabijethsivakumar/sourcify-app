const express = require('express');
const router = express.Router();
const { checkAdmin, getDashboardStats, getAllUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// All admin routes are protected and check for admin role
router.use(protect, checkAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);

module.exports = router;