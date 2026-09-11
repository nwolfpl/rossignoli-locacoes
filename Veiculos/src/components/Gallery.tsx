"use client";

import { useState } from "react";
import {
  PHOTO_VIEWS,
  VIEW_LABELS,
  VehiclePhoto,
  type PhotoView,
} from "@/components/VehiclePhoto";
import type { Vehicle } from "@/domain/types";

export function Gallery({ vehicle }: { vehicle: Vehicle }) {
  const [index, setIndex] = useState(0);
  const view: PhotoView = PHOTO_VIEWS[index];

  const move = (delta: number) =>
    setIndex((current) => (current + delta + PHOTO_VIEWS.length) % PHOTO_VIEWS.length);

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
        <VehiclePhoto vehicle={vehicle} view={view} className="aspect-[16/10] w-full" />

        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm transition hover:bg-white"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Próxima foto"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm transition hover:bg-white"
        >
          ›
        </button>

        <span className="absolute bottom-3 right-3 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {PHOTO_VIEWS.length} • imagem ilustrativa
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {PHOTO_VIEWS.map((item, itemIndex) => (
          <button
            key={item}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Ver ${VIEW_LABELS[item]}`}
            aria-current={itemIndex === index}
            className={`overflow-hidden rounded-xl border transition ${
              itemIndex === index
                ? "border-brand-500 ring-2 ring-brand-100"
                : "border-ink-200 hover:border-ink-400"
            }`}
          >
            <VehiclePhoto vehicle={vehicle} view={item} className="aspect-[16/10] w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
