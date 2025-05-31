// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, photo, birthDate, weight, breed } = await req.json(); // Añadidos nuevos campos

    if (!name) {
      return NextResponse.json({ error: "Falta campo obligatorio: name" }, { status: 400 });
    }

    let photoBuffer: Buffer | undefined;
    if (photo && typeof photo === 'string') {
      try {
        const base64Data = photo.includes(',') ? photo.split(',')[1] : photo;
        photoBuffer = Buffer.from(base64Data, 'base64');
      } catch (e) {
        console.error("Error al convertir foto a Buffer:", e);
        return NextResponse.json({ error: "Formato de foto inválido (no es base64)." }, { status: 400 });
      }
    }

    // Convertir la fecha de nacimiento a formato Date si viene
    let birthDateObj: Date | undefined;
    if (birthDate) {
      try {
        birthDateObj = new Date(birthDate);
        if (isNaN(birthDateObj.getTime())) { // Validar si la fecha es válida
          throw new Error('Fecha de nacimiento inválida.');
        }
      } catch (e) {
        return NextResponse.json({ error: "Formato de fecha de nacimiento inválido." }, { status: 400 });
      }
    }

    let pet = await prisma.pet.findFirst();
    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: name,
          photo: photoBuffer,
          birthDate: birthDateObj,
          weight: weight,
          breed: breed,
          recordedAt: new Date(),
        },
      });
      const petResponse = {
        ...pet,
        photo: pet.photo ? `data:image/jpeg;base64,${pet.photo.toString('base64')}` : null,
      };
      return NextResponse.json(petResponse, { status: 201 });
    }

    const updateData: any = { name: name };
    if (photoBuffer !== undefined) updateData.photo = photoBuffer;
    else if (photo === null) updateData.photo = null; // Permite borrar la foto

    if (birthDateObj !== undefined) updateData.birthDate = birthDateObj;
    else if (birthDate === null) updateData.birthDate = null; // Permite borrar la fecha

    if (weight !== undefined) updateData.weight = weight;
    else if (weight === null) updateData.weight = null;

    if (breed !== undefined) updateData.breed = breed;
    else if (breed === null) updateData.breed = null;

    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: updateData,
    });

    const petResponse = {
      ...updatedPet,
      photo: updatedPet.photo ? `data:image/jpeg;base64,${updatedPet.photo.toString('base64')}` : null,
      birthDate: updatedPet.birthDate ? updatedPet.birthDate.toISOString().split('T')[0] : null, // Formato 'YYYY-MM-DD'
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
      photo: pet.photo ? `data:image/jpeg;base64,${pet.photo.toString('base64')}` : null,
      birthDate: pet.birthDate ? pet.birthDate.toISOString().split('T')[0] : null, // Devuelve en 'YYYY-MM-DD'
    };
    return NextResponse.json(petResponse);
  } catch (error) {
    console.error("Error en GET /api/data:", error);
    return NextResponse.json({ error: "Error al obtener datos de la mascota" }, { status: 500 });
  }
}