import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import ReviewSection from '../components/ReviewSection';

// ── Payment Modal ──────────────────────────────────────────────
function PaymentModal({ item, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1=booking info, 2=payment
  const [form, setForm] = useState({
    checkIn: '', checkOut: '', guests: 1, notes: '',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return null;
    const diff = (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000;
    return diff > 0 ? diff : null;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.checkIn || !form.checkOut) { setError('Орох болон гарах огноог оруулна уу'); return; }
      if (!nights) { setError('Гарах огноо орох огнооноос хойш байх ёстой'); return; }
      setError(''); setStep(2); return;
    }

    // Step 2: payment
    const raw = form.cardNumber.replace(/\s/g, '');
    if (raw.length < 16) { setError('Картын дугаарыг зөв оруулна уу'); return; }
    if (!form.cardName.trim()) { setError('Картын нэрийг оруулна уу'); return; }
    if (form.expiry.length < 5) { setError('Хүчинтэй хугацааг оруулна уу'); return; }
    if (form.cvv.length < 3) { setError('CVV кодыг оруулна уу'); return; }

    setError(''); setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/reservations', {
        itemId: item._id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        notes: form.notes,
        payment: {
          status: 'paid',
          method: 'card',
          amount: item.price,
          cardLast4: raw.slice(-4),
          paidAt: new Date().toISOString(),
        },
      }, { headers: { Authorization: `Bearer ${token}` } });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Захиалга үүсгэхэд алдаа гарлаа');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-amber-800' : s < step ? 'w-3 bg-amber-300' : 'w-3 bg-gray-200'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-1">{step === 1 ? 'Захиалгын мэдээлэл' : 'Төлбөр'}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Booking summary */}
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-3">
              {item.images?.[0] && (
                <img src={getImageUrl(item.images[0])} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.location}</p>
                <p className="text-amber-800 font-bold text-sm mt-0.5">
                  {item.price}
                  {item.category === 'room' && <span className="text-xs font-normal text-gray-500"> / шөнөд</span>}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Орох огноо</label>
                    <input type="date" value={form.checkIn} min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('checkIn', e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Гарах огноо</label>
                    <input type="date" value={form.checkOut} min={form.checkIn || new Date().toISOString().split('T')[0]}
                      onChange={e => set('checkOut', e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                </div>

                {nights && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 text-sm text-amber-800 font-medium">
                    {nights} шөнө · нийт {item.price}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Зочдын тоо</label>
                  <select value={form.guests} onChange={e => set('guests', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} зочин</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Тусгай хүсэлт (заавал биш)</label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Тусгай хүсэлт..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
                </div>

                <button type="submit"
                  className="w-full py-3 bg-amber-800 text-white rounded-xl font-semibold text-sm hover:bg-amber-900 transition">
                  Цааш үргэлжлүүлэх →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-1">
                  <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Картын мэдээлэл</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Картын дугаар</label>
                      <input
                        value={form.cardNumber}
                        onChange={e => set('cardNumber', formatCard(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white tracking-wider"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Картын нэр</label>
                      <input
                        value={form.cardName}
                        onChange={e => set('cardName', e.target.value.toUpperCase())}
                        placeholder="CARDHOLDER NAME"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Хүчинтэй хугацаа</label>
                        <input
                          value={form.expiry}
                          onChange={e => set('expiry', formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CVV</label>
                        <input
                          value={form.cvv}
                          onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="···"
                          type="password"
                          maxLength={4}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Таны картын мэдээлэл аюулгүй шифрлэгдсэн
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-medium">
                    Буцах
                  </button>
                  <button type="submit" disabled={submitting}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                      submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-800 text-white hover:bg-amber-900'
                    }`}>
                    {submitting ? 'Боловсруулж байна...' : `${item.price} — Төлбөр төлөх`}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  useEffect(() => {
    setItem(null); setLoading(true); setError(null);
    setCurrentImageIndex(0); setShowModal(false); setBookingDone(false);
    fetchItem();
    window.scrollTo(0, 0);
    return () => { setItem(null); setCurrentImageIndex(0); };
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/api/destinations/${id}`);
      setItem(res.data);
    } catch {
      setError('Дэлгэрэнгүй мэдээлэл ачааллахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setShowModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowModal(false);
    setBookingDone(true);
    setTimeout(() => navigate('/profile'), 2200);
  };

  const nextImage = () => item?.images?.length > 0 && setCurrentImageIndex(p => (p + 1) % item.images.length);
  const prevImage = () => item?.images?.length > 0 && setCurrentImageIndex(p => (p - 1 + item.images.length) % item.images.length);

  const categoryLabel = () => ({
    room: 'Байрлал', dining: 'Хоол хүнс', activity: 'Үйл ажиллагаа',
    event: 'Тусгай арга хэмжээ', offer: 'Тусгай санал',
  }[item?.category] || 'Ресортын онцлог');

  const bookingBtnLabel = () => ({
    room: 'Өрөө захиалах', dining: 'Захиалга хийх', activity: 'Үйл ажиллагаа захиалах',
    event: 'Арга хэмжээнд бүртгүүлэх', offer: 'Санал авах',
  }[item?.category] || 'Одоо лавлах');

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-sm">Уншиж байна...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500">{error || 'Мэдээлэл олдсонгүй'}</p>
        <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-amber-800 text-white rounded-lg text-sm hover:bg-amber-900 transition">
          Нүүр хуудас руу буцах
        </button>
      </div>
    );
  }

  const hasImages = item.images?.length > 0;
  const currentImage = hasImages
    ? (getImageUrl(item.images[currentImageIndex]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800')
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Payment modal */}
      {showModal && (
        <PaymentModal item={item} onClose={() => setShowModal(false)} onSuccess={handlePaymentSuccess} />
      )}

      {/* Success toast */}
      {bookingDone && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-sm">Захиалга болон төлбөр амжилттай! Профайл руу шилжиж байна...</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button onClick={() => navigate('/')}
            className="text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1.5 text-sm group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Нүүр хуудас
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
            {categoryLabel()}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image carousel */}
          <div className="relative h-80 md:h-[460px] bg-gray-100">
            <img src={currentImage} alt={item.title} className="w-full h-full object-cover" />

            {item.discount && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                {item.discount} OFF
              </span>
            )}

            {hasImages && item.images.length > 1 && (
              <>
                <button onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {item.images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)}
                      className={`rounded-full transition-all ${i === currentImageIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1.5">{item.title}</h1>
                {item.location && (
                  <p className="text-gray-500 flex items-center gap-1.5 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {item.location}
                  </p>
                )}
              </div>
            </div>

            {/* Price & booking */}
            {item.price && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">
                    {item.category === 'room' ? 'Шөнийн үнэ' : 'Үнэ'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-800">{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">{item.originalPrice}</span>
                    )}
                  </div>
                  {item.duration && item.category !== 'room' && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.duration}</p>
                  )}
                </div>
                <button
                  onClick={handleBookingClick}
                  disabled={bookingDone}
                  className={`px-8 py-3.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
                    bookingDone ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-amber-800 text-white hover:bg-amber-900 shadow-sm'
                  }`}
                >
                  {bookingDone ? 'Захиалга баталгаажсан' : bookingBtnLabel()}
                </button>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Тайлбар</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>

            {/* CTA banner */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-xl p-7 text-white text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Үүнийг мэдрэхэд бэлэн үү?</h3>
              <p className="text-white/75 text-sm mb-5 max-w-md mx-auto">
                {item.category === 'room' ? 'Хонолтоо захиалаад байгальд тансаг амралт эдэлнэ үү.' : 'Дэлгэрэнгүй мэдэхийн тулд захиалгаа хийнэ үү.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={handleBookingClick} disabled={bookingDone}
                  className={`px-7 py-3 rounded-xl font-semibold text-sm transition ${bookingDone ? 'bg-white/20 cursor-default' : 'bg-white text-amber-900 hover:bg-gray-50'}`}>
                  {bookingDone ? 'Захиалагдсан' : bookingBtnLabel()}
                </button>
                <button onClick={() => navigate('/#contact')}
                  className="px-7 py-3 bg-transparent border-2 border-white/30 text-white rounded-xl font-semibold text-sm hover:border-white/60 transition">
                  Холбоо барих
                </button>
              </div>
            </div>

            {/* Reviews */}
            <ReviewSection itemId={item._id} itemType={item.category} />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-amber-800 hover:text-amber-900 font-medium text-sm">
            ← Бусад сонголтуудыг үзэх
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationDetail;
