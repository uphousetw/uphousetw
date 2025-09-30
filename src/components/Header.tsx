import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCloudinaryUrl, defaultImages } from '../config/cloudinary';

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    logo: defaultImages.logo,
    companyName: '向上建設'
  });

  useEffect(() => {
    // Fetch site configuration including logo
    const fetchSiteConfig = async () => {
      try {
        const response = await fetch('/api/public?resource=config');
        if (response.ok) {
          const data = await response.json();
          setSiteConfig(data.config);
        }
      } catch (error) {
        console.log('Using default site config');
      }
    };

    fetchSiteConfig();
  }, []);

  const navItems = [
    { path: '/', label: '首頁' },
    { path: '/about', label: '關於我們' },
    { path: '/projects', label: '建案列表' },
    { path: '/contact', label: '聯絡我們' },
  ];

  return (
    <header className="bg-secondary-50 shadow-md border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={getCloudinaryUrl(siteConfig.logo, 'logo')}
              alt="Logo"
              className="h-10 w-auto"
              onError={(e) => {
                // Fallback to default logo if Cloudinary image fails
                (e.target as HTMLImageElement).src = "/images/logo/icon_uphouse.jpg";
              }}
            />
            <span className="text-2xl font-bold text-primary-600">{siteConfig.companyName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-accent-500 border-b-2 border-accent-500'
                    : 'text-primary-600 hover:text-accent-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center">
              <span className={`bg-primary-600 block h-0.5 w-6 rounded-sm transition-all ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`bg-primary-600 block h-0.5 w-6 rounded-sm transition-all my-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`bg-primary-600 block h-0.5 w-6 rounded-sm transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-accent-500 bg-secondary-100'
                    : 'text-primary-600 hover:text-accent-500 hover:bg-secondary-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}