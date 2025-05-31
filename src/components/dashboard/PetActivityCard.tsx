// src/components/dashboard/PetActivityCard.tsx
'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Footprints, Sparkles } from 'lucide-react';

interface PetActivityCardProps {
  petName?: string;
  totalActivityEvents: number; // Esto será el total de eventos de HOY
  lastActivityTimestamp?: string; // Esto será el último evento de HOY
}

const PetActivityCard: React.FC<PetActivityCardProps> = ({
  petName = "Mascota",
  totalActivityEvents,
  lastActivityTimestamp,
}) => {
  const lastSeenTime = totalActivityEvents > 0 && lastActivityTimestamp
    ? new Date(lastActivityTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : "No hay actividad hoy"; // Mensaje claro si no hay actividad HOY

  return (
    <Card title={`Actividad de ${petName} Hoy`}> {/* Título específico para hoy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Footprints size={32} className="mr-3 text-orange-500 animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground">Eventos Detectados</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalActivityEvents}</p>
            </div>
          </div>
          <Sparkles size={28} className="text-yellow-400" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Último Evento</p>
          <p className="text-xl font-semibold">{lastSeenTime}</p>
        </div>
      </div>
    </Card>
  );
};

export default PetActivityCard;