const Product = require('../models/Product');
const Review = require('../models/Review');
const { getCache, setCache, deleteCachePattern } = require('../config/redis');

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword, category, brand, minPrice, maxPrice,
      sort = '-createdAt', page = 1, limit = 12,
      rating, badge, isFeatured,
    } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const query = { isActive: true };
    if (keyword) query.$text = { $search: keyword };
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (rating) query['rating.average'] = { $gte: Number(rating) };
    if (badge) query.badge = badge;
    if (isFeatured) query.isFeatured = true;

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)).populate('seller', 'name seller.storeName'),
      Product.countDocuments(query),
    ]);

    const response = {
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    };

    await setCache(cacheKey, response, 180);
    res.json(response);
  } catch (error) { next(error); }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name avatar seller');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.views += 1;
    await product.save({ validateBeforeSave: false });
    const reviews = await Review.find({ product: product._id }).populate('user', 'name avatar').sort('-createdAt').limit(10);
    res.json({ success: true, product, reviews });
  } catch (error) { next(error); }
};

// @desc    Create product (seller/admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    req.body.seller = req.user.id;
    const product = await Product.create(req.body);
    await deleteCachePattern('products:*');
    res.status(201).json({ success: true, product });
  } catch (error) { next(error); }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await deleteCachePattern('products:*');
    res.json({ success: true, product });
  } catch (error) { next(error); }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await product.deleteOne();
    await deleteCachePattern('products:*');
    res.json({ success: true, message: 'Product removed' });
  } catch (error) { next(error); }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const cached = await getCache('products:featured');
    if (cached) return res.json(cached);
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).sort('-rating.average');
    const response = { success: true, products };
    await setCache('products:featured', response, 600);
    res.json(response);
  } catch (error) { next(error); }
};

// @desc    Get categories with product count
// @route   GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const cached = await getCache('categories');
    if (cached) return res.json(cached);
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
    ]);
    const response = { success: true, categories };
    await setCache('categories', response, 600);
    res.json(response);
  } catch (error) { next(error); }
};
