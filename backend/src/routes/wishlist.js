const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get wishlist
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price emoji images rating badge brand');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) { next(error); }
});

// Toggle wishlist
router.post('/toggle/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    let added;
    if (idx === -1) { user.wishlist.push(pid); added = true; }
    else { user.wishlist.splice(idx, 1); added = false; }
    await user.save();
    res.json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (error) { next(error); }
});

module.exports = router;
