// frontend/src/components/Navbar.jsx - RESORT VERSION
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin }) {
  return (
    <nav className="bg-gradient-to-r from-amber-950 to-amber-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-10">
          {/* Quick Info */}
          <div className="flex items-center space-x-5 text-xs text-amber-200/80">
            <span className="hidden md:flex items-center gap-1.5">📞 <span>+976 11 123 456</span></span>
            <span className="hidden lg:flex items-center gap-1.5">✉️ <span>info@redrockresort.mn</span></span>
            <span className="hidden xl:flex items-center gap-1.5">📍 <span>Горхи-Тэрэлж, Монгол</span></span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-4 text-xs">
            <a href="#rooms" className="text-amber-200 hover:text-white transition-colors font-medium">Захиалах</a>
            <span className="text-amber-700">|</span>
            <a href="#offers" className="text-amber-200 hover:text-white transition-colors font-medium">Тусгай санал</a>
            {isAdmin && (
              <>
                <span className="text-amber-700">|</span>
                <Link to="/admin" className="bg-amber-700/60 hover:bg-amber-600 border border-amber-600 px-3 py-0.5 rounded-full transition-colors font-semibold text-white">
                  ⚙️ Админ
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