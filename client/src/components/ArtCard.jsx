// src/components/ArtCard.jsx
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const ArtCard = ({ art }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative group">
        <img
          src={art.image}
          alt={art.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="bg-white p-3 rounded-full mr-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <FiHeart className="text-gray-700" />
          </button>
          <button
            className="bg-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
            onClick={() => addToCart(art)}
          >
            <FiShoppingCart className="text-gray-700" />
          </button>
        </div>
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium text-gray-800">{art.title}</h3>
        <p className="text-gray-500">{art.medium}</p>
        <p className="text-purple-700 font-bold mt-2">₹{art.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ArtCard;
