import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import ReviewSection from '../components/ReviewSection';
import { useFavorites } from '../hooks/useFavorites';
import SEO from '../components/SEO';

// ── Availability Calendar ──────────────────────────────────────
const MONTH_NAMES = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
                     '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
const DAY_ABBR = ['Ня','Да','Мя','Лх','Пү','Ба','Бя'];

function BookingCalendar({ bookedRanges, checkIn, checkOut, onChange }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [baseMonth, setBaseMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [hover, setHover] = useState(null);
  const [phase, setPhase] = useState(checkIn && !checkOut ? 'out' : 'in');

  const dk = d => d.toISOString().split('T')[0];

  const isBooked = date => bookedRanges.some(r => {
    const s = new Date(r.checkIn); s.setHours(0,0,0,0);
    const e = new Date(r.checkOut); e.setHours(0,0,0,0);
    return date >= s && date <= e;
  });

  const isDisabled = date => date < today || isBooked(date);

  const selStart = checkIn ? new Date(checkIn) : null;
  const previewEnd = phase === 'out' && hover && !isDisabled(hover) ? hover : null;
  const selEnd = checkOut ? new Date(checkOut) : previewEnd;

  const inRange = date => selStart && selEnd && date > selStart && date < selEnd;
  const isStart = date => selStart && dk(date) === dk(selStart);
  const isEnd = date => selEnd && dk(date) === dk(selEnd);

  const handleClick = date => {
    if (isDisabled(date)) return;
    if (phase === 'in') {
      onChange(dk(date), '');
      setPhase('out');
    } else if (selStart) {
      if (date < selStart) {
        onChange(dk(date), dk(selStart));
      } else {
        onChange(checkIn, dk(date));
      }
      setPhase('in');
    }
  };

  const canGoPrev = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1) > today;
  const month2 = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);

  const renderMonth = first => {
    const yr = first.getFullYear(), mo = first.getMonth();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const startDow = first.getDay();
    const cells = [
      ...Array(startDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(yr, mo, i + 1)),
    ];

    return (
      <div key={`${yr}-${mo}`} className="min-w-0">
        <p className="text-center text-xs font-semibold text-gray-600 mb-2">
          {MONTH_NAMES[mo]} {yr}
        </p>
        <div className="grid grid-cols-7 text-center select-none">
          {DAY_ABBR.map(d => (
            <div key={d} className="text-[10px] text-gray-400 font-medium py-1">{d}</div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`e${i}`} />;
            const dis = isDisabled(date);
            const book = isBooked(date);
            const rng = inRange(date);
            const st = isStart(date);
            const en = isEnd(date);
            const todayMark = dk(date) === dk(today);

            return (
              <button
                key={date.getTime()}
                type="button"
                disabled={dis}
                onClick={() => handleClick(date)}
                onMouseEnter={() => phase === 'out' && setHover(date)}
                onMouseLeave={() => setHover(null)}
                className={[
                  'h-7 w-7 mx-auto text-xs font-medium transition-all',
                  dis ? 'cursor-not-allowed' : 'cursor-pointer',
                  book ? 'text-gray-300 line-through' : '',
                  st || en ? 'bg-amber-800 text-white rounded-full z-10' : '',
                  rng ? 'bg-amber-100 text-amber-900' : '',
                  !dis && !rng && !st && !en ? 'text-gray-700 hover:bg-amber-50 hover:text-amber-800 rounded-full' : '',
                  !dis && !book && !rng && !st && !en ? '' : '',
                  todayMark && !st && !en ? 'ring-1 ring-amber-500 rounded-full' : '',
                ].filter(Boolean).join(' ')}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <button type="button" onClick={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
          disabled={!canGoPrev}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition text-gray-500 text-base leading-none">
          ‹
        </button>
        <span className="text-xs font-medium text-gray-500">
          {phase === 'in' ? 'Орох огноог сонгоно уу' : 'Гарах огноог сонгоно уу'}
        </span>
        <button type="button" onClick={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
          className="p-1 rounded hover:bg-gray-200 transition text-gray-500 text-base leading-none">
          ›
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-3">
        {renderMonth(baseMonth)}
        {renderMonth(month2)}
      </div>

      <div className="px-4 pb-3 flex gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-800 inline-block" /> Сонгосон
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-amber-100 inline-block rounded-sm" /> Хугацаа
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-gray-100 inline-block rounded-sm" /> Захиалагдсан
        </span>
      </div>
    </div>
  );
}

// ── Payment Modal ──────────────────────────────────────────────
function PaymentModal({ item, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    checkIn: '', checkOut: '', guests: 1, notes: '',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  useEffect(() => {
    api.get(`/api/reservations/availability/${item._id}`)
      .then(res => setBookedRanges(res.data.bookedRanges || []))
      .catch(() => {});
  }, [item._id]);

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const ms = new Date(form.checkOut) - new Date(form.checkIn);
    return ms > 0 ? Math.floor(ms / 86400000) : 0;
  })();

  const priceNum = (() => {
    if (item.priceValue && item.priceValue > 0) return item.priceValue;
    const digits = (item.price || '').replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  })();

  const currency = (item.price || '').match(/[₮$€£¥]/)?.[0] || '₮';
  const isRoom = item.category === 'room';
  const totalNum = isRoom && nights > 0 && priceNum > 0 ? priceNum * nights : priceNum;
  const totalStr = totalNum > 0 ? `${currency}${totalNum.toLocaleString()}` : (item.price || '');

  const handleRangeChange = (ci, co) => {
    set('checkIn', ci);
    set('checkOut', co);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (step === 1) {
      if (!form.checkIn || !form.checkOut) { setError('Орох болон гарах огноог сонгоно уу'); return; }
      if (!nights) { setError('Гарах огноо орох огнооноос хойш байх ёстой'); return; }
      setError(''); setStep(2); return;
    }

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
          status: 'paid', method: 'card', amount: totalStr,
          cardLast4: raw.slice(-4), paidAt: new Date().toISOString(),
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[92vh] flex flex-col mx-2 sm:mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
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
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {item.images?.[0] && (
                <img src={getImageUrl(item.images[0])} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.location}</p>
                <p className="text-amber-800 font-bold text-sm mt-0.5">
                  {item.price}
                  {isRoom && <span className="text-xs font-normal text-gray-500"> / шөнөд</span>}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
            )}

            {step === 1 && (
              <>
                {/* Availability Calendar */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Огноо сонгох
                    {bookedRanges.length > 0 && (
                      <span className="ml-2 text-red-400 font-normal">({bookedRanges.length} захиалагдсан хугацаа байна)</span>
                    )}
                  </label>
                  <BookingCalendar
                    bookedRanges={bookedRanges}
                    checkIn={form.checkIn}
                    checkOut={form.checkOut}
                    onChange={handleRangeChange}
                  />
                </div>

                {/* Selected range summary */}
                {form.checkIn && form.checkOut && nights > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 text-sm text-amber-800">
                    <div className="flex items-center justify-between">
                      <span>
                        {new Date(form.checkIn).toLocaleDateString('mn-MN')} → {new Date(form.checkOut).toLocaleDateString('mn-MN')} · {nights} шөнө
                      </span>
                      <span className="font-bold text-base">{totalStr}</span>
                    </div>
                  </div>
                )}

                {/* Guests */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Зочдын тоо</label>
                  <select value={form.guests} onChange={e => set('guests', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} зочин</option>)}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Тусгай хүсэлт (заавал биш)</label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                    placeholder="Тусгай хүсэлт..."
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Картын мэдээлэл</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Картын дугаар</label>
                      <input value={form.cardNumber} onChange={e => set('cardNumber', formatCard(e.target.value))}
                        placeholder="0000 0000 0000 0000" maxLength={19}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white tracking-wider" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Картын нэр</label>
                      <input value={form.cardName} onChange={e => set('cardName', e.target.value.toUpperCase())}
                        placeholder="CARDHOLDER NAME"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white uppercase" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Хүчинтэй хугацаа</label>
                        <input value={form.expiry} onChange={e => set('expiry', formatExpiry(e.target.value))}
                          placeholder="MM/YY" maxLength={5}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CVV</label>
                        <input value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="···" type="password" maxLength={4}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
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
                    {submitting ? 'Боловсруулж байна...' : `${totalStr} — Төлбөр төлөх`}
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

// ── Heart button ───────────────────────────────────────────────
function HeartButton({ itemId, navigate }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [animating, setAnimating] = useState(false);

  const handleClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setAnimating(true);
    await toggleFavorite(itemId);
    setTimeout(() => setAnimating(false), 300);
  };

  const fav = isFavorite(itemId);

  return (
    <button
      onClick={handleClick}
      className={`p-2.5 rounded-xl border transition-all ${
        fav ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white hover:border-red-200 hover:bg-red-50'
      } ${animating ? 'scale-110' : 'scale-100'}`}
      title={fav ? 'Дуртай зүйлсээс хасах' : 'Дуртай зүйлсэд нэмэх'}
    >
      <svg className={`w-5 h-5 transition-colors ${fav ? 'text-red-500' : 'text-gray-400'}`}
        fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
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

  const itemLD = item ? {
    '@context': 'https://schema.org',
    '@type': item.category === 'room' ? 'HotelRoom' : 'Product',
    name: item.title,
    description: item.description,
    image: item.images?.[0] ? getImageUrl(item.images[0]) : undefined,
    offers: item.price ? {
      '@type': 'Offer',
      price: item.priceValue || item.price,
      priceCurrency: 'MNT',
      availability: 'https://schema.org/InStock',
    } : undefined,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {item && (
        <SEO
          title={item.title}
          description={item.description?.slice(0, 160)}
          image={item.images?.[0] ? getImageUrl(item.images[0]) : undefined}
          path={`/destination/${item._id}`}
          structuredData={itemLD}
        />
      )}

      {showModal && (
        <PaymentModal item={item} onClose={() => setShowModal(false)} onSuccess={handlePaymentSuccess} />
      )}

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
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
            {categoryLabel()}
          </span>
          <HeartButton itemId={item._id} navigate={navigate} />
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
                <button onClick={handleBookingClick} disabled={bookingDone}
                  className={`px-8 py-3.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
                    bookingDone ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-amber-800 text-white hover:bg-amber-900 shadow-sm'
                  }`}>
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
