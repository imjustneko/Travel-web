
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ReviewSection({ itemId, itemType }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    console.log('ReviewSection mounted with itemId:', itemId, 'itemType:', itemType);
    if (itemId) {
      fetchReviews();
    }
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      const url = `http://localhost:5000/api/reviews/item/${itemId}`;
      console.log('Fetching reviews from:', url);
      const response = await axios.get(url);
      console.log('Reviews response:', response.data);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      console.error('Response data:', error.response?.data);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (formData.comment.length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(
        'http://localhost:5000/api/reviews',
        {
          itemId,
          itemType,
          rating: formData.rating,
          comment: formData.comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Review submitted successfully!');
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, clickable = false, onStarClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={clickable ? 'button' : undefined}
            onClick={clickable ? () => onStarClick(star) : undefined}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-500' : 'text-gray-300'
            } ${clickable ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
            disabled={!clickable}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchReviews();
      setSuccess('Review deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete review');
    }
  };

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
  };

  return (
    <div className="mt-12 border-t pt-8">
      <div className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Guest Reviews & Ratings</h2>
        {totalReviews > 0 ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-4xl font-bold text-amber-800">{averageRating.toFixed(1)}</span>
              <span className="text-lg text-gray-600">/5.0</span>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <p className="text-lg font-semibold text-gray-900">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
              <p className="text-sm text-gray-600">Based on customer experiences</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No ratings yet. Be the first to share your experience!</p>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Write Review Button */}
      {!showForm && (
        <button
          onClick={() => {
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login');
            } else {
              setShowForm(true);
            }
          }}
          className="mb-6 px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold"
        >
          ✍️ Write a Review
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Share Your Experience</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            {renderStars(formData.rating, true, (star) => setFormData({ ...formData, rating: star }))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Tell others about your experience... (minimum 10 characters)"
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.comment.length} / 1000 characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ rating: 5, comment: '' });
                setError('');
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading reviews...</div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl text-gray-600 mb-2">No reviews yet</p>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.userName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {renderStars(review.rating)}
                  {review.user === getUserId() && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;