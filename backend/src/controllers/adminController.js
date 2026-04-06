const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Admin dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers, newUsersThisMonth,
      totalProducts, activeProducts,
      totalOrders, ordersThisMonth,
      revenueResult, lastMonthRevenue,
      pendingOrders, deliveredOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastRevenue > 0 ? ((totalRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : 0;

    // Monthly revenue chart (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top selling products
    const topProducts = await Product.find().sort('-soldCount').limit(5).select('name emoji price soldCount rating');

    // Category breakdown
    const categoryStats = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, newThisMonth: newUsersThisMonth },
        products: { total: totalProducts, active: activeProducts },
        orders: { total: totalOrders, thisMonth: ordersThisMonth, pending: pendingOrders, delivered: deliveredOrders },
        revenue: { total: totalRevenue, growth: revenueGrowth },
      },
      monthlyRevenue,
      topProducts,
      categoryStats,
    });
  } catch (error) { next(error); }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) { next(error); }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'}`, user });
  } catch (error) { next(error); }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total });
  } catch (error) { next(error); }
};
