import React from 'react';

/**
 * Image Optimization Utilities
 * Handles automatic image compression, format conversion, and lazy loading
 */

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  options?: ImageOptimizationOptions;
}

// Check if WebP is supported
const isWebPSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Convert image to WebP if supported and not already WebP
export const getOptimizedImageSrc = (src: string, options: ImageOptimizationOptions = {}): string => {
  const { format = 'webp', quality = 80 } = options;
  
  // If already optimized or WebP not supported, return original
  if (src.includes('.webp') || !isWebPSupported()) {
    return src;
  }
  
  // For external images or CDN images, you might want to use a service
  // For now, return the original src
  return src;
};

// Lazy loading intersection observer
let imageObserver: IntersectionObserver | null = null;

const getImageObserver = (): IntersectionObserver => {
  if (imageObserver) return imageObserver;
  
  imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver?.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );
  
  return imageObserver;
};

// Optimized Image Component
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  options = {}
}) => {
  const { lazy = true, width, height } = options;
  const optimizedSrc = getOptimizedImageSrc(src, options);
  
  const imgRef = React.useRef<HTMLImageElement>(null);
  
  React.useEffect(() => {
    if (!lazy || !imgRef.current) return;
    
    const observer = getImageObserver();
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazy]);
  
  const imgProps = {
    ref: imgRef,
    alt,
    className: `${className} transition-opacity duration-300`,
    style: {
      width: width ? `${width}px` : undefined,
      height: height ? `${height}px` : undefined,
    },
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
  
  if (lazy) {
    return (
      <img
        {...imgProps}
        data-src={optimizedSrc}
        src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27100%27%20height=%2750%27/%3e"
      />
    );
  }
  
  return <img {...imgProps} src={optimizedSrc} />;
};

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical images
export const preloadCriticalImages = (imageSrcs: string[]): Promise<void[]> => {
  return Promise.all(imageSrcs.map(preloadImage));
};

// Convert file to WebP (for upload scenarios)
export const convertToWebP = (file: File, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Image compression utility
export const compressImage = (
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Hook for image optimization
export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = React.useState(false);
  
  React.useEffect(() => {
    setIsWebPSupported(isWebPSupported());
  }, []);
  
  return {
    isWebPSupported,
    getOptimizedImageSrc,
    preloadImage,
    preloadCriticalImages,
    convertToWebP,
    compressImage,
  };
};