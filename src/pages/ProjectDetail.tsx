import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { defaultProject } from '../data/defaultData';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project from API
    const fetchProject = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`/.netlify/functions/projects-public/${slug}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const apiProject = data.project;

        // Convert API data to Project format
        const formattedProject: Project = {
          slug: apiProject.slug,
          title: apiProject.title,
          category: apiProject.category,
          year: apiProject.year,
          location: apiProject.location,
          summary: apiProject.summary,
          body: apiProject.description || apiProject.summary,
          coverUrl: apiProject.coverUrl,
          facts: apiProject.facts
        };

        setProject(formattedProject);
      } catch (error) {
        console.error('Failed to fetch project:', error);

        // Fallback to mock projects based on slug
        const mockProjects: Record<string, Project> = {
        'default-project': defaultProject,
        'luxury-apartment-2024': {
          ...defaultProject,
          slug: 'luxury-apartment-2024',
          title: '豪華電梯大樓',
          category: '電梯大樓',
          year: 2024,
          location: '台北市信義區',
          summary: '現代化電梯大樓，提供舒適的居住環境。',
          coverUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          facts: {
            地點: '台北市信義區',
            類別: '電梯大樓',
            年份: '2024',
            完工日: '2024-12-31'
          },
          body: `這座豪華電梯大樓位於台北市信義區的精華地段，採用現代化建築設計理念，提供住戶舒適且便利的居住環境。

建築特色包括：
• 採用環保節能材料，符合綠建築標準
• 完善的公共設施，包括健身房、會議室、空中花園
• 24小時管理服務，確保住戶安全
• 便利的交通位置，鄰近捷運站和商業區

此建案展現了我們在高層建築設計與施工方面的專業能力，每個細節都經過精心規劃，為住戶創造最佳的生活品質。`
        },
        'modern-townhouse-2023': {
          ...defaultProject,
          slug: 'modern-townhouse-2023',
          title: '現代透天別墅',
          category: '透天',
          year: 2023,
          location: '新北市板橋區',
          summary: '設計精美的現代透天別墅，注重空間利用。',
          coverUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          facts: {
            地點: '新北市板橋區',
            類別: '透天',
            年份: '2023',
            完工日: '2023-10-15'
          },
          body: `這棟現代透天別墅結合了時尚設計與實用功能，為家庭提供寬敞舒適的居住空間。

設計亮點：
• 開放式空間設計，增加室內採光與通風
• 私人花園與露台，享受戶外生活
• 智能家居系統整合，提升生活便利性
• 優質建材選用，確保建築耐久性

此案例展現了我們在透天建築設計上的創新思維，在有限的土地上創造出最大的使用價值。`
        }
      };

        // Simulate API delay for fallback
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundProject = mockProjects[slug || ''] || null;
        setProject(foundProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">找不到專案</h2>
          <p className="text-gray-600 mb-6">此專案不存在或已被移除</p>
          <Link
            to="/projects"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回專案列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <motion.div
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${project.coverUrl})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <nav className="text-white text-sm mb-4">
              <Link to="/" className="hover:underline">首頁</Link>
              <span className="mx-2">/</span>
              <Link to="/projects" className="hover:underline">專案列表</Link>
              <span className="mx-2">/</span>
              <span>{project.title}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {project.title}
            </h1>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">專案介紹</h2>
              <div className="prose prose-lg max-w-none">
                {project.body.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('•')) {
                    return (
                      <li key={index} className="text-gray-700 leading-relaxed">
                        {paragraph.substring(2)}
                      </li>
                    );
                  }
                  if (paragraph.trim() === '') return null;

                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Project Facts */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-gray-50 p-6 rounded-lg sticky top-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">專案資訊</h3>
              <dl className="space-y-4">
                {Object.entries(project.facts).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-600">{key}</dt>
                    <dd className="text-lg text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">專案摘要</p>
                <p className="text-gray-700">{project.summary}</p>
              </div>

              <div className="mt-8">
                <Link
                  to="/contact"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg text-center font-medium hover:bg-primary-700 transition-colors block"
                >
                  諮詢類似專案
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Back to Projects */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回專案列表
          </Link>
        </motion.div>
      </div>
    </div>
  );
}