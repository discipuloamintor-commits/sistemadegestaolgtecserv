import { useState, useEffect } from 'react';

export const SplashScreen = () => {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Only show in standalone (installed) mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (navigator as any).standalone === true;

        if (!isStandalone) {
            setVisible(false);
            return;
        }

        const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
        const hideTimer = setTimeout(() => setVisible(false), 2300);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div className="relative mb-8">
                <img
                    src="/icons/icon-512x512.png?v=2"
                    alt="LG TecServ Icon"
                    className="relative w-28 h-28 object-contain z-10"
                    style={{
                        animation: 'spinAccelerate 2.3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                        transformOrigin: 'center center'
                    }}
                />
            </div>

            <style>{`
        @keyframes spinAccelerate {
          0% { 
            transform: rotate(0deg); 
          }
          100% { 
            transform: rotate(1440deg); /* 4 voltas completas */
          }
        }
      `}</style>
        </div>
    );
};
