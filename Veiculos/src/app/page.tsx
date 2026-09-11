import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { VehicleCard } from "@/components/VehicleCard";
import { averagePriceByBody } from "@/lib/filters";
import { SITE } from "@/lib/site";
import { vehicleRepository } from "@/services/vehicleRepository";

const CATEGORIES = [
  { body: "Hatch", description: "Econômicos para o dia a dia" },
  { body: "Sedã", description: "Conforto e porta-malas" },
  { body: "SUV", description: "Espaço e posição elevada" },
  { body: "Picape", description: "Trabalho e lazer" },
];

const STEPS = [
  {
    title: "Escolha no estoque",
    description:
      "Todos os veículos com fotos, quilometragem, versão e opcionais informados no anúncio.",
  },
  {
    title: "Agende a avaliação",
    description:
      "Você marca um horário para ver o carro pessoalmente e fazer a inspeção com mecânico de confiança.",
  },
  {
    title: "Documentação sem dor de cabeça",
    description:
      "Conferimos a documentação e acompanhamos a transferência do início ao fim.",
  },
];

export default function HomePage() {
  const vehicles = vehicleRepository.all();
  const highlighted = vehicleRepository.getHighlighted(6);
  const brands = vehicleRepository.listBrands();
  const averages = averagePriceByBody(vehicles);
  const cheapest = Math.min(...vehicles.map((vehicle) => vehicle.price));

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-ink-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            {SITE.city}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Encontre seu próximo carro sem enrolação.
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-500 sm:text-lg">
            {vehicles.length} veículos seminovos e usados no estoque, a partir de{" "}
            {cheapest.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            })}
            . Preço, quilometragem e opcionais sempre visíveis.
          </p>

          <div className="mt-8">
            <SearchBox brands={brands} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-500">Marcas no estoque:</span>
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/carros?brand=${encodeURIComponent(brand)}`}
                className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700 transition hover:border-ink-400 hover:text-ink-900"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="destaques" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Destaques da semana</h2>
            <p className="mt-1 text-sm text-ink-500">
              Selecionados pela equipe entre os veículos disponíveis agora.
            </p>
          </div>
          <Link
            href="/carros"
            className="hidden shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block"
          >
            Ver estoque completo →
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlighted.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              averagePrice={averages.get(vehicle.body)}
            />
          ))}
        </div>

        <Link
          href="/carros"
          className="mt-6 block rounded-xl border border-ink-200 py-3 text-center text-sm font-semibold text-ink-700 sm:hidden"
        >
          Ver estoque completo
        </Link>
      </section>

      <section className="border-y border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold tracking-tight">Buscar por categoria</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => {
              const count = vehicles.filter((vehicle) => vehicle.body === category.body).length;
              return (
                <Link
                  key={category.body}
                  href={`/carros?body=${encodeURIComponent(category.body)}`}
                  className="rounded-xl border border-ink-200 bg-white p-4 transition hover:border-ink-400"
                >
                  <p className="text-base font-semibold">{category.body}</p>
                  <p className="mt-1 text-sm text-ink-500">{category.description}</p>
                  <p className="mt-3 text-xs font-medium text-brand-600">
                    {count} {count === 1 ? "veículo" : "veículos"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Como funciona</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-ink-200 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
