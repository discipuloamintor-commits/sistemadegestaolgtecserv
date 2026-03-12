import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        if (wasOffline) {
            toast.success('Conexão restaurada', {
                description: 'Você está de volta online.',
                duration: 4000,
            });
        }
        setWasOffline(false);
    }, [wasOffline]);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setWasOffline(true);
        toast.error('Sem conexão', {
            description: 'Verifique sua conexão com a internet.',
            duration: Infinity,
            id: 'offline-toast',
        });
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline, wasOffline };
};
