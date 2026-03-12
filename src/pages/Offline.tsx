import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

const Offline = () => {
  const [checking, setChecking] = useState(false);

  // Auto-reload when connection is restored
  useEffect(() => {
    const handleOnline = () => {
      window.location.href = '/';
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleRetry = () => {
    setChecking(true);
    // Small delay for UX feedback
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = '/';
      } else {
        setChecking(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* App Icon */}
        <div className="flex justify-center mb-4">
          <img
            src="/icons/icon-192x192.png"
            alt="LG TecServ"
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
        </div>

        {/* Animated Signal Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-red-200 animate-ping opacity-20" />
            <div className="absolute w-24 h-24 rounded-full border-2 border-red-200 animate-ping opacity-30" style={{ animationDelay: '0.3s' }} />
            <div className="absolute w-16 h-16 rounded-full border-2 border-red-200 animate-ping opacity-40" style={{ animationDelay: '0.6s' }} />
            {/* Center icon */}
            <div className="relative bg-red-50 p-4 rounded-full z-10">
              <WifiOff className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          Sem conexão
        </h1>

        {/* Description */}
        <p className="text-gray-500">
          Verifique sua conexão com a internet. A página será recarregada automaticamente quando a conexão for restaurada.
        </p>

        {/* Live connection check indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          Aguardando conexão...
        </div>

        {/* Retry Button */}
        <Button
          onClick={handleRetry}
          size="lg"
          className="mt-4"
          disabled={checking}
        >
          {checking ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Tentar novamente
            </>
          )}
        </Button>

        {/* Offline features */}
        <div className="mt-10 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Recursos disponíveis offline:
          </h2>
          <ul className="text-sm text-gray-500 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Visualizar dados salvos em cache
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Acessar páginas visitadas recentemente
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Interface do aplicativo permanece funcional
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Offline;
