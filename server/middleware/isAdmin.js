const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);  // userId comes from verifyToken
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error verifying admin access' });
  }
};

module.exports = isAdmin;
