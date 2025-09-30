/**
 * Real API Service - No Mock Data
 * Direct connection to backend APIs only
 * Eliminates frontend-backend alignment issues
 */
import type { Project, AboutUs, ContactMessage, SiteConfig, ApiError } from '../types/apiTypes';
import { apiConfig } from '../config/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use our environment-aware API configuration
    this.baseUrl = apiConfig.baseUrl;
  }

  /**
   * Make HTTP request with proper error handling
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...options.headers,
        },
        cache: 'no-store',
        ...options,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}`,
          details: response.statusText
        }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ===== PUBLIC ENDPOINTS =====

  /**
   * Get all projects for public display
   */
  async getPublicProjects(): Promise<{ projects: Project[]; total: number }> {
    return this.makeRequest('public?resource=projects');
  }

  /**
   * Get single project by slug for public display
   */
  async getPublicProject(slug: string): Promise<{ project: Project }> {
    return this.makeRequest(`public?resource=projects&slug=${encodeURIComponent(slug)}`);
  }

  /**
   * Get about data for public display
   */
  async getPublicAbout(): Promise<{ about: AboutUs }> {
    return this.makeRequest('public?resource=about');
  }

  /**
   * Submit contact form
   */
  async submitContact(data: Omit<ContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{ message: string }> {
    return this.makeRequest('public?resource=contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // ===== ADMIN ENDPOINTS (Protected) =====

  /**
   * Get all projects for admin management
   */
  async getAdminProjects(token: string): Promise<{ projects: Project[]; total: number }> {
    return this.makeRequest('admin?resource=projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Create new project
   */
  async createProject(token: string, data: Omit<Project, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<{ project: Project }> {
    return this.makeRequest('admin?resource=projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing project
   */
  async updateProject(token: string, id: string, data: Partial<Project>): Promise<{ project: Project }> {
    return this.makeRequest(`admin?resource=projects&id=${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete project
   */
  async deleteProject(token: string, id: string): Promise<{ message: string }> {
    return this.makeRequest(`admin?resource=projects&id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Get about data for admin editing
   */
  async getAdminAbout(token: string): Promise<{ about: AboutUs }> {
    return this.makeRequest('admin?resource=about', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Update about data
   */
  async updateAbout(token: string, data: Partial<AboutUs>): Promise<{ about: AboutUs }> {
    return this.makeRequest('admin?resource=about', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all contact messages
   */
  async getContacts(token: string): Promise<{ contacts: ContactMessage[]; total: number }> {
    return this.makeRequest('admin?resource=contacts', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Update contact message status
   */
  async updateContact(token: string, id: string, data: { status: string }): Promise<{ contact: ContactMessage }> {
    return this.makeRequest(`admin?resource=contacts&id=${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete contact message
   */
  async deleteContact(token: string, id: string): Promise<{ message: string }> {
    return this.makeRequest(`admin?resource=contacts&id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Get site configuration
   */
  async getSiteConfig(token: string): Promise<{ config: SiteConfig }> {
    return this.makeRequest('admin?resource=config', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Update site configuration
   */
  async updateSiteConfig(token: string, data: Partial<SiteConfig>): Promise<{ config: SiteConfig }> {
    return this.makeRequest('admin?resource=config', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export { ApiService };