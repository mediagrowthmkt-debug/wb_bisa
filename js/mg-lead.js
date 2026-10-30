/*!
 * mg-lead.js  |  origem do lead + eventos dataLayer + banner de cookies (Consent Mode v2)
 * Compartilhado BISA / BEEyond. Configuração pela tag:
 * <script src="/js/mg-lead.js" data-site="bisa" data-prefix="BISA" data-page="HOME"
 *         data-privacy="/pages/privacidade" defer></script>
 * Botões wa.me podem ter data-servico="lipedema" e data-cta="hero" (senão é detectado).
 */
(function () {
  'use strict';

  var tag = document.currentScript || document.querySelector('script[src*="mg-lead.js"]');
  var cfg = {
    site: (tag && tag.dataset.site) || 'site',
    prefix: (tag && tag.dataset.prefix) || 'SITE',
    page: (tag && tag.dataset.page) || 'HOME',
    privacy: (tag && tag.dataset.privacy) || '/pages/privacidade'
  };
  var COOKIE = '_lead_src';
  var DAYS = 90;
  var CONSENT_KEY = 'mg_consent';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  /* ---------- cookie helpers ---------- */
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; }
  }
  function setCookie(name, obj) {
    var exp = new Date(Date.now() + DAYS * 864e5).toUTCString();
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(obj)) +
      '; expires=' + exp + '; path=/; SameSite=Lax' + secure;
  }

  /* ---------- origem ---------- */
  function channelOf(p) {
    var src = (p.utm_source || '').toLowerCase();
    if (p.gclid || p.gbraid || p.wbraid || src === 'google') return 'GADS';
    if (p.fbclid || /^(facebook|instagram|fb|ig|meta)$/.test(src)) return 'META';
    return 'ORG';
  }

  function captureSource() {
    var qs = new URLSearchParams(location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
    var p = {}, has = false;
    keys.forEach(function (k) { var v = qs.get(k); if (v) { p[k] = v.slice(0, 150); has = true; } });
    var current = getCookie(COOKIE);
    var ch = channelOf(p);

    if (!has) {
      if (!current) {
        setCookie(COOKIE, { ch: 'ORG', ref: (document.referrer || '').slice(0, 150), ts: Date.now(), landing: location.pathname });
        return getCookie(COOKIE) || { ch: 'ORG' };
      }
      return current;
    }
    p.ch = ch; p.ts = Date.now(); p.landing = location.pathname;
    // nunca sobrescreve a primeira origem paga
    if (current && current.ch && current.ch !== 'ORG') return current;
    setCookie(COOKIE, p);
    return getCookie(COOKIE) || p;
  }

  var SRC = captureSource();
  var CH = (SRC && SRC.ch) || 'ORG';
  var LEAD_REF = cfg.prefix + '-' + cfg.page + '-' + CH;
  var CODE = '[' + LEAD_REF + ']';
  window.MG_LEAD_REF = LEAD_REF;

  /* ---------- WhatsApp: código no fim da mensagem ---------- */
  var CODE_RE = /\s*\[[A-Z]+-[A-Z]+-(GADS|META|ORG)\]\s*$/;

  function tagWa(a) {
    try {
      var url = new URL(a.href);
      var txt = (url.searchParams.get('text') || '').replace(CODE_RE, '');
      url.searchParams.delete('text');
      var rest = url.search ? url.search.slice(1) + '&' : '';
      a.href = url.origin + url.pathname + '?' + rest + 'text=' +
        encodeURIComponent((txt ? txt + ' ' : '') + CODE);
    } catch (e) { /* href inválido, ignora */ }
  }
  function isWa(a) { return /(^|\/\/)(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(a.getAttribute('href') || ''); }

  function ctaLocal(a) {
    if (a.dataset.cta) return a.dataset.cta;
    if (a.closest('.whatsapp-float, .wa-float, .whatsapp-flutuante, [data-cta-flutuante]')) return 'flutuante';
    if (a.closest('.mobile-bar, .sticky-bar, .barra-fixa')) return 'flutuante';
    if (a.closest('header, nav, .nav, .header')) return 'header';
    if (a.closest('footer, .footer')) return 'rodape';
    if (a.closest('.hero, [id="inicio"], [id="hero"]')) return 'hero';
    return 'secao';
  }

  function tagAll(root) {
    (root || document).querySelectorAll('a[href]').forEach(function (a) { if (isWa(a)) tagWa(a); });
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (isWa(a)) {
      tagWa(a);
      window.dataLayer.push({
        event: 'whatsapp_click', site: cfg.site, page_path: location.pathname,
        cta_local: ctaLocal(a), servico: a.dataset.servico || 'geral', lead_ref: LEAD_REF
      });
    } else if (/^tel:/i.test(href)) {
      window.dataLayer.push({ event: 'phone_click', site: cfg.site, page_path: location.pathname });
    } else if (/instagram\.com/i.test(href)) {
      window.dataLayer.push({ event: 'instagram_click', site: cfg.site, page_path: location.pathname });
    }
  }, true);

  /* ---------- formulário (data-lead-form) ---------- */
  window.MG_LEAD = {
    ref: LEAD_REF,
    code: CODE,
    source: SRC,
    submit: function (form, fields) {
      fields = fields || {};
      window.dataLayer.push({
        event: 'form_submit', site: cfg.site,
        form_id: form.id || form.getAttribute('name') || 'form',
        interesse: fields.interesse || 'geral', lead_ref: LEAD_REF
      });
    },
    withCode: function (text) { return String(text || '').replace(CODE_RE, '') + ' ' + CODE; }
  };

  /* ---------- banner de cookies ---------- */
  function storedConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function saveConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  function applyConsent(v) {
    var g = v === 'granted' ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: g, analytics_storage: g, ad_user_data: g, ad_personalization: g });
    window.dataLayer.push({ event: 'consent_update', consent: g });
  }

  function banner() {
    if (storedConsent()) return;
    var css = document.createElement('style');
    css.textContent =
      '.mgc{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;background:#fff;color:#2b2b2b;' +
      'border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:18px 20px;font:14px/1.5 inherit;font-family:inherit}' +
      '.mgc p{margin:0 0 12px}.mgc a{color:inherit;text-decoration:underline}' +
      '.mgc__btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}' +
      '.mgc button{cursor:pointer;border-radius:999px;padding:10px 18px;font:600 13px/1 inherit;font-family:inherit;border:1px solid currentColor;background:transparent;color:inherit}' +
      '.mgc button.mgc__ok{background:#2b2b2b;color:#fff;border-color:#2b2b2b}' +
      '@media(max-width:600px){.mgc{left:10px;right:10px;bottom:10px;padding:12px 14px;font-size:12.5px}.mgc p{margin-bottom:8px}.mgc button{flex:1;padding:9px 12px}}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.className = 'mgc';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML =
      '<p>Usamos cookies para medir o acesso e melhorar nossos anúncios. ' +
      'Saiba mais na <a href="' + cfg.privacy + '">Política de Privacidade</a>.</p>' +
      '<div class="mgc__btns"><button type="button" class="mgc__no">Recusar</button>' +
      '<button type="button" class="mgc__ok">Aceitar</button></div>';
    document.body.appendChild(box);
    box.querySelector('.mgc__ok').addEventListener('click', function () { saveConsent('granted'); applyConsent('granted'); box.remove(); });
    box.querySelector('.mgc__no').addEventListener('click', function () { saveConsent('denied'); applyConsent('denied'); box.remove(); });
  }

  function init() {
    tagAll();
    banner();
    window.dataLayer.push({ event: 'lead_source', site: cfg.site, lead_ref: LEAD_REF, canal: CH });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
