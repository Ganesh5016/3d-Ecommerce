require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const users = [
  { name: 'Admin User', email: 'admin@luxe.com', password: 'admin123', role: 'admin', isEmailVerified: true },
  { name: 'Aryan Kapoor', email: 'aryan@example.com', password: 'test1234', role: 'buyer', isEmailVerified: true },
  { name: 'Sofia Marchetti', email: 'sofia@example.com', password: 'test1234', role: 'seller', isEmailVerified: true },
];

const products = [
  { name: 'Aurora Pro Headphones', brand: 'SoundLux', category: 'electronics', emoji: '🎧', price: 18999, originalPrice: 24999, description: 'Spatial audio with AI noise cancellation. 40hr battery. Crystal-clear mics.', shortDescription: 'AI noise cancellation headphones', stock: 50, badge: 'BESTSELLER', isFeatured: true, rating: { average: 4.8, count: 2341 }, tags: ['headphones', 'audio', 'wireless', 'noise cancellation'], specifications: [{ key: 'Battery', value: '40 hours' }, { key: 'Connectivity', value: 'Bluetooth 5.3' }] },
  { name: 'Silk Noir Evening Dress', brand: 'Maison Luxe', category: 'fashion', emoji: '👗', price: 12500, originalPrice: 18000, description: 'Hand-crafted Italian silk, midnight edition. Perfect for every formal occasion.', shortDescription: 'Italian silk midnight dress', stock: 25, badge: 'NEW', isFeatured: true, rating: { average: 4.9, count: 892 }, tags: ['dress', 'silk', 'evening', 'luxury'] },
  { name: 'Crystal Gold Serum', brand: 'Aura Beauty', category: 'beauty', emoji: '✨', price: 4299, originalPrice: 5999, description: '24k gold infused anti-aging formula. 3x more effective than leading serums.', shortDescription: '24k gold anti-aging serum', stock: 120, badge: 'HOT', isFeatured: true, rating: { average: 4.7, count: 3102 }, tags: ['serum', 'skincare', 'antiaging', 'gold'] },
  { name: 'SmartWatch Pro X', brand: 'TechVault', category: 'electronics', emoji: '⌚', price: 32999, originalPrice: 41999, description: 'Health AI with sapphire crystal display. ECG, SpO2, GPS. 7-day battery.', shortDescription: 'AI health smartwatch', stock: 30, badge: 'SALE', isFeatured: true, rating: { average: 4.6, count: 1567 }, tags: ['smartwatch', 'fitness', 'health', 'gps'] },
  { name: 'Cashmere Velvet Blazer', brand: 'Atelier Mode', category: 'fashion', emoji: '🧥', price: 9800, originalPrice: 14000, description: 'Sustainable luxury cashmere blend. Tailored Italian cut. Available in 6 colors.', shortDescription: 'Sustainable cashmere blazer', stock: 40, badge: 'NEW', isFeatured: false, rating: { average: 4.8, count: 445 }, tags: ['blazer', 'cashmere', 'luxury', 'formal'] },
  { name: 'Zen Smart Diffuser', brand: 'Zen Living', category: 'home', emoji: '🕯️', price: 3499, originalPrice: 4500, description: 'Smart aromatherapy with app control. 500ml tank, 15+ hours. Whisper quiet.', shortDescription: 'App-controlled aromatherapy diffuser', stock: 85, badge: 'LOVED', isFeatured: false, rating: { average: 4.9, count: 1823 }, tags: ['diffuser', 'aromatherapy', 'smart home', 'wellness'] },
  { name: 'Optic Titanium Sunglasses', brand: 'Vista', category: 'fashion', emoji: '🕶️', price: 7200, originalPrice: 9999, description: 'Polarized titanium frame. UV400 protection. Lightweight at 18g. Italian craftsmanship.', shortDescription: 'Polarized titanium sunglasses', stock: 60, badge: 'TRENDING', isFeatured: false, rating: { average: 4.7, count: 678 }, tags: ['sunglasses', 'uv protection', 'titanium', 'summer'] },
  { name: 'Holographic Glow Palette', brand: 'Aura Beauty', category: 'beauty', emoji: '💄', price: 2899, originalPrice: 3999, description: '12 holographic pigments, vegan formula. Long-lasting 18 hours wear. Dermatologist tested.', shortDescription: 'Vegan holographic makeup palette', stock: 200, badge: 'SALE', isFeatured: false, rating: { average: 4.8, count: 4521 }, tags: ['makeup', 'palette', 'vegan', 'holographic'] },
  { name: 'Marble Coffee Table', brand: 'ArteHome', category: 'home', emoji: '🪑', price: 24500, originalPrice: 32000, description: 'Italian Carrara marble top with brushed gold legs. Elevate your living space.', shortDescription: 'Italian marble coffee table', stock: 15, badge: 'NEW', isFeatured: true, rating: { average: 4.9, count: 234 }, tags: ['furniture', 'marble', 'living room', 'luxury'] },
  { name: 'Noise-Free Earbuds Pro', brand: 'SoundLux', category: 'electronics', emoji: '🎵', price: 8999, originalPrice: 12999, description: 'True wireless with 35dB ANC. 8hr battery + 32hr case. IPX5 waterproof.', shortDescription: 'True wireless ANC earbuds', stock: 75, badge: 'HOT', isFeatured: false, rating: { average: 4.5, count: 3890 }, tags: ['earbuds', 'wireless', 'anc', 'waterproof'] },
  { name: 'Botanical Mist Perfume', brand: 'Aura Beauty', category: 'beauty', emoji: '🌸', price: 5499, originalPrice: 7000, description: 'Hand-crafted botanical blend. 100ml EDP. Top notes of jasmine and sandalwood.', shortDescription: 'Botanical eau de parfum', stock: 55, badge: '', isFeatured: false, rating: { average: 4.8, count: 1120 }, tags: ['perfume', 'fragrance', 'botanical', 'luxury'] },
  { name: 'Yoga Performance Set', brand: 'ZenActive', category: 'fashion', emoji: '🧘', price: 4200, originalPrice: 5500, description: '4-way stretch fabric. Quick-dry. Anti-odor. Includes top + leggings + bag.', shortDescription: 'Performance yoga set', stock: 90, badge: 'SALE', isFeatured: false, rating: { average: 4.6, count: 2100 }, tags: ['yoga', 'activewear', 'fitness', 'set'] },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create products with seller
    const seller = createdUsers.find(u => u.role === 'seller');
    const productData = products.map(p => ({ ...p, seller: seller._id }));
    const createdProducts = await Product.create(productData);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Create a sample order
    const buyer = createdUsers.find(u => u.role === 'buyer');
    await Order.create({
      user: buyer._id,
      items: [
        { product: createdProducts[0]._id, name: createdProducts[0].name, emoji: createdProducts[0].emoji, quantity: 1, price: createdProducts[0].price },
        { product: createdProducts[2]._id, name: createdProducts[2].name, emoji: createdProducts[2].emoji, quantity: 2, price: createdProducts[2].price },
      ],
      shippingAddress: { fullName: 'Aryan Kapoor', phone: '9876543210', street: '42 Luxury Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'delivered',
      subtotal: createdProducts[0].price + createdProducts[2].price * 2,
      shippingCost: 0,
      tax: Math.round((createdProducts[0].price + createdProducts[2].price * 2) * 0.18),
      totalAmount: createdProducts[0].price + createdProducts[2].price * 2 + Math.round((createdProducts[0].price + createdProducts[2].price * 2) * 0.18),
      tracking: [
        { status: 'confirmed', message: 'Order confirmed' },
        { status: 'shipped', message: 'Shipped from Mumbai hub', location: 'Mumbai' },
        { status: 'delivered', message: 'Delivered successfully' },
      ],
      estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(),
    });
    console.log('📋 Created sample order');

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:  admin@luxe.com / admin123');
    console.log('Buyer:  aryan@example.com / test1234');
    console.log('Seller: sofia@example.com / test1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
