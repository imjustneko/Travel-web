import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function TopBar({ isAuthenticated, isAdmin, userName, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setShowProfileMenu(false);
    onLogout();
    navigate('/');
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinkClass =
    'text-sm text-gray-600 hover:text-amber-800 transition-colors font-medium whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-700 hover:after:w-full after:transition-all after:duration-300';

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 flex-shrink-0 group"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-amber-300 transition-shadow">
              🏔️
            </div>
            <div>
              <div className="text-base font-bold text-amber-900 leading-tight">Улаан Хад Ресорт</div>
              <div className="text-xs text-gray-400 hidden md:block tracking-wide">Горхи-Тэрэлж</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            <button onClick={() => scrollToSection('rooms')} className={navLinkClass}>Өрөөнүүд</button>
            <button onClick={() => scrollToSection('dining')} className={navLinkClass}>Хоол хүнс</button>
            <button onClick={() => scrollToSection('activities')} className={navLinkClass}>Үйл ажиллагаа</button>
            <Link to="/events" className={navLinkClass}>Арга хэмжээ</Link>
            <button onClick={() => scrollToSection('contact')} className={navLinkClass}>Холбоо барих</button>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:block font-medium text-gray-700 text-sm">{userName}</span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                        <p className="text-xs text-gray-400">Зочны данс</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        Миний профайл
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-amber-800 font-semibold hover:bg-amber-50 transition"
                        >
                          Админ самбар
                        </Link>
                      )}
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          Гарах
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-amber-800 hover:bg-amber-50 rounded-lg transition font-semibold text-sm border border-amber-200"
                >
                  Нэвтрэх
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold text-sm shadow-sm"
                >
                  Бүртгүүлэх
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="lg:hidden pb-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs justify-center border-t border-gray-50 pt-2">
          <button onClick={() => scrollToSection('rooms')} className="text-gray-600 hover:text-amber-800 transition">Өрөөнүүд</button>
          <button onClick={() => scrollToSection('dining')} className="text-gray-600 hover:text-amber-800 transition">Хоол хүнс</button>
          <button onClick={() => scrollToSection('activities')} className="text-gray-600 hover:text-amber-800 transition">Үйл ажиллагаа</button>
          <Link to="/events" className="text-gray-600 hover:text-amber-800 transition">Арга хэмжээ</Link>
          <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-amber-800 transition">Холбоо барих</button>
        </nav>
      </div>
    </div>
  );
}

export default TopBar;
