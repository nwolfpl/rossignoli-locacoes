/*
 * Service worker do site e do painel da Rossignoli Locações.
 *
 * A decisão que governa este arquivo: o site é publicado por push na branch
 * main, e um cache agressivo de HTML deixaria a equipe rodando código velho sem
 * perceber. Por isso navegação é SEMPRE rede primeiro — o cache só entra quando
 * a rede falha. Ninguém fica preso numa versão antiga.
 *
 * O que NÃO passa por aqui: qualquer coisa fora deste domínio. As chamadas ao
 * Supabase são de outra origem e seguem direto para a rede, então nenhum dado de
 * pedido, visita ou cliente é guardado no aparelho.
 */
const VERSAO = 'rossignoli-v2';
const OFFLINE = '/offline/';

/* Só o essencial para a casca abrir sem sinal. */
const ESSENCIAIS = [
  OFFLINE,
  '/css/site.css',
  '/icons/site-192.png',
  '/icons/painel-192.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSAO);
    // addAll falha inteiro se um arquivo falhar; um a um é mais resistente.
    await Promise.all(ESSENCIAIS.map((u) => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

const ESTATICO = /\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2?|mp4|webmanifest)$/i;

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Supabase, fontes do Google, WhatsApp
  if (url.searchParams.has('ping')) return;   // sondagem de conexão: tem de tocar a rede

  /* Páginas: rede primeiro. Sem sinal, a última versão vista; nunca vista, a
     página offline, que guarda o telefone — o serviço é 24 horas. */
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const resposta = await fetch(req);
        const cache = await caches.open(VERSAO);
        cache.put(req, resposta.clone());
        return resposta;
      } catch (err) {
        return (await caches.match(req)) || (await caches.match(OFFLINE)) || Response.error();
      }
    })());
    return;
  }

  /* Arquivos fixos: entrega o cache na hora e atualiza por trás. */
  if (ESTATICO.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSAO);
      const guardado = await cache.match(req);
      const rede = fetch(req).then((r) => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
      return guardado || (await rede) || Response.error();
    })());
  }
});
