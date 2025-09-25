import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Mail,
  Rocket,
  BarChart3,
  MessageSquare,
  Eye,
  LogOut,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';

interface User {
  email: string;
  role: 'admin' | 'editor';
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
      // In a real app, you would verify this token with the server
      setUser({ email: 'admin@example.com', role: 'admin' });
    }
    setLoading(false);
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
    <div className="min-h-screen bg-secondary-50">
      <Routes>
        <Route index element={
          user ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin setUser={setUser} />
        } />
        <Route path="dashboard" element={
          user ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/admin" replace />
        } />
        <Route path="projects" element={
          user ? <AdminProjects user={user} /> : <Navigate to="/admin" replace />
        } />
        <Route path="about" element={
          user ? <AdminAbout user={user} /> : <Navigate to="/admin" replace />
        } />
        <Route path="contacts" element={
          user ? <AdminContacts user={user} /> : <Navigate to="/admin" replace />
        } />
        <Route path="deploy" element={
          user ? <AdminDeploy user={user} /> : <Navigate to="/admin" replace />
        } />
      </Routes>
    </div>
  );
}

function AdminLogin({ setUser }: { setUser: (user: User | null) => void }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const navigate = useNavigate();

  // Handle OAuth callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      // Handle successful OAuth callback
      localStorage.setItem('admin_token', token);
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, role: payload.role });
        setMessage('Google 登入成功');
        setMessageType('success');
        navigate('/admin/dashboard');
        // Clear URL parameters
        window.history.replaceState({}, document.title, '/admin');
      } catch (e) {
        console.error('Token decode error:', e);
        setMessage('登入 Token 處理錯誤');
        setMessageType('error');
      }
    } else if (error) {
      // Handle OAuth error callback
      setMessage(`登入失敗：${decodeURIComponent(error)}`);
      setMessageType('error');
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/admin');
    }
  }, [navigate, setUser]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Direct redirect to Google OAuth endpoint
      const googleAuthUrl = new URL('/.netlify/functions/auth', window.location.origin);
      googleAuthUrl.searchParams.set('method', 'google');

      // Redirect to our auth function, which will redirect to Google
      window.location.href = googleAuthUrl.toString();

    } catch (error) {
      console.error('Google login error:', error);
      setMessage(`Google 登入錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
      setMessageType('error');
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    if (!email) {
      setMessage('請輸入電子信箱');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, method: 'magic-link' })
      });

      if (!response.ok) {
        // If the function doesn't exist or fails, show appropriate message
        if (response.status === 404) {
          setMessage('後端服務尚未部署，請使用 Demo 登入');
          setMessageType('error');
          return;
        }

        const errorData = await response.json().catch(() => ({ error: '伺服器錯誤' }));
        setMessage(errorData.error || `HTTP ${response.status} 錯誤`);
        setMessageType('error');
        return;
      }

      const data = await response.json();

      if (data.developmentToken) {
        // In development mode, auto-login with the token
        localStorage.setItem('admin_token', data.developmentToken);
        setUser({ email, role: 'admin' });
        navigate('/admin/dashboard');
        setMessage('開發模式：自動登入成功');
        setMessageType('success');
      } else if (data.success) {
        setMessage('Magic Link 已發送至您的信箱，請檢查收件匣');
        setMessageType('success');
      } else {
        setMessage(data.error || '登入失敗');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Auth error:', error);
      // More detailed error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessage('無法連接到伺服器，請檢查網路連線或使用 Demo 登入');
      } else {
        setMessage(`網路錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Demo login for development
    const demoUser = { email: 'demo@example.com', role: 'admin' as const };
    localStorage.setItem('admin_token', 'demo-token');
    setUser(demoUser);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">管理後台</h1>
          <p className="text-neutral-600 mt-2">請選擇登入方式</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isLoading ? '登入中...' : '使用 Google 登入'}</span>
          </button>

          <div className="text-center text-neutral-500">或</div>

          <div>
            <input
              type="email"
              placeholder="輸入 Email 獲取登入連結"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              onKeyPress={(e) => e.key === 'Enter' && handleMagicLinkLogin()}
            />
            <button
              onClick={handleMagicLinkLogin}
              disabled={isLoading}
              className="w-full mt-2 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '發送中...' : '發送 Magic Link'}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">🎯 快速登入</h4>
              <p className="text-sm text-blue-600 mb-3">
                點擊下方按鈕直接以管理員身份登入後台，無需設定 Google OAuth
              </p>
              <div className="text-xs text-blue-500">
                <p><strong>帳號：</strong> demo@uphousetw.com</p>
                <p><strong>身份：</strong> 管理員</p>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              className="w-full bg-accent-500 text-white py-3 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Rocket size={18} />
              <span>Demo 登入 (直接進入管理後台)</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-500 text-center mt-6">
          僅限授權使用者登入
        </p>
      </div>
    </div>
  );
}

