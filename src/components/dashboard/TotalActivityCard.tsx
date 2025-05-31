// src/components/dashboard/TotalActivityCard.tsx
'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Award } from 'lucide-react'; // Cambiado Trophy por Award para un look más limpio

interface TotalActivityCardProps {
  totalEvents: number;
}

const TotalActivityCard: React.FC<TotalActivityCardProps> = ({ totalEvents }) => {
  return (
    <Card title="Eventos de Actividad Total">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Award className="text-blue-500" size={36} /> {/* Un color más neutro/claro */}
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total de Detecciones</span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalEvents}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TotalActivityCard;