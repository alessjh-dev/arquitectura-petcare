// src/app/api/activity/route.ts
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
    let activityNotificationMessage: string | null = null;

    if (isActivityDetected === true) {
      const eventTimestamp = new Date(recordedAt); // Esto ya debería ser un objeto Date en UTC si el payload es ISO string

      // 1. Crear un nuevo evento de actividad en la base de datos
      activityEvent = await prisma.activityEvent.create({
        data: {
          petId: pet.id,
          timestamp: eventTimestamp, // Guardar directamente el objeto Date (Prisma lo maneja como timestamptz UTC)
          activityType: 'movement',
        },
      });

      // 2. Preparar la notificación, usando la hora local para la visualización del usuario
      // Se formateará con la zona horaria del servidor o del navegador del usuario.
      const formattedTime = eventTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      activityNotificationMessage = `¡${pet.name || 'Tu mascota'} ha estado activa! Evento de movimiento detectado a las ${formattedTime}.`;

      // 3. Guardar esta notificación en la base de datos
      await prisma.notification.create({
        data: {
          type: 'activity',
          message: activityNotificationMessage,
        },
      });

      // 4. Actualizar el 'recordedAt' de la mascota, también con el timestamp original
      await prisma.pet.update({
        where: { id: pet.id },
        data: { recordedAt: eventTimestamp },
      });
    }

    return NextResponse.json({ message: "Actividad registrada", event: activityEvent, petName: pet.name });

  } catch (error) {
    console.error("Error en /api/activity:", error);
    return NextResponse.json({ error: "Error al registrar actividad" }, { status: 500 });
  }
}