// frontend/src/components/Navbar.jsx - RESORT VERSION
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin }) {
  return (
    <nav className="bg-amber-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          {/* Quick Info */}
          <div className="flex items-center space-x-6 text-xs">
            <span className="hidden md:block">📞 +976 11 123 456</span>
            <span className="hidden lg:block">✉️ info@redrockresort.mn</span>
            <span className="hidden xl:block">📍 Горхи-Тэрэлж, Монгол</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-4 text-xs">
            <a href="#rooms" className="hover:text-amber-200 transition">Захиалах</a>
            <span className="text-amber-600">•</span>
            <a href="#offers" className="hover:text-amber-200 transition">Тусгай санал</a>
            {isAdmin && (
              <>
                <span className="text-amber-600">•</span>
                <Link to="/admin" className="bg-amber-700 hover:bg-amber-600 px-3 py-1 rounded transition font-semibold">
                  Админ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;