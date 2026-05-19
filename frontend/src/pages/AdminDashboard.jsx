import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TOKEN = () => localStorage.getItem('token');
const AUTH = () => ({ headers: { Authorization: `Bearer ${TOKEN()}` } });

const NAV_ITEMS = [
  { key: 'overview',     label: 'Тойм',        icon: '◈' },
  { key: 'revenue',      label: 'Орлого',       icon: '₮' },
  { key: 'destinations', label: 'Жагсаалт',     icon: '☰' },
  { key: 'packages',     label: 'Багцууд',       icon: '⊞' },
  { key: 'reservations', label: 'Захиалга',      icon: '✓' },
  { key: 'users',        label: 'Хэрэглэгчид',  icon: '⊕' },
];

// ── SVG Bar Chart ──────────────────────────────────────────────
function BarChart({ data, labelKey, valueKey, formatVal, color = '#d97706', height = 140 }) {
  if (!data?.length) return <p className="text-center py-8 text-xs text-gray-400">Өгөгдөл байхгүй</p>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const W = 100, totalW = data.length * W;
  return (
    <svg viewBox={`0 0 ${totalW} ${height + 28}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = Math.max(3, (d[valueKey] / max) * height);
        const x = i * W + 8, barW = W - 16, y = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="3" opacity="0.85" />
            {d[valueKey] > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="9" fill="#6b7280">
                {formatVal ? formatVal(d[valueKey]) : d[valueKey]}
              </text>
            )}
            <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize="8" fill="#9ca3af">
              {String(d[labelKey]).slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function OccupancyBars({ data }) {
  if (!data?.length) return null;
  const sorted = [...data].sort((a, b) => b.rate - a.rate);
  return (
    <div className="space-y-2">
      {data.map(({ month, rate }) => {
        const isBusiest = month === sorted[0]?.month;
        return (
          <div key={month} className="flex items-center gap-3 text-xs">
            <span className="w-14 text-right text-gray-400 flex-shrink-0">{month.slice(5)}-р сар</span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isBusiest ? 'bg-amber-500' : 'bg-amber-300'}`}
                style={{ width: `${rate}%` }} />
            </div>
            <span className={`w-10 font-semibold flex-shrink-0 ${isBusiest ? 'text-amber-700' : 'text-gray-500'}`}>{rate}%</span>
          </div>
        );
      })}
    </div>
  );
}

const fmtMNT = v => v >= 1000000
  ? `₮${(v / 1000000).toFixed(1)}M`
  : v >= 1000 ? `₮${(v / 1000).toFixed(0)}K` : `₮${v}`;

// ── Dynamic list input (activities / highlights) ───────────────
function ListInput({ label, items, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-1.5">
        {items.map((val, i) => (
          <div key={i} className="flex gap-2">
            <input value={val} onChange={e => {
              const next = [...items]; next[i] = e.target.value; onChange(next);
            }} placeholder={placeholder}
              className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <button type="button" onClick={() => onChange(items.length === 1 ? [''] : items.filter((_, idx) => idx !== i))}
              className="px-2.5 py-1.5 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition text-sm">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ''])}
        className="mt-1.5 text-xs text-gray-500 hover:text-gray-800 transition">+ Нэмэх</button>
    </div>
  );
}

