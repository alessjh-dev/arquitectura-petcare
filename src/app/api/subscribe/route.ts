// src/app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: subscription.keys },
      create: subscription,
    });

    return NextResponse.json({ message: 'Suscripción guardada' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al guardar la suscripción' }, { status: 500 });
  }
}