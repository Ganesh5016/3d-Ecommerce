const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  emoji: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  variant: { name: String, value: String },
});

const trackingSchema = new mongoose.Schema({
  status: String,
  message: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String, phone: String, street: String,
    city: String, state: String, pincode: String, country: String,
  },
  paymentMethod: { type: String, enum: ['card', 'upi', 'wallet', 'cod', 'stripe'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: Number,
  couponCode: String,
  tracking: [trackingSchema],
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelReason: String,
  refundAmount: Number,
  refundStatus: { type: String, enum: ['none', 'requested', 'processing', 'completed'], default: 'none' },
  invoiceUrl: String,
  notes: String,
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `LX${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
