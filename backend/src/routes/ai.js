const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

// AI-powered search with typo tolerance
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.json({ success: true, products: [] });
    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(Number(limit));
    // Fallback regex search if no text results
    if (products.length === 0) {
      const fallback = await Product.find({
        isActive: true,
        $or: [
          { name: new RegExp(q, 'i') },
          { brand: new RegExp(q, 'i') },
          { tags: new RegExp(q, 'i') },
          { category: new RegExp(q, 'i') },
        ],
      }).limit(Number(limit));
      return res.json({ success: true, products: fallback });
    }
    res.json({ success: true, products });
  } catch (error) { next(error); }
});

// Get personalized recommendations
router.get('/recommendations', optionalAuth, async (req, res, next) => {
  try {
    const { category, limit = 8 } = req.query;
    let products;
    if (category) {
      products = await Product.find({ category, isActive: true }).sort('-rating.average -soldCount').limit(Number(limit));
    } else {
      products = await Product.find({ isActive: true, isFeatured: true }).sort('-rating.average').limit(Number(limit));
    }
    res.json({ success: true, products });
  } catch (error) { next(error); }
});

// AI Chatbot response
router.post('/chat', async (req, res, next) => {
  try {
    const { message, context = [] } = req.body;
    const lower = message.toLowerCase();
    let reply = '';
    let products = [];

    if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('best')) {
      products = await Product.find({ isActive: true, isFeatured: true }).limit(3).sort('-rating.average');
      reply = `Here are my top picks for you! 🌟 ${products.map(p => `${p.emoji} **${p.name}** (₹${p.price.toLocaleString()})`).join(', ')}. Want more details on any of these?`;
    } else if (lower.includes('new') || lower.includes('latest')) {
      products = await Product.find({ isActive: true, badge: 'NEW' }).limit(3);
      reply = `Fresh arrivals just in! ✨ ${products.map(p => `${p.emoji} ${p.name}`).join(', ')}. Shall I show you more?`;
    } else if (lower.includes('sale') || lower.includes('discount') || lower.includes('offer')) {
      products = await Product.find({ isActive: true, badge: 'SALE' }).limit(3);
      reply = `🔥 Hot deals right now: ${products.map(p => `${p.emoji} ${p.name} — save ${p.discountPercent}%`).join(', ')}!`;
    } else if (lower.includes('order') || lower.includes('track')) {
      reply = '📦 To track your order, go to **My Orders** in your account dashboard. You can also get real-time updates there!';
    } else if (lower.includes('return') || lower.includes('refund')) {
      reply = '↩️ We offer hassle-free 30-day returns! Go to your order and click "Request Return". Refunds are processed in 5-7 business days.';
    } else if (lower.includes('shipping') || lower.includes('deliver')) {
      reply = '🚚 Free shipping on orders above ₹999! Standard delivery: 5-7 days. Express: 2-3 days. Same-day available in select cities.';
    } else if (lower.includes('payment') || lower.includes('pay')) {
      reply = '💳 We accept Cards, UPI, Net Banking, Wallets, and Cash on Delivery. All transactions are 256-bit SSL encrypted!';
    } else {
      const searchProducts = await Product.find({ $text: { $search: message }, isActive: true }).limit(3);
      if (searchProducts.length > 0) {
        products = searchProducts;
        reply = `Found these for "${message}": ${products.map(p => `${p.emoji} ${p.name}`).join(', ')}. Want to explore?`;
      } else {
        reply = `I'd love to help! Try asking me about recommendations, new arrivals, orders, shipping, or returns. What can I find for you? 😊`;
      }
    }

    res.json({ success: true, reply, products });
  } catch (error) { next(error); }
});

module.exports = router;
