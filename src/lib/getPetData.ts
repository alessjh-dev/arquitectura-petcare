// src/lib/getPetData.ts
'use client';

import { useEffect, useState } from 'react';

type Pet = {
  id: string;
  name: string;
  photo: string | null; 
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
};

export function usePetData(pollInterval = 5000) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPet = async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) {
        if (res.status === 404) {
          setPet(null);
          setError("No hay mascota registrada. Por favor, configura una en Ajustes.");
          return;
        }
        throw new Error('Error al obtener datos de la mascota');
      }
      const data: Pet = await res.json();
      setPet(data);
    } catch (e: any) {
      setError(e.message);
      console.error("Error al obtener datos de la mascota:", e);
    }
  };

  useEffect(() => {
    fetchPet();
    const interval = setInterval(fetchPet, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return { pet, error };
}