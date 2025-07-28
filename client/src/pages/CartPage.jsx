import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

const CartPage = () => {
  const { cartItems, removeFromCart } = useCart();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const deliveryCharge = 80;

  useEffect(() => {
    fetchCoupons();
    fetchUsedCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/api/admin/coupons-public');
      setAvailableCoupons(res.data);
    } catch (err) {
      console.error('Failed to fetch coupons:', err.message);
    }
  };

  const fetchUsedCoupons = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsedCoupons(res.data.usedCoupons || []);
    } catch (err) {
      console.error('Error fetching used coupons:', err.message);
    }
  };

  const applyCoupon = () => {
    const entered = coupon.trim().toUpperCase();
    const match = availableCoupons.find(c => c.code === entered);

    if (!match) {
      setMessage('❌ Invalid or expired coupon');
      return;
    }

    if (usedCoupons.includes(entered)) {
      setMessage(`❌ Coupon "${entered}" has already been used`);
      return;
    }

    setAppliedCoupon(match);
    setMessage(`✅ Coupon "${match.code}" applied!`);

    const discountAmount = match?.discount ? (totalAmount * match.discount) / 100 : 0;
    const discounted = Math.max(totalAmount - discountAmount, 0);
    const final = discounted + deliveryCharge;

    localStorage.setItem('finalTotal', JSON.stringify(final));
    localStorage.setItem('appliedCoupon', match.code);
  };

  const discount =
    appliedCoupon?.discount ? (totalAmount * appliedCoupon.discount) / 100 : 0;
  const finalTotal = Math.max(totalAmount - discount, 0) + deliveryCharge;

  // 🧠 Also store final on normal render to sync with PaymentPage
  useEffect(() => {
    localStorage.setItem('finalTotal', JSON.stringify(finalTotal));
  }, [finalTotal]);

  const filteredCoupons = availableCoupons.filter(
    (c) => !usedCoupons.includes(c.code)
  );

  return (
    <section className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold text-center mb-6 font-serif text-purple-800">🛒 Your Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">Your cart is currently empty.</p>
            <Link
              to="/arts"
              className="inline-block bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 transition"
            >
              Browse Arts
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.cartId || item.id} className="flex items-center gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId || item.id)}
                    className="text-red-500 hover:text-red-700 text-2xl"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full sm:w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-purple-300"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 rounded text-white font-medium bg-purple-700 hover:bg-purple-800 transition"
                >
                  Apply Coupon
                </button>
              </div>

              {message && (
                <div
                  className={`mt-2 text-sm px-4 py-2 rounded border ${
                    message.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-400' : 'bg-red-50 text-red-700 border-red-400'
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Suggested Coupons */}
              {filteredCoupons.length > 0 && (
                <div className="text-sm text-gray-600">
                  Try:
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filteredCoupons.map(c => (
                      <button
                        key={c._id}
                        onClick={() => setCoupon(c.code)}
                        className="px-3 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs"
                      >
                        {c.code} - {c.discount}% OFF
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-8 border-t pt-6 text-right space-y-2">
              <div className="text-gray-700 text-lg">
                Subtotal: <span className="font-semibold">₹{totalAmount.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="text-green-600 text-lg">
                  Discount: -₹{discount.toFixed(0)}
                </div>
              )}
              <div className="text-gray-700 text-lg">
                Delivery Charges: <span className="font-semibold">₹{deliveryCharge}</span>
              </div>
              <div className="text-xl font-bold text-purple-800">
                Total: ₹{finalTotal.toLocaleString()}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
              <Link
                to="/arts"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition text-center"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={() => navigate('/payment')}
                className="bg-purple-700 text-white px-6 py-2 rounded hover:bg-purple-800 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CartPage;
