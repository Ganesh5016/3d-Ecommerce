const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reply: { text: String, date: Date, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
