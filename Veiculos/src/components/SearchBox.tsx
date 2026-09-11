"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const PRICE_OPTIONS = [
  { value: "", label: "Qualquer preço" },
  { value: "50000", label: "Até R$ 50.000" },
  { value: "80000", label: "Até R$ 80.000" },
  { value: "120000", label: "Até R$ 120.000" },
  { value: "200000", label: "Até R$ 200.000" },
];

export function SearchBox({ brands }: { brands: string[] }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (term.trim()) params.set("q", term.trim());
    if (brand) params.set("brand", brand);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/carros${params.size ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-[0_20px_50px_-30px_rgba(11,14,19,0.55)] sm:grid-cols-[1.4fr_1fr_1fr_auto]"
    >
      <div className="sm:col-span-1">
        <label htmlFor="busca" className="sr-only">
          Qual carro você está procurando?
        </label>
        <input
          id="busca"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Qual carro você procura? Ex.: Onix"
          className="h-12 w-full rounded-xl border border-transparent bg-ink-50 px-4 text-sm outline-none placeholder:text-ink-400 focus:border-ink-200"
        />
      </div>

      <div>
        <label htmlFor="marca" className="sr-only">
          Marca
        </label>
        <select
          id="marca"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className="h-12 w-full rounded-xl border border-transparent bg-ink-50 px-3 text-sm outline-none focus:border-ink-200"
        >
          <option value="">Todas as marcas</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="preco" className="sr-only">
          Preço máximo
        </label>
        <select
          id="preco"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className="h-12 w-full rounded-xl border border-transparent bg-ink-50 px-3 text-sm outline-none focus:border-ink-200"
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="h-12 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition hover:bg-brand-600"
      >
        Buscar carros
      </button>
    </form>
  );
}
