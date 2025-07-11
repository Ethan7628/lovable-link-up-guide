// const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header, cookie, or query param
    const token = req.header('x-auth-token') || req.cookies?.token || req.query?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            msg: 'No authentication token found',
            solution: 'Please login or provide a valid token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({
            success: false,
            msg: 'Invalid or expired token',
            solution: 'Please login again to get a new token'
        });
    }
};

module.exports.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                msg: 'Insufficient permissions',
                requiredRoles: roles,
                yourRole: req.user.role
            });
        }
        next();
    };
};