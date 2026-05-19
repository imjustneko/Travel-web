import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

function Home({ searchParams }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchParams) {
      performSearch(searchParams);
    } else {
      setFilteredItems(items);
    }
  }, [searchParams, items]);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/destinations');
      setItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const performSearch = async (params) => {
    if (!params.query) {
      setFilteredItems(items);
      return;
    }

    try {
      setLoading(true);
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/search?${queryString}`);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error searching:', error);
      setFilteredItems(items);
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/destination/${id}`);
    window.scrollTo(0, 0);
  };

  const filterByCategory = (category) => {
    return filteredItems.filter(item => item.category === category);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🏔️</div>
          <div className="text-2xl text-amber-800">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  const rooms = filterByCategory('room');
  const dining = filterByCategory('dining');
  const activities = filterByCategory('activity');
  const events = filterByCategory('event');
  const offers = filterByCategory('offer');

  // Scroll offset for sticky header (80px = height of topbar)
  const sectionClass = "scroll-mt-24";

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')",
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />

        <div className="relative z-10 text-center text-white px-4 max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 mb-6 text-sm font-medium">
            <span>⭐⭐⭐⭐⭐</span>
            <span>Горхи-Тэрэлжийн 5 одтой ресорт</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-5 leading-tight drop-shadow-xl">
            улаан хад ресорт
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light drop-shadow-lg text-white/90 max-w-2xl mx-auto">
            Байгалийн цэвэр агаарт — Монгол орны хамгийн гайхалтай газар
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg shadow-xl transition-all active:scale-95 border border-amber-600"
            >
              🛏️ Өрөөнүүдийг үзэх
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl font-semibold text-lg shadow-xl transition-all active:scale-95 border border-white/40"
            >
              📞 Холбоо барих
            </button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 md:gap-16 text-white/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-xs uppercase tracking-wider mt-1">Зочид</div>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9</div>
              <div className="text-xs uppercase tracking-wider mt-1">Үнэлгээ</div>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10+</div>
              <div className="text-xs uppercase tracking-wider mt-1">Жилийн туршлага</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-bounce">
          <div className="w-px h-8 bg-white/40" />
          <span className="text-xs uppercase tracking-widest">Доош гүйлгэх</span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-24 bg-white ${sectionClass}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-amber-700 font-semibold text-sm uppercase tracking-wider mb-3 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
              Бидний тухай
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">Диваажинд тавтай морил</h2>
            <div className="w-16 h-1 bg-amber-700 mx-auto mb-6 rounded-full" />
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Горхи-Тэрэлж Үндэсний Цэцэрлэгт Хүрээлэнгийн зүрхэнд байрлах Улаан Хад Ресорт нь тансаг байдал болон байгалийн хосгүй хослолыг санал болгодог. Тайван байдал, адал явдал болон дэлхийн түвшний зочломтгой байдлыг мэдэрнэ үү.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🏔️', title: 'Гайхалтай байршил', desc: 'Сүртэй уулс болон цэвэр байгальд хүрээлэгдсэн', color: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
              { icon: '⭐', title: '5 оддын үйлчилгээ', desc: 'Онцгой зочломтгой байдал болон хувийн анхаарал', color: 'from-yellow-50 to-amber-50', border: 'border-yellow-100' },
              { icon: '🍽️', title: 'Дэгжин хоол', desc: 'Орон нутгийн болон олон улсын амтыг агуулсан гурмэ хоол', color: 'from-orange-50 to-red-50', border: 'border-orange-100' }
            ].map(({ icon, title, desc, color, border }) => (
              <div key={title} className={`text-center p-8 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md text-4xl">
                  {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className={`py-24 bg-gray-50 ${sectionClass}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-amber-700 font-semibold text-sm uppercase tracking-wider mb-3 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
              Байрлал
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">Өрөө ба Бүхлийн өрөөнүүд</h2>
            <div className="w-16 h-1 bg-amber-700 mx-auto mb-5 rounded-full" />
            <p className="text-lg text-gray-600">Таны тав тухыг хангахаар зориулалттай тансаг байр</p>
          </div>

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleCardClick(room._id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={getImageUrl(room.images[0]) || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600'}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-800 text-white text-xs font-semibold px-3 py-1 rounded-full">🛏️ Өрөө</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">{room.title}</h3>
                    <p className="text-gray-500 mb-5 line-clamp-2 text-sm leading-relaxed">{room.description}</p>
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <span className="text-2xl font-bold text-amber-800">{room.price}</span>
                        <span className="text-gray-400 text-sm ml-1">/ шөнөд</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        ⭐⭐⭐⭐⭐
                      </div>
                    </div>
                    <button className="w-full py-3 bg-amber-800 text-white rounded-xl hover:bg-amber-900 transition-colors font-semibold group-hover:shadow-lg group-hover:shadow-amber-800/30">
                      Дэлгэрэнгүй үзэх →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-6xl mb-4">🏨</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">Манай өрөөнүүд удахгүй боломжтой болно.</p>
              <p className="text-sm text-gray-500">Дахин шалгана уу эсвэл дэлгэрэнгүй мэдээлэл авахаар бидэнтэй холбоо барина уу.</p>
            </div>
          )}
        </div>
      </section>

      {/* Dining Section */}
      {dining.length > 0 && (
        <section id="dining" className={`py-20 bg-white ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Хоол хүнсний туршлага</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Гайхалтай орчинд гурмэ амтыг мэдэрнэ үү</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dining.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => handleCardClick(item._id)}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer"
                >
                  <div className="md:flex">
                    <div className="md:w-1/2 h-64">
                      <img 
                        src={getImageUrl(item.images[0]) || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                      <button className="self-start px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition">
                        Дэлгэрэнгүй
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Activities Section */}
      {activities.length > 0 && (
        <section id="activities" className={`py-20 bg-gray-50 ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Үйл ажиллагаа ба туршлага</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Адал явдал хаа сайгүй хүлээж байна</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activities.map((activity) => (
                <div 
                  key={activity._id}
                  onClick={() => handleCardClick(activity._id)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(activity.images[0]) || 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600'}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{activity.description}</p>
                    <button className="text-amber-800 font-semibold hover:text-amber-900">
                      Дэлгэрэнгүй →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section id="events" className={`py-20 bg-white ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ресортын арга хэмжээ</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Онцгой арга хэмжээ болон баяр ёслолд бидэнтэй нэгдэнэ үү</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div 
                  key={event._id}
                  onClick={() => handleCardClick(event._id)}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={getImageUrl(event.images[0]) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {event.featured && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        Онцлох
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    <div className="text-amber-800 font-bold text-lg mb-4">{event.price}</div>
                    <button className="w-full py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold">
                      Дэлгэрэнгүй
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Offers */}
      {offers.length > 0 && (
        <section id="offers" className={`py-20 bg-amber-50 ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Тусгай санал</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Мартагдашгүй хонолтын онцгой хэлэлцээр</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offers.map((offer) => (
                <div 
                  key={offer._id}
                  onClick={() => handleCardClick(offer._id)}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer relative transform hover:-translate-y-1"
                >
                  {offer.discount && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold z-10 shadow-lg">
                      {offer.discount} OFF
                    </div>
                  )}
                  <div className="h-64">
                    <img 
                      src={getImageUrl(offer.images[0]) || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800'}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{offer.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{offer.description}</p>
                    <div className="flex items-baseline space-x-2 mb-4">
                      <span className="text-3xl font-bold text-amber-800">{offer.price}</span>
                      {offer.originalPrice && (
                        <span className="text-xl text-gray-400 line-through">{offer.originalPrice}</span>
                      )}
                    </div>
                    <button className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
                      Энэ саналыг захиалах
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className={`py-24 relative overflow-hidden ${sectionClass}`}>
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600')", backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block text-amber-400 font-semibold text-sm uppercase tracking-wider mb-4 bg-amber-900/50 px-4 py-1 rounded-full border border-amber-700">
            Холбоо барих
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">амралтаа төлөвлөх</h2>
          <div className="w-16 h-1 bg-amber-600 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            Байгальд тансаг амралт эдлэхэд бэлэн үү? Өнөөдөр бидэнтэй холбоо барина уу.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '📞', title: 'Залгах', content: '+976 11 123 456', href: 'tel:+97611123456' },
              { icon: '✉️', title: 'Имэйл бичих', content: 'info@redrockresort.mn', href: 'mailto:info@redrockresort.mn' },
              { icon: '📍', title: 'Зочлох', content: 'Горхи-Тэрэлж, Монгол', href: null }
            ].map(({ icon, title, content, href }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all">
                <div className="text-4xl mb-3">{icon}</div>
                <p className="font-semibold text-white mb-1">{title}</p>
                {href ? (
                  <a href={href} className="text-amber-300 hover:text-amber-200 transition text-sm">{content}</a>
                ) : (
                  <p className="text-gray-400 text-sm">{content}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-10 py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-amber-900/40 transition-all active:scale-95"
          >
            🏨 Одоо захиалах
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;