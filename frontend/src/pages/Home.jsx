import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import GallerySlider from '../components/GallerySlider';
import { useFavorites } from '../hooks/useFavorites';

const CATEGORIES = [
  { value: 'all',      label: 'Бүгд' },
  { value: 'room',     label: 'Өрөөнүүд' },
  { value: 'dining',   label: 'Хоол хүнс' },
  { value: 'activity', label: 'Үйл ажиллагаа' },
  { value: 'event',    label: 'Арга хэмжээ' },
];

// ── Room Compare Modal ─────────────────────────────────────────
function RoomCompareModal({ rooms, onClose, onBook }) {
  const ROWS = [
    { label: 'Үнэ (шөнөд)', key: 'price' },
    { label: 'Байршил', key: 'location' },
    { label: 'Үнэлгээ', key: 'rating', render: v => v ? `⭐ ${v}` : '—' },
    { label: 'Тайлбар', key: 'description', render: v => v ? <span className="line-clamp-3 text-xs leading-relaxed">{v}</span> : '—' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Өрөө харьцуулах</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-4 px-4 text-left text-xs text-gray-400 font-medium w-28 bg-gray-50 border-b border-gray-100">
                  Онцлог
                </th>
                {rooms.map(room => (
                  <th key={room._id} className="py-4 px-4 text-center bg-gray-50 border-b border-gray-100">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={getImageUrl(room.images?.[0]) || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300'}
                        alt={room.title}
                        className="w-full h-28 object-cover rounded-xl"
                      />
                      <span className="text-sm font-bold text-gray-900 text-center leading-tight">{room.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ label, key, render }) => (
                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 text-xs font-medium text-gray-500 bg-gray-50/50">{label}</td>
                  {rooms.map(room => (
                    <td key={room._id} className="py-3.5 px-4 text-center text-sm text-gray-700">
                      {render ? render(room[key]) : (room[key] || '—')}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Book row */}
              <tr>
                <td className="py-4 px-4 bg-gray-50/50" />
                {rooms.map(room => (
                  <td key={room._id} className="py-4 px-4 text-center">
                    <button
                      onClick={() => onBook(room._id)}
                      className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-sm font-semibold hover:bg-amber-900 transition w-full">
                      Захиалах
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Heart button ───────────────────────────────────────────────
function HeartBtn({ itemId, isFavorite, onToggle }) {
  const handleClick = e => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    onToggle(itemId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all shadow-sm ${
        isFavorite ? 'bg-red-50 border border-red-200' : 'bg-white/90 border border-white/50 hover:bg-red-50 hover:border-red-200'
      }`}
    >
      <svg className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
        fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );
}

function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [activeSearch, setActiveSearch] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/destinations');
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async e => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query && searchCategory === 'all') { clearSearch(); return; }
    try {
      let results;
      if (query) {
        const qs = new URLSearchParams({ query, category: searchCategory }).toString();
        const res = await api.get(`/api/search?${qs}`);
        results = res.data;
      } else {
        results = searchCategory === 'all' ? items : items.filter(i => i.category === searchCategory);
      }
      setFilteredItems(results);
      setActiveSearch({ query, category: searchCategory });
      setTimeout(() => {
        document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchCategory('all');
    setFilteredItems(items);
    setActiveSearch(null);
  };

  const handleCardClick = id => {
    navigate(`/destination/${id}`);
    window.scrollTo(0, 0);
  };

  const toggleCompare = id => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const by = cat => filteredItems.filter(i => i.category === cat);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-3xl mb-3 opacity-60">🏔️</div>
          <div className="text-gray-500">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  const rooms      = by('room');
  const dining     = by('dining');
  const activities = by('activity');
  const events     = by('event');
  const offers     = by('offer');

  const galleryImages = items
    .filter(i => i.category === 'gallery')
    .flatMap(i => i.images || [])
    .filter(Boolean);

  const sectionClass = 'scroll-mt-20';
  const compareRooms = rooms.filter(r => compareIds.includes(r._id));

  return (
    <div className="bg-gray-50">

      {/* Compare Modal */}
      {showCompare && compareRooms.length >= 2 && (
        <RoomCompareModal
          rooms={compareRooms}
          onClose={() => setShowCompare(false)}
          onBook={id => { setShowCompare(false); handleCardClick(id); }}
        />
      )}

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')", backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
        <div className="relative z-10 text-center text-white px-4 w-full max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1.5 mb-7 text-xs font-medium tracking-wide uppercase text-white/80">
            ★★★★★ &nbsp; Горхи-Тэрэлжийн 5 оддын ресорт
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-tight drop-shadow-xl">
            Улаан Хад Ресорт
          </h1>
          <p className="text-lg md:text-xl mb-10 font-light text-white/80 max-w-xl mx-auto leading-relaxed">
            Байгалийн цэвэр тансаг амралт
          </p>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl">
            <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
              {CATEGORIES.map(cat => (
                <button key={cat.value} type="button" onClick={() => setSearchCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    searchCategory === cat.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/65 hover:text-white hover:bg-white/10 border border-white/15'
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Өрөө, хоол хүнс, үйл ажиллагаа хайх..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/15 text-sm transition-all" />
              <button type="submit"
                className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">
                Хайх
              </button>
            </form>
          </div>
          <div className="mt-12 flex items-center justify-center gap-10 md:gap-16 text-white/70">
            <div className="text-center"><div className="text-2xl font-bold text-white">500+</div><div className="text-xs uppercase tracking-wider mt-0.5">Зочид</div></div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-bold text-white">4.9</div><div className="text-xs uppercase tracking-wider mt-0.5">Үнэлгээ</div></div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-bold text-white">10+</div><div className="text-xs uppercase tracking-wider mt-0.5">Жилийн туршлага</div></div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <div className="w-px h-6 bg-white/30" />
          <span className="text-xs uppercase tracking-widest">Доош</span>
        </div>
      </section>

      {/* ── Active search banner ── */}
      {activeSearch && (
        <div id="search-results" className={`bg-amber-50 border-b border-amber-200 py-3 ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <p className="text-sm text-amber-800">
              {activeSearch.query
                ? <><strong>"{activeSearch.query}"</strong> — {filteredItems.length} үр дүн</>
                : <><strong>{CATEGORIES.find(c => c.value === activeSearch.category)?.label}</strong> — {filteredItems.length} үр дүн</>
              }
            </p>
            <button onClick={clearSearch}
              className="text-xs text-amber-700 hover:text-amber-900 font-medium border border-amber-300 px-3 py-1 rounded-full hover:bg-amber-100 transition">
              Цэвэрлэх ✕
            </button>
          </div>
        </div>
      )}

      {/* ── About ── */}
      <section id="about" className={`py-20 bg-white ${sectionClass}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-amber-700 font-semibold text-xs uppercase tracking-wider mb-3 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
              Бидний тухай
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">Диваажинд тавтай морил</h2>
            <div className="w-12 h-0.5 bg-amber-700 mx-auto mb-6" />
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Горхи-Тэрэлж Үндэсний Цэцэрлэгт Хүрээлэнгийн зүрхэнд байрлах Улаан Хад Ресорт нь тансаг байдал болон байгалийн хосгүй хослолыг санал болгодог.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Гайхалтай байршил', desc: 'Сүртэй уулс болон цэвэр байгальд хүрээлэгдсэн' },
              { title: 'Шилдэг үйлчилгээ', desc: 'Онцгой зочломтгой байдал болон хувийн анхаарал' },
              { title: 'Хоол', desc: 'Орон нутгийн болон олон улсын амтыг агуулсан гурмэ хоол' },
            ].map(({ title, desc }) => (
              <div key={title} className="text-center p-7 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      {galleryImages.length > 0 && (
        <section id="gallery" className={`bg-gray-900 ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-8 text-center">
            <span className="inline-block text-amber-400 font-semibold text-xs uppercase tracking-widest mb-3 bg-amber-900/40 px-4 py-1 rounded-full border border-amber-800/50">
              Байгалийн гоо үзэсгэлэн
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Горхи-Тэрэлжийн мэдрэмж</h2>
            <div className="w-10 h-0.5 bg-amber-700 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
              Зургийг чирч эсвэл сумыг дарж байгалийн гайхалтай орчныг үзэж болно
            </p>
          </div>
          <GallerySlider images={galleryImages} />
          <div className="pb-14" />
        </section>
      )}

      {/* ── Rooms ── */}
      <section id="rooms" className={`py-20 bg-gray-50 ${sectionClass}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader label="Байрлал" title="Бүх өрөө" sub="Таны тав тухыг хангахаар зориулалттай тансаг байр" noMargin />
            {rooms.length > 1 && (
              <p className="text-xs text-gray-400 hidden sm:block">
                Харьцуулахын тулд өрөө дээр + товч дарна уу
              </p>
            )}
          </div>
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {rooms.map(room => (
                <RoomCard
                  key={room._id}
                  item={room}
                  onClick={() => handleCardClick(room._id)}
                  isComparing={compareIds.includes(room._id)}
                  canCompare={compareIds.length < 3 || compareIds.includes(room._id)}
                  onCompareToggle={() => toggleCompare(room._id)}
                  isFav={isFavorite(room._id)}
                  onFavToggle={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <EmptyState text={activeSearch ? 'Хайлтад тохирох өрөө олдсонгүй' : 'Манай өрөөнүүд удахгүй боломжтой болно'} />
          )}
        </div>
      </section>

      {/* ── Dining ── */}
      {dining.length > 0 && (
        <section id="dining" className={`py-20 bg-white ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="Хоол хүнсний туршлага" sub="Гайхалтай орчинд шилдэг амтыг мэдэрнэ үү" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {dining.map(item => (
                <div key={item._id} onClick={() => handleCardClick(item._id)}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group relative">
                  <HeartBtn itemId={item._id} isFavorite={isFavorite(item._id)} onToggle={toggleFavorite} />
                  <div className="md:flex">
                    <div className="md:w-2/5 h-56">
                      <img src={getImageUrl(item.images[0]) || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'}
                        alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="md:w-3/5 p-6 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">{item.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">{item.description}</p>
                      <span className="text-amber-800 text-sm font-semibold">Дэлгэрэнгүй →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Activities ── */}
      {activities.length > 0 && (
        <section id="activities" className={`py-20 bg-gray-50 ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="Үйл ажиллагаа ба туршлага" sub="Адал явдал хаа сайгүй хүлээж байна" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {activities.map(item => (
                <div key={item._id} onClick={() => handleCardClick(item._id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group relative">
                  <HeartBtn itemId={item._id} isFavorite={isFavorite(item._id)} onToggle={toggleFavorite} />
                  <div className="h-48 overflow-hidden">
                    <img src={getImageUrl(item.images[0]) || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600'}
                      alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-amber-800 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
                    <span className="text-amber-800 text-sm font-semibold">Дэлгэрэнгүй →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Events ── */}
      {events.length > 0 && (
        <section id="events" className={`py-20 bg-white ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="Ресортын арга хэмжээ" sub="Онцгой арга хэмжээ болон баяр ёслолд бидэнтэй нэгдэнэ үү" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {events.map(event => (
                <div key={event._id} onClick={() => handleCardClick(event._id)}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group relative">
                  <HeartBtn itemId={event._id} isFavorite={isFavorite(event._id)} onToggle={toggleFavorite} />
                  <div className="h-52 overflow-hidden relative">
                    <img src={getImageUrl(event.images[0]) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                      alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {event.featured && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Онцлох</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-amber-800 transition-colors">{event.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-800">{event.price}</span>
                      <span className="text-amber-800 text-sm font-semibold">Дэлгэрэнгүй →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Offers ── */}
      {offers.length > 0 && (
        <section id="offers" className={`py-20 bg-amber-50 ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="Тусгай санал" sub="Мартагдашгүй хонолтын онцгой хэлэлцээр" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {offers.map(offer => (
                <div key={offer._id} onClick={() => handleCardClick(offer._id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative">
                  <HeartBtn itemId={offer._id} isFavorite={isFavorite(offer._id)} onToggle={toggleFavorite} />
                  {offer.discount && (
                    <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      {offer.discount} OFF
                    </span>
                  )}
                  <div className="h-56 overflow-hidden">
                    <img src={getImageUrl(offer.images[0]) || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800'}
                      alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">{offer.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{offer.description}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-amber-800">{offer.price}</span>
                      {offer.originalPrice && <span className="text-base text-gray-400 line-through">{offer.originalPrice}</span>}
                    </div>
                    <button className="w-full py-3 bg-amber-800 text-white rounded-xl hover:bg-amber-900 transition font-semibold text-sm">
                      Санал авах
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section id="contact" className={`py-24 relative overflow-hidden ${sectionClass}`}>
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600')", backgroundSize: 'cover' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block text-amber-400 font-semibold text-xs uppercase tracking-wider mb-4 bg-amber-900/50 px-4 py-1.5 rounded-full border border-amber-800">
            Холбоо барих
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Амралтаа төлөвлөх</h2>
          <div className="w-12 h-0.5 bg-amber-600 mx-auto mb-6" />
          <p className="text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Байгальд тансаг амралт эдлэхэд бэлэн үү? Өнөөдөр бидэнтэй холбоо барина уу.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { title: 'Утас', content: '+976 11 123 456', href: 'tel:+97611123456' },
              { title: 'Имэйл', content: 'info@redrockresort.mn', href: 'mailto:info@redrockresort.mn' },
              { title: 'Байршил', content: 'Горхи-Тэрэлж, Монгол', href: null },
            ].map(({ title, content, href }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1.5 font-medium">{title}</p>
                {href ? (
                  <a href={href} className="text-white text-sm hover:text-amber-300 transition font-medium">{content}</a>
                ) : (
                  <p className="text-white text-sm font-medium">{content}</p>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all">
            Одоо захиалах
          </button>
        </div>
      </section>

      {/* ── Compare floating bar ── */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 flex flex-wrap gap-2">
              {compareIds.map(id => {
                const room = rooms.find(r => r._id === id);
                return room ? (
                  <div key={id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{room.title}</span>
                    <span className="text-xs font-bold text-amber-800">{room.price}</span>
                    <button onClick={() => toggleCompare(id)}
                      className="text-gray-400 hover:text-red-500 transition ml-1 text-xs font-bold">✕</button>
                  </div>
                ) : null;
              })}
              {compareIds.length < 3 && (
                <div className="flex items-center border-2 border-dashed border-gray-200 rounded-lg px-3 py-1.5 text-gray-400 text-xs">
                  + Өрөө нэмэх
                </div>
              )}
            </div>
            <button
              onClick={() => setShowCompare(true)}
              disabled={compareIds.length < 2}
              className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-sm font-semibold hover:bg-amber-900 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0">
              Харьцуулах ({compareIds.length}/3)
            </button>
            <button onClick={() => setCompareIds([])}
              className="text-gray-400 hover:text-gray-600 text-sm p-2 flex-shrink-0">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small reusable components ──

function SectionHeader({ label, title, sub, noMargin }) {
  return (
    <div className={noMargin ? '' : 'text-center mb-12'}>
      {label && (
        <span className="inline-block text-amber-700 font-semibold text-xs uppercase tracking-wider mb-3 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="w-10 h-0.5 bg-amber-700 mb-4" />
      {sub && <p className="text-gray-500">{sub}</p>}
    </div>
  );
}

function RoomCard({ item, onClick, isComparing, canCompare, onCompareToggle, isFav, onFavToggle }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative ${
        isComparing ? 'border-amber-400 shadow-amber-100 shadow-lg' : 'border-gray-100 hover:shadow-xl'
      }`}
    >
      <div className="relative h-60 overflow-hidden">
        <img
          src={getImageUrl(item.images?.[0]) || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Heart button */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); const token = localStorage.getItem('token'); if (!token) { window.location.href = '/login'; return; } onFavToggle(item._id); }}
          className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all shadow-sm ${
            isFav ? 'bg-red-50 border border-red-200' : 'bg-white/90 border border-white/50 hover:bg-red-50'
          }`}>
          <svg className={`w-4 h-4 ${isFav ? 'text-red-500' : 'text-gray-400'}`}
            fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Compare toggle */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onCompareToggle(); }}
          disabled={!canCompare}
          className={`absolute top-3 left-3 z-10 text-xs px-2.5 py-1 rounded-full font-semibold transition shadow-sm ${
            isComparing
              ? 'bg-amber-800 text-white'
              : canCompare
                ? 'bg-white/90 text-gray-600 hover:bg-amber-50 hover:text-amber-800 border border-white/50'
                : 'bg-white/50 text-gray-400 cursor-not-allowed border border-white/30'
          }`}>
          {isComparing ? '✓ Харьцуулах' : '+ Харьцуулах'}
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-amber-800 transition-colors">{item.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-amber-800">{item.price}</span>
            <span className="text-gray-400 text-xs ml-1">/ шөнөд</span>
          </div>
          <span className="text-amber-800 text-sm font-semibold">Үзэх →</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export default Home;
