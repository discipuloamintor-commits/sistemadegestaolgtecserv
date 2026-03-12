import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

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
            {/* Pulsing ring */}
            <div className="relative mb-8">
                <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-primary/30 animate-ping" />
                <div className="absolute inset-0 w-28 h-28 rounded-full border-2 border-primary/20 animate-pulse" />
                <img
                    src={logo}
                    alt="LG TecServ"
                    className="relative w-28 h-28 object-contain rounded-2xl shadow-xl z-10"
                />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">LG TecServ</h1>
            <p className="text-sm text-gray-500 mb-8">Sistema de Gestão</p>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                    style={{
                        animation: 'splashProgress 1.8s ease-out forwards',
                    }}
                />
            </div>

            <style>{`
        @keyframes splashProgress {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
        </div>
    );
};
