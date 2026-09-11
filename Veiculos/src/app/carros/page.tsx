import type { Metadata } from "next";
import { Suspense } from "react";
import { VehicleBrowser } from "@/components/VehicleBrowser";

export const metadata: Metadata = {
  title: "Estoque de seminovos e usados",
  description:
    "Veja os carros disponíveis, filtre por marca, preço, ano e quilometragem e fale direto com a loja.",
};

export default function CarrosPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">Carregando…</div>}>
      <VehicleBrowser />
    </Suspense>
  );
}
