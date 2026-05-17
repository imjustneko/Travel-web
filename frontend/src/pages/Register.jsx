import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Нууц үгнүүд таарахгүй байна');
      return;
    }
    if (formData.password.length < 6) {
      setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Бүртгэлд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200"
          alt="Resort"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 to-amber-800/60" />

        <div className="relative z-10 flex items-center space-x-3">
          <span className="text-4xl">🏔️</span>
          <div>
            <div className="text-xl font-bold text-white">Улаан Хад Ресорт</div>
            <div className="text-xs text-amber-200">Байгалийн тэвэрт тансаг амралт</div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
            <span className="text-green-300">✓</span>
            <span className="text-white text-sm font-medium">Бүртгэл үнэгүй</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Онцгой давуу<br />талуудыг эдлэх
          </h2>
          <div className="space-y-3">
            {['Эрт захиалах боломж', 'Онцгой санал авах', 'Захиалгаа хянах', '24/7 дэмжлэг'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</span>
                <span className="text-amber-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center space-x-2 mb-8">
            <span className="text-3xl">🏔️</span>
            <span className="text-xl font-bold text-amber-900">Улаан Хад Ресорт</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Данс үүсгэх</h1>
            <p className="text-gray-500">
              Данс байна уу?{' '}
              <Link to="/login" className="font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2">
                Нэвтрэх
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <span className="text-lg leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Бүтэн нэр
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="Батболд Дорж"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                И-мэйл хаяг
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Нууц үг
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="Доод тал нь 6 тэмдэгт"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Нууц үг баталгаажуулах
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-800 text-white rounded-xl font-semibold text-base hover:bg-amber-900 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-800/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Данс үүсгэж байна...
                </span>
              ) : 'Данс үүсгэх'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Улаан Хад Ресорт. Бүх эрх хамгаалагдсан.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
