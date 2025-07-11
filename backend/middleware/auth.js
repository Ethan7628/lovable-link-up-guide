const jwt = require('jsonwebtoken');

// Export auth as the main export (function)
module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// If you want to keep role-based middleware, export it separately:
module.exports.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'No user data found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        next();
    };
};
