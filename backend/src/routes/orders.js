const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
