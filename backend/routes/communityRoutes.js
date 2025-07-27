const express = require('express');
const router = express.Router();
const { createCommunity, getAllCommunities } = require('../controllers/communityController');

router.route('/').get(getAllCommunities).post(createCommunity); // For now, anyone can create

module.exports = router;