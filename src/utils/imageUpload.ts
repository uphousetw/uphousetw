// Image upload utilities for Cloudinary

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: Record<string, any>;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// Resize image client-side to reduce file size
const resizeImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with quality compression
      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Upload image to Cloudinary - simple approach that was working before
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Uphouse');

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log('Uploading to:', uploadUrl);
  console.log('Cloud name:', cloudName);
  console.log('Upload preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Uphouse');

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Cloudinary upload error:', errorData);
    throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Upload successful:', result);

  // Save image metadata to backend after successful upload
  try {
    const token = localStorage.getItem('admin_token');
    if (token) {
      await fetch('/api/admin?resource=images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publicId: result.public_id,
          title: '',
          description: '',
          category: 'gallery'
        })
      });
    }
  } catch (error) {
    console.warn('Failed to save image metadata:', error);
    // Don't fail the upload if metadata save fails
  }

  return result;
};

// Upload multiple images
export const uploadMultipleImages = async (
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadImage(file, options));
  return Promise.all(uploadPromises);
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  // This would need to be done through your backend API for security
  // as it requires your API secret
  const response = await fetch('/api/admin?resource=images&action=cloudinary-delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
    },
    body: JSON.stringify({ public_id: publicId })
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.statusText}`);
  }
};

// Validate image file
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return '只支援 JPEG、PNG 和 WebP 格式的圖片';
  }

  if (file.size > maxSize) {
    return '圖片大小不能超過 10MB';
  }

  return null;
};

// Image upload presets for different use cases
export const uploadPresets = {
  logo: {
    folder: 'uphouse/logos',
    tags: ['logo', 'branding']
  },
  gallery: {
    folder: 'uphouse/gallery',
    tags: ['gallery', 'projects']
  },
  projects: {
    folder: 'uphouse/projects',
    tags: ['projects', 'buildings']
  },
  team: {
    folder: 'uphouse/team',
    tags: ['team', 'profiles']
  }
};