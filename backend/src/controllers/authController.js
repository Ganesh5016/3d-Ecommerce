const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    wallet: user.wallet,
  };
  res.status(statusCode).json({ success: true, message, token, refreshToken, user: userData });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role === 'seller' ? 'seller' : 'buyer' });

    // Send verification email
    const otp = user.generateOTP();
    await user.save();
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your LUXE account',
        html: `<div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#c9a96e">Welcome to LUXE!</h2>
          <p>Hi ${user.name}, your verification OTP is:</p>
          <h1 style="letter-spacing:8px;color:#c9a96e">${otp}</h1>
          <p>Expires in 10 minutes.</p></div>`,
      });
    } catch (e) { console.error('Email send failed:', e.message); }

    sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.');
  } catch (error) { next(error); }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });
    if (user.isLocked) return res.status(423).json({ success: false, message: 'Account locked due to too many failed attempts. Try again later.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) { next(error); }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    if (!user.otp?.code) return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });
    if (Date.now() > user.otp.expire) return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) { next(error); }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = user.generateOTP();
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Your LUXE OTP',
      html: `<h2>Your OTP: <strong style="color:#c9a96e;letter-spacing:4px">${otp}</strong></h2><p>Expires in 10 minutes.</p>`,
    });
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) { next(error); }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const token = user.generateResetToken();
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'LUXE Password Reset',
      html: `<h2>Password Reset</h2><p>Click <a href="${resetUrl}" style="color:#c9a96e">here</a> to reset your password. Expires in 30 minutes.</p>`,
    });
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) { next(error); }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) { next(error); }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price emoji images');
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const token = user.generateToken();
    res.json({ success: true, token });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
