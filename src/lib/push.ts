// src/lib/push.ts
import webPush from 'web-push';

// ¡IMPORTANTE! Asegúrate que estas claves son las que generaste para tu aplicación
// y que la clave pública coincide con la que usas en el frontend (ServiceWorkerRegister.tsx)
const publicVapidKey = 'BBsrHT8P6ztE2drbOdMfp7gyd4yfyGiCH5PKjnp4kzSn_9pXYyN6vOLfX22Vz2tpWhhU-JpOtpsmknMkQqXDsiY';
const privateVapidKey = 'lo2eMRdWD1fT3Wl3e4mp08xuHwCIoi_TWItHLDZ03Mo';

webPush.setVapidDetails('mailto:tuemail@dominio.com', publicVapidKey, privateVapidKey);

export async function sendNotification(subscription: any, payload: string) {
  try {
    await webPush.sendNotification(subscription, payload);
    console.log('Notificación push enviada con éxito.'); // Agregado para depuración
  } catch (error: any) {
    console.error('Error enviando notificación push:', error);
    // Manejo específico de errores, por ejemplo, si la suscripción ya no es válida
    if (error.statusCode === 410) { // GONE: la suscripción ya no es válida (el usuario la desactivó, etc.)
      console.log('Suscripción inválida, eliminando de la base de datos:', subscription.endpoint);
      // Aquí podrías agregar lógica para eliminar la suscripción de tu base de datos
      // await prisma.pushSubscription.delete({ where: { endpoint: subscription.endpoint } });
    }
  }
}