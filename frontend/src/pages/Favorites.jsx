import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { getImageUrl } from '../api';

const CATEGORY_LABELS = {
  room: 'Өрөө', dining: 'Хоол', activity: 'Үйл ажиллагаа',
  event: 'Арга хэмжээ', offer: 'Санал',
};

function HeartIcon({ filled }) {
  return (
    <svg className={`w-5 h-5 transition-colors ${filled ? 'text-red-500' : 'text-gray-300'}`}
      fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, loading, toggleFavorite, isFavorite } = useFavorites();

  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl mb-2">🤍</div>
        <h2 className="text-2xl font-bold text-gray-900">Хадгалах</h2>
        <p className="text-gray-500 text-sm">Дуртай өрөөгөө хадгалахын тулд нэвтэрнэ үү</p>
        <button onClick={() => navigate('/login')}
          className="mt-2 px-6 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition">
          Нэвтрэх
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-1">Хадгалсан өрөө</h1>
          <p className="text-white/70 text-sm">
            {favorites.length > 0 ? `${favorites.length} хадгалсан зүйл` : 'Одоогоор хадгалсан зүйл байхгүй'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🤍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Хадгалсан зүйл байхгүй</h2>
            <p className="text-gray-500 text-sm mb-6">Дуртай өрөө, хоол, үйл ажиллагаагаа зүрх товч дарж хадгалаарай</p>
            <button onClick={() => navigate('/')}
              className="px-6 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition">
              Ресортыг үзэх
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(fav => {
              const item = fav.item;
              if (!item) return null;
              const img = getImageUrl(item.images?.[0]);
              return (
                <div key={fav._id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                  <div className="relative h-52 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/destination/${item._id}`)}>
                    <img
                      src={img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.discount && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {item.discount} OFF
                      </span>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="font-bold text-gray-900 cursor-pointer hover:text-amber-800 transition-colors line-clamp-1 flex-1"
                        onClick={() => navigate(`/destination/${item._id}`)}>
                        {item.title}
                      </h3>
                      <button
                        onClick={() => toggleFavorite(item._id)}
                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                        <HeartIcon filled={isFavorite(item._id)} />
                      </button>
                    </div>
                    {item.location && (
                      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {item.location}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-amber-800">{item.price}</span>
                        {item.category === 'room' && <span className="text-gray-400 text-xs ml-1">/ шөнөд</span>}
                        {item.originalPrice && (
                          <span className="text-gray-400 line-through text-xs ml-2">{item.originalPrice}</span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/destination/${item._id}`)}
                        className="text-xs font-semibold text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition">
                        Захиалах →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
