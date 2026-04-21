"use client";

import Image from "next/image";
import { Plant } from "@/core/plant/domain/Plant";
import { getRoomSvg } from "@/helpers/garden";
import { PlantMiniIcon } from "./PlantMiniIcon";
import { openModal } from "@/store/modalStore";
import { SkinId, SKIN_OPTIONS, setRoomSkin } from "@/store/gardenStore";

interface RoomCardProps {
  roomKey: string;
  label: string;
  plants: Plant[];
  skinId?: SkinId;
}

const MAX_VISIBLE = 8;

export function RoomCard({ roomKey, label, plants, skinId = "standard" }: RoomCardProps) {
  const count = plants.length;
  const visible = plants.slice(0, MAX_VISIBLE);
  const overflow = count - MAX_VISIBLE;

  const handleCardClick = () => {
    openModal("room-plants", { roomKey, label, plants });
  };

  const handleSkinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = SKIN_OPTIONS[(SKIN_OPTIONS.findIndex((s) => s.id === skinId) + 1) % SKIN_OPTIONS.length];
    setRoomSkin(roomKey, next.id);
  };

  return (
    <div
      className={`room-card room-skin-${skinId}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      <Image
        src={getRoomSvg(roomKey, skinId)}
        alt={label}
        fill
        className="object-cover room-bg-img"
        sizes="(max-width: 768px) 50vw, 33vw"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `/virtualGarden/standard/rooms/${roomKey}.svg`;
        }}
      />

      {/* Skin toggle button */}
      <button
        className="room-skin-btn"
        onClick={handleSkinClick}
        title={`Skin: ${skinId}`}
        aria-label="Cambiar skin"
      >
        🎨
      </button>

      <div className="room-overlay">
        {count === 0 ? (
          <p className="room-empty-msg">¡Agregá tu primera planta!</p>
        ) : (
          <div className="room-plants-grid">
            {visible.map((p) => (
              <PlantMiniIcon
                key={p.id}
                type={p.type}
                name={p.name}
                lastWateredDate={p.lastWateredDate}
              />
            ))}
            {overflow > 0 && (
              <span className="room-overflow">+{overflow}</span>
            )}
          </div>
        )}
      </div>

      <div className="room-footer">
        <span className="room-label">{label}</span>
        <span className="room-count">{count} {count === 1 ? "planta" : "plantas"}</span>
      </div>
    </div>
  );
}
