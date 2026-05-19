import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

function PackageCard({ pkg, onInquire }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="relative h-60 overflow-hidden">
        <img
          src={getImageUrl(pkg.images?.[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {pkg.featured && (
          <span className="absolute top-3 left-3 bg-violet-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            Онцлох
          </span>
        )}
        {pkg.discount && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {pkg.discount} OFF
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors">{pkg.title}</h3>
          <span className="flex-shrink-0 text-xs bg-amber-50 border border-amber-200 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
            {pkg.duration}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{pkg.description}</p>

        {/* What's included */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Багцад багтсан:</p>
          {pkg.includes?.room && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">🛏</span>
              <span>{pkg.includes.room}</span>
            </div>
          )}
          {pkg.includes?.dining && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">🍽</span>
              <span>{pkg.includes.dining}</span>
            </div>
          )}
          {pkg.includes?.activities?.map((act, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">🎯</span>
              <span>{act}</span>
            </div>
          ))}
          {pkg.highlights?.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>{h}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-800">{pkg.price}</span>
              {pkg.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{pkg.originalPrice}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {pkg.maxGuests && `Max ${pkg.maxGuests} зочин`}
            </p>
          </div>
          <button
            onClick={() => onInquire(pkg)}
            className="px-5 py-2.5 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition shadow-sm">
            Лавлах
          </button>
        </div>
      </div>
    </div>
  );
}

function InquireModal({ pkg, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: 2, date: '', notes: '' });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Хүсэлт илгээгдлээ!</h3>
          <p className="text-gray-500 text-sm mb-6">Бид тантай 24 цагийн дотор холбогдох болно.</p>
          <button onClick={onClose} className="px-6 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition">
            Хаах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Багц лавлах</h2>
            <p className="text-xs text-gray-400">{pkg.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Нэр *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Таны нэр"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Утас *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="Утасны дугаар"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">И-мэйл *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="email@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Зочдын тоо</label>
              <select value={form.guests} onChange={e => set('guests', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} зочин</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Хүссэн огноо</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Нэмэлт тэмдэглэл</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Тусгай хүсэлт, асуулт..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Багцын үнэ</span>
              <span className="font-bold text-amber-800">{pkg.price}</span>
            </div>
          </div>

          <button type="submit"
            className="w-full py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition">
            Хүсэлт илгээх
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PackagesList() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/api/packages')
      .then(res => setPackages(res.data.packages || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedPkg && (
        <InquireModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
      )}

      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-block text-amber-200 font-semibold text-xs uppercase tracking-wider mb-4 bg-amber-900/50 px-4 py-1.5 rounded-full border border-amber-700">
            Тусгай санал
          </span>
          <h1 className="text-5xl font-bold mb-4">Багцын гэрээ</h1>
          <p className="text-xl opacity-80 max-w-xl mx-auto">
            Өрөө, хоол хүнс болон үйл ажиллагааг нэгтгэсэн хэмнэлттэй багц үнэ
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Удахгүй боломжтой болно</h2>
            <p className="text-gray-500 text-sm mb-6">
              Бид тантай хамгийн сайн тусгай санал бэлтгэж байна.
              <br />Одоогоор хувийн санал авахын тулд биднэй холбогдоорой.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/#contact')}
                className="px-6 py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition">
                Холбоо барих
              </button>
              <button onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                Нүүр хуудас руу буцах
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Одоо байгаа багцууд</h2>
              <p className="text-gray-500 mt-2">Нэг захиалгаар бүгдийг авч хэмнэлттэйгээр амрана уу</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {packages.map(pkg => (
                <PackageCard key={pkg._id} pkg={pkg} onInquire={setSelectedPkg} />
              ))}
            </div>
          </>
        )}

        {/* Benefits banner */}
        <div className="mt-16 bg-amber-800 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2 text-center">Яагаад багц сонгох вэ?</h3>
          <p className="text-white/70 text-sm text-center mb-8">Тусдаа захиалахаас хамаагүй хэмнэлттэй</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: 'Хэмнэлттэй', desc: 'Тусдаа захиалахтай харьцуулахад 20-30% хямд' },
              { icon: '🎯', title: 'Хялбар', desc: 'Нэг захиалгаар бүгдийг шийднэ, цаг хэмнэнэ' },
              { icon: '✨', title: 'Бүрэн гүйцэд', desc: 'Унтлага, хоол, үйл ажиллагаа бүгд нэг дор' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <h4 className="font-bold mb-1">{title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
