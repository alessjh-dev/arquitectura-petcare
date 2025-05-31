// src/components/dashboard/PetInfoCard.tsx
'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Image from 'next/image';
import { Camera, Calendar, Scale, PawPrint, BadgeIndianRupee } from 'lucide-react'; // BadgeIndianRupee por ejemplo, puedes elegir otro

interface PetInfoCardProps {
  petName?: string;
  petPhoto?: string | null;
  birthDate?: string | null; // YYYY-MM-DD
  weight?: number | null;
  breed?: string | null;
}

const PetInfoCard: React.FC<PetInfoCardProps> = ({
  petName = "Mi Mascota",
  petPhoto,
  birthDate,
  weight,
  breed,
}) => {
  const getAge = (dob: string) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} años` : "N/A";
  };

  return (
    <Card title="Información de la Mascota" className="md:col-span-2 lg:col-span-2">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-4">
        {/* Sección de Foto */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl flex-shrink-0 bg-muted flex items-center justify-center">
          {petPhoto ? (
            <Image
              src={petPhoto}
              alt={`Foto de ${petName}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <Camera size={48} className="text-muted-foreground" />
          )}
        </div>

        {/* Sección de Detalles */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
          <h3 className="text-3xl font-bold text-foreground mb-2">{petName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {birthDate && (
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>Edad: {getAge(birthDate)}</span>
              </div>
            )}
            {weight && (
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-primary" />
                <span>Peso: {weight} kg</span>
              </div>
            )}
            {breed && (
              <div className="flex items-center gap-2">
                <PawPrint size={18} className="text-primary" />
                <span>Raza: {breed}</span>
              </div>
            )}
            {/* Otros datos aquí si agregas más */}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PetInfoCard;