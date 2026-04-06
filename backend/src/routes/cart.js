const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory cart (use Redis in production)
const carts = {};

router.get('/', protect, (req, res) => {
  const cart = carts[req.user.id] || { items: [], total: 0 };
  res.json({ success: true, cart });
});

router.post('/add', protect, async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const { productId, quantity = 1, variant } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (!carts[req.user.id]) carts[req.user.id] = { items: [], total: 0 };
    const cart = carts[req.user.id];
    const existing = cart.items.find(i => i.productId === productId);
    if (existing) { existing.quantity += quantity; }
    else {
      cart.items.push({ productId, name: product.name, emoji: product.emoji, price: product.price, quantity, variant });
    }
    cart.total = cart.items.reduce((a, b) => a + b.price * b.quantity, 0);
    res.json({ success: true, cart });
  } catch (error) { next(error); }
});

router.put('/update', protect, (req, res) => {
  const { productId, quantity } = req.body;
  if (!carts[req.user.id]) return res.status(404).json({ success: false, message: 'Cart empty' });
  const cart = carts[req.user.id];
  const item = cart.items.find(i => i.productId === productId);
  if (item) {
    if (quantity <= 0) cart.items = cart.items.filter(i => i.productId !== productId);
    else item.quantity = quantity;
  }
  cart.total = cart.items.reduce((a, b) => a + b.price * b.quantity, 0);
  res.json({ success: true, cart });
});

router.delete('/clear', protect, (req, res) => {
  carts[req.user.id] = { items: [], total: 0 };
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = router;
