const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

    // Validate items and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        emoji: product.emoji,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant,
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    let discount = 0;

    // Apply coupon (basic implementation)
    if (couponCode) {
      const coupons = { 'LUXE10': 0.10, 'LUXE20': 0.20, 'FIRST50': 0.50 };
      if (coupons[couponCode.toUpperCase()]) {
        discount = Math.round(subtotal * coupons[couponCode.toUpperCase()]);
      }
    }

    const totalAmount = subtotal + shippingCost + tax - discount;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      discount,
      totalAmount,
      couponCode,
      notes,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tracking: [{ status: 'pending', message: 'Order placed successfully', location: 'LUXE Warehouse' }],
    });

    // Decrement stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    // Send confirmation email
    try {
      const user = await User.findById(req.user.id);
      await sendEmail({
        to: user.email,
        subject: `LUXE Order Confirmed — #${order.orderNumber}`,
        html: `<div style="font-family:sans-serif">
          <h2 style="color:#c9a96e">Order Confirmed! 🎉</h2>
          <p>Hi ${user.name}, your order <strong>#${order.orderNumber}</strong> has been placed.</p>
          <p>Total: <strong>₹${totalAmount.toLocaleString()}</strong></p>
          <p>Estimated delivery: ${order.estimatedDelivery.toDateString()}</p>
        </div>`,
      });
    } catch (e) { }

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('order_created', { orderId: order._id, orderNumber: order.orderNumber });

    res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('items.product', 'name images emoji');
    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, message, location } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.tracking.push({ status, message: message || `Order ${status}`, location });
    if (status === 'delivered') order.deliveredAt = Date.now();
    await order.save();

    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_status_updated', { status, message, tracking: order.tracking });
    io.to(`user_${order.user}`).emit('notification', { type: 'order', message: `Your order #${order.orderNumber} is now ${status}` });

    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';
    order.tracking.push({ status: 'cancelled', message: 'Order cancelled' });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }

    // Initiate refund if paid
    if (order.paymentStatus === 'paid') {
      order.refundStatus = 'requested';
      order.refundAmount = order.totalAmount;
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) { next(error); }
};
