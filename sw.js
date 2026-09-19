/**
 * Focus Shop - Service Worker for Cross-Platform Web Push Notifications
 * Supports Android (Chrome/Samsung), iOS 16.4+ (Safari), and Desktop Browsers
 */

const CACHE_NAME = 'focus-shop-v1';

// Install
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) 
        ? event.notification.data.url 
        : 'index.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If already open, focus and navigate
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ('focus' in client) {
                    client.focus();
                    if ('navigate' in client && targetUrl) {
                        return client.navigate(targetUrl);
                    }
                    return;
                }
            }
            // If not open, open new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// Handle Push Event (if sent from backend or Web Push service)
self.addEventListener('push', (event) => {
    let data = {
        title: 'متجر فوكس 🛒',
        body: 'وصلت عروض وتخفيضات حصرية جديدة في المتجر!',
        icon: 'logo.svg',
        badge: 'logo.svg',
        url: 'index.html#featured'
    };

    if (event.data) {
        try {
            data = Object.assign(data, event.data.json());
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || 'logo.svg',
        badge: data.badge || 'logo.svg',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || 'index.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
