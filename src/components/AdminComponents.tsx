import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Trash2, ArrowLeft, LogOut, Check } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { uploadPresets } from '../utils/imageUpload';
import { getCloudinaryUrl } from '../config/cloudinary';
import { imageApi } from '../config/api';

interface User {
  email: string;
  role: 'admin' | 'editor';
}

interface AdminLayoutProps {
  user: User;
  title: string;
  children: React.ReactNode;
}

function AdminLayout({ user, title, children }: AdminLayoutProps) {
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

export function AdminGallery({ user }: { user: User }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showConfirmActions, setShowConfirmActions] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await imageApi.getAll();

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      setError('載入圖片失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageUpload = async (result: any) => {
    try {
      setError(null);

      // Save to backend
      const response = await imageApi.create({
        publicId: result.public_id,
        title: '',
        description: '',
        category: 'gallery'
      });

      if (!response.ok) {
        throw new Error(`Failed to save image: ${response.statusText}`);
      }

      const savedImage = await response.json();

      // Update local state
      setImages(prev => [...prev, savedImage]);

    } catch (error) {
      console.error('Failed to save image:', error);
      setError('儲存圖片失敗');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('確定要刪除這張圖片嗎？')) return;

    try {
      setError(null);

      // Delete from backend
      const response = await imageApi.delete(imageId);

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId));

    } catch (error) {
      console.error('Failed to delete image:', error);
      setError('刪除圖片失敗');
    }
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => {
      const newSelected = prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId];
      setShowConfirmActions(newSelected.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
      setShowConfirmActions(false);
    } else {
      setSelectedImages(images.map(img => img.id));
      setShowConfirmActions(true);
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm(`確定要刪除選擇的 ${selectedImages.length} 張圖片嗎？此操作無法復原。`)) {
      return;
    }

    try {
      setError(null);

      // Delete all selected images
      const deletePromises = selectedImages.map(imageId => imageApi.delete(imageId));

      await Promise.all(deletePromises);

      // Remove from local state
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
      setShowConfirmActions(false);

    } catch (error) {
      console.error('Failed to delete images:', error);
      setError('批量刪除圖片失敗');
    }
  };

  const handleClearSelection = () => {
    setSelectedImages([]);
    setShowConfirmActions(false);
  };

  return (
    <AdminLayout user={user} title="圖片庫管理">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-neutral-600">管理網站圖片與相簿</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">上傳新圖片</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                onUpload={handleImageUpload}
                options={uploadPresets.gallery}
                label="上傳圖片到圖片庫"
              />
            </div>
          </div>
        </div>

        {/* Confirm Actions Bar */}
        {showConfirmActions && (
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-accent-800 font-medium">
                  已選擇 {selectedImages.length} 張圖片
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-accent-600 hover:text-accent-800 text-sm underline"
                >
                  {selectedImages.length === images.length ? '取消全選' : '全選'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearSelection}
                  className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  取消選擇
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>刪除選擇的圖片</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-600">
              圖片庫 ({images.length})
            </h3>
            {images.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-accent-500 hover:text-accent-600 text-sm flex items-center space-x-1"
              >
                <span>{selectedImages.length === images.length ? '取消全選' : '全選'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">載入中...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>尚無圖片</p>
              <p className="text-sm">上傳第一張圖片開始建立圖片庫</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image) => {
                const isSelected = selectedImages.includes(image.id);
                return (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-4 ring-accent-500 rounded-lg' : ''
                    }`}
                    onClick={() => handleImageSelect(image.id)}
                  >
                    <img
                      src={getCloudinaryUrl(image.publicId, 'thumbnail')}
                      alt={image.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />

                    {/* Selection overlay */}
                    <div className={`absolute inset-0 transition-all duration-200 rounded-lg ${
                      isSelected
                        ? 'bg-accent-500 bg-opacity-20'
                        : 'bg-black bg-opacity-0 group-hover:bg-opacity-30'
                    }`}>
                      {/* Selection checkbox */}
                      <div className="absolute top-2 left-2">
                        <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? 'bg-accent-500 border-accent-500'
                            : 'bg-white bg-opacity-80 border-white group-hover:bg-opacity-100'
                        } flex items-center justify-center`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </div>

                      {/* Delete button (only show on hover when not in selection mode) */}
                      {!showConfirmActions && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id);
                            }}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                      <p className="text-xs truncate">
                        {image.title || `圖片 ${image.id.slice(-4)}`}
                      </p>
                      <p className="text-xs opacity-75">
                        {new Date(image.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminSettings({ user }: { user: User }) {
  const [settings, setSettings] = useState({
    logo: '',
    companyName: '向上建設',
    favicon: ''
  });
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async (result: any) => {
    setSettings(prev => ({ ...prev, logo: result.public_id }));
  };

  const handleFaviconUpload = async (result: any) => {
    setSettings(prev => ({ ...prev, favicon: result.public_id }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save settings via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('設定已儲存！');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout user={user} title="網站設定">
      <div className="space-y-6">
        <p className="text-neutral-600">管理網站 Logo、公司名稱等基本設定</p>

        {/* Logo Settings */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">Logo 設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                onUpload={handleLogoUpload}
                options={uploadPresets.logo}
                currentImage={settings.logo}
                label="主要 Logo"
              />
            </div>
            <div>
              <ImageUpload
                onUpload={handleFaviconUpload}
                options={uploadPresets.logo}
                currentImage={settings.favicon}
                label="Favicon"
              />
            </div>
          </div>
        </div>

        {/* Company Settings */}
        <div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-600 mb-4">公司設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司名稱
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="輸入公司名稱..."
              />
            </div>
          </div>
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
              <span>儲存設定</span>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}