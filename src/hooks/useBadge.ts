import { useEffect } from 'react';

export const useBadge = (count: number) => {
    useEffect(() => {
        if (!('setAppBadge' in navigator)) return;

        try {
            if (count > 0) {
                (navigator as any).setAppBadge(count);
            } else {
                (navigator as any).clearAppBadge();
            }
        } catch (err) {
            console.warn('Badge API not supported:', err);
        }
    }, [count]);
};
