const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    try {
        const verified = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'salon_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
