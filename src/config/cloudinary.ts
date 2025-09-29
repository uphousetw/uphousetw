import { Cloudinary } from '@cloudinary/url-gen';
import { fill, fit } from '@cloudinary/url-gen/actions/resize';
import { quality } from '@cloudinary/url-gen/actions/delivery';
import { format } from '@cloudinary/url-gen/actions/delivery';

// Cloudinary configuration
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dpqbbiuef'
  }
});

// Default transformations for different image types
export const imageTransforms = {
  logo: {
    width: 300,
    height: 100,
    crop: 'fit'
  },
  gallery: {
    width: 800,
    height: 600,
    crop: 'fill'
  },
  thumbnail: {
    width: 400,
    height: 300,
    crop: 'fill'
  },
  profile: {
    width: 200,
    height: 200,
    crop: 'fill'
  }
};

// Helper function to generate Cloudinary URLs
export const getCloudinaryUrl = (publicId: string, transform: keyof typeof imageTransforms = 'gallery') => {
  if (!publicId) return '';

  try {
    const img = cloudinary.image(publicId);
    const transformConfig = imageTransforms[transform];

    // Apply resize transformation
    if (transformConfig.crop === 'fill') {
      img.resize(fill().width(transformConfig.width).height(transformConfig.height));
    } else {
      img.resize(fit().width(transformConfig.width).height(transformConfig.height));
    }

    // Apply quality and format
    img.delivery(quality('auto')).delivery(format('auto'));

    return img.toURL();
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return '';
  }
};

// Default images configuration
export const defaultImages = {
  logo: 'uphouse/logo', // Will be the Cloudinary public ID for logo
  fallbackGallery: [
    'uphouse/gallery/project-1',
    'uphouse/gallery/project-2',
    'uphouse/gallery/project-3'
  ]
};