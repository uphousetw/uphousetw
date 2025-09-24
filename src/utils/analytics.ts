// Google Analytics 4 utilities
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load GA4 script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href
  });
};

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
};

// Track admin events
export const trackAdminEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Remove PII before sending to GA4
  const sanitizedParams = { ...parameters };
  delete sanitizedParams.email;
  delete sanitizedParams.phone;
  delete sanitizedParams.name;

  window.gtag('event', eventName, {
    event_category: 'admin',
    ...sanitizedParams
  });
};

// Admin event helpers
export const adminEvents = {
  login: (method: string, result: 'success' | 'failure') => {
    trackAdminEvent('admin_login', { method, result });
  },

  logout: () => {
    trackAdminEvent('admin_logout');
  },

  action: (action: 'create' | 'read' | 'update' | 'delete', entity: string, entityId?: string, status?: string, category?: string, year?: number) => {
    trackAdminEvent('admin_action', {
      action,
      entity,
      entity_id: entityId,
      status,
      category,
      year
    });
  },

  upload: (fileType: string, sizeKb: number, status: 'success' | 'failure') => {
    trackAdminEvent('admin_upload', { file_type: fileType, size_kb: sizeKb, status });
  },

  deployTriggered: (buildId?: string) => {
    trackAdminEvent('admin_deploy_triggered', { build_id: buildId });
  },

  deployResult: (status: 'success' | 'failure', buildId?: string) => {
    trackAdminEvent('admin_deploy_result', { status, build_id: buildId });
  },

  error: (where: string, code?: string, message?: string) => {
    trackAdminEvent('admin_error', { where, code, message });
  }
};