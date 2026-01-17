
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function TopBar({ isAuthenticated, isAdmin, userName, onLogout, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { value: 'all', label: 'All', icon: '🏨' },
    { value: 'room', label: 'Rooms', icon: '🛏️' },
    { value: 'dining', label: 'Dining', icon: '🍽️' },
    { value: 'activity', label: 'Activities', icon: '🎯' },
    { value: 'event', label: 'Events', icon: '🎉' }
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

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0" onClick={() => window.scrollTo(0, 0)}>
            <div className="text-3xl">🏔️</div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-amber-900">Red Rock Resort</div>
              <div className="text-xs text-gray-600 italic hidden md:block">Luxury Retreat in Nature</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('rooms')}
              className="text-sm text-gray-700 hover:text-amber-800 transition font-medium whitespace-nowrap"
            >
              Rooms
            </button>
            <button 
              onClick={() => scrollToSection('dining')}
              className="text-sm text-gray-700 hover:text-amber-800 transition font-medium whitespace-nowrap"
            >
              Dining
            </button>
            <button 
              onClick={() => scrollToSection('activities')}
              className="text-sm text-gray-700 hover:text-amber-800 transition font-medium whitespace-nowrap"
            >
              Activities
            </button>
            <Link 
              to="/events"
              className="text-sm text-gray-700 hover:text-amber-800 transition font-medium whitespace-nowrap"
            >
              Events
            </Link>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-sm text-gray-700 hover:text-amber-800 transition font-medium whitespace-nowrap"
            >
              Contact
            </button>
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
                placeholder="Search..."
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
                        <p className="text-xs text-gray-500">Guest Account</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition"
                      >
                        👤 My Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-amber-800 font-semibold hover:bg-amber-50 transition"
                        >
                          ⚙️ Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          🚪 Sign Out
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
                  className="px-3 py-2 text-amber-800 hover:bg-amber-50 rounded-lg transition font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-medium text-sm"
                >
                  Register
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
              placeholder="Search..."
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
            Rooms
          </button>
          <span className="text-gray-400">•</span>
          <button onClick={() => scrollToSection('dining')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Dining
          </button>
          <span className="text-gray-400">•</span>
          <button onClick={() => scrollToSection('activities')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Activities
          </button>
          <span className="text-gray-400">•</span>
          <Link to="/events" className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Events
          </Link>
          <span className="text-gray-400">•</span>
          <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-amber-800 px-2 py-1">
            Contact
          </button>
        </nav>
      </div>
    </div>
  );
}

export default TopBar;