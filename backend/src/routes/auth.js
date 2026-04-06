// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, verifyEmail, resendOTP, forgotPassword, resetPassword, getMe, logout, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
], register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);

module.exports = router;
