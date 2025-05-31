// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/push';

export async function POST(req: Request) {
  try {
    // Desestructuramos la actividad como un booleano (isActivityDetected)
    const { name, meals, water, humidity, temperature, activity: isActivityDetected, recordedAt } = await req.json();

    if (!recordedAt) {
      return NextResponse.json({ error: "Falta campo obligatorio: recordedAt" }, { status: 400 });
    }

    let pet = await prisma.pet.findFirst();
    if (!pet) {
      // Si no hay mascota, la creamos con valores iniciales
      // Si isActivityDetected es true, iniciamos activity en 1, de lo contrario en 0
      pet = await prisma.pet.create({
        data: {
          name: name || "Mi Mascota",
          meals: meals ?? 0,
          water: water ?? 100,
          humidity: humidity ?? 50,
          temperature: temperature ?? 25,
          activity: isActivityDetected ? 1 : 0, // Ajuste para actividad inicial
          recordedAt: new Date(recordedAt),
        },
      });
      return NextResponse.json(pet, { status: 201 });
    }

    const updateData: any = { recordedAt: new Date(recordedAt) };
    const notificationsToSend = [];

    if (name !== undefined) updateData.name = name;
    if (meals !== undefined) {
      updateData.meals = meals;
      if (meals > pet.meals) {
        notificationsToSend.push({
          type: 'food',
          message: `¡${pet.name || 'Tu mascota'} ha comido ${meals} veces hoy!`,
          title: 'Smart Pet Care: ¡Comida Dispensada!',
        });
      }
    }

    if (water !== undefined) {
      updateData.water = water;
      if (water < 20) {
        notificationsToSend.push({
          type: 'water',
          message: `¡ALERTA! El nivel de agua de ${pet.name || 'tu mascota'} está críticamente bajo (${water}%).`,
          title: 'Smart Pet Care: ¡Agua Baja!',
        });
      }
    }

    if (humidity !== undefined) updateData.humidity = humidity;

    if (temperature !== undefined) {
      updateData.temperature = temperature;
      if (temperature > 30) {
        notificationsToSend.push({
          type: 'alert',
          message: `¡ALERTA! La temperatura del ambiente es alta (${temperature}°C).`,
          title: 'Smart Pet Care: ¡Temperatura Elevada!',
        });
      }
    }

    // --- Lógica de Actividad Modificada ---
    if (isActivityDetected === true) {
      updateData.activity = pet.activity + 1; // Suma 1 a la actividad existente
      // Opcional: Notificación si hay actividad detectada
      // notificationsToSend.push({
      //   type: 'activity',
      //   message: `¡${pet.name || 'Tu mascota'} ha estado activo! Actividad total: ${updateData.activity}.`,
      //   title: 'Smart Pet Care: ¡Actividad Detectada!',
      // });
    } else if (isActivityDetected === false) {
      // Si recibes 'false' y quieres resetear o mantener, puedes hacerlo aquí
      // Por ejemplo, para mantener el valor, no hagas nada.
      // O para resetear diariamente, necesitarías más lógica con la fecha.
      // updateData.activity = pet.activity; // Si quieres que no cambie si es false
    }
    // --- Fin de la Lógica de Actividad Modificada ---

    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: updateData,
    });

    for (const notif of notificationsToSend) {
      await prisma.notification.create({
        data: {
          type: notif.type,
          message: notif.message,
        },
      });

      const subscriptions = await prisma.pushSubscription.findMany();
      const payload = JSON.stringify({ title: notif.title, body: notif.message });
      await Promise.all(subscriptions.map((sub: any) => sendNotification(sub, payload)));
    }

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error("Error en /api/data:", error);
    return NextResponse.json({ error: "Error al guardar o procesar datos" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pet = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada" }, { status: 404 });
    }
    return NextResponse.json(pet);
  } catch (error) {
    console.error("Error en GET /api/data:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}