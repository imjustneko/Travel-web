import { useState, useEffect } from 'react';
import api from '../api';

const TOKEN = () => localStorage.getItem('token');
const AUTH = () => ({ headers: { Authorization: `Bearer ${TOKEN()}` } });

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Destination form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', location: '',
    duration: '5 days', featured: false, discount: '', originalPrice: '', category: 'room'
  });
  const [imageUrls, setImageUrls] = useState(['']);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, destRes, usersRes, reservRes] = await Promise.all([
        api.get('/api/admin/stats', AUTH()),
        api.get('/api/admin/destinations', AUTH()),
        api.get('/api/admin/users', AUTH()),
        api.get('/api/admin/reservations', AUTH()),
      ]);
      setStats(statsRes.data);
      setDestinations(destRes.data);
      setUsers(usersRes.data);
      setReservations(reservRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  };

  // ── Destination handlers ──
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleSubmitDestination = async (e) => {
    e.preventDefault();
    try {
      const validImages = imageUrls.filter(url => url.trim() !== '');
      const data = { ...formData, images: validImages };
      if (editingId) {
        await api.put(`/api/admin/destinations/${editingId}`, data, AUTH());
      } else {
        await api.post('/api/admin/destinations', data, AUTH());
      }
      resetForm();
      fetchAll();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Хадгалахад алдаа гарлаа');
    }
  };

  const handleEditDestination = (d) => {
    setFormData({
      title: d.title, description: d.description, price: d.price,
      location: d.location, duration: d.duration, featured: d.featured,
      discount: d.discount || '', originalPrice: d.originalPrice || '',
      category: d.category || 'room'
    });
    setImageUrls(d.images && d.images.length > 0 ? [...d.images] : ['']);
    setEditingId(d._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDestination = async (id) => {
    if (!window.confirm('Энэ мэдээллийг устгах уу?')) return;
    try {
      await api.delete(`/api/admin/destinations/${id}`, AUTH());
      fetchAll();
    } catch (error) {
      alert('Устгахад алдаа гарлаа');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', price: '', location: '',
      duration: '5 days', featured: false, discount: '', originalPrice: '', category: 'room'
    });
    setImageUrls(['']);
    setEditingId(null);
    setShowForm(false);
  };

  // ── User handlers ──
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`"${name}" хэрэглэгчийг устгах уу? Түүний захиалгууд ч устгагдана.`)) return;
    try {
      await api.delete(`/api/admin/users/${id}`, AUTH());
      fetchAll();
    } catch (error) {
      alert('Устгахад алдаа гарлаа');
    }
  };

  // ── Reservation handlers ──
  const handleUpdateReservationStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/reservations/${id}/status`, { status }, AUTH());
      fetchAll();
    } catch (error) {
      alert('Төлөв солиход алдаа гарлаа');
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Захиалгыг устгах уу?')) return;
    try {
      await api.delete(`/api/admin/reservations/${id}`, AUTH());
      fetchAll();
    } catch (error) {
      alert('Устгахад алдаа гарлаа');
    }
  };

  const statusColor = (s) => ({
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600');

  const statusLabel = (s) => ({ confirmed: 'Баталгаажсан', pending: 'Хүлээгдэж байна', cancelled: 'Цуцлагдсан' }[s] || s);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('mn-MN') : '—';

  const tabs = [
    { key: 'overview', label: 'Тойм', icon: '📊' },
    { key: 'destinations', label: 'Жагсаалт', icon: '🏨' },
    { key: 'reservations', label: 'Захиалга', icon: '📋' },
    { key: 'users', label: 'Хэрэглэгчид', icon: '👥' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <div className="text-gray-600">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  const validPreviewUrls = imageUrls.filter(url => url.trim().startsWith('http'));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Admin Dashboard</h1>
        <button
          onClick={fetchAll}
          className="text-sm text-amber-800 hover:text-amber-900 font-medium border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-50 transition"
        >
          ↻ Шинэчлэх
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Нийт жагсаалт', value: stats.totalDestinations, icon: '🏨', color: 'from-amber-50 to-orange-50 border-amber-200' },
              { label: 'Нийт хэрэглэгч', value: stats.totalUsers, icon: '👥', color: 'from-blue-50 to-indigo-50 border-blue-200' },
              { label: 'Нийт захиалга', value: stats.totalReservations, icon: '📋', color: 'from-purple-50 to-violet-50 border-purple-200' },
              { label: 'Баталгаажсан', value: stats.confirmedReservations, icon: '✅', color: 'from-green-50 to-emerald-50 border-green-200' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} border rounded-2xl p-6`}>
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Recent reservations preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Сүүлийн захиалгууд</h2>
            {reservations.length === 0 ? (
              <p className="text-gray-400 text-sm">Захиалга байхгүй байна</p>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map(r => (
                  <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-800">
                        {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{r.user?.name || 'Устгагдсан хэрэглэгч'}</p>
                        <p className="text-xs text-gray-400">{r.itemDetails?.title || r.item?.title || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">{r.itemDetails?.price || r.item?.price || '—'}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reservations.length > 5 && (
              <button
                onClick={() => setActiveTab('reservations')}
                className="mt-3 text-sm text-amber-800 hover:text-amber-900 font-medium"
              >
                Бүгдийг харах →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── DESTINATIONS TAB ── */}
      {activeTab === 'destinations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">Нийт {destinations.length} жагсаалт</p>
            <button
              onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
              className="bg-amber-800 text-white px-5 py-2 rounded-lg hover:bg-amber-900 transition text-sm font-semibold"
            >
              {showForm ? 'Хаах' : '+ Нэмэх'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-5 text-gray-800">
                {editingId ? 'Мэдээлэл засах' : 'Шинэ мэдээлэл нэмэх'}
              </h2>
              <form onSubmit={handleSubmitDestination} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Гарчиг" required className="border px-3 py-2 rounded-lg text-sm" />
                  <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Байршил" required className="border px-3 py-2 rounded-lg text-sm" />
                </div>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Тайлбар" rows="3" required className="border px-3 py-2 rounded-lg w-full text-sm" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input name="price" value={formData.price} onChange={handleInputChange} placeholder="Үнэ" className="border px-3 py-2 rounded-lg text-sm" />
                  <input name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} placeholder="Анхны үнэ" className="border px-3 py-2 rounded-lg text-sm" />
                  <input name="discount" value={formData.discount} onChange={handleInputChange} placeholder="Хөнгөлөлт" className="border px-3 py-2 rounded-lg text-sm" />
                  <input name="duration" value={formData.duration} onChange={handleInputChange} placeholder="Хугацаа" className="border px-3 py-2 rounded-lg text-sm" />
                </div>
                <div className="flex items-center gap-4">
                  <select name="category" value={formData.category} onChange={handleInputChange} className="border px-3 py-2 rounded-lg text-sm">
                    <option value="room">Өрөө / Сюит</option>
                    <option value="dining">Хоол хүнс</option>
                    <option value="activity">Үйл ажиллагаа</option>
                    <option value="event">Арга хэмжээ</option>
                    <option value="offer">Тусгай санал</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} />
                    Онцлох
                  </label>
                </div>

                {/* Image URLs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Зургийн URL-ууд</label>
                  <div className="space-y-2">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageUrlChange(i, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="border px-3 py-2 rounded-lg flex-1 text-sm"
                        />
                        <button type="button" onClick={() => imageUrls.length === 1 ? setImageUrls(['']) : setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm transition">✕</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setImageUrls([...imageUrls, ''])}
                    className="mt-2 text-amber-800 hover:text-amber-900 text-sm font-medium">+ Зураг нэмэх</button>
                </div>

                {validPreviewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {validPreviewUrls.map((url, i) => (
                      <img key={i} src={url} alt={`preview ${i + 1}`}
                        className="w-24 h-16 object-cover rounded-lg border border-gray-200"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm transition">
                    {editingId ? 'Шинэчлэх' : 'Үүсгэх'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-200 text-sm transition">Цуцлах</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Зураг</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Гарчиг</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ангилал</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Үнэ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Зураг</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((d) => (
                  <tr key={d._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {d.images?.[0] ? (
                        <img src={d.images[0]} alt={d.title} className="w-14 h-10 object-cover rounded-lg"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'; }} />
                      ) : (
                        <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">—</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{d.title}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm capitalize">{d.category}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm font-medium">{d.price}</td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{d.images?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleEditDestination(d)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg mr-2 text-xs font-medium transition">Засах</button>
                      <button onClick={() => handleDeleteDestination(d._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">Устгах</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {destinations.length === 0 && <div className="text-center py-10 text-gray-400">Мэдээлэл байхгүй байна</div>}
          </div>
        </div>
      )}

      {/* ── RESERVATIONS TAB ── */}
      {activeTab === 'reservations' && (
        <div>
          <p className="text-gray-500 text-sm mb-4">Нийт {reservations.length} захиалга</p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Хэрэглэгч</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Захиалсан зүйл</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Үнэ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Зочдын тоо</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Төлөв</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Огноо</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-800">
                          {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{r.user?.name || 'Устгагдсан'}</p>
                          <p className="text-xs text-gray-400">{r.user?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{r.itemDetails?.title || r.item?.title || '—'}</p>
                      <p className="text-xs text-gray-400 capitalize">{r.itemDetails?.category || r.item?.category || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-sm">{r.itemDetails?.price || r.item?.price || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{r.guests || 1} хүн</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => handleUpdateReservationStatus(r._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusColor(r.status)}`}
                      >
                        <option value="confirmed">Баталгаажсан</option>
                        <option value="pending">Хүлээгдэж байна</option>
                        <option value="cancelled">Цуцлагдсан</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteReservation(r._id)} className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">Устгах</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reservations.length === 0 && <div className="text-center py-10 text-gray-400">Захиалга байхгүй байна</div>}
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div>
          <p className="text-gray-500 text-sm mb-4">Нийт {users.length} хэрэглэгч</p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Хэрэглэгч</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Имэйл</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Төрөл</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Эрх</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Бүртгэлийн огноо</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        u.accountType === 'premium'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.accountType === 'premium' ? '⭐ Premium' : 'Guest'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Admin</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Хэрэглэгч</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {!u.isAdmin && (
                        <button onClick={() => handleDeleteUser(u._id, u.name)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                          Устгах
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-10 text-gray-400">Хэрэглэгч байхгүй байна</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
