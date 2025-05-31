// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/push';

export async function POST(req: Request) {
  try {
    const { name, meals, water, humidity, temperature, activity: isActivityDetected, recordedAt } = await req.json();

    if (!recordedAt) {
      return NextResponse.json({ error: "Falta campo obligatorio: recordedAt" }, { status: 400 });
    }

    let pet = await prisma.pet.findFirst();
    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: name || "Mi Mascota",
          meals: meals ?? 0,
          water: water ?? 100,
          humidity: humidity ?? 50,
          temperature: temperature ?? 25,
          activity: isActivityDetected ? 1 : 0,
          recordedAt: new Date(recordedAt),
        },
      });
      return NextResponse.json(pet, { status: 201 });
    }

    const updateData: any = { recordedAt: new Date(recordedAt) };
    const notificationsToSaveToDb = []; // Ahora solo para guardar en DB
    let activityNotification: { type: string; message: string; title: string } | null = null; // Solo una para push

    if (name !== undefined) updateData.name = name;
    if (meals !== undefined) {
      updateData.meals = meals;
      if (meals > pet.meals) {
        notificationsToSaveToDb.push({
          type: 'food',
          message: `¡${pet.name || 'Tu mascota'} ha comido ${meals} veces hoy!`,
          title: 'Smart Pet Care: ¡Comida Dispensada!', // Aunque no se enviará como push
        });
      }
    }

    if (water !== undefined) {
      updateData.water = water;
      if (water < 20) {
        notificationsToSaveToDb.push({
          type: 'water',
          message: `¡ALERTA! El nivel de agua de ${pet.name || 'tu mascota'} está críticamente bajo (${water}%).`,
          title: 'Smart Pet Care: ¡Agua Baja!', // Aunque no se enviará como push
        });
      }
    }

    if (humidity !== undefined) updateData.humidity = humidity;

    if (temperature !== undefined) {
      updateData.temperature = temperature;
      if (temperature > 30) {
        notificationsToSaveToDb.push({
          type: 'alert',
          message: `¡ALERTA! La temperatura del ambiente es alta (${temperature}°C).`,
          title: 'Smart Pet Care: ¡Temperatura Elevada!', // Aunque no se enviará como push
        });
      }
    }

    // --- Lógica de Actividad Modificada ---
    if (isActivityDetected === true) {
      updateData.activity = pet.activity + 1; // Suma 1 a la actividad existente
      // ¡Esta es la ÚNICA notificación que queremos enviar como push!
      activityNotification = {
        type: 'activity',
        message: `¡${pet.name || 'Tu mascota'} ha estado activa! Actividad total: ${updateData.activity}.`,
        title: 'Smart Pet Care: ¡Actividad Detectada!',
      };
      notificationsToSaveToDb.push(activityNotification); // También la guardamos en DB
    } else if (isActivityDetected === false) {
      // Si recibes 'false', no hacemos nada con activity por ahora.
      // updateData.activity = pet.activity; // Mantiene el valor actual si no hay actividad
    }
    // --- Fin de la Lógica de Actividad Modificada ---

    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: updateData,
    });

    // Guardar TODAS las notificaciones generadas en la base de datos
    for (const notif of notificationsToSaveToDb) {
      await prisma.notification.create({
        data: {
          type: notif.type,
          message: notif.message,
        },
      });
    }

    if (activityNotification) {
      const subscriptions = await prisma.pushSubscription.findMany();
      const payload = JSON.stringify({ title: activityNotification.title, body: activityNotification.message });
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