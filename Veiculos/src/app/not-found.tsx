import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="mt-3 text-sm text-ink-500">
        O anúncio pode ter sido vendido ou removido do estoque.
      </p>
      <Link
        href="/carros"
        className="mt-6 inline-block rounded-lg bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
      >
        Ver estoque
      </Link>
    </div>
  );
}
