// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/push'; 

export async function POST(req: Request) {
  try {
    const { name, meals, water, humidity, temperature, activity, recordedAt } = await req.json();

    if (!recordedAt) {
      return NextResponse.json({ error: "Falta campo obligatorio: recordedAt" }, { status: 400 });
    }

    let pet = await prisma.pet.findFirst();
    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: name || "Mi Mascota",
          meals: meals || 0,
          water: water || 100,
          humidity: humidity || 50,
          temperature: temperature || 25,
          activity: activity || 0,
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
          message: '¡Tu mascota ha comido!',
          title: 'Smart Pet Care: ¡Hora de comer!',
        });
      }
    }

    if (water !== undefined) {
      updateData.water = water;
      if (water < 20) { 
        notificationsToSend.push({
          type: 'water',
          message: 'Nivel de agua críticamente bajo. ¡Rellénalo!',
          title: 'Smart Pet Care: ¡Alerta de Agua!',
        });
      }
    }

    if (humidity !== undefined) updateData.humidity = humidity;

    if (temperature !== undefined) {
      updateData.temperature = temperature;
      if (temperature > 30) { 
        notificationsToSend.push({
          type: 'alert',
          message: '¡Temperatura ambiente elevada! Revisa a tu mascota.',
          title: 'Smart Pet Care: ¡Alerta de Temperatura!',
        });
      }
    }

    if (activity !== undefined) updateData.activity = activity;

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