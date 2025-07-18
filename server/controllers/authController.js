const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route POST /api/auth/google
exports.googleAuth = async (req, res) => {
  const { tokenId, role } = req.body; // receive role from frontend

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Invalid Google account' });
    }

    // Find existing user
    let user = await User.findOne({ email });

    // If not found, create new user with role
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true,
        role: role || 'bidder', // default to bidder if not passed
      });
    }

    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error('Google Login Error:', err);
    res.status(401).json({ message: 'Google login failed' });
  }
};
