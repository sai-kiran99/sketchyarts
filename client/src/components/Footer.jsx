// src/components/Footer.jsx
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-10 mt-16">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-2xl font-serif mb-2">SketchyArts by Sai Kiran</h3>
        <p className="mb-4">Hyderabad, Telangana, India | saikiransai10010@gmail.com</p>

        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://www.instagram.com/sketchyarts._/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-xl hover:text-pink-400 transition" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-xl hover:text-pink-400 transition" />
          </a>
          <a href="https://wa.me/919182063610" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="text-xl hover:text-green-400 transition" />
          </a>
        </div>

        <p className="text-sm text-purple-300">&copy; {new Date().getFullYear()} SketchyArts. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
