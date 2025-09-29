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
}

// Upload image to Cloudinary via API
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'uphouse_preset');

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
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
  const response = await fetch('/api/images/delete', {
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