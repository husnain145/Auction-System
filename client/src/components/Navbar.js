import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        {/* 🔷 Brand Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transform transition-transform duration-300"
        >
          🌀 AuctionPro
        </Link>

        {/* 🌐 Navigation Links */}
        <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-4 text-sm font-medium">
          {token ? (
            <>
              <NavLink to="/auctions" label="Live Auctions" />
              
              {user.role === 'admin' && (
                <NavButton to="/admin" color="purple" icon="🎛" label="Admin Dashboard" />
              )}

              {user.role === 'seller' && (
                <NavButton to="/seller" color="green" icon="📦" label="Seller Panel" />
              )}

              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-1.5 rounded-full shadow-sm font-semibold transition"
              >
                🔒 Logout
              </button>
            </>
          ) : (
            <>
              <NavButton to="/login" color="blue" icon="🔐" label="Login" />
              <NavButton to="/register" color="indigo" icon="🚀" label="Register" />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="relative text-white hover:text-cyan-400 transition duration-300 after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan-400 after:transition-all after:duration-300"
  >
    {label}
  </Link>
);

const NavButton = ({ to, color, icon, label }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    indigo: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
    green: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    purple: 'from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700',
  };

  return (
    <Link
      to={to}
      className={`bg-gradient-to-r ${colorClasses[color]} text-white px-4 py-1.5 rounded-full shadow-sm font-semibold transition`}
    >
      {icon} {label}
    </Link>
  );
};

export default Navbar;
