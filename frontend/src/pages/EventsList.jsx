
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    window.scrollTo(0, 0);
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from /api/events');
      const response = await axios.get('http://localhost:5000/api/events');
      console.log('Events response:', response.data);
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      console.error('Response:', error.response?.data);
      setLoading(false);
    }
  };

  const handleEventClick = (id) => {
    navigate(`/destination/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <div className="text-2xl text-amber-800">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Resort Events</h1>
          <p className="text-xl opacity-90">Experience unforgettable moments at Red Rock Resort</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Scheduled</h2>
            <p className="text-gray-600 mb-6">Check back soon for upcoming events and special occasions</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-600 mt-2">Join us for exclusive resort events and celebrations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => handleEventClick(event._id)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-2 duration-300"
                >
                  {/* Event Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={
                        event.images && event.images[0]
                          ? `http://localhost:5000${event.images[0]}`
                          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {event.featured && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        Featured
                      </div>
                    )}
                    {event.discount && (
                      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {event.discount} OFF
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    
                    {event.location && (
                      <p className="text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        {event.location}
                      </p>
                    )}

                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                    <div className="flex justify-between items-center mb-4">
                      {event.price && (
                        <div>
                          <span className="text-2xl font-bold text-amber-800">{event.price}</span>
                          {event.originalPrice && (
                            <span className="text-gray-400 line-through ml-2 text-sm">
                              {event.originalPrice}
                            </span>
                          )}
                          {event.duration && (
                            <span className="text-gray-500 ml-2 text-sm">/ {event.duration}</span>
                          )}
                        </div>
                      )}
                      {event.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          <span className="font-semibold">{event.rating}</span>
                        </div>
                      )}
                    </div>

                    <button className="w-full py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold">
                      Register Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Miss Out</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter to stay updated on upcoming events and special offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button className="px-8 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsList;