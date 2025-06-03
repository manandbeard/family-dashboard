import { useState, useEffect, useCallback, useRef } from 'react';

export function useScreensaver(timeoutMinutes: number = 10) {
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const resetScreensaverTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isScreensaverActive) {
      setIsScreensaverActive(false);
    }

    timeoutRef.current = setTimeout(() => {
      setIsScreensaverActive(true);
    }, timeoutMs);
  }, [isScreensaverActive, timeoutMs]);

  const exitScreensaver = useCallback(() => {
    setIsScreensaverActive(false);
    resetScreensaverTimer();
  }, [resetScreensaverTimer]);

  useEffect(() => {
    // Set up event listeners to detect user activity
    const handleActivity = () => resetScreensaverTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Initialize timer
    resetScreensaverTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [resetScreensaverTimer]);

  // Handle slideshow for screensaver mode
  useEffect(() => {
    if (isScreensaverActive) {
      const slideInterval = setInterval(() => {
        setCurrentSlideIndex(prev => prev + 1);
      }, 10000); // Change slide every 10 seconds

      return () => clearInterval(slideInterval);
    }
  }, [isScreensaverActive]);

  return {
    isScreensaverActive,
    currentSlideIndex,
    exitScreensaver,
    resetScreensaverTimer
  };
}
