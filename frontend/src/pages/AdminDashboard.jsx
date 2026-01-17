// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    duration: '5 days',
    featured: false,
    discount: '',
    originalPrice: '',
    category: 'room'
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/admin/destinations',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDestinations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    const formDataImages = new FormData();
    selectedFiles.forEach((file) => {
      formDataImages.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/upload',
        formDataImages,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const imageUrls = await uploadImages();
      const allImages = [...uploadedImages, ...imageUrls];

      const destinationData = {
        ...formData,
        images: allImages
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/admin/destinations/${editingId}`,
          destinationData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Destination updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/destinations',
          destinationData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Destination added successfully!');
      }

      resetForm();
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Failed to save destination');
    }
  };

  const handleEdit = (destination) => {
    setFormData({
      title: destination.title,
      description: destination.description,
      price: destination.price,
      location: destination.location,
      duration: destination.duration,
      featured: destination.featured,
      discount: destination.discount || '',
      originalPrice: destination.originalPrice || '',
      category: destination.category || 'room'
    });
    setUploadedImages(destination.images || []);
    setEditingId(destination._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/destinations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Failed to delete destination');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      rating: 4.5,
      duration: '5 days',
      featured: false,
      discount: '',
      originalPrice: '',
      category: 'room'
    });
    setSelectedFiles([]);
    setUploadedImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900">
          Resort Admin Dashboard
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-800 text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition"
        >
          {showForm ? 'Cancel' : '+ Add Listing'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? 'Edit Listing' : 'Add New Listing'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title"
                required
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                required
                className="border px-3 py-2 rounded-lg"
              />
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              rows="4"
              required
              className="border px-3 py-2 rounded-lg w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="$599"
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="Original Price"
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="Discount"
                className="border px-3 py-2 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Duration"
                className="border px-3 py-2 rounded-lg"
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="room">Room / Suite</option>
                <option value="dining">Dining</option>
                <option value="activity">Activity</option>
                <option value="event">Event</option>
                <option value="offer">Special Offer</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              Featured
            </label>

            <input type="file" multiple onChange={handleFileChange} />

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Featured</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="px-6 py-4">{d.title}</td>
                <td className="px-6 py-4">{d.category}</td>
                <td className="px-6 py-4">{d.price}</td>
                <td className="px-6 py-4">{d.featured ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(d)}
                    className="bg-amber-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
