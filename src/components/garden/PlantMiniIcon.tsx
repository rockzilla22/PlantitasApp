"use client";

import Image from "next/image";
import { getPlantGardenIcon } from "@/helpers/garden";

interface PlantMiniIconProps {
  type: string;
  name: string;
  size?: number;
}

export function PlantMiniIcon({ type, name, size = 28 }: PlantMiniIconProps) {
  return (
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
  );
}
