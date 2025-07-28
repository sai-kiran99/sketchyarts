import { useState, useEffect } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';

const About = () => {
  const [about, setAbout] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAbout();
    fetchProfile();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await axios.get('/api/admin/about');
      const data = res.data;

      if (data) {
        setAbout(data);
        setDescription(data.description || '');
      } else {
        setAbout({ photo: '', description: '' });
        setEditMode(true); // enable editing if no data exists
      }
    } catch (err) {
      console.error('❌ Failed to fetch about:', err);
      setAbout({ photo: '', description: '' });
      setEditMode(true); // allow creating new one
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(res.data.isAdmin);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const handleUpdate = async () => {
    try {
      let photoUrl = about?.photo;

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('upload_preset', 'sketchyarts');
        const cloud = await axios.post('https://api.cloudinary.com/v1_1/dxzyugxhk/image/upload', formData);
        photoUrl = cloud.data.secure_url;
      }

      await axios.post(
        '/api/admin/about',
        {
          photo: photoUrl,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('About updated!');
      setEditMode(false);
      fetchAbout();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-start gap-10 animate-fade">
      {/* 🖼️ Image Section */}
      <div className="flex-shrink-0 w-full md:w-[400px]">
        {about?.photo ? (
          <div className="overflow-hidden rounded-xl shadow-xl group">
            <img
              src={about.photo}
              alt="Artist"
              className="w-[400px] h-[500px] object-cover transform group-hover:scale-105 transition duration-500"
            />
          </div>
        ) : (
          <div className="w-[400px] h-[500px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            No photo uploaded
          </div>
        )}

        {editMode && isAdmin && (
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) => setPhotoFile(e.target.files[0])}
          />
        )}
      </div>

      {/* ✍️ Text Section */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-4xl font-bold font-serif text-purple-800 mb-4">About the Artist</h2>

        {editMode && isAdmin ? (
          <>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-3 rounded text-gray-700"
            />
            <button
              onClick={handleUpdate}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </>
        ) : (
          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {about?.description}
          </p>
        )}

        {isAdmin && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
          >
            Edit About
          </button>
        )}
      </div>
    </section>
  );
};

export default About;
