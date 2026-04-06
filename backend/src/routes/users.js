const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Update profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, dateOfBirth, gender, avatar, preferences } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, dateOfBirth, gender, avatar, preferences }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

// Change password
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ success: false, message: 'Incorrect current password' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) { next(error); }
});

// Add address
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
});

// Delete address
router.delete('/addresses/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) { next(error); }
});

module.exports = router;
