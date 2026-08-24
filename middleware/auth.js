/**
 * Authentication middleware
 * Checks if the user has an active session with a valid memberId.
 * Returns 401 if not authenticated.
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.memberId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized. Please login first.'
        });
    }
    next();
}

module.exports = { requireAuth };
