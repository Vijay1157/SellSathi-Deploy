'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Module Routes
const authRoutes = require('./modules/auth/routes/authRoutes');
const adminRoutes = require('./modules/admin/routes/adminRoutes');
const sellerRoutes = require('./modules/seller/routes/sellerRoutes');
const productRoutes = require('./modules/products/routes/productRoutes');
const orderRoutes = require('./modules/orders/routes/orderRoutes');
const consumerRoutes = require('./modules/consumer/routes/consumerRoutes');
const paymentRoutes = require('./modules/payment/routes/paymentRoutes');
const reviewRoutes = require('./modules/reviews/routes/reviewRoutes');
const shippingRoutes = require('./modules/shipping/routes/shippingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://sellsathi-frontend.onrender.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list or matches Render pattern
        if (allowedOrigins.includes(origin) || 
            /^https:\/\/sellsathi-frontend-.*\.onrender\.com$/.test(origin)) {
            return callback(null, true);
        }
        
        // Allow same-origin requests (for testing)
        if (origin === 'https://sellsathi-backend-9vnn.onrender.com') {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Security headers for Firebase Auth popups
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});


// Global Logger (Diagnostic)
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} | UID: ${req.headers['x-test-uid'] || 'NONE'}`);
    next();
});

// Domain Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/seller', sellerRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/consumer', consumerRoutes);
app.use('/payment', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/webhook', shippingRoutes); // Unified webhook path

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));

// Error Handling
app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${err.stack}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start server (simplified for production)
app.listen(PORT, () => {
    console.log(`✅ SellSathi Backend (Modular) running on port ${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
});
