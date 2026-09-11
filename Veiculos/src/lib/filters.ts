import type { SortKey, Vehicle, VehicleQuery } from "@/domain/types";
import { slugify } from "@/lib/format";

const matchesText = (vehicle: Vehicle, term: string) => {
  const haystack = slugify(
    `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.body} ${vehicle.city}`,
  );
  return slugify(term)
    .split("-")
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

/** Aplica todos os filtros informados (combinam entre si com AND). */
export const applyFilters = (vehicles: Vehicle[], query: VehicleQuery) =>
  vehicles.filter((vehicle) => {
    if (query.q && !matchesText(vehicle, query.q)) return false;
    if (query.brand && vehicle.brand !== query.brand) return false;
    if (query.body && vehicle.body !== query.body) return false;
    if (query.transmission && vehicle.transmission !== query.transmission) return false;
    if (query.fuel && vehicle.fuel !== query.fuel) return false;
    if (query.minPrice != null && vehicle.price < query.minPrice) return false;
    if (query.maxPrice != null && vehicle.price > query.maxPrice) return false;
    if (query.minYear != null && vehicle.modelYear < query.minYear) return false;
    if (query.maxMileage != null && vehicle.mileage > query.maxMileage) return false;
    return true;
  });

const comparators: Record<SortKey, (a: Vehicle, b: Vehicle) => number> = {
  relevancia: (a, b) =>
    Number(b.highlighted) - Number(a.highlighted) ||
    +new Date(b.publishedAt) - +new Date(a.publishedAt),
  "menor-preco": (a, b) => a.price - b.price,
  "maior-preco": (a, b) => b.price - a.price,
  "mais-novos": (a, b) => b.modelYear - a.modelYear || a.mileage - b.mileage,
  "menor-km": (a, b) => a.mileage - b.mileage,
};

export const sortVehicles = (vehicles: Vehicle[], sort: SortKey = "relevancia") =>
  [...vehicles].sort(comparators[sort] ?? comparators.relevancia);

/** Média de preço dos veículos da mesma carroceria — base dos selos do card. */
export const averagePriceByBody = (vehicles: Vehicle[]) => {
  const groups = new Map<string, number[]>();
  for (const vehicle of vehicles) {
    groups.set(vehicle.body, [...(groups.get(vehicle.body) ?? []), vehicle.price]);
  }
  return new Map(
    [...groups].map(([body, prices]) => [
      body,
      prices.reduce((sum, price) => sum + price, 0) / prices.length,
    ]),
  );
};
