import React from 'react';

export const PageLoader = ({ text = "A carregar dados..." }: { text?: string }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] flex-col w-full">
      <img 
        src="/icons/icon-512x512.png?v=2" 
        alt="Carregando" 
        className="w-16 h-16 object-contain mb-4"
        style={{ 
            animation: 'spinAccelerate 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite', 
            transformOrigin: 'center center' 
        }}
      />
      <p className="text-muted-foreground text-sm animate-pulse">{text}</p>
      <style>{`
        @keyframes spinAccelerate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(1440deg); }
        }
      `}</style>
    </div>
  );
};
