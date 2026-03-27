/* ============================================================
   BISA — BERNHARDT INSTITUTO DE SAÚDE INTEGRATIVA
   Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- NAVIGATION ---- */
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Mobile toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpening = !navMenu.classList.contains('is-open');
      navToggle.classList.toggle('is-active');
      navMenu.classList.toggle('is-open');
      if (nav) nav.classList.toggle('nav--menu-open');
      if (isOpening) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    });

    // Close on link/CTA click
    navMenu.querySelectorAll('.nav__link, .btn').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('is-active');
        navMenu.classList.remove('is-open');
        if (nav) nav.classList.remove('nav--menu-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      });
    });
  }

  // Active link highlight
  function setActiveNavLink() {
    const links = document.querySelectorAll('.nav__link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || href.endsWith(currentPath))) {
        link.classList.add('nav__link--active');
      }
    });
  }
  setActiveNavLink();

  /* ---- AOS — Animate On Scroll ---- */
  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.aosDelay ? parseInt(el.dataset.aosDelay) : 0;
          setTimeout(() => {
            el.classList.add('aos-animate');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));

    // Safety fallback after 3s
    setTimeout(() => {
      elements.forEach(el => {
        if (!el.classList.contains('aos-animate')) {
          el.classList.add('aos-animate');
        }
      });
    }, 3000);
  }
  initAOS();

  /* ---- COUNTER ANIMATION ---- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('pt-BR') + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }
  initCounters();

  /* ---- SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- BLOG FILTER ---- */
  function initBlogFilter() {
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const blogCards = document.querySelectorAll('.blog-card[data-category]');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.filter;
        blogCards.forEach(card => {
          if (category === 'todos' || card.dataset.category === category) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
  initBlogFilter();

  /* ---- FORM VALIDATION & SUBMIT ---- */
  function initForms() {
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const inputs = form.querySelectorAll('[required]');
        let valid = true;

        inputs.forEach(input => {
          const wrap = input.closest('.form-field') || input.parentElement;
          wrap.classList.remove('form-field--error');

          if (!input.value.trim()) {
            valid = false;
            wrap.classList.add('form-field--error');
          }

          if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            valid = false;
            wrap.classList.add('form-field--error');
          }
        });

        if (valid) {
          const btn = form.querySelector('button[type="submit"]');
          const originalText = btn.innerHTML;
          btn.innerHTML = 'Enviando…';
          btn.disabled = true;

          // Redirect to WhatsApp with form data
          const nome = form.querySelector('[name="nome"]')?.value || '';
          const mensagem = form.querySelector('[name="mensagem"]')?.value || '';
          const waText = encodeURIComponent(`Olá! Meu nome é ${nome}. ${mensagem}`);
          const waUrl = `https://wa.me/5548999999999?text=${waText}`;

          setTimeout(() => {
            btn.innerHTML = '✓ Redirecionando…';
            setTimeout(() => {
              window.open(waUrl, '_blank', 'noopener,noreferrer');
              btn.innerHTML = originalText;
              btn.disabled = false;
              form.reset();
            }, 800);
          }, 800);
        }
      });
    });
  }
  initForms();

  /* ---- PARALLAX subtle on hero ---- */
  function initParallax() {
    const heroBg = document.querySelector('.hero__bg img');
    if (!heroBg) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY < window.innerHeight * 1.2) {
            heroBg.style.transform = `translateY(${scrollY * 0.28}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  initParallax();

  /* ---- YEAR auto-update in footer ---- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
