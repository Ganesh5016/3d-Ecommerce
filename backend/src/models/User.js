const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other', ''] },
  addresses: [addressSchema],
  wallet: { balance: { type: Number, default: 0 }, transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }] },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otp: { code: String, expire: Date, attempts: { type: Number, default: 0 } },
  preferences: {
    categories: [String],
    notifications: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true } },
  },
  seller: {
    storeName: String,
    storeDescription: String,
    gstNumber: String,
    bankDetails: { accountNumber: String, ifscCode: String, bankName: String },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });
};

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = { code: otp, expire: Date.now() + 10 * 60 * 1000, attempts: 0 };
  return otp;
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return token;
};

// Check if account is locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);
