import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Award, Clock } from 'lucide-react';

export default function Home() {
  const services = [
    {
      title: '住宅建設',
      description: '提供透天、華廈、電梯大樓等多樣化住宅建設服務',
      icon: <HomeIcon size={48} />
    },
    {
      title: '品質保證',
      description: '嚴格的品管流程，確保每個建案都達到最高標準',
      icon: <Award size={48} />
    },
    {
      title: '準時交付',
      description: '專業的項目管理，承諾按時完成每個建設項目',
      icon: <Clock size={48} />
    }
  ];

  const featuredProjects = [
    {
      slug: 'luxury-apartment',
      title: '豪華電梯大樓',
      category: '電梯大樓',
      year: 2024,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      slug: 'modern-townhouse',
      title: '現代透天別墅',
      category: '透天',
      year: 2024,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      slug: 'garden-villa',
      title: '花園華廈',
      category: '華廈',
      year: 2023,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Primary color (60%) */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              打造您的夢想家園
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-primary-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              專業建設團隊，品質與創新並重
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                to="/contact"
                className="bg-accent-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors inline-block shadow-lg"
              >
                立即聯絡我們
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - Secondary color (30%) */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
              我們的服務優勢
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              憑藉多年的建設經驗，我們提供全方位的建築服務
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="bg-secondary-100 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all hover:bg-secondary-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-accent-500 mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-primary-600">
                  {service.title}
                </h3>
                <p className="text-neutral-700">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects - White background with primary accents */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
              精選專案
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              探索我們最新完成的建設項目
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.slug}
                className="bg-secondary-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-secondary-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                    <span className="text-neutral-500 text-sm">{project.year}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-primary-600">
                    {project.title}
                  </h3>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="text-accent-500 hover:text-accent-600 font-medium"
                  >
                    了解更多 →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-block shadow-lg"
            >
              查看所有專案
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Primary color with accent highlights */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            準備開始您的建設項目嗎？
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            聯絡我們的專業團隊，讓我們協助您實現夢想
          </p>
          <Link
            to="/contact"
            className="bg-accent-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors inline-block shadow-lg border-2 border-accent-500 hover:border-accent-600"
          >
            立即諮詢
          </Link>
        </div>
      </section>
    </div>
  );
}