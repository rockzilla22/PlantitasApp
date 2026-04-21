"use client";

import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { $store } from "@/store/plantStore";
import { $roomSkins } from "@/store/gardenStore";
import { PLANT_LOCATIONS } from "@/data/catalog";
import { LOCATION_TO_ROOM_KEY, getPlantsByRoom } from "@/helpers/garden";
import { RoomCard } from "@/components/garden/RoomCard";

type SortMode = "count-desc" | "count-asc" | "name-asc" | "name-desc";

const SORT_LABELS: Record<SortMode, string> = {
  "count-desc": "Más plantas primero",
  "count-asc": "Menos plantas primero",
  "name-asc": "Nombre A→Z",
  "name-desc": "Nombre Z→A",
};

export default function GardenPage() {
  const storeData = useStore($store);
  const roomSkins = useStore($roomSkins);
  const [sort, setSort] = useState<SortMode>("count-desc");

  const plantsByRoom = useMemo(
    () => getPlantsByRoom(storeData.plants ?? []),
    [storeData.plants]
  );

  const totalPlants = storeData.plants?.filter((p) => !p.deleted_at).length ?? 0;
  const occupiedRooms = Object.keys(plantsByRoom).filter((k) => plantsByRoom[k].length > 0).length;

  const sortedRooms = useMemo(() => {
    const rooms = PLANT_LOCATIONS.map((loc) => ({
      roomKey: LOCATION_TO_ROOM_KEY[loc.value] ?? "storage",
      label: loc.value === "Otros" ? "Bodega" : loc.label,
      plants: plantsByRoom[LOCATION_TO_ROOM_KEY[loc.value] ?? "storage"] ?? [],
    }));

    return [...rooms].sort((a, b) => {
      if (sort === "count-desc") return b.plants.length - a.plants.length;
      if (sort === "count-asc") return a.plants.length - b.plants.length;
      if (sort === "name-asc") return a.label.localeCompare(b.label, "es");
      if (sort === "name-desc") return b.label.localeCompare(a.label, "es");
      return 0;
    });
  }, [plantsByRoom, sort]);

  return (
    <div className="garden-page">
      <div className="garden-header">
        <div>
          <h1>Mi Jardín</h1>
          <p className="garden-summary">
            {totalPlants} {totalPlants === 1 ? "planta" : "plantas"} en {occupiedRooms} {occupiedRooms === 1 ? "habitación" : "habitaciones"}
          </p>
        </div>
        <div className="sort-group flex bg-[var(--black-soft)] p-1 rounded-xl gap-1">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((k) => (
            <button
              key={k}
              className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sort === k ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-brown)] hover:text-[var(--primary)]"}`}
              onClick={() => setSort(k)}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="garden-grid">
        {sortedRooms.map(({ roomKey, label, plants }) => (
          <RoomCard
            key={roomKey}
            roomKey={roomKey}
            label={label}
            plants={plants}
            skinId={roomSkins[roomKey] ?? "standard"}
          />
        ))}
      </div>

      <style jsx>{`
        .garden-page {
          padding: 1.5rem 1rem 3rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .garden-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .garden-header h1 {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .garden-summary {
          font-size: 0.95rem;
          color: var(--text-gray);
        }

        .garden-header .sort-group {
          align-self: center;
          flex-shrink: 0;
        }

        .garden-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        @media (min-width: 1024px) {
          .garden-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        :global(.room-card) {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: 1.5rem;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--border);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          outline: none;
        }

        :global(.room-card:hover),
        :global(.room-card:focus-visible) {
          transform: scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        :global(.room-overlay) {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
        }

        :global(.room-empty-msg) {
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-align: center;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
          background: rgba(0, 0, 0, 0.3);
          padding: 0.4rem 0.75rem;
          border-radius: 1rem;
        }

        :global(.room-plants-grid) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          justify-content: center;
          align-items: center;
          max-width: 80%;
        }

        :global(.room-overflow) {
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          background: rgba(0, 0, 0, 0.45);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.room-footer) {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.5rem 0.75rem;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        :global(.room-label) {
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        :global(.room-count) {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.85);
        }

        /* Skin toggle button */
        :global(.room-skin-btn) {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.35);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          opacity: 0;
          transition: opacity 0.2s;
        }

        :global(.room-card:hover .room-skin-btn) {
          opacity: 1;
        }

        /* Skin: modern — CSS filter para diferenciar visualmente */
        :global(.room-skin-modern .room-bg-img) {
          filter: saturate(1.4) brightness(1.05);
        }

        /* Plant mini tooltip */
        :global(.plant-mini-wrapper) {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.plant-mini-tooltip) {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
          z-index: 10;
        }

        :global(.plant-mini-wrapper:hover .plant-mini-tooltip) {
          opacity: 1;
        }

        /* Room plants modal */
        :global(.room-plants-modal) {
          min-width: min(90vw, 360px);
        }

        :global(.room-plants-modal__header) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
        }

        :global(.room-plants-modal__header h3) {
          font-size: 1.1rem;
          color: var(--primary);
          margin: 0;
        }

        :global(.room-plants-modal__empty) {
          text-align: center;
          color: var(--text-gray);
          font-size: 0.9rem;
          padding: 1.5rem 0;
        }

        :global(.room-plants-modal__list) {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 50vh;
          overflow-y: auto;
        }

        :global(.room-plants-modal__item) {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 0.75rem;
          background: var(--bg-faint);
        }

        :global(.room-plants-modal__info) {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        :global(.room-plants-modal__name) {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
        }

        :global(.room-plants-modal__watered) {
          font-size: 0.75rem;
          color: var(--text-gray);
        }
      `}</style>
    </div>
  );
}
