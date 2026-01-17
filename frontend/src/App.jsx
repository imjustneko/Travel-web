// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
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
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    setIsAuthenticated(!!token);
    setIsAdmin(user.isAdmin || false);
    setUserName(user.name || '');
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

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Admin Route Component
  const AdminRoute = ({ children }) => {
    return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
  };

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
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>

      <Footer isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
    </div>
  );
}

export default App;