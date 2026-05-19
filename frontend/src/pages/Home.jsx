import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import GallerySlider from '../components/GallerySlider';

const CATEGORIES = [
  { value: 'all',      label: 'Бүгд' },
  { value: 'room',     label: 'Өрөөнүүд' },
  { value: 'dining',   label: 'Хоол хүнс' },
  { value: 'activity', label: 'Үйл ажиллагаа' },
  { value: 'event',    label: 'Арга хэмжээ' },
];

function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [activeSearch, setActiveSearch] = useState(null); // { query, category }
  const navigate = useNavigate();

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

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query && searchCategory === 'all') {
      clearSearch();
      return;
    }

    try {
      let results;
      if (query) {
        const qs = new URLSearchParams({ query, category: searchCategory }).toString();
        const res = await api.get(`/api/search?${qs}`);
        results = res.data;
      } else {
        results = searchCategory === 'all'
          ? items
          : items.filter(i => i.category === searchCategory);
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

  const handleCardClick = (id) => {
    navigate(`/destination/${id}`);
    window.scrollTo(0, 0);
  };

  const by = (cat) => filteredItems.filter(i => i.category === cat);

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

  // Collect all images from gallery items into a flat array
  const galleryImages = items
    .filter(i => i.category === 'gallery')
    .flatMap(i => i.images || [])
    .filter(Boolean);

  const sectionClass = 'scroll-mt-20';

  return (
    <div className="bg-gray-50">

      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />

        <div className="relative z-10 text-center text-white px-4 w-full max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1.5 mb-7 text-xs font-medium tracking-wide uppercase text-white/80">
            ★★★★★ &nbsp; Горхи-Тэрэлжийн 5 оддын ресорт
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-tight drop-shadow-xl">
            Улаан Хад Ресорт
          </h1>
          <p className="text-lg md:text-xl mb-10 font-light text-white/80 max-w-xl mx-auto leading-relaxed">
            Байгалийн тэвэрт тансаг амралт — Монгол орны хамгийн гайхалтай газар
          </p>

          {/* ── Search widget ── */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSearchCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    searchCategory === cat.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/65 hover:text-white hover:bg-white/10 border border-white/15'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Input row */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Өрөө, хоол хүнс, үйл ажиллагаа хайх..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/15 text-sm transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                Хайх
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center gap-10 md:gap-16 text-white/70">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs uppercase tracking-wider mt-0.5">Зочид</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-xs uppercase tracking-wider mt-0.5">Үнэлгээ</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10+</div>
              <div className="text-xs uppercase tracking-wider mt-0.5">Жилийн туршлага</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
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
            <button
              onClick={clearSearch}
              className="text-xs text-amber-700 hover:text-amber-900 font-medium border border-amber-300 px-3 py-1 rounded-full hover:bg-amber-100 transition"
            >
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
              { title: '5 оддын үйлчилгээ', desc: 'Онцгой зочломтгой байдал болон хувийн анхаарал' },
              { title: 'Дэгжин хоол',       desc: 'Орон нутгийн болон олон улсын амтыг агуулсан гурмэ хоол' },
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
          <SectionHeader label="Байрлал" title="Өрөө ба Бүхлийн өрөөнүүд" sub="Таны тав тухыг хангахаар зориулалттай тансаг байр" />
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {rooms.map(room => (
                <RoomCard key={room._id} item={room} onClick={() => handleCardClick(room._id)} />
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
            <SectionHeader title="Хоол хүнсний туршлага" sub="Гайхалтай орчинд гурмэ амтыг мэдэрнэ үү" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {dining.map(item => (
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item._id)}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="md:flex">
                    <div className="md:w-2/5 h-56">
                      <img
                        src={getImageUrl(item.images[0]) || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item._id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={getImageUrl(item.images[0]) || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                <div
                  key={event._id}
                  onClick={() => handleCardClick(event._id)}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={getImageUrl(event.images[0]) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                <div
                  key={offer._id}
                  onClick={() => handleCardClick(offer._id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative"
                >
                  {offer.discount && (
                    <span className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      {offer.discount} OFF
                    </span>
                  )}
                  <div className="h-56 overflow-hidden">
                    <img
                      src={getImageUrl(offer.images[0]) || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800'}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">{offer.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{offer.description}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-amber-800">{offer.price}</span>
                      {offer.originalPrice && (
                        <span className="text-base text-gray-400 line-through">{offer.originalPrice}</span>
                      )}
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
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600')", backgroundSize: 'cover' }}
        />
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
              { title: 'Утас',   content: '+976 11 123 456',       href: 'tel:+97611123456' },
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
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Одоо захиалах
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Small reusable components ──

function SectionHeader({ label, title, sub }) {
  return (
    <div className="text-center mb-12">
      {label && (
        <span className="inline-block text-amber-700 font-semibold text-xs uppercase tracking-wider mb-3 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="w-10 h-0.5 bg-amber-700 mx-auto mb-4" />
      {sub && <p className="text-gray-500">{sub}</p>}
    </div>
  );
}

function RoomCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
    >
      <div className="relative h-60 overflow-hidden">
        <img
          src={getImageUrl(item.images?.[0]) || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
