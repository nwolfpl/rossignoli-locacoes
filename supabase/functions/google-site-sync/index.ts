// Busca no Google Analytics 4 e no Search Console os números diários do site e grava em public.site_metricas.
// Autenticação: conta de serviço do Google (JSON no secret GOOGLE_SA_JSON), com acesso de Leitor no GA e no Search Console.
// Chamada todo dia pelo pg_cron e pelo botão "Atualizar agora" dos Relatórios.
import { createClient } from "npm:@supabase/supabase-js@2";

const GA_PROPERTY = Deno.env.get("GA_PROPERTY_ID") ?? "556470824";
const DOMINIO = "rossignolilocacoes.com.br";
const EVENTOS = ["generate_lead", "call_click"];
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const txt = (s: string) => new TextEncoder().encode(s);

async function tokenGoogle(sa: { client_email: string; private_key: string }, escopos: string[]) {
  const agora = Math.floor(Date.now() / 1000);
  const semAssinatura = b64url(txt(JSON.stringify({ alg: "RS256", typ: "JWT" }))) + "." +
    b64url(txt(JSON.stringify({ iss: sa.client_email, scope: escopos.join(" "), aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 3600 })));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const chave = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", chave, txt(semAssinatura)));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: semAssinatura + "." + b64url(assinatura) }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error("login no Google: " + (j.error_description || j.error || r.status));
  return j.access_token as string;
}

type Linha = { data: string; fonte: string; relatorio: string; chave: string; metricas: Record<string, number> };
const acumula = (mapa: Map<string, Linha>, fonte: string, relatorio: string, data: string, chave: string, m: Record<string, number>) => {
  const k = `${data}|${fonte}|${relatorio}|${chave}`;
  const l = mapa.get(k) ?? { data, fonte, relatorio, chave, metricas: {} };
  for (const [n, v] of Object.entries(m)) l.metricas[n] = (l.metricas[n] ?? 0) + v;
  mapa.set(k, l);
};
const dataGA = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
const iso = (d: Date) => d.toISOString().slice(0, 10);

