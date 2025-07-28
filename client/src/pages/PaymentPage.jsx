import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
//import axios from 'axios';
import axios from '../axiosInstance';
import Swal from 'sweetalert2';
import '../Main.css';

const PaymentPage = () => {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errors, setErrors] = useState({ upi: '', card: '' });
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', fullAddress: '', city: '', state: '', pincode: ''
  });

  const { cartItems, clearCart } = useCart();
  const [finalTotal, setFinalTotal] = useState(0);
  const deliveryCharge = 80;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const saved = Array.isArray(res.data.address) ? res.data.address : [];
      setAddresses(saved);
      if (saved.length > 0) setSelectedAddress(saved[0]);
    });

    const stored = localStorage.getItem('finalTotal');
    if (stored) setFinalTotal(JSON.parse(stored));
  }, [cartItems, navigate]);

  const deliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toDateString();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + '/' + digits.slice(2, 4);
  };

  const validateCard = () => {
    let cardError = '';
    if (!/^[0-9]{16}$/.test(card.number)) {
      cardError = 'Card number must be 16 digits';
    } else if (!/^[0-9]{2}\/[0-9]{2}$/.test(card.expiry)) {
      cardError = 'Expiry must be in MM/YY format';
    } else if (!/^[0-9]{3}$/.test(card.cvv)) {
      cardError = 'CVV must be 3 digits';
    }
    setErrors((prev) => ({ ...prev, card: cardError }));
    return !cardError;
  };

  const validateInputs = () => {
    if (!selectedAddress) {
      Swal.fire('Error', 'Please select a delivery address', 'error');
      return false;
    }
    if (method === 'upi') {
      if (!upiId.trim()) {
        setErrors((prev) => ({ ...prev, upi: 'Enter UPI ID' }));
        return false;
      } else {
        setErrors((prev) => ({ ...prev, upi: '' }));
      }
    }
    if (method === 'card') {
      const { number, name, expiry, cvv } = card;
      if (!number || !name || !expiry || !cvv || !validateCard()) {
        setErrors((prev) => ({ ...prev, card: 'Enter valid card details' }));
        return false;
      }
    }
    return true;
  };

  const placeOrder = async (status = 'Order Placed') => {
    const token = localStorage.getItem('token');
    if (!token || isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      await axios.put(
        '/api/auth/add-order',
        {
          items: cartItems.map(({ _id, id, ...item }) => item),
          total: finalTotal,
          status,
          date: new Date().toISOString(),
          address: selectedAddress,
          paymentMethod: method.toUpperCase(),
           coupon: localStorage.getItem('appliedCoupon') || ''
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      clearCart();
      localStorage.removeItem('finalTotal');
       localStorage.removeItem('appliedCoupon'); 

      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: `Delivery by ${deliveryDate()}`,
        confirmButtonText: 'Go to My Orders',
        confirmButtonColor: '#9333ea',
      }).then(() => {
        navigate('/dashboard#myorders');
      });
    } catch {
      Swal.fire('Error', '❌ Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleConfirm = () => {
    if (validateInputs()) {
      placeOrder(method === 'cod' ? 'Order Placed - COD' : 'Order Placed - Paid');
    }
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const editAddress = (index) => {
    setNewAddress(addresses[index]);
    setEditingIndex(index);
    setShowAddressForm(true);
  };

  const deleteAddress = async (index) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const updated = addresses.filter((_, i) => i !== index);
      await axios.put('/api/auth/save-address', updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(updated);
      if (selectedAddress === addresses[index]) {
        setSelectedAddress(updated[0] || null);
      }
    } catch {
      Swal.fire('Error', '❌ Failed to delete address', 'error');
    }
  };

  const saveNewAddress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const { name, phone, fullAddress, city, state, pincode } = newAddress;
    if (!name || !phone || !fullAddress || !city || !state || !pincode) {
      return Swal.fire('Error', 'Please fill all fields', 'error');
    }

    try {
      const res = await axios.put('/api/auth/save-address', newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data.addressList);
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      setEditingIndex(null);
    } catch {
      Swal.fire('Error', '❌ Failed to save address', 'error');
    }
  };

  return (
    <section className="min-h-screen px-4 py-10 bg-gradient-to-br from-purple-50 to-pink-50 fade-in">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-3xl font-bold text-center text-purple-800">🧾 Payment</h2>
      

{/* 🔴 Important Notice for Users */}
<div className="bg-red-100 border border-red-400 text-red-800 px-6 py-5 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-3">⚠️ Payment Notice</h2>
  <p className="mb-3">
    <strong>Card, UPI, and Cash on Delivery (COD) are currently not available.</strong> <br />
    Please make the payment through one of the following apps:
  </p>

  <ul className="list-disc list-inside mb-3 font-medium">
    <li>📲 Paytm</li>
    <li>📲 Google Pay (GPay)</li>
    <li>📲 PhonePe</li>
  </ul>

  <div className="mb-3">
    <p>
      <strong>Send to:</strong> 9182063610<br />
      <strong>Name:</strong> Kuntala Sai Kiran Goud
    </p>
  </div>

  <p className="mb-4 text-sm font-medium">
    💬 Before sending the amount, please contact us on WhatsApp or Instagram for confirmation.
  </p>

  <div className="flex gap-4">
    <a
      href="https://wa.me/9182063610"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition shadow"
    >
      WhatsApp Us
    </a>
    <a
      href="https://instagram.com/sketckyarts._"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full transition shadow"
    >
      DM on Instagram
    </a>
  </div>
</div>


        {/* Address Section */}
        <div className="bg-gray-100 rounded p-4 shadow space-y-2">
          <p className="text-purple-700 font-semibold">📍 Delivery Address</p>
          {addresses.map((addr, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border text-sm">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="selectedAddress"
                  checked={selectedAddress === addr}
                  onChange={() => setSelectedAddress(addr)}
                  className="mr-2"
                />
                <span>
                  <strong>{addr.name}</strong>, {addr.phone}<br />
                  {addr.fullAddress}, {addr.city}, {addr.state} - {addr.pincode}
                </span>
              </label>
              <div className="flex flex-col gap-1 ml-2">
                <button onClick={() => editAddress(idx)} className="text-blue-600 text-xs underline">Edit</button>
                <button onClick={() => deleteAddress(idx)} className="text-red-500 text-xs underline">Delete</button>
              </div>
            </div>
          ))}
          <button
            className="text-blue-600 text-sm underline"
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              setNewAddress({ name: '', phone: '', fullAddress: '', city: '', state: '', pincode: '' });
              setEditingIndex(null);
            }}
          >
            {showAddressForm ? 'Cancel' : '➕ Add New Address'}
          </button>
        </div>

        {/* New Address Form */}
        {showAddressForm && (
          <div className="bg-purple-50 p-4 rounded shadow space-y-2">
            {['name', 'phone', 'fullAddress', 'city', 'state', 'pincode'].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field[0].toUpperCase() + field.slice(1)}
                value={newAddress[field]}
                onChange={handleNewAddressChange}
                className="input-style w-full"
              />
            ))}
            <button
              onClick={saveNewAddress}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded"
            >
              {editingIndex !== null ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        )}

        {/* Payment Methods */}
        <div className="space-y-2">
          {['upi', 'card', 'cod'].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value={type}
                checked={method === type}
                onChange={() => setMethod(type)}
              />
              <span className="capitalize">
                {type === 'upi' && 'UPI (Google Pay, PhonePe)'}
                {type === 'card' && 'Debit/Credit Card'}
                {type === 'cod' && 'Cash on Delivery (COD)'}
              </span>
            </label>
          ))}
        </div>

        {/* UPI Input */}
        {method === 'upi' && (
          <>
            <input
              type="text"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="input-style w-full"
            />
            {errors.upi && <p className="text-red-500 text-sm mt-1">{errors.upi}</p>}
          </>
        )}

        {/* Card Inputs */}
        {method === 'card' && (
          <>
            <div className="space-y-3">
              <input type="text" placeholder="Card Number" className="input-style" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '') })} maxLength={16} />
              <input type="text" placeholder="Name on Card" className="input-style" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Expiry (MM/YY)" className="input-style" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} maxLength={5} />
                <input type="password" placeholder="CVV" className="input-style" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} maxLength={3} />
              </div>
            </div>
            {errors.card && <p className="text-red-500 text-sm mt-1">{errors.card}</p>}
          </>
        )}

        {/* Summary */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-purple-700 mb-2">🖼️ Items Summary</h3>
          {cartItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <img src={item.image} alt={item.title} className="w-14 h-14 rounded object-cover" />
              <div className="text-sm flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-gray-500">₹{item.price}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-bold text-purple-900 border-t pt-2">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString()}</span>
          </div>
          <p className="text-green-700 pt-2">
            📦 Expected Delivery: <strong>{deliveryDate()}</strong>
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={cartItems.length === 0 || isPlacingOrder}
          className={`w-full py-3 rounded text-white mt-4 transition ${
            cartItems.length === 0 || isPlacingOrder
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-700 hover:bg-purple-800'
          }`}
        >
          {isPlacingOrder ? 'Placing Order...' : <span>Confirm & Pay ₹{finalTotal.toLocaleString()}</span>}
        </button>
      </div>
    </section>
  );
};

export default PaymentPage;
