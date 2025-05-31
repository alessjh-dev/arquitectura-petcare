// src/sw.ts (Tu lógica personalizada del Service Worker)

/// <reference lib="webworker" /> // <-- ¡AÑADE ESTA LÍNEA AL PRINCIPIO!

// --- Tu Lógica Custom para Notificaciones Push ---
self.addEventListener('push', (event) => { // PushEvent ya debería ser reconocido
  console.log('[SW] Push event received!');
  let data;
  try {
    data = event.data.json();
    console.log('[SW] Push data parsed as JSON:', data);
  } catch (e) {
    const rawText = event.data.text();
    console.error('[SW] Failed to parse push data as JSON. Raw text:', rawText, 'Error:', e);
    data = { title: 'Notificación', body: rawText || 'Contenido desconocido' };
  }

  const title = data.title || 'Smart Pet Care Notification';
  const options = { // NotificationOptions ya debería ser reconocido
    body: data.body,
    icon: '/icon-192.png', // Asegúrate de que este archivo exista en public/
    badge: '/icon-192.png', // Asegúrate de que este archivo exista en public/
    vibrate: [200, 100, 200],
    data: {
      url: '/notifications', // URL a abrir al hacer clic en la notificación
    },
  };

  console.log('[SW] Showing notification with title:', title, 'and options:', options);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown successfully.'))
      .catch(err => console.error('[SW] Error showing notification:', err))
  );
});

self.addEventListener('notificationclick', (event) => { // NotificationEvent ya debería ser reconocido
  event.notification.close();
  // 'clients.openWindow' es parte del API de Service Worker, debería ser reconocido con 'WebWorker' lib.
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// --- Puntos de Inyección de Workbox/next-pwa ---
// No añadas aquí nada más. `next-pwa` se encargará de inyectar
// `precacheAndRoute(self.__WB_MANIFEST);`, `cleanupOutdatedCaches();`, `clientsClaim();`
// y las rutas de cacheo que configuraste en next.config.ts.
// Tu lógica custom es lo único que necesitas en este archivo.