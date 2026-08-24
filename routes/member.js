const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { getDatabase } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { generateIdCard } = require('../utils/generateIdCard');

const router = express.Router();

// All member routes require authentication
router.use(requireAuth);

// --- Multer config for profile picture update ---
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

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================================================
// GET /api/member/profile
// Get the logged-in member's full profile (dashboard data)
// ============================================================
router.get('/profile', (req, res) => {
    try {
        const db = getDatabase();
        const member = db.prepare(
            'SELECT * FROM members WHERE member_id = ?'
        ).get(req.session.memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found.'
            });
        }

        // Remove password from response
        const { password, ...profile } = member;

        res.json({
            success: true,
            data: {
                profile,
                dashboard: {
                    profile_picture: member.profile_picture,
                    profile_info: {
                        member_id: member.member_id,
                        name: member.name,
                        father_name: member.father_name,
                        email: member.email,
                        address: member.address,
                        district: member.district,
                        state: member.state,
                        contact_number: member.contact_number,
                        blood_group: member.blood_group,
                        profession: member.profession,
                        is_student: Boolean(member.is_student),
                        course: member.course,
                        year: member.year,
                        institution_name: member.institution_name,
                        city: member.city
                    },
                    event_registration: {
                        // Placeholder — can be expanded when events feature is built
                        registered_events: [],
                        message: 'No events registered yet.'
                    },
                    member_since: member.created_at
                }
            }
        });
    } catch (error) {
        console.error('[MEMBER] Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile.'
        });
    }
});

// ============================================================
// PUT /api/member/profile
// Update profile information
// ============================================================
router.put('/profile', (req, res) => {
    try {
        const {
            name, father_name, address, district, state,
            contact_number, blood_group, profession,
            is_student, course, year, institution_name, city
        } = req.body;

        const db = getDatabase();

        const stmt = db.prepare(`
            UPDATE members SET
                name = COALESCE(?, name),
                father_name = COALESCE(?, father_name),
                address = COALESCE(?, address),
                district = COALESCE(?, district),
                state = COALESCE(?, state),
                contact_number = COALESCE(?, contact_number),
                blood_group = COALESCE(?, blood_group),
                profession = COALESCE(?, profession),
                is_student = COALESCE(?, is_student),
                course = COALESCE(?, course),
                year = COALESCE(?, year),
                institution_name = COALESCE(?, institution_name),
                city = COALESCE(?, city)
            WHERE member_id = ?
        `);

        stmt.run(
            name || null, father_name || null, address || null,
            district || null, state || null, contact_number || null,
            blood_group || null, profession || null,
            is_student !== undefined ? (is_student === 'true' || is_student === '1' ? 1 : 0) : null,
            course || null, year || null, institution_name || null,
            city || null, req.session.memberId
        );

        console.log(`[MEMBER] Profile updated: ${req.session.memberId}`);

        res.json({
            success: true,
            message: 'Profile updated successfully.'
        });
    } catch (error) {
        console.error('[MEMBER] Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile.'
        });
    }
});

// ============================================================
// PUT /api/member/profile-picture
// Update profile picture
// ============================================================
router.put('/profile-picture', upload.single('profile_picture'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided.'
            });
        }

        const profilePicture = `/uploads/${req.file.filename}`;
        const db = getDatabase();

        db.prepare(
            'UPDATE members SET profile_picture = ? WHERE member_id = ?'
        ).run(profilePicture, req.session.memberId);

        console.log(`[MEMBER] Profile picture updated: ${req.session.memberId}`);

        res.json({
            success: true,
            message: 'Profile picture updated successfully.',
            data: { profile_picture: profilePicture }
        });
    } catch (error) {
        console.error('[MEMBER] Profile picture update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile picture.'
        });
    }
});

// ============================================================
// GET /api/member/id-card
// Download membership ID card as PDF
// ============================================================
router.get('/id-card', (req, res) => {
    try {
        const db = getDatabase();
        const member = db.prepare(
            'SELECT * FROM members WHERE member_id = ?'
        ).get(req.session.memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found.'
            });
        }

        // Set PDF response headers
        const filename = `ID-Card-${member.member_id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Generate and stream the PDF
        generateIdCard(member, res);

        console.log(`[MEMBER] ID card downloaded: ${member.member_id}`);
    } catch (error) {
        console.error('[MEMBER] ID card generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating ID card.'
        });
    }
});

// ============================================================
// PUT /api/member/settings
// Update settings (password change)
// ============================================================
router.put('/settings', async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required.'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.'
            });
        }

        const db = getDatabase();
        const member = db.prepare(
            'SELECT password FROM members WHERE member_id = ?'
        ).get(req.session.memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found.'
            });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(current_password, member.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(new_password, 10);
        db.prepare(
            'UPDATE members SET password = ? WHERE member_id = ?'
        ).run(hashedPassword, req.session.memberId);

        console.log(`[MEMBER] Password changed: ${req.session.memberId}`);

        res.json({
            success: true,
            message: 'Password updated successfully.'
        });
    } catch (error) {
        console.error('[MEMBER] Settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings.'
        });
    }
});

module.exports = router;
