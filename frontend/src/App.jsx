// frontend/src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import api from './api';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DestinationDetail from './pages/DestinationDetail';
import EventsList from './pages/EventsList';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserName('');
      return;
    }

    setIsAuthenticated(true);
    setIsAdmin(storedUser.isAdmin || false);
    setUserName(storedUser.name || '');

    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const serverUser = response.data;
        localStorage.setItem('user', JSON.stringify(serverUser));
        setIsAdmin(serverUser.isAdmin || false);
        setUserName(serverUser.name || '');
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setIsAdmin(userData.isAdmin || false);
    setUserName(userData.name || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserName('');
  };

  const handleSearch = (params) => {
    setSearchParams(params);
  };

  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Admin Route Component
  const AdminRoute = ({ children }) => {
    return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
  };

  if (isAdminPage) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard onLogout={handleLogout} userName={userName} />
            </AdminRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        userName={userName}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home searchParams={searchParams} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/events" element={<EventsList />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile userName={userName} setUserName={setUserName} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
    </div>
  );
}

export default App;