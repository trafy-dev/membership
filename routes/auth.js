const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { supabase, generateMemberId } = require('../db/supabase');

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
// Register a new member and store in Supabase
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

        // Check if email already exists in Supabase
        const { data: existingUser, error: checkError } = await supabase
            .from('members')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (checkError) {
            console.error('[SUPABASE] Check error:', checkError.message);
        }

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate member ID from Supabase
        const memberId = await generateMemberId();

        // Profile picture path
        const profilePicture = `/uploads/${req.file.filename}`;

        // Insert into Supabase
        const { data: newMember, error: insertError } = await supabase
            .from('members')
            .insert([{
                member_id: memberId,
                name: name.trim(),
                father_name: father_name.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                address: address || null,
                district: district || null,
                state: state || null,
                contact_number: contact_number || null,
                blood_group: blood_group || null,
                profession: profession || null,
                is_student: is_student === 'true' || is_student === '1' || is_student === true,
                course: course || null,
                year: year || null,
                institution_name: institution_name || null,
                city: city || null,
                profile_picture: profilePicture,
                disclaimer_accepted: true
            }])
            .select()
            .single();

        if (insertError) {
            console.error('[SUPABASE] Insert error:', insertError.message);
            return res.status(500).json({
                success: false,
                message: `Database error: ${insertError.message}`
            });
        }

        // Create session
        req.session.memberId = memberId;
        req.session.memberDbId = newMember.id;
        req.session.memberName = name;

        console.log(`[AUTH] New member saved in Supabase: ${memberId} (${name})`);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                member_id: memberId,
                name,
                email,
                redirect: '/dashboard'
            }
        });
    } catch (error) {
        console.error('[AUTH] Signup error:', error);

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
// Login with email and password using Supabase
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

        // Query member from Supabase
        const { data: member, error: findError } = await supabase
            .from('members')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();

        if (findError) {
            console.error('[SUPABASE] Login query error:', findError.message);
        }

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

        console.log(`[AUTH] Member logged in from Supabase: ${member.member_id} (${member.name})`);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                member_id: member.member_id,
                name: member.name,
                email: member.email,
                redirect: '/dashboard'
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
