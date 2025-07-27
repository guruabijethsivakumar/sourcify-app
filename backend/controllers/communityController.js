const Community = require('../models/communityModel');

// For admins to add new communities later
exports.createCommunity = async (req, res) => {
    const { name, description } = req.body;
    const community = await Community.create({ name, description });
    res.status(201).json(community);
};

// For the registration page to fetch the list
exports.getAllCommunities = async (req, res) => {
    const communities = await Community.find();
    res.json(communities);
};