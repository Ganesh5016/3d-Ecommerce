# LUXE — AI-Powered Premium E-Commerce Platform

<div align="center">

![LUXE Banner](https://via.placeholder.com/900x200/060612/c9a96e?text=LUXE+%E2%80%94+AI-Powered+E-Commerce)

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.2-red)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**A production-ready, full-stack luxury e-commerce platform with AI recommendations, real-time features, and microservices architecture.**

[Live Demo](#) · [API Docs](#api-endpoints) · [Report Bug](#) · [Request Feature](#)

</div>

---

## ✨ Features

### 🛍️ Core Shopping
- Product catalog with advanced filtering, search & pagination
- Shopping cart with real-time updates
- Wishlist management
- Multi-step checkout with address management
- Order tracking with live status updates (WebSockets)
- Review & rating system

### 🔐 Authentication & Security
- JWT + Refresh Token authentication
- Role-based access (Admin / Seller / Buyer)
- Email verification with OTP
- Forgot / Reset password via email
- Account lockout after failed attempts
- bcrypt password hashing
- Rate limiting & Helmet security headers

### 🧠 AI Features
- Personalized product recommendations
- Semantic AI search with typo correction
- AI chatbot with product & order assistance
- Dynamic pricing engine (AI microservice)
- Smart product tagging

### 📊 Admin Dashboard
- Real-time sales analytics & charts
- Order management with status updates
- User management (activate/suspend)
- Product CRUD with image support
- Revenue insights by category

### 💳 Payments
- Stripe integration (cards)
- UPI support ready
- Cash on Delivery
- LUXE Wallet system
- Automatic coupon codes

### ⚡ Real-Time
- Live order tracking via Socket.IO
- Real-time notifications
- Price drop & stock alerts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 18)                        │
│          Vite · TailwindCSS · Axios · Socket.IO Client          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────────────┐
│               API GATEWAY (Express.js + Socket.IO)              │
│          Rate Limiting · JWT Auth · Helmet · CORS               │
└──┬──────────────┬───────────────┬──────────────┬────────────────┘
   │              │               │              │
┌──▼───┐  ┌──────▼───┐  ┌───────▼──┐  ┌────────▼──────┐
│ Auth │  │ Products │  │  Orders  │  │   Payments    │
│ Svc  │  │   Svc    │  │   Svc    │  │  (Stripe)     │
└──┬───┘  └──────┬───┘  └───────┬──┘  └────────┬──────┘
   │              │               │              │
┌──▼──────────────▼───────────────▼──────────────▼──────┐
│                   MongoDB (Mongoose ODM)               │
│        Users · Products · Orders · Reviews             │
└───────────────────────┬────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│                Redis (Caching Layer)                   │
│     Product cache · Session · Rate limit counters      │
└────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│           AI Microservice (FastAPI + Python)           │
│   Recommendations · Semantic Search · Price Engine     │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
luxe-ecommerce/
├── 📁 backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── redis.js             # Redis connection + helpers
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, OTP, reset
│   │   │   ├── productController.js # CRUD + filtering + search
│   │   │   ├── orderController.js   # Create, track, cancel
│   │   │   └── adminController.js   # Analytics + management
│   │   ├── models/
│   │   │   ├── User.js              # User schema + JWT methods
│   │   │   ├── Product.js           # Product schema + text index
│   │   │   ├── Order.js             # Order + tracking schema
│   │   │   └── Review.js            # Review schema
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT protect + authorize
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── rateLimiter.js       # Express rate limiter
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── payments.js
│   │   │   ├── reviews.js
│   │   │   ├── wishlist.js
│   │   │   ├── cart.js
│   │   │   ├── users.js
│   │   │   ├── admin.js
│   │   │   └── ai.js
│   │   ├── utils/
│   │   │   ├── email.js             # Nodemailer helper
│   │   │   └── seed.js              # Database seeder
│   │   └── server.js                # Express + Socket.IO entry
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── 📁 frontend/
│   ├── public/
│   │   └── index.html               # HTML + Three.js CDN
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.js        # Responsive navbar + search
│   │   │   │   ├── Footer.js
│   │   │   │   └── LoadingSpinner.js
│   │   │   └── shop/
│   │   │       └── CartDrawer.js    # Slide-out cart
│   │   ├── context/
│   │   │   ├── AuthContext.js       # Global auth state
│   │   │   └── CartContext.js       # Cart state management
│   │   ├── pages/
│   │   │   ├── Home.js              # 3D hero + featured
│   │   │   ├── Login.js             # Login + demo credentials
│   │   │   ├── Register.js          # Multi-step register
│   │   │   ├── VerifyEmail.js       # OTP verification
│   │   │   ├── ForgotPassword.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── Products.js          # Catalog + filters
│   │   │   ├── ProductDetail.js     # Detail + reviews
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js          # 3-step checkout
│   │   │   ├── Orders.js
│   │   │   ├── OrderDetail.js       # Live tracking
│   │   │   ├── Profile.js
│   │   │   ├── Wishlist.js
│   │   │   └── admin/
│   │   │       ├── Dashboard.js     # Analytics + charts
│   │   │       ├── Products.js      # CRUD
│   │   │       ├── Orders.js        # Status management
│   │   │       └── Users.js         # User management
│   │   ├── utils/
│   │   │   └── api.js               # Axios client + interceptors
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js                   # Routes + providers
│   │   └── index.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── 📁 ai-service/
│   ├── main.py                      # FastAPI AI endpoints
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/yourusername/luxe-ecommerce.git
cd luxe-ecommerce

# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start everything
docker-compose up --build

# In a new terminal, seed the database
docker exec luxe_backend node src/utils/seed.js
```

Visit: http://localhost:3000

### Option 2: Manual Setup

**Prerequisites:** Node.js 20+, MongoDB 7, Redis 7, Python 3.11+

```bash
# ── Backend ──────────────────────────────────
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run seed      # Seed sample data
npm run dev       # Starts on :5000

# ── Frontend (new terminal) ──────────────────
cd frontend
cp .env.example .env
npm install
npm start         # Starts on :3000

# ── AI Service (new terminal) ────────────────
cd ai-service
pip install -r requirements.txt
python main.py    # Starts on :8000
```

---

## 🔑 Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@luxe.com         | admin123  |
| Buyer | aryan@example.com      | test1234  |
| Seller| sofia@example.com      | test1234  |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET  | `/api/auth/me` | Get current user (🔒) |
| POST | `/api/auth/logout` | Logout (🔒) |
| POST | `/api/auth/refresh-token` | Refresh JWT |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters, pagination) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/categories` | Category list |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Create (🔒 seller/admin) |
| PUT | `/api/products/:id` | Update (🔒 seller/admin) |
| DELETE | `/api/products/:id` | Delete (🔒 seller/admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (🔒) |
| GET | `/api/orders/my-orders` | My orders (🔒) |
| GET | `/api/orders/:id` | Order detail (🔒) |
| PUT | `/api/orders/:id/status` | Update status (🔒 admin) |
| PUT | `/api/orders/:id/cancel` | Cancel order (🔒) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard analytics (🔒 admin) |
| GET | `/api/admin/users` | All users (🔒 admin) |
| PUT | `/api/admin/users/:id/toggle` | Toggle user status (🔒 admin) |
| GET | `/api/admin/orders` | All orders (🔒 admin) |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/search?q=` | AI semantic search |
| GET | `/api/ai/recommendations` | Product recommendations |
| POST | `/api/ai/chat` | AI chatbot response |

---

## 🗄️ Database Schema

### User
```
name, email, password (hashed), role, avatar, phone,
addresses[], wallet, wishlist[], isEmailVerified,
otp, resetPasswordToken, loginAttempts, lockUntil,
preferences, seller{storeName, gstNumber, bankDetails}
```

### Product
```
name, slug, description, price, originalPrice, discountPercent,
category, brand, tags[], images[], emoji, stock, variants[],
rating{average, count}, seller, isFeatured, badge,
specifications[], shippingInfo, views, soldCount
```

### Order
```
orderNumber, user, items[], shippingAddress, paymentMethod,
paymentStatus, status, subtotal, shippingCost, tax,
discount, totalAmount, couponCode, tracking[],
estimatedDelivery, refundStatus
```

---

## 🌐 Deployment

### AWS EC2

```bash
# Install Docker
sudo apt update && sudo apt install -y docker.io docker-compose

# Clone & configure
git clone <repo> && cd luxe-ecommerce
# Edit .env files with production values

# Start
docker-compose -f docker-compose.yml up -d --build

# Seed DB
docker exec luxe_backend node src/utils/seed.js
```

### Environment Variables (Production)

```env
# Backend
NODE_ENV=production
MONGO_URI=mongodb+srv://...  # MongoDB Atlas
REDIS_URL=redis://...        # Redis Cloud
JWT_SECRET=<very-long-random-string>
STRIPE_SECRET_KEY=sk_live_...
EMAIL_HOST=smtp.sendgrid.net
CLIENT_URL=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 🧪 Test Accounts & Sample Data

After running `npm run seed` (or `node src/utils/seed.js`):

- **12 products** across 4 categories
- **3 users** (admin, buyer, seller)
- **1 completed order** with full tracking history
- Products include badges, ratings, specifications

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Socket.IO |
| Animations | Three.js (3D), CSS Keyframes |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB (Mongoose), Redis |
| Auth | JWT, bcryptjs, Nodemailer |
| Payments | Stripe |
| AI Service | FastAPI, NumPy, scikit-learn |
| DevOps | Docker, Docker Compose |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for the modern luxury shopper</strong><br/>
  <em>LUXE — Where AI meets luxury</em>
</div>
