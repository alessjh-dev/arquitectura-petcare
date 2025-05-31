// src/app/api/activity-stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, format } from 'date-fns';

export async function GET() {
  try {
    const pet = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada para obtener estadísticas" }, { status: 404 });
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Datos para la TARJETA PRINCIPAL DE ACTIVIDAD (solo hoy)
    const todayActivityEvents = await prisma.activityEvent.findMany({
      where: {
        petId: pet.id,
        timestamp: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const totalActivityEventsToday = todayActivityEvents.length;
    const lastActivityEventToday = todayActivityEvents.length > 0 ? todayActivityEvents[0].timestamp : null;


    // 2. Datos para la TARJETA DE ESTADÍSTICAS DIARIAS (últimos 7 días)
    const allActivityEvents = await prisma.activityEvent.findMany({ // Obtenemos TODOS los eventos
      where: { petId: pet.id },
      orderBy: { timestamp: 'desc' },
    });

    const dailyStats: { date: string; count: number; totalEvents: number }[] = [];
    for (let i = 0; i < 7; i++) { // Bucle para los últimos 7 días
      const day = new Date(today);
      day.setDate(today.getDate() - i); // Retrocede un día en cada iteración

      const start = startOfDay(day);
      const end = endOfDay(day);

      const eventsOnDay = allActivityEvents.filter((event: any) =>
        event.timestamp >= start && event.timestamp <= end
      );

      dailyStats.push({
        date: format(day, 'MMM dd'),
        count: eventsOnDay.length,
        totalEvents: eventsOnDay.length,
      });
    }


    return NextResponse.json({
      petName: pet.name,
      // Devuelve los datos de HOY (para PetActivityCard)
      totalActivityEvents: totalActivityEventsToday,
      lastActivityTimestamp: lastActivityEventToday,
      // Devuelve los datos de los ÚLTIMOS 7 DÍAS (para ActivityStatsCard)
      dailyActivity: dailyStats.reverse(), // Reverse para que el día más antiguo esté primero en la gráfica
    });

  } catch (error) {
    console.error("Error en GET /api/activity-stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas de actividad" }, { status: 500 });
  }
}