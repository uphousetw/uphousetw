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
            onClick={() => setMessage('Google OAuth 尚未實作')}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            使用 Google 登入
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
            <button
              onClick={handleDemoLogin}
              className="w-full bg-accent-500 text-white py-3 px-4 rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Rocket size={18} />
              <span>Demo 登入 (開發用)</span>
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
  return (
    <AdminLayout user={user} title="專案管理">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-neutral-600">管理建案專案與內容</p>
          <button className="bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center space-x-2">
            <Plus size={16} />
            <span>新增專案</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">現有專案</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div>
                <h4 className="font-medium text-primary-600">豪華電梯大樓</h4>
                <p className="text-sm text-neutral-600">台北市信義區 • 2024年 • 電梯大樓</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-accent-500 hover:text-accent-600 flex items-center space-x-1">
                  <Edit size={14} />
                  <span>編輯</span>
                </button>
                <button className="text-red-500 hover:text-red-600 flex items-center space-x-1">
                  <Trash2 size={14} />
                  <span>刪除</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div>
                <h4 className="font-medium text-primary-600">現代透天別墅</h4>
                <p className="text-sm text-neutral-600">新北市板橋區 • 2023年 • 透天</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-accent-500 hover:text-accent-600 flex items-center space-x-1">
                  <Edit size={14} />
                  <span>編輯</span>
                </button>
                <button className="text-red-500 hover:text-red-600 flex items-center space-x-1">
                  <Trash2 size={14} />
                  <span>刪除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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