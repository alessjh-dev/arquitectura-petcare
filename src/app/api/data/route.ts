import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, photo } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Falta campo obligatorio: name" }, { status: 400 });
    }

    let photoBuffer: Buffer | undefined;
    if (photo && typeof photo === 'string') {
      try {
        photoBuffer = Buffer.from(photo, 'base64');
      } catch (e) {
        console.error("Error al convertir foto a Buffer:", e);
        return NextResponse.json({ error: "Formato de foto inválido (no es base64)." }, { status: 400 });
      }
    }

    let pet = await prisma.pet.findFirst();
    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: name,
          photo: photoBuffer, 
          recordedAt: new Date(),
        },
      });
      return NextResponse.json(pet, { status: 201 });
    }

    const updateData: any = { name: name };
    if (photoBuffer !== undefined) { 
      updateData.photo = photoBuffer;
    } else if (photo === null) { 
      updateData.photo = null;
    }

    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: updateData,
    });

    const petResponse = {
      ...updatedPet,
      photo: updatedPet.photo && Buffer.isBuffer(updatedPet.photo) ? updatedPet.photo.toString('base64') : updatedPet.photo ?? null,
    };

    return NextResponse.json(petResponse);
  } catch (error) {
    console.error("Error en /api/data:", error);
    return NextResponse.json({ error: "Error al gestionar datos de la mascota" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pet = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada" }, { status: 404 });
    }
    const petResponse = {
      ...pet,
      photo: pet.photo && Buffer.isBuffer(pet.photo) ? pet.photo.toString('base64') : pet.photo ?? null,
    };
    return NextResponse.json(petResponse);
  } catch (error) {
    console.error("Error en GET /api/data:", error);
    return NextResponse.json({ error: "Error al obtener datos de la mascota" }, { status: 500 });
  }
}