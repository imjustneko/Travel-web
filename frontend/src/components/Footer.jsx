// frontend/src/components/Footer.jsx - RESORT VERSION
import { Link } from 'react-router-dom';

function Footer({ isAuthenticated, isAdmin }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Resort Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🏔️</span>
              <h3 className="text-xl font-bold">Red Rock Resort</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              A luxury retreat nestled in the heart of Terelj National Park, 
              offering world-class hospitality and unforgettable experiences.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-800 transition">
                <span className="text-sm">f</span>
              </a>
              <a href="https://instagram.com" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-800 transition">
                <span className="text-sm">📷</span>
              </a>
              <a href="https://twitter.com" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-800 transition">
                <span className="text-sm">𝕏</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#rooms" className="text-gray-400 hover:text-white transition">
                  Rooms & Suites
                </a>
              </li>
              <li>
                <a href="#dining" className="text-gray-400 hover:text-white transition">
                  Dining
                </a>
              </li>
              <li>
                <a href="#activities" className="text-gray-400 hover:text-white transition">
                  Activities
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition">
                  About Us
                </a>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/profile" className="text-gray-400 hover:text-white transition">
                    My Account
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition">
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>Terelj National Park<br/>Ulaanbaatar, Mongolia</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <a href="tel:+97611123456" className="hover:text-white transition">
                  +976 11 123 456
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span>
                <a href="mailto:info@redrockresort.mn" className="hover:text-white transition">
                  info@redrockresort.mn
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">⏰</span>
                <span>24/7 Reception</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to receive exclusive offers and updates.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <button className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition text-sm font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} Red Rock Resort. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition">Terms & Conditions</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition">Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;