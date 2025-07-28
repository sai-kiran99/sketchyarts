const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const {
  registerUser,
  loginUser,
  verifyOTP,
  getProfile,
  addOrderToUser,
  updateProfile,
  cancelOrder,
  updateOrderStatus,
  saveAddress,
  changePassword,
  deleteOrder,
  registerAdmin,
  sendResetOtp,
  verifyResetOtp,
  resetPassword
} = require('../controllers/authController');

// 🌐 Public Routes
router.post('/register', registerUser);
router.post('/verify', verifyOTP);
router.post('/login', loginUser);

// 🔐 Authenticated User Routes
router.get('/profile', verifyToken, getProfile);
router.put('/add-order', verifyToken, addOrderToUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/cancel-order', verifyToken, cancelOrder);
router.put('/update-order-status', verifyToken, updateOrderStatus);
router.put('/save-address', verifyToken, saveAddress);
router.put('/change-password', verifyToken, changePassword);
router.delete('/delete-order/:orderId', verifyToken, deleteOrder);

// 🧑‍💼 Admin
router.post('/register-admin', registerAdmin);
router.get('/admin/all-users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -otp');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// 🔁 Forgot Password Flow
router.post('/send-reset-otp', sendResetOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
