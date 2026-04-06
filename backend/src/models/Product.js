const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String,
  value: String,
  price: Number,
  stock: Number,
  sku: String,
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  category: { type: String, required: true },
  subcategory: String,
  brand: String,
  tags: [String],
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  emoji: { type: String, default: '📦' },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  variants: [variantSchema],
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  badge: { type: String, enum: ['NEW', 'SALE', 'BESTSELLER', 'HOT', 'TRENDING', 'LOVED', ''] },
  specifications: [{ key: String, value: String }],
  shippingInfo: { weight: Number, dimensions: { l: Number, w: Number, h: Number }, freeShipping: { type: Boolean, default: false } },
  seoTitle: String,
  seoDescription: String,
  views: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  aiEmbedding: [Number],
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.originalPrice > 0) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });

module.exports = mongoose.model('Product', productSchema);
