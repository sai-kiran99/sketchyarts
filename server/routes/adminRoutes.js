const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllOrders,
  getGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  getSaleItems,
  addSaleItem,
  deleteSaleItem,
  updateOrderStatus,
  deleteOrder,
  deleteUser,
  updateAdminProfile,
  changeAdminPassword,
  
} = require('../controllers/adminController');

const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const Gallery = require('../models/Gallery'); // ✅ Required for inline route
const { getAbout, updateAbout } = require('../controllers/adminController');
const { getAllCoupons, addCoupon, deleteCoupon } = require('../controllers/adminController');
const { updateSaleItem } = require('../controllers/adminController');
const {
  uploadSaleItemImage,
  deleteSaleItemImage
} = require('../controllers/adminController');




// USERS / ORDERS
router.get('/all-users', verifyToken, isAdmin, getAllUsers);
router.get('/all-orders', verifyToken, isAdmin, getAllOrders);
router.delete('/delete-user/:id', verifyToken, isAdmin, deleteUser);
router.delete('/delete-order/:userId/:orderIndex', verifyToken, isAdmin, deleteOrder);
router.put('/update-order-status', verifyToken, isAdmin, updateOrderStatus);
router.put('/update-admin', verifyToken, isAdmin, updateAdminProfile);
router.put('/change-password', verifyToken, isAdmin, changeAdminPassword);

// GALLERY (Admin only)
router.get('/gallery', verifyToken, isAdmin, getGalleryImages);
router.post('/gallery', verifyToken, isAdmin, addGalleryImage);
router.delete('/gallery/:id', verifyToken, isAdmin, deleteGalleryImage);

// ✅ PUT /gallery/:id – Update title/description
router.put('/gallery/:id', verifyToken, isAdmin, async (req, res) => {
  const { title } = req.body;
  const { id } = req.params;

  console.log("🟨 PUT /gallery/:id called");
  console.log("📌 Params ID:", id);
  console.log("📌 Body title:", title);

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const updated = await Gallery.findByIdAndUpdate(id, { title });
    console.log("✅ Update result:", updated);
    res.json({ message: 'Title updated successfully' });
  } catch (err) {
    console.error('❌ Failed to update gallery title:', err);
    res.status(500).json({ message: 'Failed to update title' });
  }
});

// ✅ PUBLIC route — for normal users to see gallery
router.get('/gallery-public', getGalleryImages);

//sale items
router.get('/sale-items', getSaleItems); // ✅ public for users and product detail page
router.post('/sale-items', verifyToken, isAdmin, addSaleItem);
router.delete('/sale-items/:id', verifyToken, isAdmin, deleteSaleItem);
router.put('/sale-items/:id', verifyToken, isAdmin, updateSaleItem); 
router.get('/sale-items-public', getSaleItems);
// 📸 SALE ITEM IMAGES
router.post('/sale-items/:id/images', verifyToken, isAdmin, uploadSaleItemImage); // Upload new image
router.delete('/sale-items/:id/images/:imgIndex', verifyToken, isAdmin, deleteSaleItemImage); // Delete image by index




// ABOUT PAGE
router.get('/about', getAbout);
router.post('/about', verifyToken, isAdmin, updateAbout);


// COUPONS

router.get('/coupons-public', getAllCoupons);
router.post('/coupons', verifyToken, isAdmin, addCoupon);
router.delete('/coupons/:id', verifyToken, isAdmin, deleteCoupon);
router.get('/coupons', verifyToken, isAdmin, getAllCoupons);

//settings home page 
const {
  getAllSettings,
  addNewSetting,
  deleteSetting
} = require('../controllers/adminController');

router.get('/settings', getAllSettings); // ✅ Anyone (even home page) can fetch
router.put('/settings', verifyToken, isAdmin, addNewSetting); // ✅ Admin saves new
router.delete('/settings/:id', verifyToken, isAdmin, deleteSetting); // ✅ Admin deletes old



module.exports = router;
