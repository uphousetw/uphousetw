import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/apiService';
import type { AboutUs } from '../types/apiTypes';

export default function About() {
  const [aboutData, setAboutData] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await apiService.getPublicAbout();
        setAboutData(response.about);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch about data:', error);
        setError('無法載入關於我們的資料，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">{error || '無法載入關於我們的資料'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {aboutData.title}
          </h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto"></div>
        </motion.div>

        {/* Company Introduction */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">公司簡介</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed">
              {aboutData.intro}
            </p>
          </div>
        </motion.section>

        {/* Mission and Vision */}
        {(aboutData.mission || aboutData.vision) && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {aboutData.mission && (
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    我們的使命
                  </h3>
                  <p className="text-primary-800 leading-relaxed">
                    {aboutData.mission}
                  </p>
                </div>
              )}
              {aboutData.vision && (
                <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-accent-900 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🌟</span>
                    我們的願景
                  </h3>
                  <p className="text-accent-800 leading-relaxed">
                    {aboutData.vision}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Brand Principles */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {aboutData.brandPrinciplesSubtitle || '品牌理念'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutData.principles?.map((principle, index) => (
              <div
                key={principle.title || index}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{principle.icon || '✨'}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {principle.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>



        {/* Milestones */}
        {aboutData.milestones && aboutData.milestones.length > 0 && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">發展歷程</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200"></div>

              <div className="space-y-8">
                {aboutData.milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-center">
                    {/* Timeline dot */}
                    <div className="absolute left-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="ml-16">
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-2">
                          <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                            {milestone.year}年
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {milestone.event}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}