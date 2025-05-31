// src/components/dashboard/ActivityStatsCard.tsx
'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { BarChart2 } from 'lucide-react';

interface DailyActivityData {
  date: string;
  count: number;
  totalEvents: number;
}

interface ActivityStatsCardProps {
  dailyActivity: DailyActivityData[];
}

const ActivityStatsCard: React.FC<ActivityStatsCardProps> = ({ dailyActivity }) => {
  if (!dailyActivity || dailyActivity.length === 0) {
    return (
      <Card title="Estadísticas Diarias" className="md:col-span-2 lg:col-span-2">
        <p className="text-muted-foreground text-center py-4">No hay datos de actividad para mostrar.</p>
      </Card>
    );
  }

  const maxCount = Math.max(...dailyActivity.map(d => d.count));

  return (
    <Card title="Actividad Diaria" className="md:col-span-2 lg:col-span-2">
      <div className="space-y-4">
        <div className="flex items-center text-lg font-semibold text-primary">
          <BarChart2 size={24} className="mr-2" />
          Tendencia de Actividad
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {dailyActivity.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center">
              <div className="relative w-8 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex flex-col justify-end overflow-hidden mb-1">
                <div
                  className="w-full rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    height: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%`,
                    backgroundColor: `hsl(${index * 50 % 360}, 70%, 55%)`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">{day.date.split(' ')[1]}</span>
              <span className="font-bold">{day.count}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">Eventos de actividad por día durante la última semana.</p>
      </div>
    </Card>
  );
};

export default ActivityStatsCard;