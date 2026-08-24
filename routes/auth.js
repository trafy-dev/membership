const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { getDatabase, generateMemberId } = require('../db/database');

const router = express.Router();

// --- Multer config for profile picture upload ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ============================================================
// POST /api/auth/signup
// Register a new member with profile picture upload
// ============================================================
router.post('/signup', upload.single('profile_picture'), async (req, res) => {
    try {
        const {
            name,
            father_name,
            email,
            password,
            address,
            district,
            state,
            contact_number,
            blood_group,
            profession,
            is_student,
            course,
            year,
            institution_name,
            city,
            disclaimer_accepted
        } = req.body;

        // --- Validation ---
        if (!name || !father_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, father name, email, and password are required.'
            });
        }

        if (!disclaimer_accepted || disclaimer_accepted === 'false' || disclaimer_accepted === '0') {
            return res.status(400).json({
                success: false,
                message: 'You must accept the disclaimer to register.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Profile picture is required.'
            });
        }

        const db = getDatabase();

        // Check if email already exists
        const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate member ID
        const memberId = generateMemberId();

        // Profile picture path (relative for serving)
        const profilePicture = `/uploads/${req.file.filename}`;

        // Insert into database
        const stmt = db.prepare(`
            INSERT INTO members (
                member_id, name, father_name, email, password,
                address, district, state, contact_number, blood_group,
                profession, is_student, course, year, institution_name,
                city, profile_picture, disclaimer_accepted
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?
            )
        `);

        const result = stmt.run(
            memberId, name, father_name, email, hashedPassword,
            address || null, district || null, state || null, contact_number || null, blood_group || null,
            profession || null, is_student === 'true' || is_student === '1' ? 1 : 0,
            course || null, year || null, institution_name || null,
            city || null, profilePicture, 1
        );

        // Create session
        req.session.memberId = memberId;
        req.session.memberDbId = result.lastInsertRowid;
        req.session.memberName = name;

        console.log(`[AUTH] New member registered: ${memberId} (${name})`);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                member_id: memberId,
                name,
                email,
                redirect: '/api/member/profile'
            }
        });
    } catch (error) {
        console.error('[AUTH] Signup error:', error);

        // Handle multer errors
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Profile picture must be under 5MB.'
                });
            }
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during registration.'
        });
    }
});

// ============================================================
// POST /api/auth/login
// Login with email and password
// ============================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const db = getDatabase();
        const member = db.prepare('SELECT * FROM members WHERE email = ?').get(email);

        if (!member) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const passwordMatch = await bcrypt.compare(password, member.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Create session
        req.session.memberId = member.member_id;
        req.session.memberDbId = member.id;
        req.session.memberName = member.name;

        console.log(`[AUTH] Member logged in: ${member.member_id} (${member.name})`);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                member_id: member.member_id,
                name: member.name,
                email: member.email,
                redirect: '/api/member/profile'
            }
        });
    } catch (error) {
        console.error('[AUTH] Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login.'
        });
    }
});

// ============================================================
// POST /api/auth/logout
// Destroy session
// ============================================================
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('[AUTH] Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error during logout.'
            });
        }
        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});

// ============================================================
// GET /api/auth/session
// Check if user is logged in
// ============================================================
router.get('/session', (req, res) => {
    if (req.session && req.session.memberId) {
        res.json({
            success: true,
            authenticated: true,
            data: {
                member_id: req.session.memberId,
                name: req.session.memberName
            }
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

module.exports = router;
