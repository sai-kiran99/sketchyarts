const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { sendOrderStatusEmail } = require('./authController');


// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SketchyArts OTP Verification',
    html: `<h3>Your OTP is: <b>${otp}</b></h3>`,
  });
};

// Send order confirmation email
const sendOrderEmail = async (email, orderId, deliveryDate) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your SketchyArts Order Confirmation 🎉',
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order <strong>ID: ${orderId}</strong> has been placed successfully.</p>
      <p>📦 Expected delivery by: <strong>${deliveryDate}</strong></p>
      <p>We hope you enjoy your artwork! 🎨</p>
    `,
  });
};

// Register user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = new User({ email, password: hashed, otp });
  await newUser.save();
  await sendOTP(email, otp);

  res.status(201).json({ message: 'User created. OTP sent to email.' });
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  user.isVerified = true;
  user.otp = '';
  await user.save();

  res.json({ message: 'Email verified successfully' });
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isVerified) return res.status(403).json({ message: 'User not verified or does not exist' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
};

// Get Profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    name: user.name || '',
    phone: user.phone || '',
    profilePic: user.profilePic || '',
    orders: user.orders || [],
    isAdmin: user.isAdmin || false,
    address: Array.isArray(user.address) ? user.address : user.address ? [user.address] : [],
      usedCoupons: user.usedCoupons || [],
  });
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, phone, profilePic } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.profilePic = profilePic || user.profilePic;

  await user.save();
  res.json({ message: 'Profile updated' });
};

exports.addOrderToUser = async (req, res) => {
  try {
    const { items, total, status, date, address, paymentMethod, coupon } = req.body; // ✅ Added 'coupon'
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cleanItems = items.map(item => {
      const { _id, ...rest } = item;
      return rest;
    });

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const order = {
      items: cleanItems,
      total,
      date,
      status,
      address,
      paymentMethod,
      deliveryDate: deliveryDate.toDateString(),
      isCancelled: false,
    };

    user.orders.push(order);

    // ✅ Mark coupon as used if not already
    if (coupon && !user.usedCoupons.includes(coupon)) {
      user.usedCoupons.push(coupon);
    }

    await user.save();

    const orderId = user.orders[user.orders.length - 1]._id;
    await sendOrderEmail(user.email, orderId, deliveryDate.toDateString());

    res.json({ message: 'Order added and confirmation sent!' });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.orders.findIndex(order => order._id.toString() === orderId);
    if (index === -1) return res.status(404).json({ message: 'Order not found' });

    user.orders[index].isCancelled = true;
    user.orders[index].status = 'Cancelled';

    await user.save();
    await exports.sendOrderStatusEmail(user.email, user.name, orderId, 'Cancelled');
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Cancel order error:', err.message);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const index = user.orders.findIndex(order => order._id.toString() === orderId);
  if (index === -1) return res.status(404).json({ message: 'Order not found' });

  user.orders[index].status = status;
  await user.save();
    // ✅ Send Email if Delivered or Cancelled
  if (status === 'Delivered' || status === 'Cancelled') {
    await exports.sendOrderStatusEmail(user.email, user.name, orderId, status);
  }

  res.json({ message: 'Order status updated' });
};

// Save Address
exports.saveAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddress = req.body;

    if (!Array.isArray(user.address)) {
      user.address = [];
    }

    user.address.push(newAddress);
    await user.save();

    res.json({ message: 'Address saved', addressList: user.address });
  } catch (err) {
    console.error('❌ Save address error:', err.message);
    res.status(500).json({ message: 'Failed to save address' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: '✅ Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error while changing password' });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const orderId = req.params.orderId;
    user.orders = user.orders.filter(order => order._id.toString() !== orderId);
    await user.save();

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Delete order error:', err.message);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// Register Admin
exports.registerAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      phone,
      password: hashed,
      isVerified: true,
      isAdmin: true
    });

    await user.save();
    res.status(201).json({ message: '✅ Admin registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: '❌ Admin registration failed', error });
  }
};


// Send Reset OTP
exports.sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password OTP - SketchyArts',
      html: `<p>Your OTP to reset your password is <b>${otp}</b></p>`
    });

    res.json({ message: 'Reset OTP sent to email' });
  } catch (err) {
    console.error('Error sending reset OTP:', err.message);
    res.status(500).json({ message: 'Failed to send reset OTP' });
  }
};

// Verify Reset OTP
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error('Verify reset OTP error:', err.message);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password required' });

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate({ email }, { password: hashed, otp: '' });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};


// Send Order Status Email 


exports.sendOrderStatusEmail = async (to, name, orderId, status) => {
  let subject = '';
  let body = '';

  if (status === 'Delivered') {
    subject = 'Your SketchyArts Order is Delivered 🎉';
    body = `
      <h2>Hi ${name},</h2>
      <p>Your order <strong>ID: ${orderId}</strong> has been <strong>delivered</strong>.</p>
      <p>Thank you for shopping with <b>SketchyArts</b>! 🎨</p>
    `;
  } else if (status === 'Cancelled') {
    subject = 'Your SketchyArts Order was Cancelled';
    body = `
      <h2>Hi ${name},</h2>
      <p>Your order <strong>ID: ${orderId}</strong> has been <strong>cancelled</strong>.</p>
      <p>If you have any questions, feel free to reply or contact us.</p>
    `;
  }

  if (!subject) return;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: body,
  });
};
