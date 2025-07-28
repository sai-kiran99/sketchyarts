const User = require('../models/User');
const Gallery = require('../models/Gallery');
const ArtForSale = require('../models/ArtsForSale');
const bcrypt = require('bcryptjs');
const About = require('../models/About');
const nodemailer = require('nodemailer');
const Coupon = require('../models/Coupon');
const Setting = require('../models/Setting');


// ========== USERS ==========
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password -otp');
  res.json(users);
};

// ========== ORDERS ==========
exports.getAllOrders = async (req, res) => {
  try {
    const users = await User.find({}, 'email name orders').lean();
    const allOrders = [];

    users.forEach(user => {
      user.orders.forEach(order => {
        allOrders.push({
          userId: user._id,
          userName: user.name || 'No name',
          userEmail: user.email,
          ...order
        });
      });
    });

    res.json(allOrders.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.deleteOrder = async (req, res) => {
  const { userId, orderIndex } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.orders.splice(orderIndex, 1);
    await user.save();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { userId, index, newStatus } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || !user.orders[index]) {
      return res.status(404).json({ message: 'Order not found' });
    }
    user.orders[index].status = newStatus;
    await user.save();
    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// ========== ADMIN PROFILE ==========
exports.updateAdminProfile = async (req, res) => {
  const { name, phone, photo } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.photo = photo || user.photo;
    await user.save();

    res.json({ message: 'Admin profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update admin' });
  }
};

// ========== CHANGE ADMIN PASSWORD ==========
exports.changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await User.findById(req.userId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// ========== GALLERY ==========
// ========== GALLERY ==========
exports.getGalleryImages = async (req, res) => {
  const images = await Gallery.find();
  res.json(images);
};

exports.addGalleryImage = async (req, res) => {
  const { url, title } = req.body;
  if (!url || !title) return res.status(400).json({ message: 'Missing fields' });

  const img = new Gallery({ url, title });
  await img.save();
  res.json({ message: 'Image added', image: img });
};


exports.deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
  await Gallery.findByIdAndDelete(id);
  res.json({ message: 'Image deleted' });
};

// ========== SALE ITEMS ==========
// GET
exports.getSaleItems = async (req, res) => {
  const items = await ArtForSale.find();
  res.json(items);
};

// POST
exports.addSaleItem = async (req, res) => {
  const { title, price, offer, images, description, details } = req.body;

  if (!title || !price || !images || !images.length) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const item = new ArtForSale({
    title,
    price,
    offer: offer || 0,
    images,
    description: description || 'No description',
    details: details || 'No details'
  });

  try {
    await item.save();
    res.json({ message: 'Sale item added', item });
  } catch (err) {
    console.error('❌ Failed to save sale item:', err);
    res.status(500).json({ message: 'Failed to save sale item' });
  }
};



// DELETE
exports.deleteSaleItem = async (req, res) => {
  await ArtForSale.findByIdAndDelete(req.params.id);
  res.json({ message: 'Sale item deleted' });
};
// ========== UPDATE SALE ITEM ==========
exports.updateSaleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ArtForSale.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating sale item:', err);
    res.status(500).json({ message: 'Failed to update sale item' });
  }
};






// GET about content
exports.getAbout = async (req, res) => {
  const about = await About.findOne();
  res.json(about);
};

// UPDATE about content
exports.updateAbout = async (req, res) => {
  const { photo, description } = req.body;
  if (!photo || !description) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  let about = await About.findOne();
  if (about) {
    about.photo = photo;
    about.description = description;
    await about.save();
  } else {
    about = await About.create({ photo, description });
  }

  res.json({ message: 'About info updated', about });
};

// ========== FORGOT PASSWORD FLOW ==========
let otpStore = {}; // Simple in-memory OTP store (use Redis for production)

// SEND RESET OTP
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sketchyarts.online@gmail.com',
        pass: 'your-app-password', // Use App Password here
      },
    });

    await transporter.sendMail({
      from: 'SketchyArts <sketchyarts.online@gmail.com>',
      to: email,
      subject: 'SketchyArts Password Reset OTP',
      html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
    });

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// VERIFY RESET OTP
exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  res.json({ message: 'OTP verified' });
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    delete otpStore[email];
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// GET all coupons
exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

// ADD coupon
exports.addCoupon = async (req, res) => {
  const { code, discount } = req.body;

  if (!code || !discount) return res.status(400).json({ message: 'Code and discount required' });

  const existing = await Coupon.findOne({ code });
  if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

  const coupon = new Coupon({ code, discount });
  await coupon.save();
  res.json({ message: 'Coupon added', coupon });
};

// DELETE coupon
exports.deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
};

exports.getSettings = async (req, res) => {
  const settings = await Setting.findOne();
  res.json(settings);
};

//setting admin home page

// GET all saved homepage settings (history)
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ createdAt: -1 });
    res.json(settings);
  } catch (err) {
    console.error('Failed to fetch settings:', err.message);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

// SAVE a new setting (admin can create multiple)
exports.addNewSetting = async (req, res) => {
  const { marqueeText, showMarquee, popupMessage, showPopup } = req.body;

  if (!marqueeText && !popupMessage) {
    return res.status(400).json({ message: 'At least one of marquee or popup is required' });
  }

  try {
    const newSetting = new Setting({ marqueeText, showMarquee, popupMessage, showPopup });
    await newSetting.save();
    res.status(201).json({ message: '✅ Setting saved!', setting: newSetting });
  } catch (err) {
    console.error('❌ Failed to save setting:', err.message);
    res.status(500).json({ message: 'Failed to save setting' });
  }
};

// DELETE any specific setting
exports.deleteSetting = async (req, res) => {
  try {
    await Setting.findByIdAndDelete(req.params.id);
    res.json({ message: '🗑️ Setting deleted' });
  } catch (err) {
    console.error('❌ Failed to delete setting:', err.message);
    res.status(500).json({ message: 'Failed to delete setting' });
  }
};
// Upload new image to a specific sale item
// server/controllers/adminController.js
exports.uploadSaleItemImage = async (req, res) => {
  const { id } = req.params;
  const { url } = req.body; // ✅ was imageUrl earlier

  try {
    const item = await ArtForSale.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.images.push(url); // ✅ ensure url is pushed
    await item.save();

    res.json({ message: 'Image added', images: item.images });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};


// DELETE image from specific sale item by index
exports.deleteSaleItemImage = async (req, res) => {
  const { id, imgIndex } = req.params;

  try {
    const item = await ArtForSale.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (!item.images || item.images.length <= imgIndex) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    item.images.splice(imgIndex, 1);
    await item.save();

    res.json({ message: 'Image deleted', images: item.images });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: 'Failed to delete image' });
  }
};


// ========== UPDATE ORDER STATUS ==========

const { sendOrderStatusEmail } = require('./authController');

exports.updateOrderStatus = async (req, res) => {
  const { userId, index, newStatus } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.orders[index]) return res.status(404).json({ message: 'Order not found' });

    user.orders[index].status = newStatus;
    await user.save();

    if (['Delivered', 'Cancelled'].includes(newStatus)) {
      const orderId = user.orders[index]._id;
      await sendOrderStatusEmail(user.email, user.name, orderId, newStatus);
    }

    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Failed to update order status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