export default function AdminDashboard({ onLogout, userName }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Destination form
  const [showDestForm, setShowDestForm] = useState(false);
  const [editingDestId, setEditingDestId] = useState(null);
  const [destForm, setDestForm] = useState({
    title: '', description: '', price: '', priceValue: '', location: '',
    duration: '5 days', featured: false, discount: '', originalPrice: '', category: 'room',
  });
  const [destImages, setDestImages] = useState(['']);

  // Package form
  const defaultPkg = {
    title: '', description: '', price: '', originalPrice: '', discount: '',
    duration: '1 шөнө', maxGuests: '2', featured: false, available: true,
    includesRoom: '', includesDining: '',
  };
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [pkgForm, setPkgForm] = useState(defaultPkg);
  const [pkgImages, setPkgImages] = useState(['']);
  const [pkgActivities, setPkgActivities] = useState(['']);
  const [pkgHighlights, setPkgHighlights] = useState(['']);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === 'revenue' && !revenue) fetchRevenue(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'packages') fetchPackages(); }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, d, u, r] = await Promise.all([
        api.get('/api/admin/stats', AUTH()),
        api.get('/api/admin/destinations', AUTH()),
        api.get('/api/admin/users', AUTH()),
        api.get('/api/admin/reservations', AUTH()),
      ]);
      setStats(s.data); setDestinations(d.data); setUsers(u.data); setReservations(r.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchRevenue = async () => {
    setRevenueLoading(true);
    try {
      const [rev, occ] = await Promise.all([
        api.get('/api/admin/revenue', AUTH()),
        api.get('/api/admin/occupancy', AUTH()),
      ]);
      setRevenue(rev.data); setOccupancy(occ.data);
    } catch (err) { console.error(err); }
    setRevenueLoading(false);
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get('/api/packages');
      setPackages(res.data.packages || []);
    } catch (err) { console.error(err); }
  };

  // ── Destination handlers ──
  const handleDestInput = e => {
    const { name, value, type, checked } = e.target;
    setDestForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitDest = async e => {
    e.preventDefault();
    const images = destImages.filter(u => u.trim());
    try {
      if (editingDestId) await api.put(`/api/admin/destinations/${editingDestId}`, { ...destForm, images }, AUTH());
      else await api.post('/api/admin/destinations', { ...destForm, images }, AUTH());
      resetDestForm(); fetchAll();
    } catch { alert('Хадгалахад алдаа гарлаа'); }
  };

  const handleEditDest = d => {
    setDestForm({
      title: d.title, description: d.description, price: d.price || '',
      priceValue: d.priceValue != null ? String(d.priceValue) : '',
      location: d.location, duration: d.duration, featured: d.featured,
      discount: d.discount || '', originalPrice: d.originalPrice || '',
      category: d.category || 'room',
    });
    setDestImages(d.images?.length ? [...d.images] : ['']);
    setEditingDestId(d._id); setShowDestForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDest = async id => {
    if (!window.confirm('Устгах уу?')) return;
    try { await api.delete(`/api/admin/destinations/${id}`, AUTH()); fetchAll(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };

  const resetDestForm = () => {
    setDestForm({ title: '', description: '', price: '', priceValue: '', location: '', duration: '5 days', featured: false, discount: '', originalPrice: '', category: 'room' });
    setDestImages(['']); setEditingDestId(null); setShowDestForm(false);
  };

  // ── Package handlers ──
  const handlePkgInput = e => {
    const { name, value, type, checked } = e.target;
    setPkgForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitPkg = async e => {
    e.preventDefault();
    const data = {
      title: pkgForm.title,
      description: pkgForm.description,
      price: pkgForm.price,
      originalPrice: pkgForm.originalPrice || null,
      discount: pkgForm.discount || null,
      duration: pkgForm.duration,
      maxGuests: Number(pkgForm.maxGuests) || 2,
      featured: pkgForm.featured,
      available: pkgForm.available,
      images: pkgImages.filter(u => u.trim()),
      includes: {
        room: pkgForm.includesRoom || null,
        dining: pkgForm.includesDining || null,
        activities: pkgActivities.filter(a => a.trim()),
      },
      highlights: pkgHighlights.filter(h => h.trim()),
    };
    try {
      if (editingPkgId) await api.put(`/api/packages/${editingPkgId}`, data, AUTH());
      else await api.post('/api/packages', data, AUTH());
      resetPkgForm(); fetchPackages();
    } catch { alert('Хадгалахад алдаа гарлаа'); }
  };

  const handleEditPkg = p => {
    setPkgForm({
      title: p.title, description: p.description, price: p.price,
      originalPrice: p.originalPrice || '', discount: p.discount || '',
      duration: p.duration, maxGuests: String(p.maxGuests || 2),
      featured: p.featured, available: p.available !== false,
      includesRoom: p.includes?.room || '',
      includesDining: p.includes?.dining || '',
    });
    setPkgImages(p.images?.length ? [...p.images] : ['']);
    setPkgActivities(p.includes?.activities?.length ? [...p.includes.activities] : ['']);
    setPkgHighlights(p.highlights?.length ? [...p.highlights] : ['']);
    setEditingPkgId(p._id); setShowPkgForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePkg = async id => {
    if (!window.confirm('Багцыг устгах уу?')) return;
    try { await api.delete(`/api/packages/${id}`, AUTH()); fetchPackages(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };

  const resetPkgForm = () => {
    setPkgForm(defaultPkg); setPkgImages(['']);
    setPkgActivities(['']); setPkgHighlights(['']);
    setEditingPkgId(null); setShowPkgForm(false);
  };

  // ── Reservation handlers ──
  const handleReservationStatus = async (id, status) => {
    try { await api.put(`/api/admin/reservations/${id}/status`, { status }, AUTH()); fetchAll(); }
    catch { alert('Алдаа гарлаа'); }
  };
  const handleDeleteReservation = async id => {
    if (!window.confirm('Устгах уу?')) return;
    try { await api.delete(`/api/admin/reservations/${id}`, AUTH()); fetchAll(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`"${name}" хэрэглэгчийг устгах уу?`)) return;
    try { await api.delete(`/api/admin/users/${id}`, AUTH()); fetchAll(); }
    catch { alert('Устгахад алдаа гарлаа'); }
  };
  const handleExportCSV = async () => {
    try {
      const res = await api.get('/api/admin/reservations/export', { ...AUTH(), responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { alert('Export амжилтгүй'); }
  };

  const statusStyle = s => ({
    confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    cancelled: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  }[s] || 'bg-gray-100 text-gray-500');
  const statusLabel = s => ({ confirmed: 'Баталгаажсан', pending: 'Хүлээгдэж байна', cancelled: 'Цуцлагдсан' }[s] || s);
  const fmtDate = d => d ? new Date(d).toLocaleDateString('mn-MN') : '—';
  const destValidPreviews = destImages.filter(u => u.trim().startsWith('http'));
  const pkgValidPreviews = pkgImages.filter(u => u.trim().startsWith('http'));

  const navTo = key => { setActiveTab(key); setSidebarOpen(false); };

  // ── Sidebar content ────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-base leading-tight">Улаан Хад</div>
          <div className="text-gray-500 text-xs mt-0.5">Admin панель</div>
        </div>
        <button className="lg:hidden text-gray-500 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label }) => (
          <button key={key} onClick={() => navTo(key)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            {label}
            {key === 'reservations' && reservations.length > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === key ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300'
              }`}>{reservations.length}</span>
            )}
          </button>
        ))}
      </nav>
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
        <button onClick={() => { onLogout(); navigate('/'); }}
          className="w-full text-left text-xs text-gray-500 hover:text-gray-300 transition py-1">
          Гарах →
        </button>
      </div>
    </>
  );

  const tabLabel = NAV_ITEMS.find(t => t.key === activeTab)?.label || '';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 bg-gray-900 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transform transition-transform duration-200
        lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger */}
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600 flex-shrink-0"
              onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">{tabLabel}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {activeTab === 'reservations' && (
              <button onClick={handleExportCSV}
                className="text-xs md:text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 md:px-3 py-1.5 rounded-lg transition font-medium hidden sm:block">
                CSV татах
              </button>
            )}
            <button onClick={() => { fetchAll(); if (activeTab === 'revenue') fetchRevenue(); if (activeTab === 'packages') fetchPackages(); }}
              className="text-xs md:text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 md:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
              ↻
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Уншиж байна...</div>
          ) : (
            <>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { label: 'Нийт жагсаалт',  value: stats.totalDestinations },
                      { label: 'Нийт хэрэглэгч', value: stats.totalUsers },
                      { label: 'Нийт захиалга',  value: stats.totalReservations },
                      { label: 'Баталгаажсан',   value: stats.confirmedReservations },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-xs md:text-sm font-medium text-gray-700 mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-sm font-semibold text-gray-800">Сүүлийн захиалгууд</h2>
                      <button onClick={handleExportCSV}
                        className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition hidden sm:block">
                        CSV татах
                      </button>
                    </div>
                    {reservations.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-gray-400">Захиалга байхгүй</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {reservations.slice(0, 6).map(r => (
                          <div key={r._id} className="px-4 md:px-5 py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                                {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{r.user?.name || '—'}</p>
                                <p className="text-xs text-gray-400 truncate">{r.itemDetails?.title || r.item?.title || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 text-sm flex-shrink-0">
                              <span className="hidden sm:block font-medium text-gray-700">{r.payment?.amount || r.itemDetails?.price || '—'}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle(r.status)}`}>{statusLabel(r.status)}</span>
                              <span className="hidden md:block text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {reservations.length > 6 && (
                      <div className="px-5 py-3 border-t border-gray-50">
                        <button onClick={() => navTo('reservations')} className="text-xs text-gray-500 hover:text-gray-800">
                          Бүгдийг харах ({reservations.length}) →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── REVENUE ── */}
              {activeTab === 'revenue' && (
                <div className="space-y-5">
                  {revenueLoading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Уншиж байна...</div>
                  ) : revenue ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {[
                          { label: 'Нийт орлого', value: fmtMNT(revenue.totalRevenue), color: 'text-emerald-700' },
                          { label: 'Энэ сарын орлого', value: fmtMNT(revenue.thisMonth), color: 'text-amber-700' },
                          { label: 'Өмнөх сар', value: fmtMNT(revenue.lastMonth), color: 'text-gray-700' },
                          { label: 'Тооцоо хийгдсэн', value: revenue.paidCount + ' захиалга', color: 'text-gray-700' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                            <div className={`text-xl md:text-2xl font-bold ${color}`}>{value}</div>
                            <div className="text-xs md:text-sm font-medium text-gray-700 mt-1">{label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Сарын орлого (сүүлийн 12 сар)</h2>
                        <BarChart data={revenue.monthly} labelKey="month" valueKey="revenue" formatVal={fmtMNT} color="#d97706" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                          <h2 className="text-sm font-semibold text-gray-800 mb-4">Хамгийн их захиалагдсан</h2>
                          <div className="space-y-3">
                            {revenue.topItems.map((item, i) => (
                              <div key={item.title} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                                }`}>{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                  <p className="text-xs text-gray-400">{item.count} захиалга</p>
                                </div>
                                <span className="text-sm font-semibold text-amber-700">{fmtMNT(item.revenue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-800">Өрөөний дүүргэлт</h2>
                            {occupancy?.busiest && (
                              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                Хамгийн их: {occupancy.busiest.rate}%
                              </span>
                            )}
                          </div>
                          {occupancy ? <OccupancyBars data={occupancy.occupancy} /> : <p className="text-xs text-gray-400 text-center py-4">Уншиж байна...</p>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-400 text-sm mb-3">Өгөгдөл ачааллаагүй</p>
                      <button onClick={fetchRevenue} className="text-sm text-amber-700 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-50 transition">Дахин оролдох</button>
                    </div>
                  )}
                </div>
              )}

              {/* ── DESTINATIONS ── */}
              {activeTab === 'destinations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{destinations.length} жагсаалт</p>
                    <button onClick={() => { setShowDestForm(!showDestForm); if (showDestForm) resetDestForm(); }}
                      className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
                      {showDestForm ? 'Хаах' : '+ Нэмэх'}
                    </button>
                  </div>
                  {showDestForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                      <h2 className="text-base font-semibold text-gray-900 mb-5">{editingDestId ? 'Мэдээлэл засах' : 'Шинэ мэдээлэл'}</h2>
                      <form onSubmit={handleSubmitDest} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input name="title" value={destForm.title} onChange={handleDestInput} placeholder="Гарчиг" required
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          <input name="location" value={destForm.location} onChange={handleDestInput} placeholder="Байршил" required
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <textarea name="description" value={destForm.description} onChange={handleDestInput} placeholder="Тайлбар" rows="3" required
                          className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <input name="price" value={destForm.price} onChange={handleDestInput} placeholder="₮100,000 эсвэл хоосон"
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                            <p className="text-xs text-gray-400 mt-0.5 px-1">Хоосон = <span className="text-emerald-600 font-medium">Үнэгүй</span></p>
                          </div>
                          <div>
                            <input name="priceValue" type="number" min="0" value={destForm.priceValue} onChange={handleDestInput} placeholder="100000"
                              className={`border px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 ${
                                destForm.category === 'room' ? 'border-amber-300 focus:ring-amber-300 bg-amber-50' : 'border-gray-200 focus:ring-gray-300'
                              }`} />
                            <p className="text-xs text-amber-600 font-medium mt-0.5 px-1">Тооны утга</p>
                          </div>
                          <input name="originalPrice" value={destForm.originalPrice} onChange={handleDestInput} placeholder="Анхны үнэ"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          <input name="discount" value={destForm.discount} onChange={handleDestInput} placeholder="Хөнгөлөлт"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <input name="duration" value={destForm.duration} onChange={handleDestInput} placeholder="Хугацаа"
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 w-40" />
                          <select name="category" value={destForm.category} onChange={handleDestInput}
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="room">Өрөө</option>
                            <option value="dining">Хоол хүнс</option>
                            <option value="activity">Үйл ажиллагаа</option>
                            <option value="event">Арга хэмжээ</option>
                            <option value="offer">Тусгай санал</option>
                            <option value="gallery">Галерей</option>
                          </select>
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" name="featured" checked={destForm.featured} onChange={handleDestInput} className="rounded" />
                            Онцлох
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Зургийн URL</label>
                          <div className="space-y-2">
                            {destImages.map((url, i) => (
                              <div key={i} className="flex gap-2">
                                <input type="url" value={url} onChange={e => { const u = [...destImages]; u[i] = e.target.value; setDestImages(u); }}
                                  placeholder="https://..." className="border border-gray-200 px-3 py-2 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                                <button type="button" onClick={() => setDestImages(destImages.length === 1 ? [''] : destImages.filter((_, idx) => idx !== i))}
                                  className="px-3 py-2 text-sm text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition">✕</button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => setDestImages([...destImages, ''])}
                            className="mt-1.5 text-sm text-gray-500 hover:text-gray-800 transition">+ Зураг нэмэх</button>
                        </div>
                        {destValidPreviews.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {destValidPreviews.map((url, i) => (
                              <img key={i} src={url} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                                onError={e => { e.target.style.display = 'none'; }} />
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button type="submit" className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
                            {editingDestId ? 'Шинэчлэх' : 'Үүсгэх'}
                          </button>
                          <button type="button" onClick={resetDestForm} className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                            Цуцлах
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          {['Зураг', 'Гарчиг', 'Ангилал', 'Үнэ', 'Үйлдэл'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {destinations.map(d => (
                          <tr key={d._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              {d.images?.[0] ? (
                                <img src={d.images[0]} alt="" className="w-12 h-9 object-cover rounded-lg"
                                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80'; }} />
                              ) : <div className="w-12 h-9 bg-gray-100 rounded-lg" />}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{d.title}</td>
                            <td className="px-4 py-3 text-gray-500 capitalize text-xs">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{d.category}</span>
                            </td>
                            <td className="px-4 py-3">
                              {d.price === 'Үнэгүй' || !d.price ? (
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">Үнэгүй</span>
                              ) : <span className="text-gray-700 font-medium text-sm">{d.price}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditDest(d)} className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition">Засах</button>
                                <button onClick={() => handleDeleteDest(d._id)} className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">Устгах</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {destinations.length === 0 && <div className="text-center py-12 text-sm text-gray-400">Мэдээлэл байхгүй</div>}
                  </div>
                </div>
              )}

              {/* ── PACKAGES ── */}
              {activeTab === 'packages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{packages.length} багц</p>
                    <button onClick={() => { setShowPkgForm(!showPkgForm); if (showPkgForm) resetPkgForm(); }}
                      className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
                      {showPkgForm ? 'Хаах' : '+ Нэмэх'}
                    </button>
                  </div>

                  {showPkgForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                      <h2 className="text-base font-semibold text-gray-900 mb-5">{editingPkgId ? 'Багц засах' : 'Шинэ багц нэмэх'}</h2>
                      <form onSubmit={handleSubmitPkg} className="space-y-4">

                        {/* Basic info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Гарчиг *</label>
                            <input name="title" value={pkgForm.title} onChange={handlePkgInput} placeholder="Тансаг 2 шөнийн багц" required
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Хугацаа</label>
                            <input name="duration" value={pkgForm.duration} onChange={handlePkgInput} placeholder="2 шөнө 3 өдөр"
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Тайлбар *</label>
                          <textarea name="description" value={pkgForm.description} onChange={handlePkgInput} placeholder="Багцын дэлгэрэнгүй тайлбар..." rows="3" required
                            className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none" />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Үнэ *</label>
                            <input name="price" value={pkgForm.price} onChange={handlePkgInput} placeholder="₮500,000" required
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Анхны үнэ</label>
                            <input name="originalPrice" value={pkgForm.originalPrice} onChange={handlePkgInput} placeholder="₮650,000"
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Хөнгөлөлт</label>
                            <input name="discount" value={pkgForm.discount} onChange={handlePkgInput} placeholder="20%"
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Max зочин</label>
                            <input name="maxGuests" type="number" min="1" max="20" value={pkgForm.maxGuests} onChange={handlePkgInput}
                              className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300" />
                          </div>
                        </div>

                        {/* Includes */}
                        <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Багцад багтсан зүйлс</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                🛏 Өрөө
                              </label>
                              <input name="includesRoom" value={pkgForm.includesRoom} onChange={handlePkgInput}
                                placeholder="Делюкс өрөө (1 шөнө)"
                                className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                🍽 Хоол хүнс
                              </label>
                              <input name="includesDining" value={pkgForm.includesDining} onChange={handlePkgInput}
                                placeholder="Өглөөний хоол 2 хүнд"
                                className="border border-gray-200 px-3 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" />
                            </div>
                          </div>
                          <ListInput
                            label="🎯 Үйл ажиллагаа"
                            items={pkgActivities}
                            onChange={setPkgActivities}
                            placeholder="Морин спорт, усан дусал..."
                          />
                        </div>

                        {/* Highlights */}
                        <ListInput
                          label="✨ Онцлох давуу талууд"
                          items={pkgHighlights}
                          onChange={setPkgHighlights}
                          placeholder="Жнэ: 24/7 хувийн үйлчлэгч"
                        />

                        {/* Images */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Зургийн URL</label>
                          <div className="space-y-2">
                            {pkgImages.map((url, i) => (
                              <div key={i} className="flex gap-2">
                                <input type="url" value={url} onChange={e => { const u = [...pkgImages]; u[i] = e.target.value; setPkgImages(u); }}
                                  placeholder="https://..." className="border border-gray-200 px-3 py-2 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                                <button type="button" onClick={() => setPkgImages(pkgImages.length === 1 ? [''] : pkgImages.filter((_, idx) => idx !== i))}
                                  className="px-3 py-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition text-sm">✕</button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => setPkgImages([...pkgImages, ''])}
                            className="mt-1.5 text-sm text-gray-500 hover:text-gray-800 transition">+ Зураг нэмэх</button>
                        </div>

                        {pkgValidPreviews.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {pkgValidPreviews.map((url, i) => (
                              <img key={i} src={url} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                                onError={e => { e.target.style.display = 'none'; }} />
                            ))}
                          </div>
                        )}

                        {/* Flags */}
                        <div className="flex gap-5">
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" name="featured" checked={pkgForm.featured} onChange={handlePkgInput} className="rounded" />
                            Онцлох
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" name="available" checked={pkgForm.available} onChange={handlePkgInput} className="rounded" />
                            Идэвхтэй (харагдана)
                          </label>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button type="submit" className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
                            {editingPkgId ? 'Шинэчлэх' : 'Багц үүсгэх'}
                          </button>
                          <button type="button" onClick={resetPkgForm} className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                            Цуцлах
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Package list */}
                  {packages.length === 0 && !showPkgForm ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                      <p className="text-4xl mb-3">📦</p>
                      <p className="text-gray-500 text-sm mb-2">Одоогоор багц байхгүй байна</p>
                      <button onClick={() => setShowPkgForm(true)}
                        className="text-sm text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition mt-2">
                        + Эхний багцыг нэмэх
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packages.map(p => (
                        <div key={p._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt={p.title} className="w-full h-36 object-cover"
                              onError={e => { e.target.style.display = 'none'; }} />
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{p.duration} · {p.maxGuests} зочин</p>
                              </div>
                              <div className="flex-shrink-0 flex gap-1">
                                {p.featured && <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">Онцлох</span>}
                                {!p.available && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Нуугдсан</span>}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                            {/* Includes */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {p.includes?.room && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">🛏 {p.includes.room}</span>}
                              {p.includes?.dining && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">🍽 {p.includes.dining}</span>}
                              {p.includes?.activities?.map((a, i) => (
                                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">🎯 {a}</span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-amber-800">{p.price}</span>
                                {p.originalPrice && <span className="text-xs text-gray-400 line-through ml-2">{p.originalPrice}</span>}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditPkg(p)}
                                  className="text-xs text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition">Засах</button>
                                <button onClick={() => handleDeletePkg(p._id)}
                                  className="text-xs text-red-500 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">Устгах</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── RESERVATIONS ── */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{reservations.length} захиалга</p>
                    <button onClick={handleExportCSV}
                      className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span className="hidden sm:inline">Excel/CSV татах</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          {['Хэрэглэгч', 'Захиалга', 'Дүн', 'Орох/Гарах', 'Төлөв', 'Огноо', ''].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {reservations.map(r => (
                          <tr key={r._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="font-medium text-gray-900 text-sm">{r.user?.name || '—'}</p>
                              <p className="text-xs text-gray-400">{r.user?.email || '—'}</p>
                            </td>
                            <td className="px-4 py-3 max-w-[160px]">
                              <p className="font-medium text-gray-800 text-sm truncate">{r.itemDetails?.title || r.item?.title || '—'}</p>
                              <p className="text-xs text-gray-400 capitalize">{r.itemDetails?.category || r.item?.category || '—'}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800">
                              {r.payment?.amount || r.itemDetails?.price || '—'}
                              {r.payment?.status === 'paid' && <span className="ml-1 text-xs text-emerald-600">✓</span>}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {r.checkIn ? fmtDate(r.checkIn) : '—'}
                              {r.checkOut && <><br />{fmtDate(r.checkOut)}</>}
                            </td>
                            <td className="px-4 py-3">
                              <select value={r.status} onChange={e => handleReservationStatus(r._id, e.target.value)}
                                className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusStyle(r.status)}`}>
                                <option value="confirmed">Баталгаажсан</option>
                                <option value="pending">Хүлээгдэж байна</option>
                                <option value="cancelled">Цуцлагдсан</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDeleteReservation(r._id)}
                                className="text-xs text-red-500 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">Устгах</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reservations.length === 0 && <div className="text-center py-12 text-sm text-gray-400">Захиалга байхгүй</div>}
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{users.length} хэрэглэгч</p>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          {['Нэр', 'Имэйл', 'Төрөл', 'Эрх', 'Бүртгэгдсэн', ''].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <span className="font-medium text-gray-900 truncate max-w-[100px]">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[160px]">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                u.accountType === 'premium' ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-gray-100 text-gray-500'
                              }`}>{u.accountType === 'premium' ? 'Premium' : 'Guest'}</span>
                            </td>
                            <td className="px-4 py-3">
                              {u.isAdmin ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">Admin</span>
                              ) : <span className="text-xs text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                            <td className="px-4 py-3">
                              {!u.isAdmin && (
                                <button onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="text-xs text-red-500 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">Устгах</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && <div className="text-center py-12 text-sm text-gray-400">Хэрэглэгч байхгүй</div>}
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
