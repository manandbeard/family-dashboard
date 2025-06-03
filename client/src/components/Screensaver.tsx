import { useEffect, useState } from 'react';
import { PhotoItem } from '@shared/schema';

interface ScreensaverProps {
  active: boolean;
  photos: PhotoItem[];
  onExit: () => void;
}

export function Screensaver({ active, photos, onExit }: ScreensaverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  
  useEffect(() => {
    if (!active || photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
        setTransitioning(false);
      }, 1000); // Match the CSS transition time
    }, 10000); // Change photo every 10 seconds
    
    return () => clearInterval(interval);
  }, [active, photos.length]);
  
  if (!active) return null;
  
  // If no photos, show a black screen with message
  if (photos.length === 0) {
    return (
      <div 
        className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white"
        onClick={onExit}
      >
        <div className="text-center">
          <p className="text-xl mb-4">No photos available</p>
          <p className="text-sm opacity-60">Move mouse or touch screen to exit</p>
        </div>
      </div>
    );
  }
  
  const currentPhoto = photos[currentIndex];
  
  return (
    <div 
      className="fixed inset-0 bg-black z-50 cursor-none"
      onClick={onExit}
      onKeyDown={(e) => e.key === 'Escape' && onExit()}
      tabIndex={0}
    >
      <div className="h-full w-full relative">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            backgroundImage: `url("${currentPhoto.path}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white opacity-60 text-sm">
          Move mouse or touch screen to exit
        </div>
      </div>
    </div>
  );
}
