import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            toast.error('Notificações não suportadas neste navegador.');
            return false;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            toast.success('Notificações ativadas!', {
                description: 'Você receberá alertas importantes do sistema.'
            });
            return true;
        } else if (result === 'denied') {
            toast.error('Notificações bloqueadas', {
                description: 'Verifique as configurações do seu navegador para ativar.'
            });
        }
        return false;
    };

    return { permission, requestPermission, isSupported };
};
