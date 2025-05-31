import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const timestamp = today.toISOString(); 

    const petId = 'some_default_pet_id'; 
    const activityType = 'movement'; 

    const postBody = {
      petId: petId,
      timestamp: timestamp,
      activityType: activityType,
    };

    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al llamar al servicio POST:', errorData);
      return NextResponse.json(
        { message: 'Error al registrar la actividad', error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error en el endpoint GET /api/activity-today:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}