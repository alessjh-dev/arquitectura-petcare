'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Trophy } from 'lucide-react';

interface TotalActivityCardProps {
  totalEvents: number;
}

const TotalActivityCard: React.FC<TotalActivityCardProps> = ({ totalEvents }) => {
  return (
    <Card title="Total de Actividad" className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
      <div className="flex flex-col items-center justify-center h-full py-4">
        <Trophy size={48} className="mb-4 text-yellow-300" />
        <p className="text-sm opacity-90">Eventos de actividad registrados</p>
        <p className="text-5xl font-bold mt-2">{totalEvents}</p>
        <p className="text-xs opacity-80 mt-1">¡Un campeón de la diversión!</p>
      </div>
    </Card>
  );
};

export default TotalActivityCard;