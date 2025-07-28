import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ArtsForSale = () => {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [added, setAdded] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [form, setForm] = useState({ title: '', price: '', offer: '', file: null });
  const [editForm, setEditForm] = useState({ title: '', offer: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) fetchProfile();
    else fetchItems(false);
  }, []);

  useEffect(() => {
    fetchItems(isAdmin);
  }, [isAdmin]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(res.data.isAdmin);
    } catch (err) {
      console.error('Profile fetch failed');
    }
  };

  const fetchItems = async (adminView = false) => {
    try {
      const url = adminView
        ? 'http://localhost:5000/api/admin/sale-items'
        : 'http://localhost:5000/api/admin/sale-items-public';

      const config = adminView
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const res = await axios.get(url, config);
      setItems(res.data.reverse());
    } catch (err) {
      toast.error('Failed to load sale items');
    }
  };

  const handleUpload = async () => {
    const { title, price, offer, file } = form;
    if (!title.trim() || !price || !file) return toast.error('Enter title, price & select image');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sketchyarts');

    try {
      const cloudRes = await axios.post('https://api.cloudinary.com/v1_1/dxzyugxhk/image/upload', formData);
      const imageUrl = cloudRes.data.secure_url;

      await axios.post('http://localhost:5000/api/admin/sale-items', {
        title,
        price,
        offer,
        images: [imageUrl],
        description: 'New product added from admin',
        details: 'Default details here',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Product uploaded!');
      setForm({ title: '', price: '', offer: '', file: null });
      fetchItems();
    } catch (err) {
      toast.error('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getDiscountedPrice = (price, offer) =>
    Math.round(price - (price * (offer || 0)) / 100);

  const handleAddToCart = (item) => {
    const productToAdd = {
      _id: item._id,
      title: item.title,
      image: item.images?.[0],
      price: getDiscountedPrice(item.price, item.offer),
    };
    addToCart(productToAdd);
    setAdded((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAdded((prev) => ({ ...prev, [item._id]: false }));
    }, 3000);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/sale-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setEditForm({ title: item.title, offer: item.offer });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/sale-items/${editingItemId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Product updated');
      setEditingItemId(null);
      setEditForm({ title: '', offer: '' });
      fetchItems();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center font-serif text-purple-900 mb-10">🛒 Arts for Sale</h2>

      {/* 🎨 Custom Banner */}
      <div className="bg-purple-100 rounded-xl p-8 mb-10 shadow text-center">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-purple-900 drop-shadow-sm">
          🎨 Customised Artwork Starts from ₹1,000
        </h2>
        <p className="mb-6 text-lg font-semibold text-gray-800">
          Get your dream artwork today — portraits, illustrations & more!
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <a
            href="https://wa.me/9182063610"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow transition"
          >
            WhatsApp Now
          </a>
          <a
            href="https://instagram.com/sketckyarts._"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-full shadow transition"
          >
            DM on Instagram
          </a>
        </div>
      </div>

      {isAdmin && (
        <div className="max-w-md mx-auto mb-10 bg-white p-4 rounded shadow space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Offer % (optional)"
            value={form.offer}
            onChange={(e) => setForm({ ...form, offer: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            className="w-full"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Product'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {items.map((art) => {
          const discounted = getDiscountedPrice(art.price, art.offer);
          const isEditing = editingItemId === art._id;

          return (
            <div key={art._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
              <Link to={`/product/${art._id}`}>
                <img
                  src={art.images?.[0]}
                  alt={art.title}
                  className="w-full h-[360px] object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <div className="p-4 flex-1 flex flex-col justify-between">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="border rounded px-2 py-1 mb-2"
                    />
                    <input
                      type="number"
                      value={editForm.offer}
                      onChange={(e) => setEditForm({ ...editForm, offer: e.target.value })}
                      className="border rounded px-2 py-1 mb-2"
                    />
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mb-2"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{art.title}</h3>
                    {art.offer > 0 ? (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500 line-through">₹{art.price}</p>
                        <p className="text-xl font-bold text-pink-600">
                          ₹{discounted}{' '}
                          <span className="text-green-600 text-sm">({art.offer}% OFF)</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-pink-600 mb-2">₹{art.price}</p>
                    )}
                  </>
                )}

                <button
                  onClick={() => handleAddToCart(art)}
                  disabled={added[art._id]}
                  className={`mt-2 px-4 py-2 rounded text-white transition ${
                    added[art._id]
                      ? 'bg-green-600 scale-105 animate-pulse cursor-default'
                      : 'bg-purple-700 hover:bg-purple-800'
                  }`}
                >
                  {added[art._id] ? 'Added to Cart ✅' : 'Add to Cart'}
                </button>

                {isAdmin && (
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => handleEdit(art)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(art._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ArtsForSale;
