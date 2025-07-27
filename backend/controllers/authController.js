const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.registerUser = async (req, res) => {
    const { name, phoneNumber, password, role , communityId } = req.body;
    if (!name || !phoneNumber || !password || !role) return res.status(400).json({ message: 'Please add all fields' });
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ 
        name, 
        phoneNumber, 
        password: hashedPassword, 
        role,
        // Add the community if the role is buyer and ID is provided
        community: role === 'buyer' ? communityId : null
    });
    if (user) {
        res.status(201).json({ _id: user.id, name: user.name, role: user.role, token: generateToken(user._id) });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

exports.loginUser = async (req, res) => {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({ _id: user.id, name: user.name, role: user.role, token: generateToken(user._id) });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};