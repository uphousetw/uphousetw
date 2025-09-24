import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { defaultProject } from '../data/defaultData';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'completed'>('latest');

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockProjects: Project[] = [
      defaultProject,
      {
        ...defaultProject,
        slug: 'luxury-apartment-2024',
        title: '豪華電梯大樓',
        category: '電梯大樓',
        year: 2024,
        location: '台北市信義區',
        summary: '現代化電梯大樓，提供舒適的居住環境。',
        coverUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        facts: {
          地點: '台北市信義區',
          類別: '電梯大樓',
          年份: '2024',
          完工日: '2024-12-31'
        }
      },
      {
        ...defaultProject,
        slug: 'modern-townhouse-2023',
        title: '現代透天別墅',
        category: '透天',
        year: 2023,
        location: '新北市板橋區',
        summary: '設計精美的現代透天別墅，注重空間利用。',
        coverUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        facts: {
          地點: '新北市板橋區',
          類別: '透天',
          年份: '2023',
          完工日: '2023-10-15'
        }
      },
      {
        ...defaultProject,
        slug: 'garden-mansion-2024',
        title: '花園華廈',
        category: '華廈',
        year: 2024,
        location: '桃園市中壢區',
        summary: '結合自然景觀的花園華廈建案。',
        coverUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        facts: {
          地點: '桃園市中壢區',
          類別: '華廈',
          年份: '2024',
          完工日: '2024-08-30'
        }
      }
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(project => project.year.toString() === selectedYear);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return b.year - a.year;
      } else {
        // Sort by completion date
        return new Date(b.facts.完工日).getTime() - new Date(a.facts.完工日).getTime();
      }
    });

    setFilteredProjects(filtered);
  }, [projects, selectedCategory, selectedYear, sortBy]);

  const categories = ['透天', '華廈', '電梯大樓', '其他'];
  const years = Array.from(new Set(projects.map(p => p.year.toString()))).sort().reverse();

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            專案列表
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索我們完成的各類建築項目
          </p>
          <div className="w-24 h-1 bg-primary-600 mx-auto mt-6"></div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-md mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                類別
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">所有類別</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年份
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">所有年份</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'completed')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="latest">最新</option>
                <option value="completed">已完工優先</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link to={`/projects/${project.slug}`}>
                <img
                  src={project.coverUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm">
                    {project.category}
                  </span>
                  <span className="text-gray-500 text-sm">{project.year}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  📍 {project.location}
                </p>
                <p className="text-gray-600 mb-4">
                  {project.summary}
                </p>
                <Link
                  to={`/projects/${project.slug}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  了解更多 →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              找不到符合條件的專案
            </h3>
            <p className="text-gray-600">
              請試試調整篩選條件
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}