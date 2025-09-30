import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Award, Clock } from 'lucide-react';

interface FeaturedProject {
  slug: string;
  title: string;
  category: string;
  year: number;
  coverUrl: string;
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);

  const services = [
    {
      title: '住宅建設',
      description: '苗栗高鐵特區美宅',
      icon: <HomeIcon size={48} />
    },
    {
      title: '品質保證',
      description: '嚴格的品管流程，確保每個建案都達最高標準',
      icon: <Award size={48} />
    },
    {
      title: '準時交付',
      description: '專業的項目管理，承諾按時完成每個建設項目',
      icon: <Clock size={48} />
    }
  ];

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await fetch('/api/public?resource=projects');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const apiProjects = data.projects || [];

        // Get the 3 most recent projects for featured section with safe defaults
        const sortedProjects = apiProjects
          .map((project: any) => ({
            slug: project.slug || `project-${project.id}`,
            title: project.title || 'Untitled Project',
            category: project.category || '其他',
            year: project.year || new Date().getFullYear(),
            coverUrl: project.coverUrl || 'https://via.placeholder.com/400x300?text=No+Image'
          }))
          .sort((a: any, b: any) => b.year - a.year)
          .slice(0, 3);

        setFeaturedProjects(sortedProjects);
      } catch (error) {
        console.error('Failed to fetch featured projects:', error);
        // Show empty array if API fails - no hardcoded fallback
        setFeaturedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

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
              向上建設 向下扎根
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-primary-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              美感空間，打造城市願景
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
              品牌理念
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              美感中築夢，品質中紮根
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
              精選建案
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              探索我們最新完成的建設項目
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-secondary-50 rounded-lg shadow-md overflow-hidden border border-secondary-200">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-gray-200 h-6 w-16 rounded-full animate-pulse"></div>
                      <div className="bg-gray-200 h-4 w-12 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-gray-200 h-6 w-32 rounded mb-3 animate-pulse"></div>
                    <div className="bg-gray-200 h-4 w-24 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProjects.map((project, index) => (
                <motion.div
                  key={project.slug}
                  className="bg-secondary-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-secondary-200"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <img
                    src={project.coverUrl}
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
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-block shadow-lg"
            >
              查看所有建案
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Primary color with accent highlights */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            開始您的夢想?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            向上築夢的路上，聯絡我們實現夢想
          </p>
          <Link
            to="/contact"
            className="bg-accent-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors inline-block shadow-lg border-2 border-accent-500 hover:border-accent-600"
          >
            聯絡我們
          </Link>
        </div>
      </section>
    </div>
  );
}