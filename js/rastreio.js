/*
 * Rastreamento do comportamento no site — Rossignoli Locações.
 *
 * Por que existe, já tendo Google Analytics: o GA responde "quantos", não "o
 * quê". Ele não mostra a sequência de passos de uma visita, e é exatamente isso
 * que diz onde o pedido de orçamento morre — a pessoa preencheu a carga, o peso,
 * a cidade e não apertou enviar. Esse rastro fica aqui e aparece no painel.
 *
 * Três decisões que valem explicar:
 *
 * 1. Reaproveita o que o site já tem. A origem sai do mesmo `origemRossignoli`
 *    que monta a mensagem do WhatsApp, e os cliques saem dos mesmos `data-ev`
 *    que já alimentam o GA. Não há uma segunda convenção para manter.
 * 2. Fala com o Supabase por fetch puro, com keepalive, igual ao registro de
 *    pedidos que já existe no index. A chave é pública e só consegue inserir.
 * 3. Nada aqui pode quebrar a página. Toda falha é engolida de propósito:
 *    perder um evento é aceitável, atrapalhar um orçamento não é.
 */
(function () {
  'use strict';

  var URL_BASE = 'https://vllghkaymxzlfprcvfmc.supabase.co/rest/v1/';
  var CHAVE = 'sb_publishable_HqfLoJbcH5yfYkej7hDeGA_a8_Is3-p';

  var CHAVE_VISITANTE = 'rossignoliVisitante';
  var CHAVE_SESSAO = 'rossignoliSessao';

  var ESPERA_LOTE = 1200;
  var LOTE_MAX = 30;
  var PULSO = 30000;
  var LIMITE_PULSO = 20 * 60000;
  var MARCOS = [25, 50, 75, 100];

  /* Intenção de contato vai na hora: a aba pode fechar logo em seguida. */
  var IMEDIATOS = { whatsapp_clique: 1, telefone_clique: 1, sessao_inicio: 1, orcamento_enviado: 1 };

  /* ---------- identidade ---------- */

  function uuid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /* Storage lança em janela privada ou com cookies bloqueados: aí o id só vive na memória. */
  function leOuCria(store, chave) {
    try {
      var s = store === 'local' ? localStorage : sessionStorage;
      var v = s.getItem(chave);
      if (v) return v;
      v = uuid();
      s.setItem(chave, v);
      return v;
    } catch (e) {
      return uuid();
    }
  }

  function sessaoNova() {
    try {
      return !sessionStorage.getItem(CHAVE_SESSAO);
    } catch (e) {
      return true;
    }
  }

  var nova = sessaoNova();
  var visitante = leOuCria('local', CHAVE_VISITANTE);
  var sessao = leOuCria('session', CHAVE_SESSAO);

  /* ---------- contexto ---------- */

  var params = new URLSearchParams(location.search);

  /* Mesma origem que o montador do WhatsApp usa, para os dois contarem a mesma história. */
  function origem() {
    var o = null;
    try { o = sessionStorage.getItem('origemRossignoli'); } catch (e) {}
    if (o) return o;
    o = params.get('utm_source') || params.get('o');
    if (!o) {
      try {
        var h = document.referrer ? new URL(document.referrer).hostname.replace('www.', '') : '';
        o = h && h.indexOf('rossignolilocacoes') < 0 ? h : 'direto';
      } catch (e) { o = 'direto'; }
    }
    try { sessionStorage.setItem('origemRossignoli', o); } catch (e) {}
    return o;
  }

  function aparelho() {
    var ua = navigator.userAgent;
    if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
    if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function achaPrimeiro(ua, pares) {
    for (var i = 0; i < pares.length; i++) if (pares[i][1].test(ua)) return pares[i][0];
    return 'Outro';
  }

  function navegador(ua) {
    return achaPrimeiro(ua, [
      ['Edge', /Edg\//], ['Opera', /OPR\//], ['Samsung Internet', /SamsungBrowser/],
      ['Chrome', /Chrome\//], ['Firefox', /Firefox\//], ['Safari', /Safari\//]
    ]);
  }

  function sistema(ua) {
    return achaPrimeiro(ua, [
      ['Android', /Android/], ['iOS', /iPhone|iPad|iPod/], ['Windows', /Windows/],
      ['macOS', /Mac OS X|Macintosh/], ['Linux', /Linux/]
    ]);
  }

  /* ---------- envio ---------- */

  var fila = [];
  var timer = null;

  function envia(tabela, linhas, keepalive) {
    if (!linhas.length) return;
    try {
      fetch(URL_BASE + tabela, {
        method: 'POST',
        keepalive: !!keepalive,
        headers: {
          apikey: CHAVE,
          Authorization: 'Bearer ' + CHAVE,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(linhas)
      })['catch'](function () {});
    } catch (e) {}
  }

  function descarrega(keepalive) {
    if (!fila.length) return;
    var lote = fila;
    fila = [];
    if (timer) { clearTimeout(timer); timer = null; }
    envia('site_eventos', lote, keepalive);
  }

  function corta(v, n) {
    return v == null ? null : String(v).slice(0, n);
  }

  function registra(nome, o) {
    o = o || {};
    fila.push({
      sessao_id: sessao,
      visitante_id: visitante,
      nome: nome,
      caminho: location.pathname,
      rotulo: corta(o.rotulo, 200),
      valor: typeof o.valor === 'number' ? o.valor : null,
      detalhes: o.detalhes || {}
    });
    if (IMEDIATOS[nome] || fila.length >= LOTE_MAX) descarrega();
    else if (!timer) timer = setTimeout(function () { timer = null; descarrega(); }, ESPERA_LOTE);
  }

  /* Deixa o resto do site chamar: window.rastreia('nome', {...}) */
  window.rastreia = registra;

  /* ---------- abertura da sessão ---------- */

  if (nova) {
    envia('site_sessoes', [{
      id: sessao,
      visitante_id: visitante,
      primeira_pagina: location.pathname,
      referencia: corta(document.referrer, 500),
      origem: origem(),
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      dispositivo: aparelho(),
      navegador: navegador(navigator.userAgent),
      sistema: sistema(navigator.userAgent),
      idioma: navigator.language || null,
      tela: screen.width + 'x' + screen.height,
      fuso: (Intl.DateTimeFormat().resolvedOptions().timeZone) || null,
      user_agent: corta(navigator.userAgent, 500)
    }]);
    registra('sessao_inicio', { rotulo: origem() });
  }

  registra('pagina_vista', { rotulo: document.title });

  /* ---------- rolagem, tempo e saída ---------- */

  var entrou = Date.now();
  var atingidos = {};
  var rolagemMax = 0;

  /*
   * Enquanto a página não tem layout, innerHeight pode ser 0 e a altura rolável
   * sair zero ou negativa. Tratar isso como "leu a página toda" marcaria 100%
   * no instante do carregamento e estragaria a métrica de leitura — por isso
   * aqui a resposta é "ainda não dá para dizer".
   */
  function profundidade() {
    var altura = window.innerHeight;
    var rolavel = document.documentElement.scrollHeight - altura;
    if (!altura || rolavel <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((window.scrollY / rolavel) * 100)));
  }

  /* Página que cabe inteira na tela: é vista por completo, mas só depois de existir. */
  function cabeNaTela() {
    return window.innerHeight > 0 &&
      document.documentElement.scrollHeight <= window.innerHeight + 8;
  }

  function aoRolar() {
    var pct = profundidade();
    if (pct === null) return;
    if (pct > rolagemMax) rolagemMax = pct;
    for (var i = 0; i < MARCOS.length; i++) {
      var m = MARCOS[i];
      if (pct >= m && !atingidos[m]) { atingidos[m] = 1; registra('rolagem', { valor: m }); }
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  /* Depois do load a altura já é confiável. */
  window.addEventListener('load', aoRolar);
  setTimeout(aoRolar, 1200);

  setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    var s = Date.now() - entrou;
    if (s > LIMITE_PULSO) return;
    registra('pulso', { valor: Math.round(s / 1000) });
  }, PULSO);

  /* pagehide cobre o caso que o unload não cobre no Safari e no celular. */
  window.addEventListener('pagehide', function () {
    registra('saida_pagina', {
      valor: Math.round((Date.now() - entrou) / 1000),
      detalhes: { rolagem_maxima: rolagemMax === 0 && cabeNaTela() ? 100 : rolagemMax }
    });
    descarrega(true);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') descarrega(true);
  });

  /* ---------- cliques ---------- */

  function rotuloDe(a) {
    var t = (a.textContent || '').replace(/\s+/g, ' ').trim();
    return t.slice(0, 200) || a.getAttribute('aria-label') || 'sem rótulo';
  }

  document.addEventListener('click', function (e) {
    var alvo = e.target.closest ? e.target.closest('a,button,[data-ev]') : null;
    if (!alvo) return;

    var href = alvo.getAttribute('href') || '';
    var ev = alvo.dataset ? alvo.dataset.ev : null;
    var marcado = alvo.closest('[data-ev]');
    if (!ev && marcado) ev = marcado.dataset.ev;

    if (href.indexOf('wa.me/') >= 0 || href.indexOf('api.whatsapp.com') >= 0) {
      registra('whatsapp_clique', { rotulo: ev || rotuloDe(alvo), detalhes: { origem: origem() } });
      return;
    }
    if (href.indexOf('tel:') === 0) {
      registra('telefone_clique', { rotulo: ev || rotuloDe(alvo) });
      return;
    }
    if (href.indexOf('mailto:') === 0) {
      registra('email_clique', { rotulo: ev || rotuloDe(alvo) });
      return;
    }
    /* Reaproveita o data-ev que o site já usa para o Google Analytics. */
    if (ev) {
      registra('cta_clique', { rotulo: ev });
      return;
    }
    if (/^https?:\/\//.test(href)) {
      try {
        var u = new URL(href);
        if (u.hostname !== location.hostname) {
          registra('link_externo', { rotulo: u.hostname });
        }
      } catch (err) {}
    }
  }, true);

  /* ---------- montador do orçamento ---------- */

  /*
   * O dado mais valioso do site: quem começou a montar o pedido e não enviou.
   * Guarda o campo preenchido, não o texto livre de observação — ali a pessoa às
   * vezes escreve nome e telefone, e isso não precisa entrar na trilha.
   */
  var builder = document.getElementById('builder');
  if (builder) {
    var comecou = false;
    var atraso = null;
    var preenchidos = {};

    builder.addEventListener('change', function (e) {
      var campo = e.target && e.target.name;
      if (!campo) return;

      if (!comecou) { comecou = true; registra('orcamento_iniciado'); }

      preenchidos[campo] = campo === 'obs' ? '(preenchido)' : (e.target.value || '').slice(0, 120);

      if (atraso) clearTimeout(atraso);
      atraso = setTimeout(function () {
        registra('orcamento_campo', {
          rotulo: campo,
          valor: Object.keys(preenchidos).length,
          detalhes: preenchidos
        });
      }, 900);
    });
  }

  /* ---------- dúvidas frequentes ---------- */

  /* Qual pergunta as pessoas abrem diz o que falta explicar na página. */
  document.querySelectorAll('details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      var s = d.querySelector('summary');
      registra('duvida_abriu', { rotulo: s ? s.textContent.trim() : 'sem título' });
    });
  });
})();
