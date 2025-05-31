import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, format } from 'date-fns';

export async function GET() {
  try {
    const pet = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada para obtener estadísticas" }, { status: 404 });
    }

    const allActivityEvents = await prisma.activityEvent.findMany({
      where: { petId: pet.id },
      orderBy: { timestamp: 'desc' },
    });

    const dailyStats: { date: string; count: number; totalEvents: number }[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);

      const start = startOfDay(day);
      const end = endOfDay(day);

      const eventsToday = allActivityEvents.filter(event =>
        event.timestamp >= start && event.timestamp <= end
      );

      dailyStats.push({
        date: format(day, 'MMM dd'),
        count: eventsToday.length,
        totalEvents: eventsToday.length,
      });
    }

    const totalActivityEvents = allActivityEvents.length;
    const lastActivityEvent = allActivityEvents.length > 0 ? allActivityEvents[0].timestamp : null;

    return NextResponse.json({
      petName: pet.name,
      totalActivityEvents: totalActivityEvents,
      lastActivityTimestamp: lastActivityEvent,
      dailyActivity: dailyStats.reverse(),
    });

  } catch (error) {
    console.error("Error en GET /api/activity-stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas de actividad" }, { status: 500 });
  }
}