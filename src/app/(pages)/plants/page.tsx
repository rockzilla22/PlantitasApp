"use client";

import { useEffect } from "react";
import { Resizer } from "@/components/sections/Resizer";
import { PlantDetailPanel } from "@/components/sections/PlantDetailPanel";
import { PlantGrid } from "@/components/sections/PlantGrid";
import { useStore } from "@nanostores/react";
import { $selectedPlantId, $store, checkCapLimit } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";

export default function HomePage() {
  const { plants } = useStore($store);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 820) {
      $selectedPlantId.set(null);
    }
  }, []);

  const handleAddPlant = () => {
    if (checkCapLimit()) openModal("add-plant");
  };

  return (
    <section id="tab-plants" className="tab-content active">
      <div className="plants-layout">
        <div className="plants-main-area">
          <div className="view-header">
            <h2 className="text-[var(--primary)] font-bold">Mis Plantas</h2>
            <button className="btn-primary" onClick={handleAddPlant}>
              + Añadir
            </button>
          </div>
          <PlantGrid plants={plants} />
        </div>
        <Resizer />
        <PlantDetailPanel />
      </div>
    </section>
  );
}
