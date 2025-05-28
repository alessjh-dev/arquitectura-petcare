// public/sw.js
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received!'); // Nuevo log
  let data;
  try {
    data = event.data.json(); // Intentamos parsear como JSON
    console.log('[SW] Push data parsed as JSON:', data); // Nuevo log
  } catch (e) {
    // Si falla, intentamos leerlo como texto plano para ver qué es
    const rawText = event.data.text();
    console.error('[SW] Failed to parse push data as JSON. Raw text:', rawText, 'Error:', e); // Nuevo log
    // Puedes establecer un data por defecto o simplemente no mostrar nada
    data = { title: 'Notificación', body: rawText || 'Contenido desconocido' };
  }

  const title = data.title || 'Smart Pet Care Notification';
  const options = {
    body: data.body,
    icon: '/icon-192.png', // Asegúrate de que esta ruta sea correcta y el archivo exista
    badge: '/icon-192.png', // Asegúrate de que esta ruta sea correcta y el archivo exista
    vibrate: [200, 100, 200],
    data: {
      url: '/notifications',
    },
  };

  console.log('[SW] Showing notification with title:', title, 'and options:', options); // Nuevo log

  event.waitUntil(
    self.registration.showNotification(title, options)
    .then(() => console.log('[SW] Notification shown successfully.')) // Nuevo log
    .catch(err => console.error('[SW] Error showing notification:', err)) // Nuevo log
  );
});

// ... (resto de tu sw.js, incluyendo 'install' y 'activate' listeners) ...