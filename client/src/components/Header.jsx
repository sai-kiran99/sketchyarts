import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useState, useContext } from 'react';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Header = () => {
  const { cartItems } = useCart();
  const { user, logout, loading } = useContext(AuthContext); // ✅ using loading and user
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    const root = document.getElementById('root');
    if (root) root.classList.add('animate-fadeOut');

    setTimeout(() => {
      logout();
      localStorage.removeItem('token');
      navigate('/');
      if (root) root.classList.remove('animate-fadeOut');
    }, 600);
  };

  // ✅ Build navLinks after checking user role
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/arts', label: 'Sale' },
    { path: '/contact', label: 'Contact' },
    !user
      ? { path: '/login', label: 'Login' }
      : user.isAdmin
        ? { path: '/admin-dashboard', label: 'Admin Dashboard' }
        : { path: '/dashboard', label: 'My Profile' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-purple-900 text-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="SketchyArts Logo" className="w-10 h-10 object-contain hover:drop-shadow-glow" />
            <span className="text-3xl font-serif font-bold tracking-wide">
              Sketchy<span className="text-pink-400">Arts</span>
            </span>
          </Link>

          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
            </button>
          </div>

          <nav className="hidden md:flex space-x-6 text-lg font-medium items-center">
            {!loading && (
              <>
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`hover:text-pink-400 transition ${
                      location.pathname === link.path ? 'underline underline-offset-4 font-bold' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                )}
              </>
            )}
          </nav>

          <Link to="/cart" className="relative ml-4 hidden md:inline-block">
            <FiShoppingCart className="text-2xl hover:text-pink-400 transition" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-purple-800 text-white px-6 pb-4 shadow-lg">
            <nav className="flex flex-col gap-4 text-lg font-medium">
              {!loading && (
                <>
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`hover:text-pink-300 transition ${
                        location.pathname === link.path ? 'underline underline-offset-4 font-bold' : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {user && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-left bg-red-500 px-3 py-1 rounded text-white"
                    >
                      Logout
                    </button>
                  )}

                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 mt-2">
                    <FiShoppingCart className="text-xl" />
                    <span>Cart ({cartItems.length})</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
