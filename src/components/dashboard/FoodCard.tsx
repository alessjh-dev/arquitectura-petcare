"use client";

import Card from "@/components/ui/Card";
import { Utensils } from "lucide-react";

interface FoodCardProps {
  mealsToday: number;
}

export function FoodCard({ mealsToday }: FoodCardProps) {
  return (
    <Card className="rounded-2xl shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Utensils className="text-green-600 dark:text-green-400" size={32} />
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Comida</span>
            <span className="text-lg font-bold">
              Ha comido {mealsToday} {mealsToday === 1 ? "vez" : "veces"} hoy
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
