import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('profile');
  const [formData, setFormData] = useState({ name: '', phone: '', profilePic: '' });
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { cartItems } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          profilePic: res.data.profilePic || '',
        });
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);
const handlePicUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'sketchyarts');

  try {
    const res = await axios.post('https://api.cloudinary.com/v1_1/dxzyugxhk/image/upload', data);
    const imageUrl = res.data.secure_url;
    setFormData(prev => ({ ...prev, profilePic: imageUrl }));

    // ✅ Auto-save to backend
    const token = localStorage.getItem('token');
    await axios.put('/api/auth/profile', {
      ...formData,
      profilePic: imageUrl
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ Refresh updated user
    const updated = await axios.get('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(updated.data);

    toast.success('✅ Photo uploaded & saved');
  } catch {
    toast.error('❌ Upload failed');
  } finally {
    setUploading(false);
  }
};


  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        profilePic: res.data.profilePic || '',
      });

      setEditing(false);
      toast.success('✅ Profile updated!');
    } catch {
      toast.error('❌ Failed to update profile');
    }
  };

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/auth/cancel-order', { orderId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(prev => ({
        ...prev,
        orders: prev.orders.map(order =>
          order._id === orderId ? { ...order, isCancelled: true, status: 'Cancelled' } : order
        )
      }));
    } catch {
      toast.error('❌ Failed to cancel order');
    }
  };

  const deleteOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/auth/delete-order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(prev => ({
        ...prev,
        orders: prev.orders.filter(order => order._id !== orderId)
      }));
    } catch {
      toast.error('❌ Failed to delete order');
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const stages = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const sortedOrders = [...user.orders].reverse();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">
        👋 Hello, {user.name || user.email?.split('@')[0]}
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6 border-b pb-2 text-sm sm:text-base">
        <button onClick={() => setTab('profile')} className={`${tab === 'profile' ? 'text-purple-700 font-bold' : 'text-gray-500'}`}>👤 Profile</button>
        <button onClick={() => setTab('orders')} className={`${tab === 'orders' ? 'text-purple-700 font-bold' : 'text-gray-500'}`}>📦 Orders</button>
        <button onClick={() => setTab('cart')} className={`${tab === 'cart' ? 'text-purple-700 font-bold' : 'text-gray-500'}`}>🛒 Cart</button>
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="space-y-4 bg-white shadow p-4 rounded">
          <div className="flex flex-col items-center">
            <img
              src={
                user?.profilePic ||
                formData.profilePic ||
                process.env.PUBLIC_URL + '/default-avatar.png'
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label className="mt-2 bg-purple-600 text-white text-sm py-1 px-3 rounded cursor-pointer">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" onChange={handlePicUpload} className="hidden" />
            </label>
          </div>

          {editing ? (
            <div className="space-y-2">
              <input name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Full Name" />
              <input name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border p-2 rounded" placeholder="Phone Number" />
              <div className="flex gap-2">
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded w-full">Save</button>
                <button onClick={() => setEditing(false)} className="bg-red-500 text-white px-4 py-2 rounded w-full">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="text-sm space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not Added'}</p>
              <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Edit Profile</button>
              <Link to="/change-password" className="block text-blue-700 mt-2 underline">Change Password</Link>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {sortedOrders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            sortedOrders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded shadow space-y-2 text-sm transition-all duration-300 ease-in-out">
                <div className="flex justify-between font-semibold">
                  <span>Order ID: {order._id.slice(-6)}</span>
                  <span>{new Date(order.date).toLocaleString()}</span>
                </div>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Phone:</strong> {order.address?.phone || 'Not provided'}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
                <p><strong>Address:</strong> {order.address?.fullAddress}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                <p><strong>Expected Delivery:</strong> {order.deliveryDate || 'N/A'}</p>

                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded" />
                    <div>
                      <p>{item.title}</p>
                      <p className="text-gray-600">₹{item.price}</p>
                    </div>
                  </div>
                ))}
                <p><strong>Total:</strong> ₹{order.total}</p>

                <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                  {stages.map((stage, idx) => {
                    const active = stages.indexOf(order.status) >= idx;
                    const cancelled = order.status === 'Cancelled';
                    return (
                      <div key={stage} className={`flex-1 text-center ${cancelled ? 'text-red-500' : active ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                        <div className="rounded-full w-6 h-6 mx-auto mb-1 bg-current text-white flex items-center justify-center text-xs">{idx + 1}</div>
                        <span>{stage}</span>
                      </div>
                    );
                  })}
                </div>

                {order.status === 'Cancelled' && (
                  <p className="text-red-600 text-center font-semibold">Order is Cancelled ❌</p>
                )}

                <div className="flex gap-2 pt-2">
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button onClick={() => cancelOrder(order._id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs transition hover:scale-105">Cancel</button>
                  )}
                  {order.status === 'Cancelled' && (
                    <button onClick={() => deleteOrder(order._id)} className="bg-gray-800 text-white px-3 py-1 rounded text-xs transition hover:scale-105">Delete</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cart */}
      {tab === 'cart' && (
        <div className="bg-white rounded shadow p-4 space-y-3 text-sm">
          <h3 className="text-purple-700 font-semibold">🛒 Items in Cart: {cartItems.length}</h3>
          {cartItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b pb-2">
              <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-gray-600">₹{item.price}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Link to="/cart" className="bg-blue-600 text-white px-4 py-2 rounded w-full text-center">View Cart</Link>
            <Link to="/payment" className="bg-green-600 text-white px-4 py-2 rounded w-full text-center">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
