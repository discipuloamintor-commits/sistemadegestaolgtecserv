import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useAutoInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canShowPrompt, setCanShowPrompt] = useState(false);

  useEffect(() => {
    console.log('🚀 PWA Hook: Inicializado');
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (navigator as any).standalone === true;
    const installed = isStandalone || (isIOS && isInStandaloneMode);
    
    console.log('📱 PWA Status:', {
      isStandalone,
      isIOS,
      isInStandaloneMode,
      installed,
      isHTTPS: window.location.protocol === 'https:',
      hostname: window.location.hostname
    });
    
    setIsInstalled(installed);

    // Don't proceed if already installed
    if (installed) {
      console.log('✅ PWA: Já instalado, não mostrar prompt');
      return;
    }

    // Check if we've already dismissed the prompt
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    console.log('💾 PWA: Prompt dismisssed?', promptDismissed);
    
    if (promptDismissed === 'true') {
      console.log('⚠️ PWA: Prompt foi dispensado anteriormente');
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 PWA: beforeinstallprompt evento disparado!');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanShowPrompt(true);
    };

    console.log('👂 PWA: Aguardando evento beforeinstallprompt...');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ PWA: Service Worker registrado');
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptToInstall = async () => {
    console.log('🖱️ PWA: promptToInstall chamado');
    if (!deferredPrompt) {
      console.log('❌ PWA: Nenhum prompt disponível');
      return;
    }

    console.log('📲 PWA: Mostrando prompt nativo...');
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    console.log('👤 PWA: Escolha do usuário:', choiceResult.outcome);
    
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ PWA: Instalação aceita!');
      setIsInstalled(true);
    } else {
      console.log('❌ PWA: Instalação rejeitada');
    }
    
    setDeferredPrompt(null);
    setCanShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const dismissPrompt = () => {
    console.log('🚫 PWA: Prompt dispensado pelo usuário');
    setCanShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Log state changes
  useEffect(() => {
    console.log('📊 PWA State:', { 
      canShowPrompt, 
      isInstalled, 
      hasDeferredPrompt: !!deferredPrompt 
    });
  }, [canShowPrompt, isInstalled, deferredPrompt]);

  return {
    isInstalled,
    deferredPrompt,
    promptToInstall,
    canShowPrompt,
    dismissPrompt,
  };
};
