// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import PetInfoCard from '@/components/dashboard/PetInfoCard';
import PetActivityCard from '@/components/dashboard/PetActivityCard';
import ActivityStatsCard from '@/components/dashboard/ActivityStatsCard';
import TotalActivityCard from '@/components/dashboard/TotalActivityCard';
import { usePetData } from '@/lib/getPetData';

interface ActivityStats {
  petName: string;
  totalActivityEvents: number; // Eventos de HOY
  lastActivityTimestamp: string | null; // Último evento de HOY
  dailyActivity: { date: string; count: number; totalEvents: number }[]; // Eventos de los ÚLTIMOS 7 DÍAS
}

export default function HomePageClient() {
  const { pet, error: petError } = usePetData();
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchActivityStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await fetch('/api/activity-stats');
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No hay datos de mascota registrados para las estadísticas. Por favor, asegúrate de que haya una mascota y eventos de actividad.');
        }
        throw new Error('Error al cargar estadísticas de actividad.');
      }
      const data: ActivityStats = await res.json();
      setActivityStats(data);
    } catch (err: any) {
      setStatsError(err.message);
      console.error('Error al obtener estadísticas de actividad:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchActivityStats(); // Solo se llama una vez al montar el componente
    // Eliminamos: const interval = setInterval(fetchActivityStats, 10000);
    // Eliminamos: return () => clearInterval(interval);
  }, []); // Dependencias vacías para asegurar que se ejecute solo una vez

  if (petError || statsError) {
    return <p className="text-center text-red-500 py-10">Error: {petError || statsError}</p>;
  }

  if (!pet || loadingStats) {
    return <p className="text-center py-10">Cargando datos de la mascota y actividad...</p>;
  }

  return (
    <div className="container mx-auto p-4 pb-20 grid auto-rows-auto gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {/* 1. Tarjeta de Información de la Mascota */}
      <PetInfoCard
        petName={pet.name}
        petPhoto={pet.photo}
        birthDate={pet.birthDate}
        weight={pet.weight}
        breed={pet.breed}
      />

      {/* 2. Tarjeta principal de actividad (Eventos de HOY) */}
      <PetActivityCard
        petName={activityStats?.petName || pet.name}
        totalActivityEvents={activityStats?.totalActivityEvents ?? 0}
        lastActivityTimestamp={activityStats?.lastActivityTimestamp?.toString()}
      />

      {/* 3. Tarjeta de Estadísticas Diarias (Gráfica de barras de los últimos 7 días) */}
      {activityStats && activityStats.dailyActivity && (
        <ActivityStatsCard dailyActivity={activityStats.dailyActivity} />
      )}

      {/* 4. Tarjeta de Total de Actividad (acumulado general, esta tarjeta no recibe datos de la API de stats en este formato) */}
      {activityStats && (
        <TotalActivityCard totalEvents={activityStats.totalActivityEvents} />
      )}
    </div>
  );
}