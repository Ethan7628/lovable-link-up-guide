
const jwt = require('jsonwebtoken');

// Main authentication middleware
const auth = function (req, res, next) {
    console.log('🔐 Auth middleware triggered for:', req.path);
    
    // Get token from multiple sources
    const headerToken = req.header('x-auth-token');
    const cookieToken = req.cookies?.token;
    const queryToken = req.query?.token;
    const bearerToken = req.header('authorization')?.replace('Bearer ', '');
    
    const token = headerToken || cookieToken || queryToken || bearerToken;
    
    console.log('🔍 Token sources check:');
    console.log('  - Header (x-auth-token):', headerToken ? 'present' : 'missing');
    console.log('  - Cookie:', cookieToken ? 'present' : 'missing');
    console.log('  - Query param:', queryToken ? 'present' : 'missing');
    console.log('  - Bearer token:', bearerToken ? 'present' : 'missing');
    console.log('  - Final token:', token ? 'found' : 'not found');

    if (!token) {
        console.log('❌ No authentication token found');
        return res.status(401).json({
            success: false,
            msg: 'No authentication token found',
            solution: 'Please login or provide a valid token in x-auth-token header',
            timestamp: new Date().toISOString()
        });
    }

    try {
        console.log('🔓 Attempting to verify token...');
        
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET not configured');
            return res.status(500).json({
                success: false,
                msg: 'Server configuration error',
                solution: 'JWT_SECRET environment variable not set'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully for user:', decoded.id);
        console.log('👤 User role:', decoded.role);
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ JWT Verification Error:', err.message);
        console.error('Token that failed:', token.substring(0, 20) + '...');
        
        let errorMessage = 'Invalid or expired token';
        let solution = 'Please login again to get a new token';
        
        if (err.name === 'TokenExpiredError') {
            errorMessage = 'Token has expired';
            solution = 'Please login again to refresh your token';
        } else if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Malformed token';
            solution = 'Please login again to get a valid token';
        }
        
        res.status(401).json({
            success: false,
            msg: errorMessage,
            solution: solution,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
};

// Role-based authorization middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        console.log('🎭 Role check middleware triggered');
        console.log('Required roles:', roles);
        console.log('User role:', req.user?.role);
        
        if (!req.user) {
            console.log('❌ No user in request - auth middleware not called first');
            return res.status(401).json({ 
                msg: 'Unauthorized - no user data',
                solution: 'Make sure auth middleware is called before role check'
            });
        }
        
        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(userRole)) {
            console.log(`❌ Access denied - user role '${userRole}' not in allowed roles:`, allowedRoles);
            return res.status(403).json({
                msg: 'Insufficient permissions',
                requiredRoles: allowedRoles,
                yourRole: userRole,
                solution: `This endpoint requires one of these roles: ${allowedRoles.join(', ')}`
            });
        }
        
        console.log(`✅ Role check passed for user role: ${userRole}`);
        next();
    };
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = function (req, res, next) {
    const token = req.header('x-auth-token') || req.cookies?.token || req.query?.token;
    
    if (!token) {
        console.log('ℹ️ Optional auth - no token provided, continuing without user');
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('✅ Optional auth - token verified for user:', decoded.id);
    } catch (err) {
        console.log('⚠️ Optional auth - invalid token, continuing without user:', err.message);
    }
    
    next();
};

module.exports = auth;
module.exports.requireRole = requireRole;
module.exports.optionalAuth = optionalAuth;
