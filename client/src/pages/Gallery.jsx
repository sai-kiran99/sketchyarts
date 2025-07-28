import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [titleInput, setTitleInput] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchImages();
    fetchProfile();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/gallery-public');
      setImages(res.data.reverse());
    } catch (err) {
      toast.error('Failed to load gallery');
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdmin(res.data.isAdmin);
    } catch (err) {
      console.error('Profile fetch failed');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !newTitle) return toast.error('Title and image required');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sketchyarts');

    try {
      const cloudRes = await axios.post('https://api.cloudinary.com/v1_1/dxzyugxhk/image/upload', formData);
      const imageUrl = cloudRes.data.secure_url;

      await axios.post('http://localhost:5000/api/admin/gallery', {
        url: imageUrl,
        title: newTitle
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Image uploaded!');
      setNewTitle('');
      fetchImages();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deleted');
      fetchImages();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleEditTitle = async (id) => {
    if (!titleInput.trim()) return toast.error('Title cannot be empty');

    try {
      await axios.put(`http://localhost:5000/api/admin/gallery/${id}`, {
        title: titleInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Title updated');
      setEditId(null);
      fetchImages();
    } catch (err) {
      console.error('❌ Failed to update title:', err.response?.data || err.message);
      toast.error('Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <h2 className="text-4xl font-bold text-center text-purple-900 mb-10">🖼️ Art Gallery</h2>

      {/* 📤 Upload Section */}
      {isAdmin && (
        <div className="mb-8 max-w-xl mx-auto text-center space-y-2">
          <input
            type="text"
            placeholder="Enter image title"
            className="border border-gray-300 px-4 py-2 rounded w-full"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <label className="block bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700 transition">
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* 🧱 Masonry Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 max-w-7xl mx-auto">
        {images.map((img) => (
          <div key={img._id} className="break-inside-avoid rounded-lg shadow-md overflow-hidden bg-white transition-transform hover:scale-[1.03]">
            <img
              src={img.url}
              alt={img.title}
              onClick={() => setSelectedImage(img.url)}
              className="w-full h-auto cursor-pointer object-cover"
            />
            <div className="p-3 text-center">
              {editId === img._id ? (
                <>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="border px-2 py-1 rounded w-full mb-2"
                  />
                  <button
                    onClick={() => handleEditTitle(img._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-purple-900">{img.title}</h3>
                  {isAdmin && (
                    <div className="mt-2 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditId(img._id);
                          setTitleInput(img.title);
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(img._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center px-4">
          <div className="relative max-w-3xl w-full">
            <button
              className="absolute top-2 right-3 text-white text-3xl font-bold hover:text-red-400"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Enlarged Artwork"
              className="w-full max-h-[90vh] object-contain rounded shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
