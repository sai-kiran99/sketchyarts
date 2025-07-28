const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('❌ No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    console.log('✅ Token verified. User ID:', req.userId);
    next();
  } catch (err) {
    console.warn('❌ Invalid or expired token');
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
