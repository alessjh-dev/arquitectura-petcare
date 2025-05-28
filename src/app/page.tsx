'use client';

import React from 'react';
import PetActivityCard from '@/components/dashboard/PetActivityCard';
import { FoodCard } from '@/components/dashboard/FoodCard';
import WaterCard from '@/components/dashboard/WaterCard';
import EnvironmentCard from '@/components/dashboard/EnvironmentCard';
import { usePetData } from '@/lib/getPetData';
export default function HomePageClient() {
  const { pet, error } = usePetData(10000);

  if (error) return <p>Error: {error}</p>;
  if (!pet) return <p>Cargando...</p>;

  return (
    <div className="container mx-auto p-4 pb-20 grid auto-rows-auto gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      <FoodCard mealsToday={pet.meals} />
      <WaterCard waterLevel={pet.water} />
      <EnvironmentCard humidity={pet.humidity} temperature={pet.temperature} />
      <PetActivityCard petName={pet.name} activity={pet.activity} lastSeen={pet.updatedAt} />
    </div>
  );
}
