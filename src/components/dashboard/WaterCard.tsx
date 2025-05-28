'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Droplet } from 'lucide-react';

interface WaterCardProps {
  waterLevel: number;
}

const WaterCard: React.FC<WaterCardProps> = ({ waterLevel }) => {
  const waterLevelText = waterLevel > 80 ? "Lleno" : waterLevel > 30 ? "OK" : "Bajo";

  return (
    <Card title="Agua">
      <div className="flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-700 flex items-end justify-center">
            <div
              className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-500 ease-in-out"
              style={{ height: `${waterLevel}%` }}
            >
              <div className="absolute -bottom-1 w-full h-3 bg-blue-400 opacity-50 rounded-full animate-pulse"></div>
            </div>
            <Droplet size={32} className="relative z-10 text-white mb-1 opacity-75" />
          </div>
          <div className="flex-grow">
            <p className="text-sm text-muted-foreground">Nivel Actual</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{waterLevelText}</p>
            <p className="text-lg font-medium text-sky-500">{waterLevel}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WaterCard;
