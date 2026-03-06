import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <img 
            src="/icons/icon-192x192.png" 
            alt="Gestao LG TecServ" 
            className="w-24 h-24 rounded-2xl shadow-lg mb-4"
          />
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <WifiOff className="relative w-24 h-24 text-muted-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground">
          Você está offline
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg">
          Verifique sua conexão com a internet e tente novamente.
        </p>

        {/* Retry Button */}
        <Button 
          onClick={handleRetry}
          size="lg"
          className="mt-6"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Tentar novamente
        </Button>

        {/* Available Features */}
        <div className="mt-12 p-6 bg-muted/50 rounded-xl border border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Recursos disponíveis offline:
          </h2>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li>• Visualizar dados salvos em cache</li>
            <li>• Acessar páginas visitadas recentemente</li>
            <li>• Interface do aplicativo permanece funcional</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Offline;
