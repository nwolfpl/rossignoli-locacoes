"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/VehicleCard";
import { SORT_LABELS, type SortKey, type VehicleQuery } from "@/domain/types";
import { averagePriceByBody } from "@/lib/filters";
import { vehicleRepository } from "@/services/vehicleRepository";

type FieldOption = { value: string; label: string };

const FIELDS: {
  param: keyof VehicleQuery;
  label: string;
  options: FieldOption[];
}[] = [
  {
    param: "brand",
    label: "Marca",
    options: [
      { value: "", label: "Todas" },
      ...vehicleRepository.listBrands().map((brand) => ({ value: brand, label: brand })),
    ],
  },
  {
    param: "body",
    label: "Carroceria",
    options: [
      { value: "", label: "Todas" },
      { value: "Hatch", label: "Hatch" },
      { value: "Sedã", label: "Sedã" },
      { value: "SUV", label: "SUV" },
      { value: "Picape", label: "Picape" },
      { value: "Minivan", label: "Minivan" },
    ],
  },
  {
    param: "transmission",
    label: "Câmbio",
    options: [
      { value: "", label: "Todos" },
      { value: "Manual", label: "Manual" },
      { value: "Automático", label: "Automático" },
      { value: "CVT", label: "CVT" },
      { value: "Automatizado", label: "Automatizado" },
    ],
  },
  {
    param: "fuel",
    label: "Combustível",
    options: [
      { value: "", label: "Todos" },
      { value: "Flex", label: "Flex" },
      { value: "Gasolina", label: "Gasolina" },
      { value: "Diesel", label: "Diesel" },
      { value: "Híbrido", label: "Híbrido" },
      { value: "Elétrico", label: "Elétrico" },
    ],
  },
  {
    param: "minPrice",
    label: "Preço mínimo",
    options: [
      { value: "", label: "Sem mínimo" },
      { value: "40000", label: "R$ 40.000" },
      { value: "60000", label: "R$ 60.000" },
      { value: "90000", label: "R$ 90.000" },
      { value: "120000", label: "R$ 120.000" },
    ],
  },
  {
    param: "maxPrice",
    label: "Preço máximo",
    options: [
      { value: "", label: "Sem máximo" },
      { value: "50000", label: "R$ 50.000" },
      { value: "80000", label: "R$ 80.000" },
      { value: "120000", label: "R$ 120.000" },
      { value: "200000", label: "R$ 200.000" },
    ],
  },
  {
    param: "minYear",
    label: "Ano a partir de",
    options: [
      { value: "", label: "Qualquer ano" },
      { value: "2015", label: "2015" },
      { value: "2019", label: "2019" },
      { value: "2021", label: "2021" },
      { value: "2023", label: "2023" },
    ],
  },
  {
    param: "maxMileage",
    label: "Quilometragem até",
    options: [
      { value: "", label: "Qualquer km" },
      { value: "40000", label: "40.000 km" },
      { value: "60000", label: "60.000 km" },
      { value: "80000", label: "80.000 km" },
      { value: "120000", label: "120.000 km" },
    ],
  },
];

const NUMERIC_PARAMS = new Set(["minPrice", "maxPrice", "minYear", "maxMileage"]);

const buildQuery = (params: URLSearchParams): VehicleQuery => {
  const query: VehicleQuery = {};
  for (const field of FIELDS) {
    const raw = params.get(field.param);
    if (!raw) continue;
    if (NUMERIC_PARAMS.has(field.param)) {
      (query[field.param] as number) = Number(raw);
    } else {
      (query[field.param] as string) = raw;
    }
  }
  const q = params.get("q");
  if (q) query.q = q;
  const sort = params.get("sort") as SortKey | null;
  if (sort && sort in SORT_LABELS) query.sort = sort;
  return query;
};

export function VehicleBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useMemo(() => buildQuery(searchParams), [searchParams]);
  const results = useMemo(() => vehicleRepository.search(query), [query]);
  const averages = useMemo(() => averagePriceByBody(vehicleRepository.all()), []);

  const activeCount = Object.keys(query).filter((key) => key !== "sort").length;

  const update = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    router.replace(`/carros${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const clearAll = () => router.replace("/carros", { scroll: false });

  const filterPanel = (
    <div className="space-y-4">
      <div>
        <label htmlFor="filtro-q" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Buscar
        </label>
        <input
          id="filtro-q"
          defaultValue={query.q ?? ""}
          onChange={(event) => update("q", event.target.value)}
          placeholder="Marca, modelo ou versão"
          className="h-11 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-ink-400"
        />
      </div>

      {FIELDS.map((field) => (
        <div key={field.param}>
          <label
            htmlFor={`filtro-${field.param}`}
            className="mb-1.5 block text-xs font-semibold text-ink-700"
          >
            {field.label}
          </label>
          <select
            id={`filtro-${field.param}`}
            value={String(query[field.param] ?? "")}
            onChange={(event) => update(field.param, event.target.value)}
            className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-ink-400"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-lg border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Limpar filtros ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Estoque</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink-200 p-4">{filterPanel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-500">
              <strong className="tnum font-semibold text-ink-900">{results.length}</strong>{" "}
              {results.length === 1 ? "veículo encontrado" : "veículos encontrados"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium lg:hidden"
              >
                Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>

              <label htmlFor="ordenar" className="sr-only">
                Ordenar por
              </label>
              <select
                id="ordenar"
                value={query.sort ?? "relevancia"}
                onChange={(event) => update("sort", event.target.value)}
                className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-ink-400"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  averagePrice={averages.get(vehicle.body)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-ink-200 px-6 py-16 text-center">
              <p className="text-base font-semibold">Não encontramos carros com esses filtros.</p>
              <p className="mt-2 text-sm text-ink-500">
                Tente ampliar a faixa de preço ou remover algum filtro.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 bg-ink-900/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold">Filtros</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-ink-500"
              >
                Fechar
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-5 w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white"
            >
              Ver {results.length} {results.length === 1 ? "veículo" : "veículos"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
