import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showChangePw, setShowChangePw] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '' });
  const [settings, setSettings] = useState({
    marqueeText: '',
    showMarquee: true,
    popupMessage: '',
    showPopup: true,
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('Login required');
      navigate('/login');
      return;
    }
    fetchData();
    fetchCoupons();
    fetchAllSettings(); 
  }, []);

  const fetchData = async () => {
    try {
      const profile = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmin(profile.data);
      setAdminForm({ name: profile.data.name || '', phone: profile.data.phone || '' });

      const res = await axios.get('/api/auth/admin/all-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      setMessage('Error loading dashboard');
      navigate('/');
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
    } catch {
      setMessage('❌ Failed to load coupons');
      setTimeout(() => setMessage(''), 3000);
    }
  };

 const [allSettings, setAllSettings] = useState([]);

const fetchAllSettings = async () => {
  try {
    const res = await axios.get('/api/admin/settings');
    const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAllSettings(sorted);
  } catch (err) {
    console.error('❌ Failed to fetch all settings:', err.message);
  }
};

useEffect(() => {
  fetchAllSettings(); // fetch full history
}, []);

const deleteSetting = async (id) => {
  if (!window.confirm('Are you sure you want to delete this setting?')) return;

  try {
    await axios.delete(`/api/admin/settings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAllSettings();
    setMessage('🗑️ Setting deleted');
    setTimeout(() => setMessage(''), 3000);
  } catch {
    setMessage('❌ Failed to delete setting');
    setTimeout(() => setMessage(''), 3000);
  }
};

const applySetting = (item) => {
  setSettings({
    marqueeText: item.marqueeText,
    popupMessage: item.popupMessage,
    showMarquee: item.showMarquee,
    showPopup: item.showPopup,
  });
  setMessage('✅ Applied setting. You can now update or save it again.');
  setTimeout(() => setMessage(''), 3000);
};
const saveSettings = async () => {
  const isMarqueeFilled = (settings.marqueeText || '').trim().length > 0;
  const isPopupFilled = (settings.popupMessage || '').trim().length > 0;

  if (!isMarqueeFilled && !isPopupFilled) {
    setMessage('⚠️ Please enter either Marquee Text or Popup Message');
    setTimeout(() => setMessage(''), 3000);
    return;
  }

  try {
    await axios.put('/api/admin/settings', settings, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessage('✅ Settings updated!');
    setTimeout(() => setMessage(''), 3000);
    fetchAllSettings(); // ✅ refresh the history list
  } catch (error) {
    console.error('❌ Failed to update settings:', error.message);
    setMessage('❌ Failed to update settings');
    setTimeout(() => setMessage(''), 3000);
  }
};




  const handleAdminUpdate = async () => {
    try {
      await axios.put('/api/admin/update-admin', adminForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Profile updated!');
      setTimeout(() => setMessage(''), 3000);
      setEditAdmin(false);
      fetchData();
    } catch {
      setMessage('❌ Failed to update admin');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.put(
        '/api/admin/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Password changed successfully');
      setTimeout(() => setMessage(''), 3000);
      setShowChangePw(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setMessage('❌ Failed to change password');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Delete user?')) {
      try {
        await axios.delete(`/api/admin/delete-user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
        setMessage('🗑️ User deleted');
        setTimeout(() => setMessage(''), 3000);
      } catch {
        setMessage('❌ Failed to delete user');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const updateOrderStatus = async (userId, index, newStatus) => {
    try {
      await axios.put(
        '/api/admin/update-order-status',
        { userId, index, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      setMessage('✅ Order status updated');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to update status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteOrder = async (userId, index) => {
    try {
      await axios.delete(`/api/admin/delete-order/${userId}/${index}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      setMessage('🗑️ Order deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to delete order');
      setTimeout(() => setMessage(''), 3000);

    }
  };

  const addCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount) {
      setMessage('⚠️ Please enter both code and discount');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await axios.post('/api/admin/coupons', newCoupon, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewCoupon({ code: '', discount: '' });
      fetchCoupons();
      setMessage('✅ Coupon added');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to add coupon');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteCoupon = async (id) => {
    try {
      await axios.delete(`/api/admin/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoupons();
      setMessage('🗑️ Coupon deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to delete coupon');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <h2 className="text-3xl font-bold text-purple-800 mb-6">🛠️ Admin Dashboard</h2>

      {message && (
        <div className="bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded mb-4">{message}</div>
      )}

      <div className="flex gap-3 mb-6">
        {['dashboard', 'users', 'orders', 'coupons', 'settings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full font-semibold ${
              tab === t ? 'bg-purple-600 text-white' : 'bg-white text-purple-700 border'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* 🟣 Dashboard */}
      {tab === 'dashboard' && admin && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-xl font-bold text-purple-700 mb-2">👤 Admin Profile</h3>
            {editAdmin ? (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={adminForm.name || ''}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="border w-full px-3 py-1 mb-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={adminForm.phone || ''}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  className="border w-full px-3 py-1 mb-2 rounded"
                />
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleAdminUpdate}>
                  Save
                </button>{' '}
                <button className="text-sm ml-2" onClick={() => setEditAdmin(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p><strong>{admin.name}</strong> — {admin.email}</p>
                <p>📞 {admin.phone}</p>
                <button className="mt-2 px-4 py-1 text-sm bg-purple-600 text-white rounded" onClick={() => setEditAdmin(true)}>
                  Edit
                </button>
              </>
            )}

            {showChangePw ? (
              <div className="mt-4 space-y-2">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <div className="flex gap-2">
                  <button className="bg-purple-700 text-white px-4 py-1 rounded" onClick={handleChangePassword}>
                    Submit
                  </button>
                  <button className="bg-gray-200 px-4 py-1 rounded" onClick={() => setShowChangePw(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p onClick={() => setShowChangePw(true)} className="text-sm text-purple-600 underline mt-3 cursor-pointer">
                Change Password
              </p>
            )}
          </div>
        </div>
      )}

      {/* 👥 Users Tab */}
      {tab === 'users' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u._id} className="bg-white p-4 rounded shadow">
              <p className="font-semibold">{u.name || 'No Name'}</p>
              <p>{u.email}</p>
              <p>📞 {u.phone || 'N/A'}</p>
              <p>Orders: {u.orders?.length || 0}</p>
              <button className="text-red-600 text-sm mt-2" onClick={() => deleteUser(u._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}


{/* 📦 Orders Tab */}
{tab === 'orders' && (
  <div className="grid lg:grid-cols-2 gap-4">
    {users
      .flatMap((u) =>
        u.orders?.map((o, idx) => ({
          ...o,
          userId: u._id,
          userName: u.name,
          userEmail: u.email,
          orderIndex: idx,
        }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((order, idx) => (
        <div key={order.userId + idx} className="bg-white p-4 rounded shadow">
          <p className="font-bold text-purple-700">{order.userName}</p>
          <p className="text-sm">{order.userEmail}</p>

          {/* ✅ Order ID */}
          <p className="text-xs text-gray-500 mb-1">
            🆔 Order ID: <span className="break-all">{order._id}</span>
          </p>

          <p>Total: ₹{order.total}</p>

          {order.date && (
            <p className="text-sm text-gray-600">
              🕒 Ordered on: {new Date(order.date).toLocaleString()}
            </p>
          )}

          {/* ✅ Delivery Address */}
          {order.address && (
            <div className="text-xs mt-2 bg-gray-50 p-2 rounded border">
              <p className="font-semibold text-gray-700">📍 Delivery Address</p>
              <p>{order.address.name}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p>📞 {order.address.phone}</p>
            </div>
          )}

          {/* ✅ Status Control */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
            {[
              { label: 'Ordered', icon: '📝' },
              { label: 'Packed', icon: '📦' },
              { label: 'Shipped', icon: '🚚' },
              { label: 'Delivered', icon: '✅' },
              { label: 'Cancelled', icon: '❌' },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer border transition-all
                  ${
                    order.status === label
                      ? 'bg-purple-600 text-white border-purple-600 shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                onClick={() => updateOrderStatus(order.userId, order.orderIndex, label)}
              >
                <span>{icon}</span> <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ✅ Items */}
          <div className="mt-3 text-xs">
            {order.items?.map((i, iIdx) => (
              <div key={iIdx} className="flex items-center gap-2 mb-1">
                <img src={i.image} alt="" className="w-6 h-6 rounded" />
                <span>{i.name || i.title}</span> ₹{i.price}
              </div>
            ))}
          </div>

          {/* ✅ Delete Button */}
          <button
            className="text-red-500 mt-2 text-sm underline"
            onClick={() => deleteOrder(order.userId, order.orderIndex)}
          >
            Delete Order
          </button>
        </div>
      ))}
  </div>
)}

      {/* 🎟️ Coupons Tab */}
      {tab === 'coupons' && (
        <div className="bg-white max-w-xl mx-auto p-6 rounded shadow space-y-4">
          <h3 className="text-xl font-bold text-purple-700">Coupons</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Code"
              value={newCoupon.code || ''}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              className="flex-1 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="Discount %"
              value={newCoupon.discount || ''}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
              className="w-24 px-2 py-1 border rounded"
            />
            <button onClick={addCoupon} className="bg-purple-700 text-white px-4 py-1 rounded">
              Add
            </button>
          </div>
          <div>
            {coupons.map((c) => (
              <div key={c._id} className="flex justify-between items-center border px-3 py-2 rounded mt-2">
                <span>
                  <strong>{c.code}</strong> — {c.discount}%
                </span>
                <button onClick={() => deleteCoupon(c._id)} className="text-red-600 text-sm underline">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚙️ Settings Tab */}
{tab === 'settings' && (
  <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-8 border border-purple-200">
    <h3 className="text-2xl font-bold text-purple-700">🛠️ Homepage Settings</h3>

    {message && (
      <div className="bg-yellow-50 text-purple-800 border border-yellow-300 px-4 py-2 rounded text-sm">
        {message}
      </div>
    )}

    {/* 🎯 Editable Current Form */}
    <div className="space-y-3">
      <input
        type="text"
        placeholder="🎨 Marquee Text"
        value={settings.marqueeText || ''}
        onChange={(e) => setSettings({ ...settings, marqueeText: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />
      <label className="flex items-center text-sm">
        <input
          type="checkbox"
          checked={!!settings.showMarquee}
          onChange={(e) => setSettings({ ...settings, showMarquee: e.target.checked })}
          className="mr-2"
        />
        Show Marquee Banner
      </label>

      <input
        type="text"
        placeholder="💬 Popup Message"
        value={settings.popupMessage || ''}
        onChange={(e) => setSettings({ ...settings, popupMessage: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />
      <label className="flex items-center text-sm">
        <input
          type="checkbox"
          checked={!!settings.showPopup}
          onChange={(e) => setSettings({ ...settings, showPopup: e.target.checked })}
          className="mr-2"
        />
        Show Welcome Popup
      </label>

      <div className="flex gap-4 mt-2">
        <button
          onClick={saveSettings}
          className="px-6 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
        >
          💾 Save
        </button>
        <button
          onClick={() =>
            setSettings({ marqueeText: '', popupMessage: '', showMarquee: true, showPopup: true })
          }
          className="px-6 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          ❌ Clear
        </button>
      </div>
    </div>

    {/* 📜 Previous Settings */}
    <div className="mt-8">
      <h4 className="text-xl font-bold text-purple-700 mb-4">🕒 Previously Saved Settings</h4>

      {allSettings.length === 0 ? (
        <p className="text-gray-500">No previous settings found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSettings.map((s, index) => (
            <div
              key={s._id}
              className="p-4 bg-purple-50 rounded shadow border border-purple-100 space-y-2"
            >
              <div className="text-sm">
                <p><strong>🎨 Marquee:</strong> {s.marqueeText || <em>None</em>}</p>
                <p><strong>💬 Popup:</strong> {s.popupMessage || <em>None</em>}</p>
                <p className="text-xs text-gray-500 mt-1">⏰ {new Date(s.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex justify-between mt-2">
                
                <button
                  onClick={() => deleteSetting(s._id)}
                  className="text-sm text-red-600 underline hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default AdminDashboard;
