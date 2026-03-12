// Custom Service Worker logic for Push Notifications and extra PWA features
console.log('📬 Custom SW script loaded');

// Handle Push events
self.addEventListener('push', (event) => {
    console.log('📢 Push event received', event);

    let data = { title: 'Notificação LG TecServ', body: 'Nova atualização no sistema.' };
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'Notificação', body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Detalhes',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/icons/icon-96x96.png'
            },
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle Notification click
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked', event.notification.tag);
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Extra: Background Sync log
self.addEventListener('sync', (event) => {
    if (event.tag === 'supabase-queue') {
        console.log('🔄 Background Sync: Sincronizando dados pendentes...');
    }
});
