import { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { uploadImage, validateImageFile, type UploadOptions, type UploadResult } from '../utils/imageUpload';
import { getCloudinaryUrl } from '../config/cloudinary';

interface ImageUploadProps {
  onUpload: (result: UploadResult) => void;
  options?: UploadOptions;
  currentImage?: string;
  label?: string;
  multiple?: boolean;
  className?: string;
}

export default function ImageUpload({
  onUpload,
  options = {},
  currentImage,
  label = '上傳圖片',
  multiple = false,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateImageFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    let previewUrl: string | null = null;

    try {
      // Create preview
      previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Cloudinary
      const result = await uploadImage(file, options);

      // Set the uploaded image as preview (using Cloudinary secure_url)
      console.log('Upload result:', result);
      console.log('Using secure_url for preview:', result.secure_url);
      setPreview(result.secure_url);

      // Call the onUpload callback
      onUpload(result);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : '上傳失敗');
      setPreview(currentImage || null);
    } finally {
      // Clean up preview URL if it was created
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
          aria-label={label}
          title={label}
        />

        {preview ? (
          <div className="relative">
            <img
              src={(() => {
                const imageUrl = preview.startsWith('uphouse/') ? getCloudinaryUrl(preview) : preview;
                console.log('Displaying image - preview:', preview, 'final URL:', imageUrl);
                return imageUrl;
              })()}
              alt="Preview"
              className="max-w-full h-32 object-cover mx-auto rounded"
              onError={(e) => {
                console.error('Image load error:', e);
                console.error('Failed URL:', (e.target as HTMLImageElement).src);
              }}
            />
            {!uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="清除圖片"
                aria-label="清除圖片"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 text-gray-400">
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              ) : (
                <ImageIcon size={48} />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {uploading ? '上傳中...' : '點擊上傳或拖放圖片到此處'}
              </p>
              <p className="text-xs text-gray-500">
                支援 JPEG、PNG、WebP 格式，最大 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}