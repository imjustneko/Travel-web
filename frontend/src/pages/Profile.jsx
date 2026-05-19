import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

function Profile({ userName, setUserName }) {
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [formData, setFormData] = useState({
    name: '', currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const [profileRes, resRes, subRes] = await Promise.all([
        api.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/reservations/my', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/subscription/status', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null })),
      ]);
      setProfile(profileRes.data);
      setFormData(f => ({ ...f, name: profileRes.data.name }));
      setReservations(resRes.data.reservations || []);
      setSubscription(subRes.data);
    } catch (err) {
      setError('Профайл ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Шинэ нууц үгнүүд таарахгүй байна'); return;
    }
    try {
      const token = localStorage.getItem('token');
      const updateData = { name: formData.name };
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      const res = await api.put('/api/user/profile', updateData, { headers: { Authorization: `Bearer ${token}` } });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = res.data.user.name;
      localStorage.setItem('user', JSON.stringify(user));
      setUserName(res.data.user.name);
      setProfile(p => ({ ...p, name: res.data.user.name }));
      setFormData(f => ({ ...f, name: res.data.user.name, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setSuccess('Профайл амжилттай шинэчлэгдлаа');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Захиалгыг цуцлах уу?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/reservations/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
      setSuccess('Захиалга цуцлагдлаа');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Цуцлахад алдаа гарлаа'); }
  };

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/subscription/upgrade', {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
      setSuccess('Premium болгох амжилттай боллоо!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Алдаа гарлаа'); }
  };

  const handleDowngrade = async () => {
    if (!window.confirm('Premium гишүүнчлэлээ цуцлах уу?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/subscription/downgrade', {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
      setSuccess('Зочны данс руу буулгагдлаа');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Алдаа гарлаа'); }
  };

  const statusStyle = (s) => ({
    confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    cancelled: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  }[s] || 'bg-gray-100 text-gray-500');

  const statusLabel = (s) => ({ confirmed: 'Баталгаажсан', pending: 'Хүлээгдэж байна', cancelled: 'Цуцлагдсан' }[s] || s);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('mn-MN') : '—';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-sm">Уншиж байна...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500 text-sm">{error || 'Профайл олдсонгүй'}</p>
        <button onClick={() => navigate('/')} className="text-sm text-amber-800 underline">Нүүр хуудас</button>
      </div>
    );
  }

  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const isPremium = subscription?.accountType === 'premium';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Toast messages */}
        {success && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-amber-800 to-amber-900" />

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-amber-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {profile.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            <div className="pt-12 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isPremium ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isPremium ? 'Premium' : 'Guest'}
                  </span>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Засах
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Нийт захиалга',  value: reservations.length },
                { label: 'Идэвхтэй',       value: confirmedCount },
                { label: 'Гишүүн болсон',  value: fmtDate(profile.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Edit form ── */}
        {editing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Профайл засах</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Бүтэн нэр</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
                <input type="email" value={profile.email} disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Нууц үг солих (Заавал биш)</p>
                <div className="space-y-3">
                  {[
                    { name: 'currentPassword', label: 'Одоогийн нууц үг' },
                    { name: 'newPassword', label: 'Шинэ нууц үг' },
                    { name: 'confirmPassword', label: 'Шинэ нууц үг давтах' },
                  ].map(({ name, label }) => (
                    <div key={name}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input type="password" name={name} value={formData[name]} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-amber-800 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-900 transition">
                  Хадгалах
                </button>
                <button type="button" onClick={() => { setEditing(false); setError(''); }}
                  className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  Цуцлах
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Subscription card ── */}
        <div className={`rounded-2xl border p-6 ${
          isPremium
            ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'
            : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Гишүүнчлэл</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isPremium ? 'Premium гишүүн' : 'Зочны данс'}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              isPremium ? 'bg-violet-700 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {isPremium ? 'PREMIUM' : 'GUEST'}
            </span>
          </div>

          {isPremium && subscription?.subscriptionExpiry && (
            <p className="text-xs text-violet-600 mb-4">
              Сунгалтын огноо: {fmtDate(subscription.subscriptionExpiry)}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 mb-5 text-sm">
            {[
              isPremium ? 'Эрт захиалах эрх' : 'Стандарт захиалга',
              isPremium ? 'Бүх захиалгад 20% хямдрал' : 'Стандарт үнэ',
              isPremium ? 'Үнэгүй өрөө дэвшүүлэх' : 'Дэвшүүлэх боломжгүй',
              isPremium ? '24/7 Тэргүүн тусламж' : 'Стандарт тусламж',
            ].map(benefit => (
              <div key={benefit} className="flex items-center gap-1.5 text-gray-600">
                <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isPremium ? 'text-violet-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {benefit}
              </div>
            ))}
          </div>

          {isPremium ? (
            <button onClick={handleDowngrade}
              className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">
              Зочин рүү буулгах
            </button>
          ) : (
            <button onClick={handleUpgrade}
              className="text-sm font-semibold bg-violet-700 text-white px-5 py-2 rounded-lg hover:bg-violet-800 transition shadow-sm">
              Premium болгох
            </button>
          )}
        </div>

        {/* ── Reservations ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Миний захиалгууд</h2>

          {reservations.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-gray-400 text-sm mb-4">Одоогоор захиалга байхгүй байна</p>
              <button onClick={() => navigate('/')}
                className="text-sm font-semibold text-amber-800 border border-amber-200 px-5 py-2.5 rounded-xl hover:bg-amber-50 transition">
                Ресортыг үзэх
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(r => {
                const imgSrc = r.itemDetails?.image
                  ? getImageUrl(r.itemDetails.image)
                  : null;
                return (
                  <div key={r._id} className="flex gap-3 md:gap-4 border border-gray-100 rounded-xl p-3 md:p-4 hover:bg-gray-50 transition">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-24 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {imgSrc ? (
                        <img src={imgSrc} alt={r.itemDetails?.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {r.itemDetails?.title || 'Захиалга'}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{r.itemDetails?.category || '—'}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusStyle(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="font-semibold text-amber-800">{r.itemDetails?.price || '—'}</span>
                        {r.checkIn && <span>Орох: {fmtDate(r.checkIn)}</span>}
                        {r.checkOut && <span>Гарах: {fmtDate(r.checkOut)}</span>}
                        <span>{r.guests || 1} зочин</span>
                      </div>

                      {/* Payment info */}
                      {r.payment?.status === 'paid' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Төлбөр төлөгдсөн · {r.payment.method === 'card' ? 'Карт' : r.payment.method}
                          {r.payment.amount && ` · ${r.payment.amount}`}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        Захиалсан: {fmtDate(r.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                      {r.item && (
                        <button onClick={() => navigate(`/destination/${r.item._id || r.item}`)}
                          className="text-xs text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition font-medium">
                          Үзэх
                        </button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button onClick={() => handleCancelReservation(r._id)}
                          className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium">
                          Цуцлах
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
