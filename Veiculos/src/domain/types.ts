export type Fuel = "Flex" | "Gasolina" | "Diesel" | "Híbrido" | "Elétrico";
export type Transmission = "Manual" | "Automático" | "Automatizado" | "CVT";
export type Body = "Hatch" | "Sedã" | "SUV" | "Picape" | "Minivan";

/** Um veículo publicado no catálogo. */
export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  modelYear: number;
  price: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  body: Body;
  color: string;
  colorHex: string;
  doors: number;
  city: string;
  state: string;
  features: string[];
  highlighted: boolean;
  publishedAt: string; // ISO
  description: string;
}

/** Filtros da listagem. Todos opcionais e combináveis. */
export interface VehicleQuery {
  q?: string;
  brand?: string;
  body?: Body;
  transmission?: Transmission;
  fuel?: Fuel;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxMileage?: number;
  sort?: SortKey;
}

export type SortKey =
  | "relevancia"
  | "menor-preco"
  | "maior-preco"
  | "mais-novos"
  | "menor-km";

export const SORT_LABELS: Record<SortKey, string> = {
  relevancia: "Mais relevantes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "mais-novos": "Mais novos",
  "menor-km": "Menor quilometragem",
};
