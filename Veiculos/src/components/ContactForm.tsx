"use client";

import { useState, type FormEvent } from "react";
import type { Vehicle } from "@/domain/types";
import { whatsappLink } from "@/lib/site";

/**
 * Protótipo: o envio é simulado localmente (não há backend).
 * O WhatsApp continua como canal real de contato.
 */
export function ContactForm({ vehicle }: { vehicle: Vehicle }) {
  const [sent, setSent] = useState(false);
  const message = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year}.`;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">Mensagem registrada!</p>
        <p className="mt-1">
          No protótipo o envio é simulado. Para falar agora, use o WhatsApp acima.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="lead-nome" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Nome
        </label>
        <input
          id="lead-nome"
          required
          className="h-11 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-ink-400"
        />
      </div>
      <div>
        <label htmlFor="lead-tel" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Telefone
        </label>
        <input
          id="lead-tel"
          type="tel"
          required
          placeholder="(35) 90000-0000"
          className="h-11 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-ink-400"
        />
      </div>
      <div>
        <label htmlFor="lead-msg" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Mensagem
        </label>
        <textarea
          id="lead-msg"
          rows={3}
          defaultValue={message}
          className="w-full rounded-lg border border-ink-200 p-3 text-sm outline-none focus:border-ink-400"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-ink-900 py-3 text-sm font-semibold text-white transition hover:bg-ink-800"
      >
        Enviar mensagem
      </button>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-ink-500 underline-offset-2 hover:underline"
      >
        Prefiro falar pelo WhatsApp
      </a>
    </form>
  );
}
