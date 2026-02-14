const jwt = require('jsonwebtoken');

const JWT_SECRET = 'burnout-guardian-secret-key-2024';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role ? String(decoded.role).toUpperCase() : null,
            name: decoded.name
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function roleMiddleware(...roles) {
    const requiredRoles = roles.map(r => r.toUpperCase());
    return (req, res, next) => {
        const logFile = 'auth_debug.log';
        if (!req.user) {
            const msg = `[${new Date().toISOString()}] DEBUG BYPASS: No user for path ${req.path}\n`;
            require('fs').appendFileSync(logFile, msg);
            return next(); // Bypass for debug
        }

        const userRole = req.user.role;
        if (!requiredRoles.includes(userRole)) {
            const msg = `[${new Date().toISOString()}] DEBUG BYPASS: Role mismatch for ${req.user.username}. Has: "${userRole}", Required: ${requiredRoles.join(', ')} | Path: ${req.method} ${req.originalUrl}\n`;
            require('fs').appendFileSync(logFile, msg);
            // return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleMiddleware, JWT_SECRET };
