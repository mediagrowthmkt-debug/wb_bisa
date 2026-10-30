/* Formulário passo a passo (data-lead-form) -> evento form_submit + WhatsApp com código de origem */
(function () {
  'use strict';
  function init(form) {
    var steps = [].slice.call(form.querySelectorAll('.mf__step'));
    var back = form.querySelector('.mf__back');
    var next = form.querySelector('.mf__next');
    var send = form.querySelector('[type="submit"]');
    var count = form.querySelector('.mf__count');
    var bar = form.querySelector('.mf__bar span');
    var phone = form.dataset.phone || '5548988694319';
    var i = 0;

    function show(n) {
      i = Math.max(0, Math.min(n, steps.length - 1));
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); s.classList.remove('has-err'); });
      if (count) count.textContent = 'Passo ' + (i + 1) + ' de ' + steps.length;
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
      back.hidden = i === 0;
      var last = i === steps.length - 1;
      next.hidden = last; send.hidden = !last;
      var f = steps[i].querySelector('input:not([type=hidden]), textarea');
      if (f && i > 0) setTimeout(function () { f.focus({ preventScroll: true }); }, 50);
    }
    function valid() {
      var s = steps[i], ok = true;
      var hid = s.querySelector('input[type=hidden]');
      if (hid && !hid.value) ok = false;
      s.querySelectorAll('[required]').forEach(function (el) { if (!el.value.trim()) ok = false; });
      var tel = s.querySelector('[type=tel]');
      if (tel && tel.value.replace(/\D/g, '').length < 10) ok = false;
      var em = s.querySelector('[type=email]');
      if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) ok = false;
      s.classList.toggle('has-err', !ok);
      return ok;
    }
    form.querySelectorAll('.mf__opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var st = b.closest('.mf__step');
        st.querySelectorAll('.mf__opt').forEach(function (o) { o.classList.remove('is-on'); });
        b.classList.add('is-on');
        st.querySelector('input[type=hidden]').value = b.dataset.val;
        setTimeout(function () { show(i + 1); }, 180);
      });
    });
    next.addEventListener('click', function () { if (valid()) show(i + 1); });
    back.addEventListener('click', function () { show(i - 1); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (i < steps.length - 1) { if (valid()) show(i + 1); } else { form.requestSubmit ? form.requestSubmit() : send.click(); }
      }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid()) return;
      var v = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var interesse = v('interesse') || 'Avaliação geral';
      var msg = 'Olá! Meu nome é ' + v('nome') + '. Tenho interesse em ' + interesse + '.';
      if (v('mensagem')) msg += ' ' + v('mensagem').replace(/[.!?]?\s*$/, '.');
      if (v('whatsapp')) msg += ' Meu WhatsApp: ' + v('whatsapp') + '.';
      if (v('email')) msg += ' E-mail: ' + v('email') + '.';
      if (window.MG_LEAD) { window.MG_LEAD.submit(form, { interesse: interesse }); msg = window.MG_LEAD.withCode(msg); }
      window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      form.reset(); form.querySelectorAll('.mf__opt').forEach(function (o) { o.classList.remove('is-on'); });
      show(0);
    });
    show(0);
  }
  function boot() { document.querySelectorAll('form[data-lead-form].mf').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
