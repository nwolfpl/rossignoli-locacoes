import { VEHICLES } from "@/data/vehicles";
import type { Vehicle, VehicleQuery } from "@/domain/types";
import { applyFilters, sortVehicles } from "@/lib/filters";

/**
 * Contrato de acesso a dados. A UI depende apenas desta interface, então
 * trocar o mock por uma API HTTP não exige mudança nos componentes.
 */
export interface VehicleRepository {
  search(query: VehicleQuery): Vehicle[];
  getBySlug(slug: string): Vehicle | undefined;
  getHighlighted(limit?: number): Vehicle[];
  getRelated(vehicle: Vehicle, limit?: number): Vehicle[];
  listBrands(): string[];
  all(): Vehicle[];
}

export const vehicleRepository: VehicleRepository = {
  search: (query) => sortVehicles(applyFilters(VEHICLES, query), query.sort),

  getBySlug: (slug) => VEHICLES.find((vehicle) => vehicle.slug === slug),

  getHighlighted: (limit = 6) =>
    sortVehicles(
      VEHICLES.filter((vehicle) => vehicle.highlighted),
      "relevancia",
    ).slice(0, limit),

  getRelated: (vehicle, limit = 3) =>
    VEHICLES.filter(
      (candidate) =>
        candidate.id !== vehicle.id &&
        (candidate.body === vehicle.body || candidate.brand === vehicle.brand),
    )
      .sort(
        (a, b) =>
          Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price),
      )
      .slice(0, limit),

  listBrands: () => [...new Set(VEHICLES.map((vehicle) => vehicle.brand))].sort(),

  all: () => VEHICLES,
};
