
'use client';

import React, { useEffect, useState } from 'react';
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
  const { pet, error: petError } = usePetData(10000);
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
    fetchActivityStats();
    const interval = setInterval(fetchActivityStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (petError || statsError) {
    return <p className="text-center text-red-500 py-10">Error: {petError || statsError}</p>;
  }

  if (!pet || loadingStats) {
    return <p className="text-center py-10">Cargando datos de actividad...</p>;
  }

  return (
    <div className="container mx-auto p-4 pb-20 grid auto-rows-auto gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      <PetActivityCard
        petName={activityStats?.petName || pet.name}
        totalActivityEvents={activityStats?.totalActivityEvents ?? 0}
        lastActivityTimestamp={activityStats?.lastActivityTimestamp?.toString()}
      />

      {activityStats && activityStats.dailyActivity && (
        <ActivityStatsCard dailyActivity={activityStats.dailyActivity} />
      )}

      {activityStats && (
        <TotalActivityCard totalEvents={activityStats.totalActivityEvents} />
      )}

      {/* Otros widgets comentados */}
      {/*
      <FoodCard mealsToday={pet.meals} />
      <WaterCard waterLevel={pet.water} />
      <EnvironmentCard humidity={pet.humidity} temperature={pet.temperature} />
      */}
    </div>
  );
}