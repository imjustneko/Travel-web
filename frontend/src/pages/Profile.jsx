import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile({ userName, setUserName }) {
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchReservations();
    fetchSubscription();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({ ...formData, name: response.data.name });
      setLoading(false);
    } catch (error) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };
  const fetchSubscription = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/subscription/status', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSubscription(response.data);
    setSubscriptionLoading(false);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    setSubscriptionLoading(false);
  }
};

const handleUpgrade = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      'http://localhost:5000/api/subscription/upgrade',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSubscription();
    fetchProfile();
    setSuccess('🎉 Upgraded to Premium successfully!');
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    setError(error.response?.data?.message || 'Failed to upgrade');
  }
};

const handleDowngrade = async () => {
  if (!window.confirm('Are you sure you want to cancel your premium membership?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.put(
      'http://localhost:5000/api/subscription/downgrade',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSubscription();
    fetchProfile();
    setSuccess('Downgraded to Guest account');
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    setError(error.response?.data?.message || 'Failed to downgrade');
  }
};

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reservations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/reservations/${reservationId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh reservations
      fetchReservations();
      setSuccess('Reservation cancelled successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to cancel reservation');
    }
  };

  const handleViewRoom = (itemId) => {
    navigate(`/destination/${itemId}`);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = { name: formData.name };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        'http://localhost:5000/api/user/profile',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = response.data.user.name;
      localStorage.setItem('user', JSON.stringify(user));
      setUserName(response.data.user.name);
      setProfile({ ...profile, name: response.data.user.name });
      
      setFormData({
        name: response.data.user.name,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: profile.name,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditing(false);
    setError('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.confirmed;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-amber-800">Loading...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Profile Information Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 h-32"></div>
        
        <div className="relative px-6 pb-6">
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-5xl text-amber-800 font-bold">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="pt-20 flex justify-end">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-amber-800 text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile?.name}</h1>
              <p className="text-gray-600 mb-6">{profile?.email}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-amber-800">{reservations.filter(r => r.status === 'confirmed').length}</div>
                  <div className="text-gray-600">Active Reservations</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{reservations.length}</div>
                  <div className="text-gray-600">Total Bookings</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {subscription?.accountType === 'premium' ? '⭐ Premium' : '👤 Guest'}
                  </div>
                  <div className="text-gray-600">Account Type</div>
                </div>
              </div>

              {/* Subscription Card */}
              {subscriptionLoading ? (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-6 mb-8">
                  <p className="text-amber-700">Loading subscription status...</p>
                </div>
              ) : subscription ? (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-6 mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-1">Membership Status</h3>
                      <p className="text-amber-700">

                        {subscription.accountType === 'premium' ? '⭐ Premium Member' : '👤 Guest Account'}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      subscription.accountType === 'premium' 
                        ? 'bg-amber-800 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {subscription.accountType === 'premium' ? 'ACTIVE' : 'GUEST'}
                    </span>
                  </div>

                  {subscription.accountType === 'premium' && (
                    <div className="mb-4 text-sm text-amber-700">
                      <strong>Renewal Date:</strong> {new Date(subscription.subscriptionExpiry).toLocaleDateString()}
                    </div>
                  )}

                  {/* Benefits List */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-amber-900 mb-3">Your Benefits:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? 'Early Booking Access' : 'Standard Booking'}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? '20% Discount on All Bookings' : 'Standard Pricing'}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? 'Free Room Upgrades' : 'No Upgrades'}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? '24/7 Priority Support' : 'Standard Support'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {subscription.accountType === 'guest' ? (
                      <button
                        onClick={handleUpgrade}
                        className="bg-amber-800 text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition font-semibold"
                      >
                        🚀 Upgrade to Premium
                      </button>
                    ) : (
                      <button
                        onClick={handleDowngrade}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        📉 Downgrade to Guest
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-6 mb-8">
                  <p className="text-amber-700">Unable to load subscription status</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-semibold">
                      {new Date(profile?.memberSince).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status:</span>
                    <span className="font-semibold text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profile?.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Change Password (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition font-semibold"
                >
                  ✖️ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Spacing between profile and reservations */}
      <div className="my-4"></div>

      {/* Reservations Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">My Reservations</h2>
        
        {reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-xl mb-2">No reservations yet</p>
            <p className="text-sm mb-6">Start planning your perfect stay</p>
            <button
              onClick={() => navigate('/')}
              className="bg-amber-800 text-white px-6 py-3 rounded-lg hover:bg-amber-900 transition font-semibold"
            >
              Explore Our Resort
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="w-1/3">
                    <img
                      src={
                        reservation.itemDetails?.image
                          ? `http://localhost:5000${reservation.itemDetails.image}`
                          : 'https://via.placeholder.com/200x150?text=Room'
                      }
                      alt={reservation.itemDetails?.title || 'Room'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="w-2/3 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {reservation.itemDetails?.title || 'Room'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">
                      {reservation.itemDetails?.price || 'N/A'} per night
                    </p>

                    <p className="text-gray-500 text-xs mb-4">
                      Booked on {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      {reservation.item && (
                        <button
                          onClick={() => handleViewRoom(reservation.item._id)}
                          className="flex-1 bg-amber-800 text-white px-3 py-2 rounded text-sm hover:bg-amber-900 transition"
                        >
                          View Room
                        </button>
                      )}
                      {reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;