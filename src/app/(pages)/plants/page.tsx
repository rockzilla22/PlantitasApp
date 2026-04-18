"use client";

import { useEffect } from "react";
import { Resizer } from "@/components/sections/Resizer";
import { PlantDetailPanel } from "@/components/sections/PlantDetailPanel";
import { PlantGrid } from "@/components/sections/PlantGrid";
import { useStore } from "@nanostores/react";
import { $selectedPlantId, $store } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";

export default function HomePage() {
  const { plants } = useStore($store);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 820) {
      $selectedPlantId.set(null);
    }
  }, []);

  const handleAddPlant = () => {
    openModal("add-plant");
  };

  return (
    <section id="tab-plants" className="tab-content active">
      <div className="plants-layout">
        <div className="plants-main-area">
          <div className="!mb-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--background)] py-2 min-[820px]:sticky min-[820px]:top-[100px] min-[820px]:z-40 min-[820px]:mb-10">
            <h2 className="text-[1.2rem] font-bold min-[820px]:text-[1.5rem]">Mis Plantas</h2>
            <button className="btn-primary" onClick={handleAddPlant}>Añadir Planta</button>
          </div>
          
          <PlantGrid plants={plants} />
        </div>
        <Resizer />
        <PlantDetailPanel />
      </div>
    </section>
  );
}
