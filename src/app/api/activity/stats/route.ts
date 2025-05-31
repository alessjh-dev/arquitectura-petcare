// src/app/api/activity-stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Eliminamos: import { startOfDay, endOfDay, format } from 'date-fns';
// Eliminamos: import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export async function GET(req: Request) {
  try {
    const pet = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada para obtener estadísticas" }, { status: 404 });
    }

    // --- CÁLCULO SIMPLIFICADO DE FECHAS EN UTC ---
    const now = new Date(); // Hora actual del servidor (presumiblemente UTC en Vercel)

    // Para obtener el inicio de "hoy" en UTC:
    // Creamos una nueva fecha con el año, mes y día actual de 'now' en UTC, y la hora a 00:00:00.000 UTC
    const startOfTodayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    
    // Para obtener el fin de "hoy" en UTC:
    // Es el inicio de mañana en UTC, o el inicio de hoy + 24 horas
    const endOfTodayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    // Alternativamente, puedes hacer: new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000);

    console.log('--- Depuración de Fechas Simplificadas ---');
    console.log('Fecha y hora actual (servidor UTC):', now.toISOString());
    console.log('Inicio del día de hoy (UTC para consulta):', startOfTodayUtc.toISOString());
    console.log('Fin del día de hoy (UTC para consulta):', endOfTodayUtc.toISOString());
    console.log('-----------------------------------------');

    // 1. Datos para la TARJETA PRINCIPAL DE ACTIVIDAD (solo hoy en la zona horaria del usuario)
    // Nota: La consulta es en UTC. El front-end formateará a la zona horaria del usuario.
    const todayActivityEvents = await prisma.activityEvent.findMany({
      where: {
        petId: pet.id,
        timestamp: {
          gte: startOfTodayUtc,
          lt: endOfTodayUtc,   // Usamos 'lt' (less than) para evitar incluir eventos del inicio del día siguiente
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const totalActivityEventsToday = todayActivityEvents.length;
    const lastActivityEventToday = totalActivityEventsToday > 0 ? todayActivityEvents[0].timestamp : null;


    // 2. Datos para la TARJETA DE ESTADÍSTICAS DIARIAS (últimos 7 días en la zona horaria del usuario)
    const dailyStats: { date: string; count: number; totalEvents: number }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(now); // Copia la fecha actual en UTC
      day.setUTCDate(now.getUTCDate() - i); // Retrocede 'i' días en UTC

      const startOfDayIthDayUtc = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0));
      const endOfDayIthDayUtc = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1, 0, 0, 0, 0));
      
      const eventsOnDay = await prisma.activityEvent.count({ // count es más eficiente que findMany + filter
        where: {
          petId: pet.id,
          timestamp: {
            gte: startOfDayIthDayUtc,
            lt: endOfDayIthDayUtc,
          },
        },
      });

      // Formatear la fecha para la visualización (puede usar Intl.DateTimeFormat para más control de zona horaria)
      // Para simplicidad, usaremos toLocaleDateString que usa la zona horaria del ambiente de ejecución del cliente.
      const displayDate = new Date(startOfDayIthDayUtc); // La fecha en UTC
      dailyStats.push({
        date: displayDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }), // Ej. "may. 30"
        count: eventsOnDay,
        totalEvents: eventsOnDay,
      });
    }

    return NextResponse.json({
      petName: pet.name,
      totalActivityEvents: totalActivityEventsToday,
      lastActivityTimestamp: lastActivityEventToday,
      dailyActivity: dailyStats.reverse(), // Para que los días más antiguos estén al principio
    });

  } catch (error) {
    console.error("Error en GET /api/activity-stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas de actividad" }, { status: 500 });
  }
}