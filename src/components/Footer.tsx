import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/images/logo/icon_uphouse.jpg"
                alt="Uphouse Logo"
                className="h-8 w-auto"
              />
              <h3 className="text-xl font-bold text-secondary-50">向上建設股份有限公司</h3>
            </div>
            <p className="text-primary-100 mb-4">
              美感空間，建設城市願景
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-secondary-50">聯絡資訊</h4>
            <div className="space-y-2 text-primary-100">
              <p>地址：苗栗縣竹南鎮康德街71號</p>
              <p>電話：(03) 777-5355</p>
              <p>Email：info@uphousetw.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-secondary-50">快速連結</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-primary-100 hover:text-accent-300 transition-colors">
                關於我們
              </Link>
              <Link to="/projects" className="block text-primary-100 hover:text-accent-300 transition-colors">
                建案列表
              </Link>
              <Link to="/contact" className="block text-primary-100 hover:text-accent-300 transition-colors">
                聯絡我們
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-500 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-200 text-sm">
            © 2025 向上建設股份有限公司. 保留所有權利。
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-primary-200 hover:text-accent-300 text-sm transition-colors">
              隱私權政策
            </Link>
            <Link to="/disclaimer" className="text-primary-200 hover:text-accent-300 text-sm transition-colors">
              免責聲明
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}