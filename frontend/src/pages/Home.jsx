import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.get('http://localhost:5000/api/destinations');
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
      const response = await axios.get(`http://localhost:5000/api/search?${queryString}`);
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
          <div className="text-2xl text-amber-800">Loading...</div>
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
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg">Red Rock Resort</h1>
          <p className="text-2xl md:text-3xl mb-8 font-light drop-shadow-lg">Luxury Retreat in Nature's Embrace</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                const element = document.getElementById('rooms');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold text-lg shadow-lg"
            >
              Explore Rooms
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('contact');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-amber-900 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-20 bg-white ${sectionClass}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Paradise</h2>
            <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nestled in the heart of Terelj National Park, Red Rock Resort offers an unparalleled 
              blend of luxury and nature. Experience tranquility, adventure, and world-class hospitality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🏔️</div>
              <h3 className="text-xl font-bold mb-2">Stunning Location</h3>
              <p className="text-gray-600">Surrounded by majestic mountains and pristine nature</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">5-Star Service</h3>
              <p className="text-gray-600">Exceptional hospitality and personalized attention</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-2">Fine Dining</h3>
              <p className="text-gray-600">Exquisite cuisine featuring local and international flavors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className={`py-20 bg-gray-50 ${sectionClass}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Rooms & Suites</h2>
            <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Luxurious accommodations designed for your comfort</p>
          </div>

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <div 
                  key={room._id} 
                  onClick={() => handleCardClick(room._id)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-2 duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={room.images[0] ? `http://localhost:5000${room.images[0]}` : 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600'}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold text-amber-800">{room.price}</div>
                      <div className="text-gray-500 text-sm">per night</div>
                    </div>
                    <button className="w-full py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">Our rooms will be available soon.</p>
              <p className="text-sm mt-2">Check back later or contact us for more information.</p>
            </div>
          )}
        </div>
      </section>

      {/* Dining Section */}
      {dining.length > 0 && (
        <section id="dining" className={`py-20 bg-white ${sectionClass}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Dining Experience</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Savor exquisite flavors in stunning settings</p>
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
                        src={item.images[0] ? `http://localhost:5000${item.images[0]}` : 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                      <button className="self-start px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition">
                        Learn More
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Activities & Experiences</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Adventure awaits at every turn</p>
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
                      src={activity.images[0] ? `http://localhost:5000${activity.images[0]}` : 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600'}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{activity.description}</p>
                    <button className="text-amber-800 font-semibold hover:text-amber-900">
                      Learn More →
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Resort Events</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Join us for exclusive events and celebrations</p>
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
                      src={event.images[0] ? `http://localhost:5000${event.images[0]}` : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {event.featured && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    <div className="text-amber-800 font-bold text-lg mb-4">{event.price}</div>
                    <button className="w-full py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold">
                      Learn More
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Special Offers</h2>
              <div className="w-24 h-1 bg-amber-800 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">Exclusive deals for unforgettable stays</p>
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
                      src={offer.images[0] ? `http://localhost:5000${offer.images[0]}` : 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800'}
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
                      Book This Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className={`py-20 bg-gray-900 text-white ${sectionClass}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Plan Your Stay</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
          <p className="text-xl mb-8">Ready to experience luxury in nature? Contact us today.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold">Call Us</p>
              <a href="tel:+97611123456" className="text-gray-400 hover:text-white transition">
                +976 11 123 456
              </a>
            </div>
            <div>
              <div className="text-3xl mb-2">✉️</div>
              <p className="font-semibold">Email Us</p>
              <a href="mailto:info@redrockresort.mn" className="text-gray-400 hover:text-white transition">
                info@redrockresort.mn
              </a>
            </div>
            <div>
              <div className="text-3xl mb-2">📍</div>
              <p className="font-semibold">Visit Us</p>
              <p className="text-gray-400">Terelj National Park</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold text-lg">
            Book Your Escape Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;