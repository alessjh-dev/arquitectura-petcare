
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
          timestamp: new Date(recordedAt),
          activityType: 'movement',
        },
      });

      activityNotification = {
        type: 'activity',
        message: `¡${pet.name || 'Tu mascota'} ha estado activo! Evento de movimiento detectado a las ${new Date(recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}.`,
        title: 'Smart Pet Care: ¡Actividad Detectada!',
      };

      await prisma.notification.create({
        data: {
          type: activityNotification.type,
          message: activityNotification.message,
        },
      });

      await prisma.pet.update({
        where: { id: pet.id },
        data: { recordedAt: new Date(recordedAt) },
      });
    }

    if (activityNotification) {
      const subscriptions = await prisma.pushSubscription.findMany();
      const payload = JSON.stringify({ title: activityNotification.title, body: activityNotification.message });
    }

    return NextResponse.json({ message: "Actividad registrada", event: activityEvent, petName: pet.name });

  } catch (error) {
    console.error("Error en /api/activity:", error);
    return NextResponse.json({ error: "Error al registrar actividad" }, { status: 500 });
  }
}