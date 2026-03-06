import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoInstallPrompt } from '@/hooks/useAutoInstallPrompt';
import { Trash2, Info } from 'lucide-react';

const PWADebug = () => {
  const { isInstalled, deferredPrompt, canShowPrompt } = useAutoInstallPrompt();

  const clearPWACache = () => {
    localStorage.removeItem('pwa-prompt-dismissed');
    localStorage.removeItem('ios-install-banner-dismissed');
    console.log('🗑️ Cache PWA limpo!');
    alert('Cache PWA limpo! Recarregue a página.');
    window.location.reload();
  };

  const checkPWAStatus = () => {
    const status = {
      isInstalled,
      canShowPrompt,
      hasDeferredPrompt: !!deferredPrompt,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isHTTPS: window.location.protocol === 'https:',
      hasServiceWorker: 'serviceWorker' in navigator,
      localStorage: {
        promptDismissed: localStorage.getItem('pwa-prompt-dismissed'),
        iosBannerDismissed: localStorage.getItem('ios-install-banner-dismissed'),
      },
      userAgent: navigator.userAgent,
    };
    
    console.table(status);
    return status;
  };

  const status = checkPWAStatus();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">PWA Debug Panel</h1>
          <p className="text-muted-foreground">
            Use esta página para diagnosticar problemas de instalação do PWA
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Status do PWA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instalado:</span>
                  <span className={`font-mono ${status.isInstalled ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.isInstalled ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pode mostrar prompt:</span>
                  <span className={`font-mono ${status.canShowPrompt ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.canShowPrompt ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evento disponível:</span>
                  <span className={`font-mono ${status.hasDeferredPrompt ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.hasDeferredPrompt ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modo Standalone:</span>
                  <span className={`font-mono ${status.isStandalone ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.isStandalone ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HTTPS:</span>
                  <span className={`font-mono ${status.isHTTPS ? 'text-green-600' : 'text-red-600'}`}>
                    {status.isHTTPS ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Worker:</span>
                  <span className={`font-mono ${status.hasServiceWorker ? 'text-green-600' : 'text-red-600'}`}>
                    {status.hasServiceWorker ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prompt dispensado:</span>
                  <span className={`font-mono ${status.localStorage.promptDismissed === 'true' ? 'text-orange-600' : 'text-green-600'}`}>
                    {status.localStorage.promptDismissed === 'true' ? '⚠️ Sim' : '✅ Não'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={clearPWACache} 
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache e Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Navegador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-xs break-all">{status.userAgent}</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requisitos para beforeinstallprompt</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>HTTPS ou localhost {status.isHTTPS ? '✅' : '❌'}</li>
              <li>Service Worker registrado {status.hasServiceWorker ? '✅' : '❓'}</li>
              <li>Manifest.json válido</li>
              <li>Chrome/Edge (não funciona em Safari/Firefox)</li>
              <li>App não instalado {!status.isInstalled ? '✅' : '❌'}</li>
              <li>Usuário visitou o site pelo menos uma vez</li>
              <li>Critérios de engajamento atendidos</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>💡 Dicas de Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Abra o DevTools (F12) e vá na aba Console para ver os logs detalhados</p>
            <p>2. Se o evento não disparar, teste em Chrome/Edge (não funciona em Safari)</p>
            <p>3. Certifique-se de estar em HTTPS ou localhost</p>
            <p>4. Se já instalou antes, desinstale e limpe o cache</p>
            <p>5. O evento pode levar alguns segundos após o carregamento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PWADebug;
