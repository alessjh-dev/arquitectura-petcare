// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Obtener todas las notificaciones
export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        timestamp: 'desc', // Ordenar por las más recientes primero
      },
      take: 100, // Limitar a las 100 notificaciones más recientes
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 });
  }
}

// POST: Marcar una o varias notificaciones como leídas
export async function POST(req: Request) {
  try {
    const { id, isRead, ids } = await req.json();

    if (id) { // Marcar una sola notificación
      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { isRead: isRead ?? true },
      });
      return NextResponse.json(updatedNotification);
    } else if (ids && Array.isArray(ids)) { // Marcar múltiples notificaciones
      await prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { isRead: isRead ?? true },
      });
      return NextResponse.json({ message: 'Notificaciones actualizadas' });
    }

    return NextResponse.json({ error: "ID o IDs de notificación requeridos" }, { status: 400 });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    return NextResponse.json({ error: "Error al actualizar notificación" }, { status: 500 });
  }
}

// DELETE: Eliminar todas las notificaciones
export async function DELETE() {
  try {
    await prisma.notification.deleteMany();
    return NextResponse.json({ message: 'Todas las notificaciones eliminadas' });
  } catch (error) {
    console.error("Error al eliminar notificaciones:", error);
    return NextResponse.json({ error: "Error al eliminar notificaciones" }, { status: 500 });
  }
}