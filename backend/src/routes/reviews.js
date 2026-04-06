// reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res, next) => {
  try {
    const { product, rating, title, comment } = req.body;
    const existing = await Review.findOne({ product, user: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this product' });
    const review = await Review.create({ product, user: req.user.id, rating, title, comment });
    const reviews = await Review.find({ product });
    const avgRating = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { 'rating.average': avgRating.toFixed(1), 'rating.count': reviews.length });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (error) { next(error); }
});

router.get('/product/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review removed' });
  } catch (error) { next(error); }
});

module.exports = router;
