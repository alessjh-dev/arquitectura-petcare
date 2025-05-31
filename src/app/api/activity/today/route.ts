import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const recordedAt = now.toISOString(); 

    const postBody = {
      isActivityDetected: true,
      recordedAt: recordedAt,
    };

    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { message: 'Error de configuración: BASE_URL no definida en las variables de entorno.' },
        { status: 500 }
      );
    }

    const response = await fetch(`${baseUrl}/api/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al llamar al servicio POST /api/activity:', errorData);
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