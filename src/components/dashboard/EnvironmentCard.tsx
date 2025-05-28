'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Thermometer, Sun, Snowflake, CloudDrizzle } from 'lucide-react';

interface EnvironmentCardProps {
  humidity: number;
  temperature: number;
}

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ humidity, temperature }) => {
  const getTempColor = (temp: number) => {
    if (temp < 18) return 'text-blue-500';
    if (temp > 28) return 'text-red-500';
    return 'text-green-500';
  };

  const getTempIcon = (temp: number) => {
    if (temp < 18) return <Snowflake size={32} className={`mr-3 ${getTempColor(temp)}`} />;
    if (temp > 28) return <Sun size={32} className={`mr-3 ${getTempColor(temp)}`} />;
    return <Thermometer size={32} className={`mr-3 ${getTempColor(temp)}`} />;
  };

  return (
    <Card title="Ambiente">
      <div className="space-y-5">
        <div className="flex items-center">
          {getTempIcon(temperature)}
          <div>
            <p className="text-sm text-muted-foreground">Temperatura</p>
            <p className={`text-2xl font-bold ${getTempColor(temperature)}`}>{temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center">
          <CloudDrizzle size={32} className="mr-3 text-cyan-500" />
          <div>
            <p className="text-sm text-muted-foreground">Humedad</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{humidity}%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1 overflow-hidden">
              <div
                className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${humidity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnvironmentCard;
