import { useState, useEffect } from 'react';
import { X, Download, MoreVertical, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Banner de instalação manual que NÃO depende do evento beforeinstallprompt.
 * Mostra instruções visuais para o utilizador instalar via menu do navegador.
 * Funciona SEMPRE, independentemente do Chrome bloquear ou não o evento nativo.
 */
export const ManualInstallBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;

    if (isStandalone || isIOSStandalone) {
      return; // Already installed, don't show
    }

    // Check if dismissed recently (max 24h, not forever)
    const dismissedAt = localStorage.getItem('manual-install-dismissed-at');
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        return; // Dismissed less than 24h ago
      }
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Show after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('manual-install-dismissed-at', String(Date.now()));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 z-[200] animate-fade-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-md mx-auto relative overflow-hidden">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* App Icon */}
          <img
            src="/icons/icon-192x192.png?v=2"
            alt="LG TecServ"
            className="w-14 h-14 rounded-xl shadow-md flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">Instale o LG TecServ</h3>
            <p className="text-gray-500 text-xs mt-0.5 mb-2">Acesso rápido direto da sua tela inicial</p>

            {isIOS ? (
              /* iOS Instructions */
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
                <Share className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-800 font-medium">
                  Toque em <strong>Compartilhar</strong> → <strong>"Tela de Início"</strong>
                </span>
              </div>
            ) : (
              /* Android/Chrome Instructions */
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
                <MoreVertical className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-800 font-medium">
                  Toque em <strong>⋮</strong> (menu) → <strong>"Instalar aplicativo"</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
