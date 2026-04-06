const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const connectRedis = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Connect to databases
connectDB();
connectRedis();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter.general);
app.use('/api/auth/', rateLimiter.auth);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Socket.IO real-time events
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 LUXE Server running on port ${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}\n`);
});

module.exports = { app, io };
