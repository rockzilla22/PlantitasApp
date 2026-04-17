"use client";

import { Resizer } from "@/components/sections/Resizer";
import { PlantDetailPanel } from "@/components/sections/PlantDetailPanel";
import { PlantGrid } from "@/components/sections/PlantGrid";
import { useStore } from "@nanostores/react";
import { $store } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";

export default function HomePage() {
  const { plants } = useStore($store);

  const handleAddPlant = () => {
    openModal("add-plant");
  };

  return (
    <section id="tab-plants" className="tab-content active">
      <div className="view-header">
        <h2>Mis Plantas</h2>
        <button className="btn-primary" onClick={handleAddPlant}>Añadir Planta</button>
      </div>
      <div className="plants-layout">
        <PlantGrid plants={plants} />
        <Resizer />
        <PlantDetailPanel />
      </div>
    </section>
  );
}
