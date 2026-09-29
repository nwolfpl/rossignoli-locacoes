/*
 * Liga o app instalável: registra o service worker e avisa quando o sinal cai.
 *
 * O aviso importa mais no painel que no site. Sem sinal, a casca abre com os
 * dados da última vez e as consultas ao Supabase falham caladas — sem a faixa,
 * alguém poderia decidir olhando número velho achando que é o de agora.
 */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {
        /* Modo privado ou navegador antigo: o site funciona igual, só não instala. */
      });
    });
  }

  var ID = 'rossignoli-sem-sinal';

  function faixa() {
    var el = document.getElementById(ID);
    if (el) return el;

    var estilo = document.createElement('style');
    estilo.textContent =
      '#' + ID + '{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;' +
      'background:#9A6A00;color:#fff;padding:10px 16px;text-align:center;' +
      'font:600 14px/1.4 "Barlow","Helvetica Neue",system-ui,sans-serif;' +
      'padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}' +
      '#' + ID + '[hidden]{display:none}';
    document.head.appendChild(estilo);

    el = document.createElement('div');
    el.id = ID;
    el.setAttribute('role', 'status');
    el.hidden = true;
    /* O texto muda conforme a tela: no painel o risco é decidir com dado velho. */
    el.textContent = /^\/painel\//.test(location.pathname)
      ? 'Sem conexão — os números na tela são da última vez que carregou.'
      : 'Sem conexão — a ligação ainda funciona: (35) 99191-2616.';
    document.body.appendChild(el);
    return el;
  }

  function mostra() { faixa().hidden = false; }
  function esconde() { var el = document.getElementById(ID); if (el) el.hidden = true; }

  /*
   * navigator.onLine não serve sozinho: ele diz "online" só por existir uma
   * rede, mesmo sem internet de verdade — wi-fi de obra que não sai, dados
   * móveis sem sinal, portal de hotel. Então a checagem é alcançar o servidor.
   * O ?ping= faz o service worker deixar passar direto para a rede.
   */
  function sonda() {
    if (navigator.onLine === false) { mostra(); return; }
    fetch('/favicon.ico?ping=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { r.ok ? esconde() : mostra(); })
      .catch(mostra);
  }

  addEventListener('offline', mostra);
  addEventListener('online', sonda);
  addEventListener('DOMContentLoaded', sonda);
  // Voltar para a aba depois de um tempo é o momento típico de o sinal ter mudado.
  addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') sonda();
  });
})();
