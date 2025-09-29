import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export default function SEO({ title, description, image, type = 'website' }: SEOProps) {
  const location = useLocation();

  const siteName = '向上建設';
  const defaultDescription = '專營苗栗後龍高鐵特區的建設公司';
  const defaultImage = '/og-image.jpg'; // You would add this image to public folder
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';

  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription = description || defaultDescription;
  const pageImage = image || defaultImage;
  const pageUrl = `${siteUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const updateNameTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Basic meta tags
    updateNameTag('description', pageDescription);

    // Open Graph tags
    updateMetaTag('og:title', pageTitle);
    updateMetaTag('og:description', pageDescription);
    updateMetaTag('og:image', pageImage);
    updateMetaTag('og:url', pageUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', siteName);

    // Twitter Card tags
    updateNameTag('twitter:card', 'summary_large_image');
    updateNameTag('twitter:title', pageTitle);
    updateNameTag('twitter:description', pageDescription);
    updateNameTag('twitter:image', pageImage);

  }, [pageTitle, pageDescription, pageImage, pageUrl, type]);

  return null;
}