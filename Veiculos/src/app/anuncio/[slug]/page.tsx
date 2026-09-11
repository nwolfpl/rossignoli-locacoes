import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { Gallery } from "@/components/Gallery";
import { VehicleCard } from "@/components/VehicleCard";
import { formatKm, formatPrice, formatYear } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { vehicleRepository } from "@/services/vehicleRepository";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vehicleRepository.all().map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  if (!vehicle) return { title: "Anúncio não encontrado" };

  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${formatYear(vehicle.year, vehicle.modelYear)}`;
  return {
    title,
    description: `${title} com ${formatKm(vehicle.mileage)} por ${formatPrice(vehicle.price)} em ${vehicle.city} - ${vehicle.state}.`,
    alternates: { canonical: `/anuncio/${vehicle.slug}` },
  };
}

const SAFETY_TIPS = [
  "Veja o carro pessoalmente antes de fechar negócio.",
  "Confirme a documentação e o histórico do veículo.",
  "Nunca faça pagamento antecipado sem inspecionar o carro.",
];

export default async function AnuncioPage({ params }: Params) {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  if (!vehicle) notFound();

  const related = vehicleRepository.getRelated(vehicle, 3);
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`;
  const contactMessage = `Olá! Tenho interesse no ${title} ${vehicle.year} anunciado por ${formatPrice(vehicle.price)}.`;

  const specs: [string, string][] = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Versão", vehicle.version],
    ["Ano", formatYear(vehicle.year, vehicle.modelYear)],
    ["Quilometragem", formatKm(vehicle.mileage)],
    ["Combustível", vehicle.fuel],
    ["Câmbio", vehicle.transmission],
    ["Carroceria", vehicle.body],
    ["Cor", vehicle.color],
    ["Portas", String(vehicle.doors)],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:pb-10">
      <nav aria-label="Você está em" className="text-sm text-ink-500">
        <Link href="/" className="hover:text-ink-900">
          Início
        </Link>{" "}
        /{" "}
        <Link href="/carros" className="hover:text-ink-900">
          Estoque
        </Link>{" "}
        / <span className="text-ink-700">{title}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Gallery vehicle={vehicle} />

          <section className="mt-8">
            <h2 className="text-lg font-bold tracking-tight">Sobre o veículo</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{vehicle.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold tracking-tight">Informações do veículo</h2>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-ink-100 py-2.5 text-sm"
                >
                  <dt className="text-ink-500">{label}</dt>
                  <dd className="font-medium text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold tracking-tight">Equipamentos</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {vehicle.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-ink-700">
                  <span aria-hidden className="text-emerald-600">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-ink-200 bg-ink-50 p-5">
            <h2 className="text-base font-bold tracking-tight">Compre com segurança</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              {SAFETY_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span aria-hidden>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-200 p-5">
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-1 text-sm text-ink-500">{vehicle.version}</p>
            <p className="tnum mt-1 text-sm text-ink-500">
              {formatYear(vehicle.year, vehicle.modelYear)} • {formatKm(vehicle.mileage)}
            </p>

            <p className="tnum mt-4 text-3xl font-bold tracking-tight">
              {formatPrice(vehicle.price)}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              📍 {vehicle.city} - {vehicle.state}
            </p>

            <a
              href={whatsappLink(contactMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block rounded-lg bg-brand-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Tenho interesse
            </a>

            <div className="mt-5 border-t border-ink-100 pt-5">
              <p className="text-sm font-semibold">Enviar mensagem</p>
              <p className="mb-3 mt-1 text-xs text-ink-400">
                Retornamos em horário comercial — {SITE.hours}
              </p>
              <ContactForm vehicle={vehicle} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-ink-200 p-5 text-sm">
            <p className="font-semibold">{SITE.name}</p>
            <p className="mt-1 text-ink-500">Loja em {SITE.city}</p>
            <p className="mt-3 text-xs text-ink-400">
              Anúncio publicado em{" "}
              {new Date(vehicle.publishedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Veículos parecidos</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <VehicleCard key={item.id} vehicle={item} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-ink-500">{vehicle.model}</p>
          <p className="tnum text-base font-bold leading-tight">{formatPrice(vehicle.price)}</p>
        </div>
        <a
          href={whatsappLink(contactMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
        >
          Tenho interesse
        </a>
      </div>
    </div>
  );
}
