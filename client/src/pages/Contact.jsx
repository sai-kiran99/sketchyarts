// src/pages/Contact.jsx
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

const Contact = () => {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-purple-800 font-serif mb-6">Get in Touch</h2>
      <p className="text-gray-700 mb-6">Reach out for commissions, collaborations, or feedback.</p>

      <div className="space-y-4 text-lg">
        <p>
          <strong>Phone:</strong>{' '}
          <a href="https://wa.me/919182063610" className="text-green-600 hover:underline">
            +91 9182063610
          </a>
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:saikiransai10010@gmail.com" className="text-indigo-700 hover:underline">
            saikiransai10010@gmail.com
          </a>
        </p>
        <p>
          <strong>Location:</strong> Hyderabad, Telangana, India
        </p>
      </div>

      <div className="my-8">
        <iframe
          title="Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.161845342115!2d78.4867!3d17.385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb977d9c62e38d%3A0x1234567890abcdef!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1629876543210"
          width="100%"
          height="300"
          className="border-0 rounded-lg shadow"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Social Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <a
          href="https://wa.me/919182063610"
          className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition"
          target="_blank" rel="noopener noreferrer"
        >
          <FaWhatsapp className="text-xl" />
          Chat on WhatsApp
        </a>

        <a
          href="https://instagram.com/sketchyarts._" // Replace with your actual IG handle
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition"
          target="_blank" rel="noopener noreferrer"
        >
          <FaInstagram className="text-xl" />
          View on Instagram
        </a>
      </div>
    </section>
  );
};

export default Contact;
