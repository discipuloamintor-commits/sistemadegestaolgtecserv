import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const IOSInstallBanner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (navigator as any).standalone === true;
        const dismissed = localStorage.getItem('ios-install-banner-dismissed') === 'true';

        if (isIOS && !isStandalone && !dismissed) {
            const timer = setTimeout(() => setShow(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem('ios-install-banner-dismissed', 'true');
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-md mx-auto relative">
                {/* Close */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Arrow pointing down (towards Safari share button) */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />

                <div className="flex items-start gap-3">
                    <img
                        src="/icons/icon-96x96.png"
                        alt="LG TecServ"
                        className="w-12 h-12 rounded-xl shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm">Instale o LG TecServ</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Toque em{' '}
                            <span className="inline-flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                                📤 Compartilhar
                            </span>{' '}
                            e depois em{' '}
                            <span className="inline-flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                                ➕ Adicionar à Tela Inicial
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
