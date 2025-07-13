import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-300 py-12 shadow-inner ">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Brand */}
        <div>
          <h3 className="text-3xl font-extrabold text-cyan-400 mb-3 tracking-wide">
            🌀 AuctionPro
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Explore real-time auctions for cars, bikes, smartphones, and dream homes.
            Elevate your bidding experience today.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-3">
            {[
              { label: 'Live Auctions', to: '/' },
              { label: 'Login', to: '/login' },
              { label: 'Register', to: '/register' },
              { label: 'Contact Us', to: '/contact' },
            ].map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.to}
                  className="relative group text-gray-300 hover:text-cyan-400 transition"
                >
                  {link.label}
                  <span className="block h-0.5 max-w-0 bg-cyan-400 transition-all duration-300 group-hover:max-w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Connect With Us</h4>
          <div className="flex gap-5 text-xl">
            <a
              href="#"
              className="bg-gray-800 hover:bg-blue-500 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-sky-400 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-pink-500 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-gray-500 text-white p-3 rounded-full shadow-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 pt-5 text-center text-sm text-gray-500 border-t border-gray-800">
        © {new Date().getFullYear()}{' '}
        <span className="text-cyan-400 font-semibold">AuctionPro</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
