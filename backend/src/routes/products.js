const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts, getCategories } = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);
router.post('/', protect, authorize('seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
