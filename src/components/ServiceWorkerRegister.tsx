// src/components/ServiceWorkerRegister.tsx
'use client';

import { useEffect } from 'react';

// Asegúrate que esta clave pública VAPID coincide con la de src/lib/push.ts
const VAPID_PUBLIC_KEY = 'BBsrHT8P6ztE2drbOdMfp7gyd4yfyGiCH5PKjnp4kzSn_9pXYyN6vOLfX22Vz2tpWhhU-JpOtpsmknMkQqXDsiY'; // ¡DEBE SER LA MISMA QUE EN src/lib/push.ts!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Comprobamos si el navegador soporta Service Workers y Push API
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('El navegador no soporta Service Workers o Push API.');
      return;
    }

    // Pedir permiso para notificaciones
    Notification.requestPermission().then(async (permission) => {
      if (permission !== 'granted') {
        console.log('Permiso de notificación denegado.');
        return;
      }

      try {
        // Registrar el Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);

        // Obtener la suscripción actual o crear una nueva
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          console.log('No hay suscripción push existente, creando una nueva...');
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          console.log('Nueva suscripción push creada:', subscription);

          // Enviar la suscripción al servidor para guardarla
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          });
          console.log('Suscripción enviada al backend.');
        } else {
          console.log('Suscripción push existente:', subscription);
          // Opcional: Re-enviar la suscripción al backend en cada carga para asegurar que esté actualizada
          // await fetch('/api/subscribe', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(subscription),
          // });
        }
      } catch (error) {
        console.error('Error en el proceso de Service Worker o Push:', error);
      }
    });
  }, []);

  return null;
}