import { Loader2 } from 'lucide-react';

export const Loading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <img 
          src="/icons/icon-192x192.png" 
          alt="Gestao LG TecServ" 
          className="w-20 h-20 rounded-2xl shadow-lg mx-auto mb-4 animate-pulse"
        />
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};
