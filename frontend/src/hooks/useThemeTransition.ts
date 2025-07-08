import { useEffect, useRef } from 'react';

export function useThemeTransition() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Add preload class to prevent transitions on page load
    document.documentElement.classList.add('preload');

    // Remove preload class after a short delay
    const timeoutId = setTimeout(() => {
      document.documentElement.classList.remove('preload');
    }, 200); // Increased delay to ensure styles are loaded

    return () => {
      clearTimeout(timeoutId);
      document.documentElement.classList.remove('preload');
    };
  }, []);
} 