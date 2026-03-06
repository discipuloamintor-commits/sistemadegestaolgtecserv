import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, CheckCircle, Apple, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detecta o sistema operacional
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsIOS(ios);
    setIsAndroid(android);

    // Captura o evento de instalação (só funciona em Chrome/Edge Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">LG TecServ</h1>
          <p className="text-muted-foreground">Sistema de Gestão Financeira</p>
        </div>

        {isInstalled ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle>App Instalado!</CardTitle>
              </div>
              <CardDescription>
                O aplicativo já está instalado no seu dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Abrir Aplicativo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-6 w-6" />
                  <CardTitle>Instale o Aplicativo</CardTitle>
                </div>
                <CardDescription>
                  Instale o LG TecServ no seu dispositivo para acesso rápido e uso offline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deferredPrompt && (
                  <Button onClick={handleInstallClick} className="w-full" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Instalar Agora
                  </Button>
                )}

                {isIOS && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Apple className="h-5 w-5" />
                        <CardTitle className="text-base">Como Instalar no iPhone/iPad</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Toque no botão <strong>Compartilhar</strong> <span className="inline-block">📤</span> (parte inferior da tela no Safari)</li>
                        <li>Role para baixo e toque em <strong>"Adicionar à Tela Inicial"</strong></li>
                        <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
                        <li>O ícone do app aparecerá na sua tela inicial!</li>
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {isAndroid && (
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Chrome className="h-5 w-5" />
                        <CardTitle className="text-base">Como Instalar no Android</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Toque no <strong>menu</strong> do navegador (⋮ três pontos no canto superior)</li>
                        <li>Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                        <li>Toque em <strong>"Instalar"</strong> na janela que aparecer</li>
                        <li>O app será instalado como um aplicativo nativo!</li>
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {!isIOS && !isAndroid && (
                  <div className="space-y-4">
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Apple className="h-5 w-5" />
                          <CardTitle className="text-base">iPhone/iPad (Safari)</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Toque no botão Compartilhar 📤</li>
                          <li>Selecione "Adicionar à Tela Inicial"</li>
                          <li>Toque em "Adicionar"</li>
                        </ol>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Chrome className="h-5 w-5" />
                          <CardTitle className="text-base">Android (Chrome)</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Toque no menu (⋮ três pontos)</li>
                          <li>Selecione "Instalar app"</li>
                          <li>Confirme a instalação</li>
                        </ol>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/")} 
                    className="w-full"
                  >
                    Continuar sem Instalar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Benefícios do App Instalado</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Acesso rápido direto da tela inicial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Funciona offline após o primeiro acesso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Carregamento mais rápido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Experiência como aplicativo nativo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Install;