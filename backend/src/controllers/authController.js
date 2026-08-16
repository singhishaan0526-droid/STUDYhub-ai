const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

const signToken = promisify(jwt.sign);

const createTokenResponse = async (user, res) => {
  const token = await signToken({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '5h' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash });
    await createTokenResponse(user, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    await createTokenResponse(user, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
