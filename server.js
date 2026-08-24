require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('[SERVER] Created uploads directory');
}

// Initialize database (creates DB + runs schema)
const { getDatabase } = require('./db/database');
getDatabase();

// Import routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/member');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──

// CORS — allow frontend on any origin during development
app.use(cors({
    origin: true,
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'membership-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Membership API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint — API info
app.get('/', (req, res) => {
    res.json({
        name: 'Dravida Maanavar Peravai — Membership API',
        version: '1.0.0',
        endpoints: {
            auth: {
                signup: 'POST /api/auth/signup',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                session: 'GET /api/auth/session'
            },
            member: {
                profile: 'GET /api/member/profile',
                updateProfile: 'PUT /api/member/profile',
                updatePicture: 'PUT /api/member/profile-picture',
                idCard: 'GET /api/member/id-card',
                settings: 'PUT /api/member/settings'
            },
            health: 'GET /api/health'
        }
    });
});

// ── Error handling ──
app.use((err, req, res, next) => {
    console.error('[SERVER] Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

// ── Start server ──
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║  Membership API Server                       ║
║  Running on: http://localhost:${PORT}           ║
║  Database:   SQLite (membership.db)          ║
╚══════════════════════════════════════════════╝
    `);
});

module.exports = app;
