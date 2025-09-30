import { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { getCloudinaryUrl } from '../config/cloudinary';
import { imageApi } from '../config/api';

interface Image {
  id: string;
  publicId: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

interface ImageSelectorProps {
  onSelect: (imageUrl: string, publicId: string) => void;
  onClose: () => void;
  currentImageUrl?: string;
}

export default function ImageSelector({ onSelect, onClose, currentImageUrl }: ImageSelectorProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await imageApi.getAll();

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const data = await response.json();
      setImages(data.images || []);
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

  const handleImageSelect = (image: Image) => {
    const imageUrl = getCloudinaryUrl(image.publicId, 'gallery');
    onSelect(imageUrl, image.publicId);
  };

  const handleImageClick = (imageId: string) => {
    setSelectedImageId(imageId === selectedImageId ? null : imageId);
  };

  const handleConfirmSelection = () => {
    if (selectedImageId) {
      const selectedImage = images.find(img => img.id === selectedImageId);
      if (selectedImage) {
        handleImageSelect(selectedImage);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-600">選擇封面圖片</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              從圖片庫中選擇一張圖片作為建案封面。點擊圖片選擇，再點擊「確認選擇」按鈕。
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto mb-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">載入圖片中...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>尚無圖片</p>
                <p className="text-sm mt-2">請先到圖片管理上傳圖片</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => {
                  const imageUrl = getCloudinaryUrl(image.publicId, 'thumbnail');
                  const isSelected = selectedImageId === image.id;
                  const isCurrent = currentImageUrl && currentImageUrl.includes(image.publicId);

                  return (
                    <div
                      key={image.id}
                      onClick={() => handleImageClick(image.id)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? 'ring-4 ring-accent-500 shadow-lg transform scale-105'
                          : 'hover:shadow-md hover:scale-102'
                      } ${
                        isCurrent ? 'ring-2 ring-blue-400' : ''
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={image.title || '圖片'}
                        className="w-full h-32 object-cover"
                      />

                      {/* Selection overlay */}
                      <div className={`absolute inset-0 transition-opacity duration-200 ${
                        isSelected
                          ? 'bg-accent-500 bg-opacity-20'
                          : 'bg-black bg-opacity-0 hover:bg-opacity-10'
                      }`}>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-accent-500 text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded px-2 py-1 text-xs">
                            目前使用
                          </div>
                        )}
                      </div>

                      {/* Image info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
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

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedImageId && (
                <span>已選擇: {images.find(img => img.id === selectedImageId)?.title || '圖片'}</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => onSelect('', '')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                清除封面
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedImageId}
                className="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認選擇
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}