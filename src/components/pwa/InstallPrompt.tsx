import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => Promise<void>;
  onDismiss: () => void;
  isUpdateAvailable?: boolean;
}

export const InstallPrompt = ({ 
  deferredPrompt, 
  onInstall, 
  onDismiss,
  isUpdateAvailable = false 
}: InstallPromptProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('🎨 InstallPrompt: Montado', { 
      hasDeferredPrompt: !!deferredPrompt,
      isUpdateAvailable 
    });
    
    // Show prompt after 2 seconds if conditions are met
    const timer = setTimeout(() => {
      if (deferredPrompt) {
        console.log('✨ InstallPrompt: Mostrando pop-up!');
        setIsVisible(true);
      } else {
        console.log('⚠️ InstallPrompt: Sem deferredPrompt, não mostrando');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [deferredPrompt, isUpdateAvailable]);

  const handleInstall = async () => {
    await onInstall();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Wait for exit animation
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Card */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <img 
            src="/icons/icon-192x192.png" 
            alt="Gestao LG TecServ" 
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isUpdateAvailable ? 'Nova versão disponível!' : 'Instale o Gestao LG TecServ'}
          </h2>
          <p className="text-muted-foreground">
            {isUpdateAvailable 
              ? 'Uma nova versão do aplicativo está disponível. Atualize para obter os recursos mais recentes.'
              : 'Acesso rápido, modo offline e notificações em tempo real'
            }
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleInstall}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            {isUpdateAvailable ? 'Baixar atualização' : 'Baixar aplicativo'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="w-full h-12 text-base font-medium text-muted-foreground hover:text-foreground"
          >
            Agora não
          </Button>
        </div>
      </div>
    </div>
  );
};
