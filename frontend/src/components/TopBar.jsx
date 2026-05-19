
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function TopBar({ isAuthenticated, isAdmin, userName, onLogout, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { value: 'all', label: 'Бүгд', icon: '🏨' },
    { value: 'room', label: 'Өрөөнүүд', icon: '🛏️' },
    { value: 'dining', label: 'Хоол хүнс', icon: '🍽️' },
    { value: 'activity', label: 'Үйл ажиллагаа', icon: '🎯' },
    { value: 'event', label: 'Арга хэмжээ', icon: '🎉' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query: searchQuery, category });
    }
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    onLogout();
    navigate('/');
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const navBtnClass = "text-sm text-gray-600 hover:text-amber-800 transition-colors font-medium whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-700 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-11 h-11 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:shadow-amber-300 transition-shadow">
              🏔️
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold text-amber-900 leading-tight">Улаан Хад Ресорт</div>
              <div className="text-xs text-gray-500 hidden md:block tracking-wide">Байгалийн цэвэр агаарт тансаг амралт</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            <button onClick={() => scrollToSection('rooms')} className={navBtnClass}>Өрөөнүүд</button>
            <button onClick={() => scrollToSection('dining')} className={navBtnClass}>Хоол хүнс</button>
            <button onClick={() => scrollToSection('activities')} className={navBtnClass}>Үйл ажиллагаа</button>
            <Link to="/events" className={navBtnClass}>Арга хэмжээ</Link>
            <button onClick={() => scrollToSection('contact')} className={navBtnClass}>Холбоо барих</button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Хайх..."
                className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm w-32 lg:w-40"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-amber-800 text-white rounded-r-lg hover:bg-amber-900 transition text-sm"
              >
                🔍
              </button>
            </form>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:block font-medium text-gray-700 text-sm">{userName}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>

                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileMenu(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                        <p className="text-xs text-gray-500">Зочны данс</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition"
                      >
                        👤 Миний профайл
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-amber-800 font-semibold hover:bg-amber-50 transition"
                        >
                          ⚙️ Админ самбар
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          🚪 Гарах
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-amber-800 hover:bg-amber-50 rounded-xl transition font-semibold text-sm border border-amber-200 hover:border-amber-300"
                >
                  Нэвтрэх
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-amber-800 text-white rounded-xl hover:bg-amber-900 transition font-semibold text-sm shadow-md shadow-amber-800/20 hover:shadow-amber-800/40"
                >
                  Бүртгүүлэх
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Хайх..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition text-sm flex-shrink-0"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Mobile Navigation */}
        <nav className="lg:hidden pb-3 flex flex-wrap gap-2 justify-center text-xs">
          <button onClick={() => scrollToSection('rooms')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Өрөөнүүд
          </button>
          <span className="text-gray-400">•</span>
          <button onClick={() => scrollToSection('dining')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Хоол хүнс
          </button>
          <span className="text-gray-400">•</span>
          <button onClick={() => scrollToSection('activities')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Үйл ажиллагаа
          </button>
          <span className="text-gray-400">•</span>
          <Link to="/events" className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Арга хэмжээ
          </Link>
          <span className="text-gray-400">•</span>
          <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Холбоо барих
          </button>
        </nav>
      </div>
    </div>
  );
}

export default TopBar;