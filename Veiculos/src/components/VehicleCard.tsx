import Link from "next/link";
import { Badge } from "@/components/Badge";
import { VehiclePhoto } from "@/components/VehiclePhoto";
import type { Vehicle } from "@/domain/types";
import { daysSince, formatKm, formatPrice, formatYear } from "@/lib/format";

type Props = {
  vehicle: Vehicle;
  /** Média de preço da mesma carroceria no estoque — base do selo de oportunidade. */
  averagePrice?: number;
};

export function VehicleCard({ vehicle, averagePrice }: Props) {
  const isNew = daysSince(vehicle.publishedAt) <= 10;
  const belowAverage =
    averagePrice != null && vehicle.price < averagePrice * 0.92;
  const age = Math.max(1, new Date().getFullYear() - vehicle.modelYear);
  const lowMileage = vehicle.mileage < 60_000 && vehicle.mileage / age < 10_000;

  return (
    <article className="group relative rounded-2xl border border-ink-200 bg-white transition hover:-translate-y-0.5 hover:border-ink-400/60 hover:shadow-[0_12px_30px_-18px_rgba(11,14,19,0.5)]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-ink-100">
        <VehiclePhoto
          vehicle={vehicle}
          className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
        />
        {vehicle.highlighted && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-900/90 px-2.5 py-1 text-[11px] font-semibold text-white">
            Destaque
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight text-ink-900">
            <Link href={`/anuncio/${vehicle.slug}`} className="before:absolute before:inset-0">
              {vehicle.brand} {vehicle.model}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-ink-500">{vehicle.version}</p>
        </div>

        <p className="tnum text-[13px] text-ink-500">
          {formatYear(vehicle.year, vehicle.modelYear)} • {formatKm(vehicle.mileage)} •{" "}
          {vehicle.transmission}
        </p>

        <p className="tnum text-xl font-bold tracking-tight text-ink-900">
          {formatPrice(vehicle.price)}
        </p>

        {(belowAverage || isNew || lowMileage) && (
          <div className="flex flex-wrap gap-1.5">
            {belowAverage && <Badge tone="success">Preço abaixo da média</Badge>}
            {lowMileage && <Badge tone="info">Baixa quilometragem</Badge>}
            {isNew && !belowAverage && <Badge tone="brand">Novo anúncio</Badge>}
          </div>
        )}

        <p className="flex items-center gap-1 border-t border-ink-100 pt-3 text-[13px] text-ink-500">
          <span aria-hidden>📍</span> {vehicle.city} - {vehicle.state}
        </p>
      </div>
    </article>
  );
}
