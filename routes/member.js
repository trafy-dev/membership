const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { supabase } = require('../db/supabase');
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
// Get the logged-in member's full profile from Supabase
// ============================================================
router.get('/profile', async (req, res) => {
    try {
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('member_id', req.session.memberId)
            .maybeSingle();

        if (error || !member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in Supabase.'
            });
        }

        // Remove password hash from response
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
            message: 'Error fetching profile from Supabase.'
        });
    }
});

// ============================================================
// PUT /api/member/profile
// Update profile information in Supabase
// ============================================================
router.put('/profile', async (req, res) => {
    try {
        const {
            name, father_name, address, district, state,
            contact_number, blood_group, profession,
            is_student, course, year, institution_name, city
        } = req.body;

        const updatePayload = {};
        if (name !== undefined) updatePayload.name = name;
        if (father_name !== undefined) updatePayload.father_name = father_name;
        if (address !== undefined) updatePayload.address = address;
        if (district !== undefined) updatePayload.district = district;
        if (state !== undefined) updatePayload.state = state;
        if (contact_number !== undefined) updatePayload.contact_number = contact_number;
        if (blood_group !== undefined) updatePayload.blood_group = blood_group;
        if (profession !== undefined) updatePayload.profession = profession;
        if (is_student !== undefined) updatePayload.is_student = is_student === 'true' || is_student === '1' || is_student === true;
        if (course !== undefined) updatePayload.course = course;
        if (year !== undefined) updatePayload.year = year;
        if (institution_name !== undefined) updatePayload.institution_name = institution_name;
        if (city !== undefined) updatePayload.city = city;

        const { error } = await supabase
            .from('members')
            .update(updatePayload)
            .eq('member_id', req.session.memberId);

        if (error) {
            console.error('[MEMBER] Supabase update error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile in database.'
            });
        }

        console.log(`[MEMBER] Profile updated in Supabase: ${req.session.memberId}`);

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
// Update profile picture in Supabase
// ============================================================
router.put('/profile-picture', upload.single('profile_picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided.'
            });
        }

        const profilePicture = `/uploads/${req.file.filename}`;

        const { error } = await supabase
            .from('members')
            .update({ profile_picture: profilePicture })
            .eq('member_id', req.session.memberId);

        if (error) {
            console.error('[MEMBER] Supabase photo update error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error updating photo in database.'
            });
        }

        console.log(`[MEMBER] Profile picture updated in Supabase: ${req.session.memberId}`);

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
router.get('/id-card', async (req, res) => {
    try {
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('member_id', req.session.memberId)
            .maybeSingle();

        if (error || !member) {
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

        console.log(`[MEMBER] ID card downloaded from Supabase data: ${member.member_id}`);
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
// Update password in Supabase
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

        const { data: member, error: findError } = await supabase
            .from('members')
            .select('password')
            .eq('member_id', req.session.memberId)
            .maybeSingle();

        if (findError || !member) {
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

        // Hash new password and update in Supabase
        const hashedPassword = await bcrypt.hash(new_password, 10);
        const { error: updateError } = await supabase
            .from('members')
            .update({ password: hashedPassword })
            .eq('member_id', req.session.memberId);

        if (updateError) {
            return res.status(500).json({
                success: false,
                message: 'Error updating password in database.'
            });
        }

        console.log(`[MEMBER] Password changed in Supabase: ${req.session.memberId}`);

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
