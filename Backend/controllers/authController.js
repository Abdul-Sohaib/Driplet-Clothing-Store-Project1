// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/Client/clientuser'); // Your User model
const { setAuthCookie } = require('../middleware/cookies');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password); // Assuming bcrypt or similar
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );
    console.log('Generated token:', token.substring(0, 10) + '...');
    setAuthCookie(res, token);
    res.status(200).json({ user: { id: user._id, email: user.email, name: user.name, gender: user.gender } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ message: 'Login failed' });
  }
};

module.exports = { login };