import { useState, useEffect } from 'react';
import api from '../api';

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

  const [imageUrls, setImageUrls] = useState(['']);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        '/api/admin/destinations',
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
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
    } else {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const validImages = imageUrls.filter(url => url.trim() !== '');

      const destinationData = { ...formData, images: validImages };

      if (editingId) {
        await api.put(
          `/api/admin/destinations/${editingId}`,
          destinationData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Амжилттай шинэчлэгдлээ!');
      } else {
        await api.post(
          '/api/admin/destinations',
          destinationData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Амжилттай нэмэгдлээ!');
      }

      resetForm();
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Хадгалахад алдаа гарлаа');
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
    setImageUrls(destination.images && destination.images.length > 0 ? [...destination.images] : ['']);
    setEditingId(destination._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Энэ мэдээллийг устгах уу?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/api/admin/destinations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Устгахад алдаа гарлаа');
    }
  };

  const resetForm = () => {
    setFormData({
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
    setImageUrls(['']);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Уншиж байна...</div>;
  }

  const validPreviewUrls = imageUrls.filter(url => url.trim().startsWith('http'));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Admin Dashboard</h1>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="bg-amber-800 text-white px-6 py-2 rounded-lg hover:bg-amber-900 transition"
        >
          {showForm ? 'Хаах' : '+ Нэмэх'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? 'Мэдээлэл засах' : 'Шинэ мэдээлэл нэмэх'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Гарчиг"
                required
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Байршил"
                required
                className="border px-3 py-2 rounded-lg"
              />
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Тайлбар"
              rows="4"
              required
              className="border px-3 py-2 rounded-lg w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Үнэ (жнэ: ₮150,000)"
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="Анхны үнэ"
                className="border px-3 py-2 rounded-lg"
              />
              <input
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="Хөнгөлөлт (жнэ: 20%)"
                className="border px-3 py-2 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Хугацаа"
                className="border px-3 py-2 rounded-lg"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="room">Өрөө / Сюит</option>
                <option value="dining">Хоол хүнс</option>
                <option value="activity">Үйл ажиллагаа</option>
                <option value="event">Арга хэмжээ</option>
                <option value="offer">Тусгай санал</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              <span className="font-medium">Онцлох</span>
            </label>

            {/* Image URL inputs */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Зургийн URL-ууд
              </label>
              <div className="space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="border px-3 py-2 rounded-lg flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addImageUrl}
                className="mt-2 text-amber-800 hover:text-amber-900 font-medium text-sm flex items-center gap-1"
              >
                + Зураг нэмэх
              </button>
            </div>

            {/* Image preview */}
            {validPreviewUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Урьдчилан харах:</p>
                <div className="flex flex-wrap gap-3">
                  {validPreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-28 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
              >
                {editingId ? 'Шинэчлэх' : 'Үүсгэх'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Цуцлах
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Зураг</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Гарчиг</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ангилал</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Үнэ</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Зургийн тоо</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d._id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  {d.images && d.images[0] ? (
                    <img
                      src={d.images[0]}
                      alt={d.title}
                      className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'; }}
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      Зургүй
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{d.category}</td>
                <td className="px-4 py-3 text-gray-600">{d.price}</td>
                <td className="px-4 py-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {d.images ? d.images.length : 0} зураг
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEdit(d)}
                    className="bg-amber-500 text-white px-3 py-1 rounded mr-2 hover:bg-amber-600 transition text-sm"
                  >
                    Засах
                  </button>
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                  >
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {destinations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Одоогоор мэдээлэл байхгүй байна
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
