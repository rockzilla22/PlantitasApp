"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plant } from "@/core/plant/domain/Plant";
import { getRoomSvg } from "@/helpers/garden";
import { PlantMiniIcon } from "./PlantMiniIcon";

interface RoomCardProps {
  roomKey: string;
  label: string;
  plants: Plant[];
}

const MAX_VISIBLE = 6;

export function RoomCard({ roomKey, label, plants }: RoomCardProps) {
  const router = useRouter();
  const count = plants.length;
  const visible = plants.slice(0, MAX_VISIBLE);
  const overflow = count - MAX_VISIBLE;

  return (
    <div
      className="room-card"
      onClick={() => router.push(`/plants?location=${encodeURIComponent(label)}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/plants?location=${encodeURIComponent(label)}`)}
    >
      <Image
        src={getRoomSvg(roomKey)}
        alt={label}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      <div className="room-overlay">
        {count === 0 ? (
          <p className="room-empty-msg">¡Agregá tu primera planta!</p>
        ) : (
          <div className="room-plants-grid">
            {visible.map((p) => (
              <PlantMiniIcon key={p.id} type={p.type} name={p.name} />
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
