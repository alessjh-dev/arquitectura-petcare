// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import PetInfoCard from '@/components/dashboard/PetInfoCard'; // Nueva tarjeta de información de la mascota
import PetActivityCard from '@/components/dashboard/PetActivityCard';
import ActivityStatsCard from '@/components/dashboard/ActivityStatsCard';
import TotalActivityCard from '@/components/dashboard/TotalActivityCard';
import { usePetData } from '@/lib/getPetData';

interface ActivityStats {
  petName: string;
  totalActivityEvents: number;
  lastActivityTimestamp: string | null;
  dailyActivity: { date: string; count: number; totalEvents: number }[];
}

export default function HomePageClient() {
  const { pet, error: petError } = usePetData(); // Ya no necesita pollInterval
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchActivityStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await fetch('/api/activity/stats');
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No hay datos de mascota registrados para las estadísticas.');
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
    fetchActivityStats();
    const interval = setInterval(fetchActivityStats, 10000); // Polling para las stats
    return () => clearInterval(interval);
  }, []);

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

      {/* 2. Tarjeta principal de actividad */}
      <PetActivityCard
        petName={activityStats?.petName || pet.name}
        totalActivityEvents={activityStats?.totalActivityEvents ?? 0}
        lastActivityTimestamp={activityStats?.lastActivityTimestamp?.toString()}
      />

      {/* 3. Tarjeta de Estadísticas Diarias */}
      {activityStats && activityStats.dailyActivity && (
        <ActivityStatsCard dailyActivity={activityStats.dailyActivity} />
      )}

      {/* 4. Tarjeta de Total de Actividad (Rediseñada) */}
      {activityStats && (
        <TotalActivityCard totalEvents={activityStats.totalActivityEvents} />
      )}
    </div>
  );
}