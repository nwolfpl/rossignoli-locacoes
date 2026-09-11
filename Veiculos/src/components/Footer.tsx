import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer id="contato" className="mt-20 border-t border-ink-200 bg-ink-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold">
            Rossignoli <span className="text-brand-500">Veículos</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-ink-500">{SITE.tagline}</p>
        </div>

        <div className="text-sm">
          <p className="font-semibold">Contato</p>
          <ul className="mt-2 space-y-1 text-ink-500">
            <li>{SITE.phoneLabel}</li>
            <li>{SITE.email}</li>
            <li>{SITE.city}</li>
            <li>{SITE.hours}</li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold">Navegação</p>
          <ul className="mt-2 space-y-1 text-ink-500">
            <li>
              <Link href="/carros" className="hover:text-ink-900">
                Estoque completo
              </Link>
            </li>
            <li>
              <Link href="/#destaques" className="hover:text-ink-900">
                Destaques
              </Link>
            </li>
            <li>
              <Link href="/#como-funciona" className="hover:text-ink-900">
                Como funciona
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-200 px-4 py-5 text-center text-xs text-ink-400 sm:px-6">
        Protótipo em desenvolvimento — veículos, preços e contatos são fictícios.
      </div>
    </footer>
  );
}
