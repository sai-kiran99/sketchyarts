import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProduct();
    checkAdmin();
  }, [id]);

  const checkAdmin = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(res.data?.isAdmin || false);
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/sale-items-public');
      const found = res.data.find((item) => item._id === id);
      setProduct(found);
      setEditData({
        title: found.title,
        price: found.price,
        offer: found.offer,
        description: found.description,
        details: found.details,
      });
    } catch (err) {
      console.error('Failed to fetch product:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sketchyarts');

    try {
      const cloudRes = await axios.post('https://api.cloudinary.com/v1_1/dxzyugxhk/image/upload', formData);
      const url = cloudRes.data.secure_url;

      await axios.post(`http://localhost:5000/api/admin/sale-items/${id}/images`, { url }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchProduct();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imgIndex) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/sale-items/${id}/images/${imgIndex}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProduct();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/sale-items/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProduct();
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  if (!product) return <div className="text-center py-20 text-red-600 font-bold text-xl">Product not found 😢</div>;

  const discountedPrice = Math.round(product.price - (product.price * (product.offer || 0)) / 100);

  const handleAddToCart = () => {
    const productToAdd = {
      _id: product._id,
      title: product.title,
      price: discountedPrice,
      image: product.images?.[0], // ✅ send image to cart
    };
    addToCart(productToAdd);
    setAddedToCart(true);
    toast.success('🛒 Added to cart!');
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
      {/* Left: Image Grid (1 column on mobile, 2 on tablet+) */}
      <div className="w-full lg:w-[40%] grid grid-cols-1 sm:grid-cols-2 gap-4">
        {product.images?.map((img, index) => (
          <div key={index} className="relative group">
            <img
              src={img}
              alt={`img-${index}`}
              onClick={() => setSelectedIndex(index)}
              className="rounded-lg w-full h-[300px] object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
            />
            {isAdmin && (
              <button
                onClick={() => handleDeleteImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 text-xs rounded hidden group-hover:block"
              >
                Delete
              </button>
            )}
          </div>
        ))}
        {isAdmin && (
          <div className="border-2 border-dashed h-32 flex items-center justify-center rounded text-purple-600 col-span-full">
            <label className="cursor-pointer">
              <input type="file" onChange={handleImageUpload} className="hidden" />
              {uploading ? 'Uploading...' : '➕ Upload Image'}
            </label>
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="w-full mt-6 lg:mt-0 lg:w-[60%] space-y-4">
        {editMode ? (
          <>
            <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="border p-2 w-full rounded" />
            <input type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} className="border p-2 w-full rounded" />
            <input type="number" value={editData.offer} onChange={(e) => setEditData({ ...editData, offer: e.target.value })} className="border p-2 w-full rounded" placeholder="Offer %" />
            <textarea rows={3} value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="border p-2 w-full rounded" placeholder="Description" />
            <textarea rows={3} value={editData.details} onChange={(e) => setEditData({ ...editData, details: e.target.value })} className="border p-2 w-full rounded" placeholder="Details" />
            <div className="flex gap-4">
              <button onClick={saveEdit} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-purple-800">{product.title}</h2>
            {product.offer > 0 && <p className="line-through text-gray-500">₹{product.price}</p>}
            <p className="text-2xl font-semibold text-pink-600">
              ₹{discountedPrice}{' '}
              {product.offer > 0 && <span className="text-green-600 text-sm">({product.offer}% OFF)</span>}
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{product.description}</p>
            <p className="text-sm text-gray-500">{product.details}</p>

            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`mt-4 px-6 py-2 rounded text-white transition ${
                addedToCart ? 'bg-green-600 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'
              }`}
            >
              {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {isAdmin && (
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 ml-4 px-4 py-2 bg-yellow-500 text-white rounded"
              >
                ✏️ Edit Product
              </button>
            )}
          </>
        )}
      </div>

      {/* Zoom Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute left-6 text-white text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            ‹
          </button>
          <img
            src={product.images[selectedIndex]}
            alt="zoomed"
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-xl transition-transform duration-300 scale-100"
          />
          <button
            className="absolute right-6 text-white text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
