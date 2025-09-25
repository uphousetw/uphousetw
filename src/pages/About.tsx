import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { defaultAboutUs } from '../data/defaultData';

export default function About() {
  const [aboutData, setAboutData] = useState(defaultAboutUs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/.netlify/functions/about-public');
        if (response.ok) {
          const data = await response.json();
          setAboutData(data.about);
        } else {
          console.log('Using fallback about data');
        }
      } catch (error) {
        console.error('Failed to fetch about data:', error);
        console.log('Using fallback about data');
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
            <p className="text-gray-600 leading-relaxed mt-4">
              我們擁有經驗豐富的建築團隊和先進的施工技術，從規劃設計到施工完成，
              每個環節都嚴格把關，確保為客戶提供最優質的建築服務。
            </p>
          </div>
        </motion.section>

        {/* Brand Principles */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">品牌理念</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutData.principles.map((principle) => (
              <div
                key={principle}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {principle}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getPrincipleDescription(principle)}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Milestones */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">發展歷程</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200"></div>

            <div className="space-y-8">
              {defaultAboutUs.milestones.map((milestone) => (
                <div key={milestone.year} className="relative flex items-center">
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

              {/* Additional milestones */}
              <div className="relative flex items-center">
                <div className="absolute left-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-16">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        2021年
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      擴大營運規模
                    </h3>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-16">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-2">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        2024年
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      獲得建築品質認證
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function getPrincipleDescription(principle: string): string {
  const descriptions: Record<string, string> = {
    '品質與安全': '嚴格遵循建築法規，採用優質材料，確保每個建案的安全性與耐久性。',
    '準時交付': '專業的項目管理團隊，精確控制施工進度，承諾按期完工交付。',
    '透明溝通': '與客戶保持密切溝通，定期回報工程進度，確保客戶了解項目狀況。'
  };
  return descriptions[principle] || '';
}