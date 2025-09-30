import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { AdminGallery, AdminSettings } from '../components/AdminComponents';
import ImageSelector from '../components/ImageSelector';
import { isDemoModeAvailable, DEMO_CONFIG, validateEnvironment } from '../config/environment';
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
  Clock,
  Image as ImageIcon,
  Settings,
  X
} from 'lucide-react';

interface User {
  email: string;
  role: 'admin' | 'editor';
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate environment on startup
    const envCheck = validateEnvironment();
    if (envCheck.warnings.length > 0) {
      console.error('Environment warnings:', envCheck.warnings);
    }

    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Verify token type and set appropriate user
      if (token === DEMO_CONFIG.TOKEN && isDemoModeAvailable()) {
        setUser(DEMO_CONFIG.USER);
      } else {
        // Real token - decode JWT to get user info
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ email: payload.email, role: payload.role });
        } catch (e) {
          // Invalid token, clear it
          localStorage.removeItem('admin_token');
        }
      }
    }
    // Note: Removed auto-demo login for production safety
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
        <Route path="gallery" element={
          user ? <AdminGallery user={user} /> : <Navigate to="/admin" replace />
        } />
        <Route path="settings" element={
          user ? <AdminSettings user={user} /> : <Navigate to="/admin" replace />
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

  // Handle magic link callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      // Handle successful magic link callback
      localStorage.setItem('admin_token', token);
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, role: payload.role });
        setMessage('登入成功');
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
      // Handle error callback
      setMessage(`登入失敗：${decodeURIComponent(error)}`);
      setMessageType('error');
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/admin');
    }
  }, [navigate, setUser]);

  const handleMagicLinkLogin = async () => {
    if (!email) {
      setMessage('請輸入電子信箱');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth?method=magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
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
    // Demo login - only available in development
    if (!isDemoModeAvailable()) {
      setMessage('Demo mode not available in production');
      setMessageType('error');
      return;
    }

    localStorage.setItem('admin_token', DEMO_CONFIG.TOKEN);
    setUser(DEMO_CONFIG.USER);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              電子信箱
            </label>
            <input
              type="email"
              placeholder="輸入您的 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              onKeyPress={(e) => e.key === 'Enter' && handleMagicLinkLogin()}
            />
            <button
              onClick={handleMagicLinkLogin}
              disabled={isLoading}
              className="w-full mt-3 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '發送中...' : '發送登入連結'}
            </button>
            <p className="text-xs text-neutral-500 mt-2">
              登入連結將發送至您的信箱
            </p>
          </div>

          {isDemoModeAvailable() && (
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">🎯 開發模式快速登入</h4>
                <p className="text-sm text-blue-600 mb-3">
                  點擊下方按鈕直接以管理員身份登入後台，無需設定 Google OAuth
                </p>
                <div className="text-xs text-blue-500">
                  <p><strong>帳號：</strong> {DEMO_CONFIG.USER.email}</p>
                  <p><strong>身份：</strong> 管理員</p>
                  <p><strong>警告：</strong> {DEMO_CONFIG.WARNING}</p>
                </div>
              </div>
              <button
                onClick={handleDemoLogin}
                className="w-full bg-accent-500 text-white py-3 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Rocket size={18} />
                <span>Demo 登入 (開發模式)</span>
              </button>
            </div>
          )}
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
  const [stats, setStats] = useState({
    totalProjects: 0,
    monthlyContacts: 0,
    monthlyVisitors: 0,
    loading: true
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    navigate('/admin');
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      // Fetch projects count
      const projectsResponse = await fetch('/api/admin?resource=projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = projectsResponse.ok ? await projectsResponse.json() : { projects: [] };

      // Fetch contacts count
      const contactsResponse = await fetch('/api/admin?resource=contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contactsData = contactsResponse.ok ? await contactsResponse.json() : { contacts: [] };

      // Calculate monthly contacts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyContacts = contactsData.contacts?.filter((contact: any) =>
        new Date(contact.createdAt) >= thirtyDaysAgo
      ).length || 0;

      // Mock visitor data (in real app, would come from analytics API)
      const monthlyVisitors = Math.floor(Math.random() * 2000) + 500;

      setStats({
        totalProjects: projectsData.projects?.length || 0,
        monthlyContacts,
        monthlyVisitors,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminCard
            title="建案管理"
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
            title="圖片庫"
            description="管理網站圖片與相簿"
            icon={<ImageIcon size={32} />}
            href="/admin/gallery"
          />
          <AdminCard
            title="聯絡訊息"
            description="查看客戶來信"
            icon={<Mail size={32} />}
            href="/admin/contacts"
          />
          <AdminCard
            title="網站設定"
            description="管理 Logo 與網站配置"
            icon={<Settings size={32} />}
            href="/admin/settings"
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
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary-600">{stats.totalProjects}</p>
                      <p className="text-neutral-600 text-sm">總建案數</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-secondary-200">
              <div className="flex items-center">
                <div className="text-accent-500 mr-4">
                  <MessageSquare size={32} />
                </div>
                <div>
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary-600">{stats.monthlyContacts}</p>
                      <p className="text-neutral-600 text-sm">本月聯絡數</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-secondary-200">
              <div className="flex items-center">
                <div className="text-accent-500 mr-4">
                  <Eye size={32} />
                </div>
                <div>
                  {stats.loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary-600">{stats.monthlyVisitors.toLocaleString()}</p>
                      <p className="text-neutral-600 text-sm">本月訪客</p>
                    </>
                  )}
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

      const data = await apiService.getAdminProjects(token);

      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('無法載入建案列表');
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
    if (!confirm('確定要刪除這個建案嗎？此操作無法復原。')) {
      return;
    }

    setDeleting(projectId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin?resource=projects&id=${projectId}`, {
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
      alert('刪除建案失敗，請稍後再試');
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
      <AdminLayout user={user} title="建案管理">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user} title="建案管理">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-neutral-600">管理建案建案與內容</p>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <button
            onClick={handleAddProject}
            className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>新增建案</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">
            現有建案 ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>尚無建案資料</p>
              <button
                onClick={handleAddProject}
                className="mt-4 text-accent-500 hover:text-accent-600 font-medium"
              >
                新增第一個建案 →
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    title: string;
    intro: string;
    mission: string;
    vision: string;
    brandPrinciplesSubtitle?: string;
    principles: { icon?: string; title: string; description: string; }[];
    milestones: { year: string; event: string; }[];
  }>({
    title: '',
    intro: '',
    mission: '',
    vision: '',
    brandPrinciplesSubtitle: '',
    principles: [],
    milestones: []
  });

  const fetchAboutData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('未登入');
        return;
      }

      const data = await apiService.getAdminAbout(token);
      setFormData({
        title: data.about.title || '',
        intro: data.about.intro || '',
        mission: data.about.mission || '',
        vision: data.about.vision || '',
        brandPrinciplesSubtitle: data.about.brandPrinciplesSubtitle || '',
        principles: data.about.principles || [],
        milestones: data.about.milestones || []
      });
    } catch (error) {
      console.error('Failed to fetch about data:', error);
      setError('無法載入關於我們資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('No authentication token');
      await apiService.updateAbout(token, formData);

      // Refresh the form data from server after successful update
      await fetchAboutData();

      alert('資料更新成功！');
    } catch (error) {
      console.error('Failed to update about data:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handlePrincipleChange = (index: number, field: string, value: string) => {
    const newPrinciples = [...formData.principles];
    newPrinciples[index] = { ...newPrinciples[index], [field]: value };
    setFormData({ ...formData, principles: newPrinciples });
  };

  const addPrinciple = () => {
    setFormData({
      ...formData,
      principles: [...formData.principles, { icon: '✨', title: '', description: '' }]
    });
  };

  const removePrinciple = (index: number) => {
    setFormData({
      ...formData,
      principles: formData.principles.filter((_, i) => i !== index)
    });
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData({ ...formData, milestones: newMilestones });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { year: '', event: '' }]
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <AdminLayout user={user} title="關於我們管理">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2">載入中...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout user={user} title="關於我們管理">
        <div className="text-center py-12 text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user} title="關於我們管理">
      <div className="space-y-6">
        <p className="text-neutral-600">編輯公司資訊、理念與發展歷程</p>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">基本資料</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">標題</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="輸入標題..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司簡介</label>
              <textarea
                value={formData.intro}
                onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="輸入公司簡介..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使命</label>
              <input
                type="text"
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="輸入公司使命..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">願景</label>
              <input
                type="text"
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="輸入公司願景..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌理念副標題</label>
              <input
                type="text"
                value={formData.brandPrinciplesSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, brandPrinciplesSubtitle: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="輸入品牌理念副標題（首頁品牌理念區塊使用）..."
              />
            </div>
          </div>
        </div>

        {/* Brand Principles */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">品牌理念</h3>
          <div className="space-y-4">
            {formData.principles.map((principle, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={principle.icon || ''}
                        onChange={(e) => handlePrincipleChange(index, 'icon', e.target.value)}
                        className="w-16 p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500 text-center"
                        placeholder="🎯"
                      />
                      <input
                        type="text"
                        value={principle.title || ''}
                        onChange={(e) => handlePrincipleChange(index, 'title', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                        placeholder="理念標題"
                      />
                    </div>
                    <textarea
                      value={principle.description || ''}
                      onChange={(e) => handlePrincipleChange(index, 'description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                      rows={2}
                      placeholder="理念描述"
                    />
                  </div>
                  <button
                    onClick={() => removePrinciple(index)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="移除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addPrinciple}
            className="mt-4 bg-secondary-400 text-primary-600 px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>新增理念</span>
          </button>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">發展歷程</h3>
          <div className="space-y-4">
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={milestone.year || ''}
                        onChange={(e) => handleMilestoneChange(index, 'year', e.target.value)}
                        className="w-24 p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500 text-center"
                        placeholder="2023"
                      />
                      <input
                        type="text"
                        value={milestone.event || ''}
                        onChange={(e) => handleMilestoneChange(index, 'event', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                        placeholder="重要事件或里程碑"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeMilestone(index)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="移除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addMilestone}
            className="mt-4 bg-secondary-400 text-primary-600 px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>新增發展歷程</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>儲存中...</span>
              </>
            ) : (
              <span>儲存所有變更</span>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminContacts({ user }: { user: User }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('未登入');
        return;
      }

      const data = await apiService.getContacts(token);
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setError('無法載入聯絡訊息');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('確定要刪除這則聯絡訊息嗎？此操作無法復原。')) {
      return;
    }

    setDeleting(contactId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin?resource=contacts&id=${contactId}`, {
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
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    setUpdating(contactId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin?resource=contacts&id=${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Update local state
      setContacts(contacts.map(c =>
        c.id === contactId ? { ...c, status: newStatus, updatedAt: data.contact.updatedAt } : c
      ));
    } catch (error) {
      console.error('Failed to update contact status:', error);
      alert('狀態更新失敗，請稍後再試');
    } finally {
      setUpdating(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // First, update all contacts to 'read' status
      const token = localStorage.getItem('admin_token');
      const updatePromises = contacts
        .filter(c => c.status === 'new')
        .map(contact =>
          fetch(`/api/admin?resource=contacts&id=${contact.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'read' })
          })
        );

      await Promise.all(updatePromises);

      // Create CSV content
      const csvHeaders = ['ID', '姓名', '電話', 'Email', '建案類型', '訊息', '狀態', '建立時間'];
      const csvRows = contacts.map(contact => [
        contact.id,
        contact.name,
        contact.phone,
        contact.email || '',
        contact.project,
        `"${contact.message.replace(/"/g, '""')}"`, // Escape quotes in message
        contact.status === 'new' ? '已讀' : contact.status === 'read' ? '已讀' : '已處理',
        formatDate(contact.createdAt)
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `聯絡訊息_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh contact list to show updated status
      await fetchContacts();

    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('匯出失敗，請稍後再試');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout user={user} title="聯絡訊息">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-neutral-600">查看和管理客戶聯絡表單</p>
          <button
            onClick={handleExportCSV}
            disabled={exporting || contacts.length === 0}
            className="bg-secondary-400 text-primary-600 px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>匯出中...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>匯出 CSV</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow border border-secondary-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-primary-600">最新聯絡訊息</h3>
          </div>
          <div className="divide-y divide-secondary-200">
            {loading ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                載入中...
              </div>
            ) : error ? (
              <div className="px-6 py-8 text-center text-red-500">
                {error}
              </div>
            ) : contacts.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                暫無聯絡訊息
              </div>
            ) : (
              contacts.slice(0, 10).map((contact) => (
                <div key={contact.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium text-primary-600">{contact.name}</h4>
                      <p className="text-sm text-neutral-600">{contact.phone} • {contact.project}</p>
                      {contact.email && (
                        <p className="text-sm text-neutral-500">{contact.email}</p>
                      )}
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{contact.message}</p>
                    </div>
                    <div className="text-right min-w-[200px]">
                      <p className="text-sm text-neutral-500 mb-2">{formatDate(contact.createdAt)}</p>

                      {/* Status Dropdown */}
                      <div className="mb-2">
                        <select
                          value={contact.status}
                          onChange={(e) => handleUpdateStatus(contact.id, e.target.value)}
                          disabled={updating === contact.id}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                        >
                          <option value="new">新訊息</option>
                          <option value="read">已讀</option>
                          <option value="processed">已處理</option>
                          <option value="resolved">已解決</option>
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          disabled={deleting === contact.id}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="刪除"
                        >
                          {deleting === contact.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2">
                        {contact.status === 'new' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <Clock size={10} className="mr-1" />
                            新訊息
                          </span>
                        ) : contact.status === 'read' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            <Eye size={10} className="mr-1" />
                            已讀
                          </span>
                        ) : contact.status === 'processed' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <MessageSquare size={10} className="mr-1" />
                            已處理
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <CheckCircle size={10} className="mr-1" />
                            已解決
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminDeploy({ user }: { user: User }) {
  const [deploying, setDeploying] = useState(false);
  const [deployHistory, setDeployHistory] = useState([
    { version: 'v1.2.3', date: new Date().toLocaleString('zh-TW'), status: 'success' },
    { version: 'v1.2.2', date: new Date(Date.now() - 86400000).toLocaleString('zh-TW'), status: 'success' },
    { version: 'v1.2.1', date: new Date(Date.now() - 172800000).toLocaleString('zh-TW'), status: 'success' }
  ]);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      // Mock deployment process (in real app, would trigger Netlify build)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newVersion = `v1.2.${Date.now().toString().slice(-1)}`;
      const newDeploy = {
        version: newVersion,
        date: new Date().toLocaleString('zh-TW'),
        status: 'success'
      };

      setDeployHistory([newDeploy, ...deployHistory.slice(0, 4)]);
      alert('網站重新部署成功！');
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('部署失敗，請稍後再試');
    } finally {
      setDeploying(false);
    }
  };

  const currentDeploy = deployHistory[0];

  return (
    <AdminLayout user={user} title="網站部署">
      <div className="space-y-6">
        <p className="text-neutral-600">管理網站部署與發布</p>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">部署狀態</h3>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              deploying
                ? 'bg-yellow-50 border border-yellow-200'
                : currentDeploy.status === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                {deploying ? (
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                ) : currentDeploy.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 text-red-500">❌</div>
                )}
                <div>
                  <p className={`font-medium ${
                    deploying
                      ? 'text-yellow-800'
                      : currentDeploy.status === 'success'
                        ? 'text-green-800'
                        : 'text-red-800'
                  }`}>
                    {deploying ? '正在部署...' : currentDeploy.status === 'success' ? '部署成功' : '部署失敗'}
                  </p>
                  <p className={`text-sm flex items-center space-x-1 ${
                    deploying
                      ? 'text-yellow-600'
                      : currentDeploy.status === 'success'
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}>
                    <Clock size={14} />
                    <span>最後部署：{currentDeploy.date}</span>
                  </p>
                </div>
              </div>
              <span className={`text-sm ${
                deploying
                  ? 'text-yellow-600'
                  : currentDeploy.status === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}>
                線上版本：{currentDeploy.version}
              </span>
            </div>

            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="w-full bg-accent-500 text-white py-3 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deploying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>部署中...</span>
                </>
              ) : (
                <>
                  <Rocket size={18} />
                  <span>重新部署網站</span>
                </>
              )}
            </button>

            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-medium text-primary-600 mb-2">部署歷史</h4>
              <div className="space-y-2 text-sm">
                {deployHistory.map((deploy, index) => (
                  <div key={index} className="flex justify-between items-center text-neutral-600">
                    <span className="flex items-center space-x-2">
                      <span>{deploy.version}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        deploy.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {deploy.status === 'success' ? '成功' : '失敗'}
                      </span>
                    </span>
                    <span>{deploy.date}</span>
                  </div>
                ))}
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
  const [showImageSelector, setShowImageSelector] = useState(false);

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
      if (!token) {
        throw new Error('No authentication token');
      }

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

      let data;
      if (project) {
        // Update existing project
        data = await apiService.updateProject(token, project.id, updatedFormData);
      } else {
        // Create new project
        data = await apiService.createProject(token, updatedFormData);
      }

      onSave(data.project);
    } catch (error) {
      console.error('Failed to save project:', error);
      setError('儲存建案失敗，請稍後再試');
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

  const handleImageSelect = (imageUrl: string, _publicId: string) => {
    setFormData(prev => ({
      ...prev,
      coverUrl: imageUrl
    }));
    setShowImageSelector(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-600">
              {project ? '編輯建案' : '新增建案'}
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
                  建案標題 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="請輸入建案標題"
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
                封面圖片
              </label>
              <div className="space-y-3">
                {formData.coverUrl && (
                  <div className="relative inline-block">
                    <img
                      src={formData.coverUrl}
                      alt="封面圖片預覽"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('coverUrl', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImageSelector(true)}
                    className="bg-secondary-400 text-primary-600 px-4 py-2 rounded-lg hover:bg-secondary-500 transition-colors flex items-center space-x-2"
                  >
                    <ImageIcon size={16} />
                    <span>從圖片庫選擇</span>
                  </button>
                  <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => handleChange('coverUrl', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="或輸入圖片網址"
                  />
                </div>
              </div>
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
                placeholder="請輸入建案簡介"
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
                placeholder="請輸入建案詳細描述"
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
                {saving ? '儲存中...' : (project ? '更新建案' : '建立建案')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          onSelect={handleImageSelect}
          onClose={() => setShowImageSelector(false)}
          currentImageUrl={formData.coverUrl}
        />
      )}
    </div>
  );
}