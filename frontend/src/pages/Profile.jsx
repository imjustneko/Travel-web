import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
      const response = await api.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({ ...formData, name: response.data.name });
      setLoading(false);
    } catch (error) {
      setError('Профайл ачааллахад алдаа гарлаа');
      setLoading(false);
    }
  };
  const fetchSubscription = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/api/subscription/status', {
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
    await api.put(
      '/api/subscription/upgrade',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSubscription();
    fetchProfile();
    setSuccess('🎉 Премиүм болгох амжилттай боллоо!');
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    setError(error.response?.data?.message || 'Дэвшүүлэхэд алдаа гарлаа');
  }
};

const handleDowngrade = async () => {
  if (!window.confirm('Та пүрэмиум гишүүнчлэлээ цуцлахдаа итгэлтэй байна уу?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await api.put(
      '/api/subscription/downgrade',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSubscription();
    fetchProfile();
    setSuccess('Зочны данс руу буулгагдлаа');
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    setError(error.response?.data?.message || 'Буулгахад алдаа гарлаа');
  }
};

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/reservations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/reservations/${reservationId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh reservations
      fetchReservations();
      setSuccess('Захиалга амжилттай цуцлагдлаа');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Захиалгыг цуцлахад алдаа гарлаа');
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
      setError('Шинэ нууц үгнүүд таарахгүй байна');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = { name: formData.name };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put(
        '/api/user/profile',
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

      setSuccess('Профайл амжилттай шинэчлэгдлаа!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
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
        <div className="text-2xl text-amber-800">Уншиж байна...</div>
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
                ✏️ Профайл засах
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
                  <div className="text-gray-600">Идэвхтэй захиалгууд</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{reservations.length}</div>
                  <div className="text-gray-600">Нийт захиалгууд</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {subscription?.accountType === 'premium' ? '⭐ Пүрэмиум' : '👤 Зочин'}
                  </div>
                  <div className="text-gray-600">Дансны төрөл</div>
                </div>
              </div>

              {/* Subscription Card */}
              {subscriptionLoading ? (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-6 mb-8">
                  <p className="text-amber-700">Гишүүнчлэлийн статусыг ачааллаж байна...</p>
                </div>
              ) : subscription ? (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-6 mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-1">Гишүүнчлэлийн статус</h3>
                      <p className="text-amber-700">
                        {subscription.accountType === 'premium' ? '⭐ Пүрэмиум гишүүн' : '👤 Зочны данс'}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      subscription.accountType === 'premium' 
                        ? 'bg-amber-800 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {subscription.accountType === 'premium' ? 'ИДЭВХТЭЙ' : 'ЗОЧИН'}
                    </span>
                  </div>

                  {subscription.accountType === 'premium' && (
                    <div className="mb-4 text-sm text-amber-700">
                      <strong>Сунгалтын огноо:</strong> {new Date(subscription.subscriptionExpiry).toLocaleDateString()}
                    </div>
                  )}

                  {/* Benefits List */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-amber-900 mb-3">Таны давуу тал:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? 'Эрт захиалах эрх' : 'Стандарт захиалга'}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? 'Бүх захиалгад 20% хямдрал' : 'Стандарт үнэ'}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? 'Үнэгүй өрөө дэвшүүлэх' : 'Дэвшүүлэх боломжгүй'}
                      </div>
                      <div className="flex items-center text-amber-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {subscription.accountType === 'premium' ? '24/7 Тэргүүн тусламж' : 'Стандарт тусламж'}
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
                        🚀 Премиүм болгох
                      </button>
                    ) : (
                      <button
                        onClick={handleDowngrade}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        📉 Зочин рүү буулгах
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-6 mb-8">
                  <p className="text-amber-700">Гишүүнчлэлийн статусыг ачааллах боломжгүй</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Дансны дэлгэрэнгүй</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Гишүүн болсон огноо:</span>
                    <span className="font-semibold">
                      {new Date(profile?.memberSince).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дансны статус:</span>
                    <span className="font-semibold text-green-600">Идэвхтэй</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Профайл засах</h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Бүтэн нэр</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">И-мэйл хаяг</label>
                <input
                  type="email"
                  value={profile?.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">И-мэйл хаягийг өөрчлөх боломжгүй</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Нууц үг солих (Заавал биш)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Одоогийн нууц үг</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Одоогийн нууц үгийг оруулна уу"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Шинэ нууц үг</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Шинэ нууц үгийг оруулна уу (доод тал нь 6 тэмдэгт)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Шинэ нууц үгийг баталгаажуулах</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Шинэ нууц үгийг дахин оруулна уу"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  💾 Өөрчлөлт хадгалах
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition font-semibold"
                >
                  ✖️ Цуцлах
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
        <h2 className="text-2xl font-bold mb-6">Миний захиалгууд</h2>

        {reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-xl mb-2">Захиалга байхгүй байна</p>
            <p className="text-sm mb-6">Төгс хонолтоо төлөвлөж эхлэх</p>
            <button
              onClick={() => navigate('/')}
              className="bg-amber-800 text-white px-6 py-3 rounded-lg hover:bg-amber-900 transition font-semibold"
            >
              Манай ресортыг судлах
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
                          ? `${BASE_URL}${reservation.itemDetails.image}`
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
                      {reservation.itemDetails?.price || 'Тодорхойгүй'} шөнөд
                    </p>

                    <p className="text-gray-500 text-xs mb-4">
                      Захиалсан огноо: {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      {reservation.item && (
                        <button
                          onClick={() => handleViewRoom(reservation.item._id)}
                          className="flex-1 bg-amber-800 text-white px-3 py-2 rounded text-sm hover:bg-amber-900 transition"
                        >
                          Өрөө үзэх
                        </button>
                      )}
                      {reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition"
                        >
                          Цуцлах
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