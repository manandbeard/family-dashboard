
import { useState, useEffect } from 'react';
import { getTextColor } from '@/lib/utils/color';
import { PhotoItem } from '@shared/schema';

interface PhotoSlideshowProps {
  photos: PhotoItem[];
  color: string;
  settings: {
    slideshowInterval?: number;
    transitionDuration?: number;
    transitionStyle?: 'slide' | 'fade';
  };
}

function getTransitionStyle(transitioning: boolean, style: 'slide' | 'fade' | 'zoom' = 'slide') {
  if (style === 'slide') {
    return {
      transform: `translate(${transitioning ? '100%' : '-50%'}, -50%)`,
      transition: 'transform',
      opacity: 1
    };
  } else if (style === 'zoom') {
    return {
      transform: `translate(-50%, -50%) scale(${transitioning ? 1.1 : 1})`,
      transition: 'transform',
      opacity: 1
    };
  }
  return {
    transform: 'translate(-50%, -50%)',
    transition: 'opacity',
    opacity: transitioning ? 0 : 1
  };
}

export function PhotoSlideshow({ photos, color, settings }: PhotoSlideshowProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);
  const textColor = getTextColor(color);
  const currentPhoto = photos[currentPhotoIndex];
  const nextPhoto = photos[(currentPhotoIndex + 1) % photos.length];
  const transitionStyle = settings.transitionStyle || 'slide';

  const getTransitionStyles = () => {
    const duration = `${settings.transitionDuration || 750}ms`;
    const base = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
      objectFit: 'contain',
      transition: `transform ${duration} ease-in-out, opacity ${duration} ease-in-out`,
    };

    switch (transitionStyle) {
      case 'slide':
        return {
          ...base,
          transform: `translate(${transitioning ? '100%' : '-50%'}, -50%)`,
          opacity: 1,
        };
      case 'zoom':
        return {
          ...base,
          transform: `translate(-50%, -50%) scale(${transitioning ? '1.2' : '1'})`,
          opacity: transitioning ? 0 : 1,
        };
      case 'fade':
        return {
          ...base,
          transform: 'translate(-50%, -50%)',
          opacity: transitioning ? 0 : 1,
        };
      default:
        return base;
    }
  };

  // Preload next image
  useEffect(() => {
    if (!nextPhoto) return;
    const img = new Image();
    img.src = nextPhoto.path;
    img.onload = () => setNextImageLoaded(true);
  }, [currentPhotoIndex, nextPhoto]);
  
  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    
    const interval = setInterval(() => {
      if (nextImageLoaded) {
        setTransitioning(true);
        const transitionTimeout = setTimeout(() => {
          setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
          // Add a small delay before resetting transition state
          setTimeout(() => {
            setTransitioning(false);
            setNextImageLoaded(false);
          }, 50);
        }, settings?.transitionDuration || 750);
        
        return () => clearTimeout(transitionTimeout);
      }
    }, (settings?.slideshowInterval || 7) * 1000);
    
    return () => clearInterval(interval);
  }, [photos, settings]);
  
  if (!photos || photos.length === 0) {
    return (
      <div className="h-full rounded-xl bg-white shadow-soft overflow-hidden">
        <div className="px-4 py-2 text-white" style={{ backgroundColor: color }}>
          <h2 className="font-bold" style={{ color: textColor }}>Family Photos</h2>
        </div>
        <div className="flex items-center justify-center h-full p-4">
          <p className="text-center text-[#7A7A7A]">No photos available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full rounded-xl bg-white shadow-soft overflow-hidden">
      <div className="px-4 py-2 text-white" style={{ backgroundColor: color }}>
        <h2 className="font-bold" style={{ color: textColor }}>Family Photos</h2>
      </div>
      
      <div className="photo-slideshow w-full h-[calc(100%-40px)] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-[#f0f0f0]">
          {currentPhoto && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                key={currentPhoto.path}
                src={currentPhoto.path}
                alt="Family photo"
                style={getTransitionStyles()}
                onError={(e) => console.error('Image failed to load:', e)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