function AdminDashboard({ user, setUser }: { user: User; setUser: (user: User | null) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="bg-primary-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">管理後台</h1>
              <p className="text-primary-100">歡迎，{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-600 mb-2">儀表板</h2>
          <p className="text-neutral-600">管理網站內容與設定</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminCard
            title="專案管理"
            description="新增、編輯建案資訊"
            icon={<Building2 size={32} />}
            href="/admin/projects"
          />
          <AdminCard
            title="關於我們"
            description="管理公司資訊"
            icon={<Users size={32} />}
            href="/admin/about"
          />
          <AdminCard
            title="聯絡訊息"
            description="查看客戶來信"
            icon={<Mail size={32} />}
            href="/admin/contacts"
          />
          <AdminCard
            title="網站部署"
            description="重新部署網站"
            icon={<Rocket size={32} />}
            href="/admin/deploy"
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-primary-600 mb-6">網站統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-secondary-200">
              <div className="flex items-center">
                <div className="text-accent-500 mr-4">
                  <BarChart3 size={32} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">12</p>
                  <p className="text-neutral-600 text-sm">總專案數</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-secondary-200">
              <div className="flex items-center">
                <div className="text-accent-500 mr-4">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">23</p>
                  <p className="text-neutral-600 text-sm">本月聯絡數</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-secondary-200">
              <div className="flex items-center">
                <div className="text-accent-500 mr-4">
                  <Eye size={32} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">1.2k</p>
                  <p className="text-neutral-600 text-sm">本月訪客</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCard({ title, description, icon, href }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(href)}
      className="bg-white p-6 rounded-lg shadow border border-secondary-200 hover:shadow-lg transition-shadow cursor-pointer hover:border-accent-300"
    >
      <div className="text-accent-500 mb-4">{icon}</div>
      <h3 className="font-semibold text-primary-600 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm">{description}</p>
    </div>
  );
}

function AdminProjects({ user }: { user: User }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('未登入');
        return;
      }

      const response = await fetch('/.netlify/functions/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('無法載入專案列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('確定要刪除這個專案嗎？此操作無法復原。')) {
      return;
    }

    setDeleting(projectId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/.netlify/functions/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Remove from local state
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('刪除專案失敗，請稍後再試');
    } finally {
      setDeleting(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleProjectSaved = (savedProject: any) => {
    if (editingProject) {
      // Update existing project
      setProjects(projects.map(p => p.id === savedProject.id ? savedProject : p));
    } else {
      // Add new project
      setProjects([savedProject, ...projects]);
    }
    handleModalClose();
  };

  if (loading) {
    return (
      <AdminLayout user={user} title="專案管理">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user} title="專案管理">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-neutral-600">管理建案專案與內容</p>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <button
            onClick={handleAddProject}
            className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>新增專案</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">
            現有專案 ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>尚無專案資料</p>
              <button
                onClick={handleAddProject}
                className="mt-4 text-accent-500 hover:text-accent-600 font-medium"
              >
                新增第一個專案 →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:border-accent-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    {project.coverUrl && (
                      <img
                        src={project.coverUrl}
                        alt={project.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-primary-600">{project.title}</h4>
                      <p className="text-sm text-neutral-600">
                        {project.location} • {project.year}年 • {project.category}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        建立：{new Date(project.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-accent-500 hover:text-accent-600 flex items-center space-x-1 px-3 py-1 rounded hover:bg-accent-50 transition-colors"
                    >
                      <Edit size={14} />
                      <span>編輯</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deleting === project.id}
                      className="text-red-500 hover:text-red-600 flex items-center space-x-1 px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                      <span>{deleting === project.id ? '刪除中...' : '刪除'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Modal */}
        {showModal && (
          <ProjectModal
            project={editingProject}
            onClose={handleModalClose}
            onSave={handleProjectSaved}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function AdminAbout({ user }: { user: User }) {
  return (
    <AdminLayout user={user} title="關於我們管理">
      <div className="space-y-6">
        <p className="text-neutral-600">編輯公司資訊、理念與發展歷程</p>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">公司簡介</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            rows={4}
            placeholder="輸入公司簡介..."
            defaultValue="本公司專注於住宅與商辦建設，致力於品質、安全與準時交付。"
          />
          <button className="mt-4 bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors">
            儲存變更
          </button>
        </div>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">品牌理念</h3>
          <div className="space-y-3">
            {['品質與安全', '準時交付', '透明溝通'].map((principle, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={principle}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
                <button className="text-red-500 hover:text-red-600">移除</button>
              </div>
            ))}
          </div>
          <button className="mt-4 bg-secondary-400 text-primary-600 px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors">
            新增理念
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminContacts({ user }: { user: User }) {
  return (
    <AdminLayout user={user} title="聯絡訊息">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-neutral-600">查看和管理客戶聯絡表單</p>
          <button className="bg-secondary-400 text-primary-600 px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2">
            <Download size={16} />
            <span>匯出 CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow border border-secondary-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-primary-600">最新聯絡訊息</h3>
          </div>
          <div className="divide-y divide-secondary-200">
            {[
              { name: '王先生', phone: '0932-123456', project: '電梯大樓', date: '2024-09-24' },
              { name: '李小姐', phone: '0987-654321', project: '透天', date: '2024-09-23' },
              { name: '張公司', phone: '02-2345-6789', project: '華廈', date: '2024-09-22' }
            ].map((contact, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-primary-600">{contact.name}</h4>
                    <p className="text-sm text-neutral-600">{contact.phone} • {contact.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">{contact.date}</p>
                    <button className="text-accent-500 hover:text-accent-600 text-sm">查看詳情</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminDeploy({ user }: { user: User }) {
  return (
    <AdminLayout user={user} title="網站部署">
      <div className="space-y-6">
        <p className="text-neutral-600">管理網站部署與發布</p>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">部署狀態</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">部署成功</p>
                  <p className="text-sm text-green-600 flex items-center space-x-1">
                    <Clock size={14} />
                    <span>最後部署：2024-09-24 14:30</span>
                  </p>
                </div>
              </div>
              <span className="text-green-600 text-sm">線上版本：v1.2.3</span>
            </div>

            <button className="w-full bg-accent-500 text-white py-3 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2">
              <Rocket size={18} />
              <span>重新部署網站</span>
            </button>

            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-medium text-primary-600 mb-2">部署歷史</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>v1.2.3</span>
                  <span>2024-09-24 14:30</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>v1.2.2</span>
                  <span>2024-09-23 09:15</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>v1.2.1</span>
                  <span>2024-09-22 16:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminLayout({ user, title, children }: {
  user: User;
  title: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="bg-primary-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-primary-100 hover:text-white flex items-center space-x-1"
              >
                <ArrowLeft size={16} />
                <span>返回儀表板</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-primary-100">歡迎，{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, onSave }: {
  project: any;
  onClose: () => void;
  onSave: (project: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    category: project?.category || '電梯大樓',
    year: project?.year || new Date().getFullYear(),
    location: project?.location || '',
    summary: project?.summary || '',
    description: project?.description || '',
    coverUrl: project?.coverUrl || '',
    facts: {
      地點: project?.facts?.地點 || '',
      類別: project?.facts?.類別 || '',
      年份: project?.facts?.年份 || '',
      完工日: project?.facts?.完工日 || ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = ['透天', '華廈', '電梯大樓', '其他'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.location || !formData.summary) {
      setError('請填寫所有必填欄位');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const url = project
        ? `/.netlify/functions/projects/${project.id}`
        : '/.netlify/functions/projects';

      const method = project ? 'PUT' : 'POST';

      // Update facts based on form data
      const updatedFormData = {
        ...formData,
        facts: {
          地點: formData.location,
          類別: formData.category,
          年份: formData.year.toString(),
          完工日: formData.facts.完工日 || new Date().toISOString().split('T')[0]
        }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      onSave(data.project);
    } catch (error) {
      console.error('Failed to save project:', error);
      setError('儲存專案失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFactChange = (fact: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      facts: {
        ...prev.facts,
        [fact]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-600">
              {project ? '編輯專案' : '新增專案'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  專案標題 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="請輸入專案標題"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  類別
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地點 *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="例：台北市信義區"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年份
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  min="2000"
                  max="2030"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面圖片網址
              </label>
              <input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => handleChange('coverUrl', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                簡介 *
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="請輸入專案簡介"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詳細描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="請輸入專案詳細描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完工日期
              </label>
              <input
                type="date"
                value={formData.facts.完工日}
                onChange={(e) => handleFactChange('完工日', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '儲存中...' : (project ? '更新專案' : '建立專案')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}