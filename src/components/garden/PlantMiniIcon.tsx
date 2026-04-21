"use client";

import Image from "next/image";
import { getPlantGardenIcon, getDaysSinceWatered } from "@/helpers/garden";

interface PlantMiniIconProps {
  type: string;
  name: string;
  lastWateredDate?: string | null;
  size?: number;
}

export function PlantMiniIcon({ type, name, lastWateredDate, size = 28 }: PlantMiniIconProps) {
  const days = getDaysSinceWatered(lastWateredDate);
  const tooltipText =
    days === null ? name : `${name} · ${days === 0 ? "Regada hoy" : `Hace ${days}d`}`;

  return (
    <div className="plant-mini-wrapper" title={tooltipText}>
      <Image
        src={getPlantGardenIcon(type)}
        alt={name}
        width={size}
        height={size}
        className="object-contain drop-shadow-sm"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/virtualGarden/standard/plants/generic.svg";
        }}
      />
      <span className="plant-mini-tooltip">{tooltipText}</span>
    </div>
  );
}
