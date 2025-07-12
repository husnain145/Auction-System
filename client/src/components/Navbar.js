import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  return (
    <nav className=" top-0 left-0 w-full z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transition-transform duration-300 tracking-wide"
        >
          🌀 AuctionPro
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-end">
          {token ? (
            <>
              <Link
                to="/"
                className="text-white text-sm font-medium hover:text-cyan-400 transition duration-200"
              >
                Live Auctions
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full shadow-sm transition"
                >
                  🎛 Admin Dashboard
                </Link>
              )}

              {user.role === 'seller' && (
                <Link
                  to="/seller"
                  className="text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full shadow-sm transition"
                >
                  📦 Seller Panel
                </Link>
              )}

              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white text-sm px-4 py-1.5 rounded-full font-semibold shadow-md transition"
              >
                🔒 Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-4 py-1.5 rounded-full font-semibold shadow-md transition"
              >
                🔐 Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-4 py-1.5 rounded-full font-semibold shadow-md transition"
              >
                🚀 Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
