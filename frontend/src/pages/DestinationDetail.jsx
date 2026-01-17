
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewSection from '../components/ReviewSection'; // ⭐ ADDED

function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    setItem(null);
    setLoading(true);
    setError(null);
    setCurrentImageIndex(0);
    setBookingStatus('idle');
    setBookingMessage('');
    fetchItem();
    window.scrollTo(0, 0);
    
    return () => {
      setItem(null);
      setCurrentImageIndex(0);
    };
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/destinations/${id}`);
      setItem(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Failed to load details. Please try again.');
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setBookingStatus('loading');
    setBookingMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/reservations',
        { itemId: item._id, guests: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookingStatus('success');
      setBookingMessage('Reservation confirmed! Redirecting to your profile...');
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
      setBookingMessage(error.response?.data?.message || 'Failed to create reservation. Please try again.');
      
      setTimeout(() => {
        setBookingStatus('idle');
        setBookingMessage('');
      }, 5000);
    }
  };

  const nextImage = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  const getButtonText = () => {
    if (!item) return 'Contact Us';
    switch(item.category) {
      case 'room':
        return 'Book This Room';
      case 'dining':
        return 'Make Reservation';
      case 'activity':
        return 'Book Activity';
      case 'event':
        return 'Register for Event';
      case 'offer':
        return 'Claim This Offer';
      default:
        return 'Inquire Now';
    }
  };

  const getCategoryLabel = () => {
    if (!item) return '';
    switch(item.category) {
      case 'room':
        return 'Accommodation';
      case 'dining':
        return 'Dining Experience';
      case 'activity':
        return 'Activity';
      case 'event':
        return 'Special Event';
      case 'offer':
        return 'Special Offer';
      default:
        return 'Resort Feature';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-4xl mb-4">🏔️</div>
        <div className="text-xl text-amber-800">Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-2xl text-red-600 mb-4">{error || 'Item not found'}</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const hasImages = item.images && item.images.length > 0;
  const currentImage = hasImages 
    ? `http://localhost:5000${item.images[currentImageIndex]}`
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Booking Status Messages */}
      {bookingStatus === 'success' && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
          ✅ {bookingMessage}
        </div>
      )}
      
      {bookingStatus === 'error' && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
          ❌ {bookingMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-amber-800 hover:text-amber-900 font-medium flex items-center"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold">
            {getCategoryLabel()}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Carousel */}
          <div className="relative h-96 md:h-[500px] bg-gray-200">
            <img
              src={currentImage}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            
            {item.discount && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                {item.discount} OFF
              </div>
            )}

            {hasImages && item.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition"
                >
                  →
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {item.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{item.title}</h1>
                {item.location && (
                  <p className="text-gray-600 text-lg flex items-center">
                    <span className="mr-2">📍</span>
                    {item.location}
                  </p>
                )}
              </div>
              {/* Admin rating replaced with user reviews rating below */}
            </div>

            {/* Price & Booking Section */}
            {item.price && (
              <div className="bg-amber-50 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      {item.category === 'room' ? 'Starting from' : 'Price'}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-amber-800">{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-2xl text-gray-400 line-through">{item.originalPrice}</span>
                      )}
                    </div>
                    {item.duration && (
                      <p className="text-gray-600 mt-2">
                        {item.category === 'room' ? 'Per night' : item.duration}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={handleBooking}
                    disabled={bookingStatus === 'loading'}
                    className={`w-full md:w-auto px-8 py-4 rounded-lg text-lg font-semibold whitespace-nowrap transition ${
                      bookingStatus === 'loading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-amber-800 text-white hover:bg-amber-900'
                    }`}
                  >
                    {bookingStatus === 'loading' ? 'Processing...' : getButtonText()}
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-lg p-8 text-white text-center mb-8">
              <h3 className="text-3xl font-bold mb-3">Ready to Experience This?</h3>
              <p className="text-lg mb-6 opacity-90">
                {item.category === 'room' ? 'Reserve your stay and enjoy luxury in nature.' :
                 item.category === 'dining' ? 'Make your reservation for an unforgettable dining experience.' :
                 item.category === 'activity' ? 'Join us for an adventure you\'ll never forget.' :
                 'Contact us to learn more and make your reservation.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleBooking}
                  disabled={bookingStatus === 'loading'}
                  className={`px-8 py-4 rounded-lg text-lg font-semibold transition ${
                    bookingStatus === 'loading'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-white text-amber-900 hover:bg-gray-100'
                  }`}
                >
                  {bookingStatus === 'loading' ? 'Processing...' : getButtonText()}
                </button>
                <button 
                  onClick={() => navigate('/#contact')}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-amber-900 transition text-lg"
                >
                  Contact Us
                </button>
              </div>
            </div>

            {/* ⭐ REVIEWS SECTION - FIXED: NOW INCLUDED ⭐ */}
            <ReviewSection 
              itemId={item._id} 
              itemType={item.category} 
            />
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-amber-800 hover:text-amber-900 font-semibold text-lg"
          >
            ← Explore More Options
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationDetail;