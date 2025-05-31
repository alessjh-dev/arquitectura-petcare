import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { isActivityDetected, recordedAt } = await req.json();

    if (!recordedAt || isActivityDetected === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios: isActivityDetected, recordedAt" }, { status: 400 });
    }

    const pet = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada para registrar actividad." }, { status: 404 });
    }

    let activityEvent = null;
    let activityNotification = null;

    if (isActivityDetected === true) {
      activityEvent = await prisma.activityEvent.create({
        data: {
          petId: pet.id,
          timestamp: new Date(recordedAt), // Usa directamente el recordedAt del cliente
          activityType: 'movement',
        },
      });

      // --- MODIFICACIÓN CLAVE AQUÍ ---
      // Elimina la parte de formateo de la hora del mensaje
      // Ahora, el mensaje solo dirá que se detectó actividad, sin la hora.
      activityNotification = {
        type: 'activity',
        message: `¡${pet.name || 'Tu mascota'} ha estado activo! Evento de movimiento detectado.`,
        title: 'Smart Pet Care: ¡Actividad Detectada!',
      };

      await prisma.notification.create({
        data: {
          type: activityNotification.type,
          message: activityNotification.message, // Este mensaje ahora NO incluye la hora
          // La columna 'timestamp' de la notificación debería guardar el `recordedAt` original
          timestamp: new Date(recordedAt), 
        },
      });

      await prisma.pet.update({
        where: { id: pet.id },
        data: { recordedAt: new Date(recordedAt) },
      });
    }

    return NextResponse.json({ message: "Actividad registrada", event: activityEvent, petName: pet.name });

  } catch (error) {
    console.error("Error en /api/activity:", error);
    return NextResponse.json({ error: "Error al registrar actividad" }, { status: 500 });
  }
}