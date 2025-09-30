// API Configuration for different environments
interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Get the API base URL based on environment
const getApiBaseUrl = (): string => {
  // In production (when deployed to Vercel/Netlify), use relative URLs
  if (import.meta.env.PROD) {
    return window.location.origin;
  }

  // In development, check if we have a specific API server running
  // This allows for flexible development setups
  const devApiUrl = import.meta.env.VITE_API_URL;
  if (devApiUrl) {
    return devApiUrl;
  }

  // Default development configuration
  // Try to detect if dev server is running on a different port
  const currentPort = window.location.port;
  const currentHost = window.location.hostname;

  // If we're running on a known frontend port, use API server
  if (['5173', '5174', '5175', '3000', '4173'].includes(currentPort)) {
    // Return the default API port
    return `http://${currentHost}:3002`;
  }

  // Fallback to same origin
  return window.location.origin;
};

export const apiConfig: ApiConfig = {
  baseUrl: getApiBaseUrl(),
  timeout: 10000, // 10 seconds
};

// API helper functions
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiConfig.baseUrl}/api/${cleanEndpoint}`;
};

// Generic API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint);

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// Specific API methods for images (using admin endpoint)
export const imageApi = {
  // Get all images
  getAll: async (): Promise<Response> => {
    const token = localStorage.getItem('admin_token');
    return apiRequest('admin?resource=images', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // Create new image
  create: async (imageData: {
    publicId: string;
    title?: string;
    description?: string;
    category?: string;
  }): Promise<Response> => {
    const token = localStorage.getItem('admin_token');
    return apiRequest('admin?resource=images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    });
  },

  // Delete image
  delete: async (imageId: string): Promise<Response> => {
    const token = localStorage.getItem('admin_token');
    return apiRequest(`admin?resource=images&id=${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  // Update image
  update: async (imageId: string, imageData: any): Promise<Response> => {
    const token = localStorage.getItem('admin_token');
    return apiRequest(`admin?resource=images&id=${imageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    });
  },
};

// Environment detection helpers
export const isProduction = (): boolean => import.meta.env.PROD;
export const isDevelopment = (): boolean => import.meta.env.DEV;

// Debug logging for development
if (isDevelopment()) {
  console.log('🔧 API Configuration:', {
    baseUrl: apiConfig.baseUrl,
    environment: import.meta.env.MODE,
    currentOrigin: window.location.origin,
  });
}