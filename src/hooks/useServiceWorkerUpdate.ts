import { useState, useEffect } from 'react';

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Get the current registration
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  setUpdateAvailable(true);
                  // Clear localStorage flags to show install prompt again
                  localStorage.removeItem('pwa-prompt-shown');
                  localStorage.removeItem('ios-install-banner-dismissed');
                }
              });
            }
          });

          // Check for waiting service worker immediately
          if (reg.waiting) {
            setUpdateAvailable(true);
          }
        }
      });

      // Listen for controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // Check for updates every 60 minutes
    const interval = setInterval(() => {
      if (registration) {
        registration.update();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [registration]);

  const applyUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    updateAvailable,
    applyUpdate
  };
};
