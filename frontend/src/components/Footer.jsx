import { Link } from 'react-router-dom';

function Footer({ isAuthenticated, isAdmin }) {
  const year = new Date().getFullYear();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="bg-gray-950 text-white">

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand — wider column */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="w-9 h-9 bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-700 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight">Улаан Хад Ресорт</div>
                <div className="text-xs text-gray-500">Горхи-Тэрэлж · Монгол</div>
              </div>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
              Горхи-Тэрэлж Үндэсний Цэцэрлэгт Хүрээлэнгийн зүрхэнд байрлах тансаг амралтын газар. Байгалийн гоо үзэсгэлэн болон дэлхийн түвшний үйлчилгээний хосолмол.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2">
              {[
                {
                  href: 'https://facebook.com',
                  label: 'Facebook',
                  icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />,
                },
                {
                  href: 'https://instagram.com',
                  label: 'Instagram',
                  icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />,
                },
              ].map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-gray-800 hover:bg-amber-800 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Судлах</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Өрөөнүүд',      action: () => scrollTo('rooms') },
                { label: 'Хоол хүнс',     action: () => scrollTo('dining') },
                { label: 'Үйл ажиллагаа', action: () => scrollTo('activities') },
                { label: 'Арга хэмжээ',   to: '/events' },
                { label: 'Тусгай санал',  action: () => scrollTo('offers') },
              ].map(({ label, action, to }) =>
                to ? (
                  <li key={label}>
                    <Link to={to} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link>
                  </li>
                ) : (
                  <li key={label}>
                    <button onClick={action} className="text-sm text-gray-500 hover:text-white transition-colors text-left">{label}</button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Данс</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="text-sm text-gray-500 hover:text-white transition-colors">Нэвтрэх</Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-500 hover:text-white transition-colors">Бүртгүүлэх</Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/profile" className="text-sm text-gray-500 hover:text-white transition-colors">Миний профайл</Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-sm text-amber-600 hover:text-amber-400 transition-colors font-medium">Админ самбар</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Холбоо барих</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm text-gray-500 leading-relaxed">
                  Горхи-Тэрэлж Үндэсний Цэцэрлэгт Хүрээлэн,<br />Улаанбаатар, Монгол
                </span>
              </li>
              <li>
                <a href="tel:+97611123456" className="flex items-center gap-2.5 group">
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-sm text-gray-500 group-hover:text-white transition-colors">+976 11 123 456</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@redrockresort.mn" className="flex items-center gap-2.5 group">
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-sm text-gray-500 group-hover:text-white transition-colors">info@redrockresort.mn</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-500">24/7 Бүртгэл</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2.5">Онцгой санал болон мэдэгдэл хүлээн авах</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="И-мэйл хаяг"
                  className="flex-1 min-w-0 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-700 focus:bg-gray-800 transition-all"
                />
                <button className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                  Бүртгүүлэх
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {year} Улаан Хад Ресорт. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Нууцлалын бодлого</a>
            <span className="text-gray-800">·</span>
            <a href="#" className="hover:text-gray-400 transition-colors">Үйлчилгээний нөхцөл</a>
            <span className="text-gray-800">·</span>
            <a href="#" className="hover:text-gray-400 transition-colors">Цуцлалтын бодлого</a>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
