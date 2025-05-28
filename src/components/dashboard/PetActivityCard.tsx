'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Footprints, Sparkles } from 'lucide-react';

interface PetActivityCardProps {
  petName?: string;
  activity: number;
  lastSeen?: string; 
}

const PetActivityCard: React.FC<PetActivityCardProps> = ({
  petName = "Mascota",
  activity,
  lastSeen,
}) => {
  const lastSeenTime = lastSeen 
  ? new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
  : "Desconocido";

  return (
    <Card title={`Actividad de ${petName}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Footprints size={32} className="mr-3 text-orange-500 animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground">Nivel de Actividad</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{activity}</p>
            </div>
          </div>
          <Sparkles size={28} className="text-yellow-400" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Última vez visto/a</p>
          <p className="text-xl font-semibold">{lastSeenTime}</p>
        </div>
      </div>
    </Card>
  );
};

export default PetActivityCard;
