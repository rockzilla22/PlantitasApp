"use client";

import { Plant } from "@/core/plant/domain/Plant";
import { useStore } from "@nanostores/react";
import { $selectedPlantId } from "@/store/plantStore";

interface PlantGridProps {
  plants: Plant[];
}

export function PlantGrid({ plants }: PlantGridProps) {
  const selectedId = useStore($selectedPlantId);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    return dateStr.split('-').reverse().join('/');
  };

  const sortedPlants = [...plants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div id="plants-list" className="grid-container">
      {sortedPlants.length === 0 ? (
        <div className="empty-state">
          <p>No hay plantas registradas. ¡Añadí tu primera planta!</p>
        </div>
      ) : (
        sortedPlants.map((plant) => (
          <div
            key={plant.id}
            onClick={() => $selectedPlantId.set(plant.id)}
            className={`card plant-card ${selectedId === plant.id ? 'selected' : ''}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{plant.icon} {plant.name}</h3>
              <small className="badge badge-success">{plant.type}</small>
            </div>
            <div className="microclima-info">
              <span className="microclima-tag">📍 {plant.location}</span>
            </div>
            <p><strong>Riego:</strong> {formatDate(plant.lastWateredDate)}</p>
          </div>
        ))
      )}
    </div>
  );
}
