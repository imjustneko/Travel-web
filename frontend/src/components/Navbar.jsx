// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md transition text-sm font-medium"
            >
              🏠 Home
            </Link>
            <Link 
              to="/" 
              className="hover:bg-blue-700 px-3 py-2 rounded-md transition text-sm font-medium"
            >
              🗺️ Destinations
            </Link>
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className="hover:bg-blue-700 px-3 py-2 rounded-md transition text-sm font-medium"
              >
                👤 My Account
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded-md transition font-semibold text-sm"
              >
                ⚙️ Admin
              </Link>
            )}
          </div>

          {/* Right Side Info */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="hidden md:block">📞 +1 (234) 567-890</span>
            <span className="hidden lg:block">✉️ info@travelhub.com</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;