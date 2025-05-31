// src/app/api/activity/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toZonedTime } from 'date-fns-tz'; // Instala esto: npm install date-fns-tz

// Instala date-fns-tz: npm install date-fns-tz

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
      // Convertir recordedAt a un objeto Date
      const recordDate = new Date(recordedAt);

      // Si recordedAt viene como fecha local desde el ESP32, es mejor convertirla a UTC explícitamente
      // Si el ESP32 ya envía una ISO string (ej. "2025-05-30T20:00:00Z"), ya es UTC y no se necesita conversión
      // Si no estás seguro, la forma más segura es siempre tratarla como UTC al guardar
      const timestampForDb = recordDate.toISOString(); // Almacenar siempre como ISO string (UTC)

      // 1. Crear un nuevo evento de actividad en la base de datos
      activityEvent = await prisma.activityEvent.create({
        data: {
          petId: pet.id,
          timestamp: new Date(timestampForDb), // Aseguramos que se guarda como UTC
          activityType: 'movement',
        },
      });

      // 2. Preparar la notificación, usando la hora local para la visualización del usuario
      // Asume tu zona horaria local, por ejemplo 'America/Guatemala'
      const userTimezone = 'America/Guatemala'; // ¡AJUSTA ESTO A TU ZONA HORARIA REAL!
      const localizedRecordedAt = toZonedTime(recordDate, userTimezone);
      const formattedTime = localizedRecordedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });


      activityNotificationMessage = `¡${pet.name || 'Tu mascota'} ha estado activa! Evento de movimiento detectado a las ${formattedTime}.`;

      // 3. Guardar esta notificación en la base de datos
      await prisma.notification.create({
        data: {
          type: 'activity',
          message: activityNotificationMessage,
        },
      });

      // 4. Actualizar el 'recordedAt' de la mascota, también en UTC
      await prisma.pet.update({
        where: { id: pet.id },
        data: { recordedAt: new Date(timestampForDb) },
      });
    }

    return NextResponse.json({ message: "Actividad registrada", event: activityEvent, petName: pet.name });

  } catch (error) {
    console.error("Error en /api/activity:", error);
    return NextResponse.json({ error: "Error al registrar actividad" }, { status: 500 });
  }
}