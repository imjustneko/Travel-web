import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TOKEN = () => localStorage.getItem('token');
const AUTH = () => ({ headers: { Authorization: `Bearer ${TOKEN()}` } });

const NAV_ITEMS = [
  { key: 'overview',      label: 'Тойм' },
  { key: 'destinations',  label: 'Жагсаалт' },
  { key: 'reservations',  label: 'Захиалга' },
  { key: 'users',         label: 'Хэрэглэгчид' },
];

export default function AdminDashboard({ onLogout, userName }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Destination form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', location: '',
    duration: '5 days', featured: false, discount: '', originalPrice: '', category: 'room',
  });
  const [imageUrls, setImageUrls] = useState(['']);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, d, u, r] = await Promise.all([
        api.get('/api/admin/stats', AUTH()),
        api.get('/api/admin/destinations', AUTH()),
        api.get('/api/admin/users', AUTH()),
        api.get('/api/admin/reservations', AUTH()),
      ]);
      setStats(s.data);
      setDestinations(d.data);
      setUsers(u.data);
      setReservations(r.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ── Destination ──
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitDest = async (e) => {
    e.preventDefault();
    const images = imageUrls.filter(u => u.trim());
    const data = { ...formData, images };
    try {
      if (editingId) await api.put(`/api/admin/destinations/${editingId}`, data, AUTH());
      else await api.post('/api/admin/destinations', data, AUTH());
      resetForm();
      fetchAll();
    } catch { alert('Хадгалахад алдаа гарлаа'); }
  };

  const handleEditDest = (d) => {
    setFormData({
      title: d.title, description: d.description, price: d.price,
      location: d.location, duration: d.duration, featured: d.featured,
      discount: d.discount || '', originalPrice: d.originalPrice || '',
      category: d.category || 'room',
    });
    setImageUrls(d.images?.length ? [...d.images] : ['']);
    setEditingId(d._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDest = async (id) => {
    if (!window.confirm('Устгах уу?')) return;
    try { await api.delete(`/api/admin/destinations/${id}`, AUTH()); fetchAll(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', price: '', location: '',
      duration: '5 days', featured: false, discount: '', originalPrice: '', category: 'room',
    });
    setImageUrls(['']);
    setEditingId(null);
    setShowForm(false);
  };

  // ── Users ──
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`"${name}" хэрэглэгчийг устгах уу?`)) return;
    try { await api.delete(`/api/admin/users/${id}`, AUTH()); fetchAll(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };

  // ── Reservations ──
  const handleReservationStatus = async (id, status) => {
    try { await api.put(`/api/admin/reservations/${id}/status`, { status }, AUTH()); fetchAll(); }
    catch { alert('Алдаа гарлаа'); }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Захиалгыг устгах уу?')) return;
    try { await api.delete(`/api/admin/reservations/${id}`, AUTH()); fetchAll(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };

  const statusStyle = (s) => ({
    confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    cancelled: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  }[s] || 'bg-gray-100 text-gray-500');

  const statusLabel = (s) => ({ confirmed: 'Баталгаажсан', pending: 'Хүлээгдэж байна', cancelled: 'Цуцлагдсан' }[s] || s);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('mn-MN') : '—';

  const validPreviews = imageUrls.filter(u => u.trim().startsWith('http'));

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="text-white font-bold text-base leading-tight">Улаан Хад</div>
          <div className="text-gray-500 text-xs mt-0.5">Admin панель</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
              {key === 'reservations' && reservations.length > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === key ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300'
                }`}>
                  {reservations.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{userName || 'Admin'}</div>
              <div className="text-gray-500 text-xs">Администратор</div>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full text-left text-xs text-gray-500 hover:text-gray-300 transition py-1"
          >
            Гарах
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {NAV_ITEMS.find(t => t.key === activeTab)?.label}
            </h1>
          </div>
          <button
            onClick={fetchAll}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            Шинэчлэх
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Уншиж байна...</div>
          ) : (
            <>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Нийт жагсаалт',  value: stats.totalDestinations,    sub: 'destinations' },
                      { label: 'Нийт хэрэглэгч', value: stats.totalUsers,            sub: 'бүртгэлтэй' },
                      { label: 'Нийт захиалга',  value: stats.totalReservations,     sub: 'бүгд' },
                      { label: 'Баталгаажсан',   value: stats.confirmedReservations, sub: 'захиалга' },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-800">Сүүлийн захиалгууд</h2>
                    </div>
                    {reservations.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-gray-400">Захиалга байхгүй</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {reservations.slice(0, 6).map(r => (
                          <div key={r._id} className="px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                                {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{r.user?.name || '—'}</p>
                                <p className="text-xs text-gray-400">{r.itemDetails?.title || r.item?.title || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-gray-700">{r.itemDetails?.price || r.item?.price || '—'}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle(r.status)}`}>{statusLabel(r.status)}</span>
                              <span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {reservations.length > 6 && (
                      <div className="px-5 py-3 border-t border-gray-50">
                        <button onClick={() => setActiveTab('reservations')} className="text-xs text-gray-500 hover:text-gray-800 transition">
                          Бүгдийг харах ({reservations.length}) →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── DESTINATIONS ── */}
              {activeTab === 'destinations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{destinations.length} жагсаалт</p>
                    <button
                      onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                      className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                    >
                      {showForm ? 'Хаах' : '+ Нэмэх'}
                    </button>
                  </div>

                  {showForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-base font-semibold text-gray-900 mb-5">
                        {editingId ? 'Мэдээлэл засах' : 'Шинэ мэдээлэл'}
                      </h2>
                      <form onSubmit={handleSubmitDest} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <input name="title" value={formData.title} onChange={handleInput} placeholder="Гарчиг" required
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          <input name="location" value={formData.location} onChange={handleInput} placeholder="Байршил" required
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <textarea name="description" value={formData.description} onChange={handleInput} placeholder="Тайлбар" rows="3" required
                          className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none" />
                        <div className="grid grid-cols-4 gap-3">
                          <input name="price" value={formData.price} onChange={handleInput} placeholder="Үнэ"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          <input name="originalPrice" value={formData.originalPrice} onChange={handleInput} placeholder="Анхны үнэ"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          <input name="discount" value={formData.discount} onChange={handleInput} placeholder="Хөнгөлөлт"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          <input name="duration" value={formData.duration} onChange={handleInput} placeholder="Хугацаа"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div className="flex items-center gap-4">
                          <select name="category" value={formData.category} onChange={handleInput}
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="room">Өрөө / Сюит</option>
                            <option value="dining">Хоол хүнс</option>
                            <option value="activity">Үйл ажиллагаа</option>
                            <option value="event">Арга хэмжээ</option>
                            <option value="offer">Тусгай санал</option>
                            <option value="gallery">Галерей (байгаль)</option>
                          </select>
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInput}
                              className="rounded border-gray-300" />
                            Онцлох
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Зургийн URL</label>
                          <div className="space-y-2">
                            {imageUrls.map((url, i) => (
                              <div key={i} className="flex gap-2">
                                <input type="url" value={url} onChange={e => {
                                  const u = [...imageUrls]; u[i] = e.target.value; setImageUrls(u);
                                }} placeholder="https://example.com/image.jpg"
                                  className="border border-gray-200 px-3 py-2 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                                <button type="button" onClick={() => setImageUrls(imageUrls.length === 1 ? [''] : imageUrls.filter((_, idx) => idx !== i))}
                                  className="px-3 py-2 text-sm text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition">
                                  Хасах
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => setImageUrls([...imageUrls, ''])}
                            className="mt-2 text-sm text-gray-500 hover:text-gray-800 transition">
                            + Зураг нэмэх
                          </button>
                        </div>

                        {validPreviews.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {validPreviews.map((url, i) => (
                              <img key={i} src={url} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                                onError={e => { e.target.style.display = 'none'; }} />
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button type="submit"
                            className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
                            {editingId ? 'Шинэчлэх' : 'Үүсгэх'}
                          </button>
                          <button type="button" onClick={resetForm}
                            className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                            Цуцлах
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Зураг</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Гарчиг</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ангилал</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Үнэ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Зургийн тоо</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Үйлдэл</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {destinations.map(d => (
                          <tr key={d._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              {d.images?.[0] ? (
                                <img src={d.images[0]} alt="" className="w-12 h-9 object-cover rounded-lg"
                                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80'; }} />
                              ) : (
                                <div className="w-12 h-9 bg-gray-100 rounded-lg" />
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                            <td className="px-4 py-3 text-gray-500 capitalize">{d.category}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{d.price}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                {d.images?.length || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditDest(d)}
                                  className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition font-medium">
                                  Засах
                                </button>
                                <button onClick={() => handleDeleteDest(d._id)}
                                  className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition font-medium">
                                  Устгах
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {destinations.length === 0 && (
                      <div className="text-center py-12 text-sm text-gray-400">Мэдээлэл байхгүй</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── RESERVATIONS ── */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{reservations.length} захиалга</p>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Хэрэглэгч</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Захиалсан зүйл</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Үнэ</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Зочид</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Төлөв</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Огноо</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Үйлдэл</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {reservations.map(r => (
                          <tr key={r._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{r.user?.name || 'Устгагдсан'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{r.user?.email || '—'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{r.itemDetails?.title || r.item?.title || '—'}</p>
                              <p className="text-xs text-gray-400 capitalize mt-0.5">{r.itemDetails?.category || r.item?.category || '—'}</p>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{r.itemDetails?.price || r.item?.price || '—'}</td>
                            <td className="px-4 py-3 text-gray-500">{r.guests || 1}</td>
                            <td className="px-4 py-3">
                              <select value={r.status} onChange={e => handleReservationStatus(r._id, e.target.value)}
                                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${statusStyle(r.status)}`}>
                                <option value="confirmed">Баталгаажсан</option>
                                <option value="pending">Хүлээгдэж байна</option>
                                <option value="cancelled">Цуцлагдсан</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(r.createdAt)}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDeleteReservation(r._id)}
                                className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition font-medium">
                                Устгах
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reservations.length === 0 && (
                      <div className="text-center py-12 text-sm text-gray-400">Захиалга байхгүй</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{users.length} хэрэглэгч</p>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Нэр</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Имэйл</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Төрөл</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Эрх</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Бүртгэгдсэн</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Үйлдэл</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <span className="font-medium text-gray-900">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                u.accountType === 'premium'
                                  ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {u.accountType === 'premium' ? 'Premium' : 'Guest'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {u.isAdmin ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">Admin</span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(u.createdAt)}</td>
                            <td className="px-4 py-3">
                              {!u.isAdmin && (
                                <button onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition font-medium">
                                  Устгах
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && (
                      <div className="text-center py-12 text-sm text-gray-400">Хэрэглэгч байхгүй</div>
                    )}
                  </div>
                </div>
              )}

            </>
          )}
        </main>
      </div>
    </div>
  );
}
