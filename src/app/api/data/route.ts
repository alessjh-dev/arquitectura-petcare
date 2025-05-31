// src/app/api/data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Función helper para convertir varios tipos de datos binarios a Buffer
// Esto maneja Buffer, Uint8Array y el formato problemático de string con comas.
function ensureBuffer(data: any): Buffer | null {
  if (data instanceof Buffer) {
    return data;
  }
  if (data instanceof Uint8Array) { // <--- CAMBIO CLAVE: Manejar Uint8Array
    return Buffer.from(data);
  }
  // Este caso es para el formato de string '137,80,78,71,...' que viste.
  // Es una forma de parchear datos que quizás se guardaron incorrectamente en el pasado.
  if (typeof data === 'string' && data.includes(',')) {
    try {
      const bytes = data.split(',').map(Number);
      const validBytes = bytes.filter(byte => !isNaN(byte));
      return Buffer.from(validBytes);
    } catch (e) {
      console.error("Error al parsear string de bytes a Buffer:", e);
      return null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { name, photo, birthDate, weight, breed } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Falta campo obligatorio: name" }, { status: 400 });
    }

    let photoBuffer: Buffer | null = null;
    // Por defecto, asumimos 'image/jpeg' o 'image/png' ya que son los 'accept' del input file.
    // Lo ideal en un sistema robusto sería guardar el mimeType en la DB.
    let photoMimeType: string = 'image/jpeg'; 

    if (photo && typeof photo === 'string') {
      try {
        const parts = photo.split(';');
        const mimeTypePart = parts[0];
        const dataPart = parts[1];

        if (!dataPart || !mimeTypePart.startsWith('data:')) {
          throw new Error('Formato de Data URL inválido en la entrada.');
        }

        photoMimeType = mimeTypePart.split(':')[1]; // Ej: 'image/jpeg' o 'image/png'
        const base64Data = dataPart.split(',')[1]; // Esta es la cadena base64 pura

        if (!base64Data) {
            throw new Error('No se encontraron datos base64 en la URL de datos.');
        }

        photoBuffer = Buffer.from(base64Data, 'base64');
        // photoBuffer ahora es un Buffer de Node.js listo para ser guardado en la DB
      } catch (e) {
        console.error("Error al convertir foto a Buffer (POST entrada):", e);
        return NextResponse.json({ error: `Formato de foto inválido o error en conversión: ${(e as Error).message}` }, { status: 400 });
      }
    } else if (photo === null) {
      photoBuffer = null; // Si se envió 'null', significa eliminar la foto
    }
    // Si photo es undefined, no se actualiza la foto (el campo photo no se incluye en updateData)


    let birthDateObj: Date | undefined;
    if (birthDate) {
      try {
        birthDateObj = new Date(birthDate);
        if (isNaN(birthDateObj.getTime())) {
          throw new Error('Fecha de nacimiento inválida.');
        }
      } catch (e) {
        return NextResponse.json({ error: "Formato de fecha de nacimiento inválido." }, { status: 400 });
      }
    }

    let pet: any | null = await prisma.pet.findFirst();

    if (!pet) {
      // Si no hay mascota, la creamos
      pet = await prisma.pet.create({
        data: {
          name: name,
          photo: photoBuffer, // Aquí se guarda el Buffer real o null
          birthDate: birthDateObj,
          weight: weight,
          breed: breed,
          recordedAt: new Date(),
        },
      });
      // Convertir la foto para la respuesta JSON
      const petPhotoBuffer = ensureBuffer(pet.photo);
      const petResponse = {
        ...pet,
        // Usar el photoMimeType que se detectó al subir, o un default
        photo: petPhotoBuffer ? `data:${photoMimeType};base64,${petPhotoBuffer.toString('base64')}` : null,
      };
      return NextResponse.json(petResponse, { status: 201 });
    }

    // Si ya existe una mascota, la actualizamos
    const updateData: any = { name: name };
    // Solo actualiza la foto si se envió una nueva foto (o null para eliminar)
    if (photoBuffer !== undefined) { 
        updateData.photo = photoBuffer;
    } else if (photo === null) { // Si photo es explícitamente null, borrar la foto.
        updateData.photo = null;
    }


    if (birthDateObj !== undefined) updateData.birthDate = birthDateObj;
    else if (birthDate === null) updateData.birthDate = null;

    if (weight !== undefined) updateData.weight = weight;
    else if (weight === null) updateData.weight = null;

    if (breed !== undefined) updateData.breed = breed;
    else if (breed === null) updateData.breed = null;

    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: updateData,
    });

    // Convertir la foto para la respuesta JSON
    const updatedPetPhotoBuffer = ensureBuffer(updatedPet.photo);
    const petResponse = {
      ...updatedPet,
      // Usar el photoMimeType que se detectó al actualizar, o un default.
      // Aquí asumo PNG por tu log, si subes JPGs, el photoMimeType de la solicitud actual es mejor.
      photo: updatedPetPhotoBuffer ? `data:${photoMimeType};base64,${updatedPetPhotoBuffer.toString('base64')}` : null,
      birthDate: updatedPet.birthDate ? updatedPet.birthDate.toISOString().split('T')[0] : null,
    };

    return NextResponse.json(petResponse);
  } catch (error) {
    console.error("Error en /api/data:", error);
    return NextResponse.json({ error: "Error al gestionar datos de la mascota" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pet: any | null = await prisma.pet.findFirst();
    if (!pet) {
      return NextResponse.json({ error: "No hay mascota registrada" }, { status: 404 });
    }

    // Aseguramos que pet.photo es un Buffer antes de intentar convertirlo a base64
    const petPhotoBuffer = ensureBuffer(pet.photo);

    const petResponse = {
      ...pet,
      // Asume 'image/png' para la recuperación de imágenes existentes.
      // Si usas JPGs, deberías haber guardado el MIME type junto con la imagen en la DB.
      photo: petPhotoBuffer ? `data:image/png;base64,${petPhotoBuffer.toString('base64')}` : null,
      birthDate: pet.birthDate ? pet.birthDate.toISOString().split('T')[0] : null,
    };
    return NextResponse.json(petResponse);
  } catch (error) {
    console.error("Error en GET /api/data:", error);
    return NextResponse.json({ error: "Error al obtener datos de la mascota" }, { status: 500 });
  }
}