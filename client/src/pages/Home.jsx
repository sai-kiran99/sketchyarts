import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import bannerImage from '../assets/banner.jpg';
import axios from 'axios';

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showOfferBar, setShowOfferBar] = useState(false);
  const [marqueeText, setMarqueeText] = useState('');

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');

    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/settings');
        const allSettings = res.data;

        const latest = allSettings.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        if (!latest) return;

        setShowOfferBar(latest.showMarquee);
        setMarqueeText(latest.marqueeText);
        setPopupMessage(latest.popupMessage);

        if (latest.showPopup && latest.popupMessage && !hasSeenPopup) {
          setTimeout(() => {
            setShowPopup(true);
            sessionStorage.setItem('hasSeenPopup', 'true');
          }, 1000);
        }
      } catch (err) {
        console.error('⚠️ Failed to fetch homepage settings:', err.message);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      {/* 🎉 Popup Offer */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-[90%] text-center relative"
            >
              <button
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>
              <h2 className="text-xl font-bold text-purple-700 mb-2">🎉 Special Offer!</h2>
              <p className="text-gray-700">{popupMessage}</p>
              <div className="mt-4">
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-purple-700 text-white px-5 py-2 rounded-full hover:bg-purple-800 transition"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔻 Marquee Tag */}
      {showOfferBar && (
        <div className="bg-purple-100 text-purple-900 py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-center font-medium text-sm sm:text-base">
            {marqueeText || '🎉 Apply OFF20 to get 20% OFF on your first order! 🎨'}
          </div>
        </div>
      )}

      {/* 🔻 Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-200 to-pink-100">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            alt="art bg"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="relative z-10 text-center px-4 animate-fade">
          <h1 className="text-5xl md:text-6xl font-serif text-purple-800 font-bold mb-4 transition-opacity duration-1000 ease-out opacity-0 animate-fade-in-up">
            Welcome to <span className="text-pink-500">SketchyArts</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Dive into Sai Kiran’s world of expressive sketches, abstract colors, and original artworks.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/gallery"
              className="bg-purple-700 text-white px-6 py-3 rounded-full hover:bg-purple-800 transition"
            >
              Explore Gallery
            </Link>
            <Link
              to="/arts"
              className="border-2 border-purple-700 text-purple-700 px-6 py-3 rounded-full hover:bg-purple-100 transition"
            >
              Buy Art
            </Link>
          </div>
        </div>
      </section>

      {/* 🎨 Custom Artwork Section */}
      <section className="py-16 px-4 bg-purple-100 text-center">
        <h2 className="text-2xl md:text-5xl font-extrabold mb-4 text-purple-900 drop-shadow-sm">
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
      </section>
    </>
  );
};

export default Home;