async function sincronizaGA(tk: string, ini: string, mapa: Map<string, Linha>) {
  const relatorio = async (dims: string[], mets: string[], soEventos = false) => {
    const body: Record<string, unknown> = {
      dateRanges: [{ startDate: ini, endDate: "today" }],
      dimensions: ["date", ...dims].map((name) => ({ name })),
      metrics: mets.map((name) => ({ name })),
      limit: 100000,
    };
    if (soEventos) body.dimensionFilter = { filter: { fieldName: "eventName", inListFilter: { values: EVENTOS } } };
    const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY}:runReport`, {
      method: "POST", headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) throw new Error("Analytics: " + (j.error?.message || r.status));
    return (j.rows ?? []).map((row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => ({
      d: row.dimensionValues.map((x) => x.value), m: row.metricValues.map((x) => Number(x.value)),
    }));
  };
  // visitas por recorte e, separado, os cliques de WhatsApp (generate_lead) e Ligar (call_click) no mesmo recorte
  const recortes: [string, string[]][] = [["total", []], ["canal", ["sessionDefaultChannelGroup", "sessionSource"]], ["pagina", ["pagePath"]],
    ["cidade", ["city"]], ["dispositivo", ["deviceCategory"]], ["hora", ["hour"]]];
  for (const [rel, dims] of recortes) {
    for (const x of await relatorio(dims, ["sessions", "totalUsers", "screenPageViews", "engagedSessions"]))
      acumula(mapa, "ga", rel, dataGA(x.d[0]), x.d.slice(1).join("|"), { sessoes: x.m[0], usuarios: x.m[1], visualizacoes: x.m[2], engajadas: x.m[3] });
    for (const x of await relatorio([...dims, "eventName"], ["eventCount"], true)) {
      const ev = x.d[x.d.length - 1];
      acumula(mapa, "ga", rel, dataGA(x.d[0]), x.d.slice(1, -1).join("|"), { [ev === "generate_lead" ? "whatsapp" : "ligar"]: x.m[0] });
    }
  }
}

async function sincronizaGSC(tk: string, ini: string, mapa: Map<string, Linha>) {
  const r0 = await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers: { Authorization: `Bearer ${tk}` } });
  const j0 = await r0.json();
  if (!r0.ok) throw new Error("Search Console: " + (j0.error?.message || r0.status));
  const site = (j0.siteEntry ?? []).map((s: { siteUrl: string }) => s.siteUrl).filter((u: string) => u.includes(DOMINIO))
    .sort((a: string, b: string) => (b.startsWith("sc-domain:") ? 1 : 0) - (a.startsWith("sc-domain:") ? 1 : 0))[0];
  if (!site) throw new Error("Search Console: a conta de serviço ainda não tem acesso ao site " + DOMINIO);
  const fim = iso(new Date());
  for (const [rel, dims] of [["total", ["date"]], ["busca", ["date", "query"]], ["busca_pagina", ["date", "page"]]] as [string, string[]][]) {
    const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: "POST", headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: ini, endDate: fim, dimensions: dims, rowLimit: 25000 }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error("Search Console: " + (j.error?.message || r.status));
    for (const x of j.rows ?? [])
      acumula(mapa, "gsc", rel, x.keys[0], x.keys.slice(1).join("|").replace("https://" + DOMINIO, "") || "", {
        cliques: x.clicks, impressoes: x.impressions, posicao_x_impr: x.position * x.impressions, // posição média = posicao_x_impr ÷ impressões
      });
  }
  return site;
}

async function grava(mapa: Map<string, Linha>) {
  const L = [...mapa.values()].map((l) => ({ ...l, atualizado_em: new Date().toISOString() }));
  for (let i = 0; i < L.length; i += 500) {
    const { error } = await sb.from("site_metricas").upsert(L.slice(i, i + 500), { onConflict: "data,fonte,relatorio,chave" });
    if (error) throw new Error("banco: " + error.message);
  }
  return L.length;
}
const registra = (fonte: string, ok: boolean, linhas: number | null, detalhe: string) => sb.from("site_sync").insert({ fonte, ok, linhas, detalhe });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const resp = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...cors, "Content-Type": "application/json" } });
  let pedido: { dias?: number; forcar?: boolean } = {};
  try { pedido = await req.json(); } catch { /* sem corpo */ }

  // evita chamadas repetidas: se sincronizou há menos de 15 min, só devolve o status
  const { data: ult } = await sb.from("site_sync").select("em").eq("ok", true).order("em", { ascending: false }).limit(1);
  if (!pedido.forcar && ult?.[0] && Date.now() - new Date(ult[0].em).getTime() < 15 * 6e4) return resp({ ok: true, pulou: "sincronizado há menos de 15 min" });

  const bruto = Deno.env.get("GOOGLE_SA_JSON");
  if (!bruto) {
    await registra("config", false, null, "Falta a chave da conta de serviço (secret GOOGLE_SA_JSON).");
    return resp({ ok: false, configurado: false });
  }
  const sa = JSON.parse(bruto);
  const dias = Math.min(Math.max(pedido.dias ?? 35, 3), 480);
  const ini = iso(new Date(Date.now() - dias * 864e5));
  const saida: Record<string, unknown> = { conta: sa.client_email };
  for (const [fonte, escopo, fn] of [
    ["ga", "https://www.googleapis.com/auth/analytics.readonly", sincronizaGA],
    ["gsc", "https://www.googleapis.com/auth/webmasters.readonly", sincronizaGSC],
  ] as const) {
    try {
      const mapa = new Map<string, Linha>();
      const tk = await tokenGoogle(sa, [escopo]);
      const extra = await (fn as (t: string, i: string, m: Map<string, Linha>) => Promise<unknown>)(tk, ini, mapa);
      const n = await grava(mapa);
      await registra(fonte, true, n, `${dias} dias${extra ? " · " + extra : ""}`);
      saida[fonte] = { ok: true, linhas: n };
    } catch (e) {
      await registra(fonte, false, null, String((e as Error).message).slice(0, 500));
      saida[fonte] = { ok: false, erro: String((e as Error).message) };
    }
  }
  return resp(saida);
});
