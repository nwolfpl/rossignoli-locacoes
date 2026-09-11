import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";

const NAV = [
  { href: "/carros", label: "Estoque" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-[13px] font-bold text-white">
            RV
          </span>
          <span className="hidden text-[15px] font-semibold leading-tight tracking-tight sm:block">
            Rossignoli <span className="text-brand-500">Veículos</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm text-ink-700 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/carros"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 md:hidden"
          >
            Estoque
          </Link>
          <a
            href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
