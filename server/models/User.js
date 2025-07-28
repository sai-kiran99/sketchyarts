const mongoose = require('mongoose');

// ✅ Define AddressSchema
const AddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  fullAddress: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: false });

// ✅ Define order item schema
const OrderItemSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String
}, { _id: false });

// ✅ Define order schema
const OrderSchema = new mongoose.Schema({
  items: [OrderItemSchema],
  total: Number,
  status: String,
  date: String,
  paymentMethod: String,
  address: AddressSchema,
  deliveryDate: String,
  isCancelled: {
    type: Boolean,
    default: false
  }
});

// ✅ Main user schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: String,
  isVerified: { type: Boolean, default: false },
  name: String,
  phone: String,
  profilePic: String,
  isAdmin: { type: Boolean, default: false },
  address: [AddressSchema],
  orders: [OrderSchema],

  // ✅ New field for coupon tracking
  usedCoupons: {
    type: [String],
    default: [],
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
