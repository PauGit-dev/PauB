/* =========================================================================
   UGC CREATOR con Paula — lógica del funnel
   ========================================================================= */

/* --- CONFIGURACIÓN -------------------------------------------------------
   Pega aquí la URL /exec del despliegue de Google Apps Script.
   (Apps Script → Implementar → Nueva implementación → Aplicación web →
    Ejecutar como: yo · Con acceso: cualquier usuario)
   ------------------------------------------------------------------------ */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1ENNt-7A3UbPHODP5O5ISNCnbjUOfa2tJ8R_GAeatA36mVojYcR2IK8eShQ5_fh0d/exec';

/* URL de destino tras enviar la solicitud. */
const GRACIAS_URL = '../gracias/';

/* Clave de consentimiento de cookies en localStorage. */
const CONSENT_KEY = 'ugc_paula_consent';

(function () {
  'use strict';

  /* ===================================================================
     1. Consentimiento de cookies + Meta Pixel
     El Pixel NO se carga hasta que la usuaria acepta.
     =================================================================== */

  function readConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      /* Navegación privada o almacenamiento bloqueado: seguimos sin guardar. */
    }
  }

  function loadPixel() {
    const id = window.META_PIXEL_ID;
    if (!id || id === 'META_PIXEL_ID' || window.__pixelLoaded) return;
    window.__pixelLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    if (typeof window.fbq !== 'function') return;

    window.fbq('init', id);
    (window.META_PIXEL_EVENTS || ['PageView']).forEach(function (event) {
      window.fbq('track', event);
    });
  }

  function initConsent() {
    const banner = document.querySelector('[data-cookie-banner]');
    const consent = readConsent();

    if (consent === 'accepted') {
      loadPixel();
      return;
    }

    if (consent === 'rejected' || !banner) return;

    banner.hidden = false;

    banner.addEventListener('click', function (event) {
      const action = event.target.closest('[data-consent]');
      if (!action) return;

      const choice = action.dataset.consent;
      saveConsent(choice);
      banner.hidden = true;

      if (choice === 'accepted') loadPixel();
    });
  }

  /* ===================================================================
     2. Cabecera adherida
     =================================================================== */

  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    const onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===================================================================
     3. Barra de CTA fija en móvil
     Aparece al salir del hero y se esconde sobre el CTA final.
     =================================================================== */

  function initStickyCta() {
    const bar = document.querySelector('[data-sticky-cta]');
    if (!bar || !('IntersectionObserver' in window)) return;

    document.body.classList.add('has-sticky-cta');

    const hero = document.querySelector('[data-hero]');
    const end = document.querySelector('[data-cta-end]');
    const state = { pastHero: false, atEnd: false };

    const sync = function () {
      bar.classList.toggle('is-visible', state.pastHero && !state.atEnd);
    };

    if (hero) {
      new IntersectionObserver(function (entries) {
        state.pastHero = !entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(hero);
    }

    if (end) {
      new IntersectionObserver(function (entries) {
        state.atEnd = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(end);
    }
  }

  /* ===================================================================
     4. FAQ: sólo una respuesta abierta a la vez
     =================================================================== */

  function initFaq() {
    const items = document.querySelectorAll('[data-faq] details');

    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  /* ===================================================================
     5. Revelado suave al hacer scroll
     =================================================================== */

  function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ===================================================================
     6. Vídeos de Wistia
     Fachada: sólo se contacta con Wistia cuando la visitante pulsa play.
     Se carga con doNotTrack, así que no instala ninguna cookie y no
     depende del banner de consentimiento.
     =================================================================== */

  function initVideos() {
    const boxes = document.querySelectorAll('[data-video]');

    boxes.forEach(function (box) {
      const trigger = box.querySelector('.video__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        const id = box.dataset.video;

        /* Todavía sin configurar: no cargamos un reproductor roto. */
        if (!id || id.indexOf('WISTIA_ID') === 0) {
          if (!box.querySelector('.video__pending')) {
            const aviso = document.createElement('p');
            aviso.className = 'video__pending';
            aviso.textContent = 'Falta el ID de Wistia de este vídeo.';
            box.appendChild(aviso);
          }
          return;
        }

        const frame = document.createElement('iframe');
        frame.className = 'video__frame';
        frame.src = 'https://fast.wistia.net/embed/iframe/' + encodeURIComponent(id) +
                    '?doNotTrack=true&autoPlay=true&playsinline=true';
        frame.title = trigger.textContent.trim() || 'Vídeo';
        frame.allow = 'autoplay; fullscreen';
        frame.allowFullscreen = true;

        trigger.replaceWith(frame);
      });
    });
  }

  /* ===================================================================
     7. Formulario de solicitud
     =================================================================== */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* Reglas por campo. Instagram es el único opcional. */
  const RULES = {
    nombre: function (v) {
      if (!v.trim()) return 'Dinos cómo te llamas.';
      if (v.trim().length < 2) return 'Escribe tu nombre completo.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return 'Necesitamos tu email para contestarte.';
      if (!EMAIL_RE.test(v.trim())) return 'Revisa el email, parece que falta algo.';
      return '';
    },
    whatsapp: function (v) {
      if (!v.trim()) return 'Sin WhatsApp no podemos escribirte.';
      if (v.replace(/\D/g, '').length < 9) return 'Escribe el número completo, con prefijo si es de fuera de España.';
      return '';
    },
    punto_partida: function (v) {
      return v ? '' : 'Elige en qué punto estás.';
    },
    objetivo: function (v) {
      if (v.trim().length < 5) return 'Cuéntanoslo aunque sea en una línea.';
      return '';
    },
    freno: function (v) {
      if (v.trim().length < 5) return 'Cuéntanoslo aunque sea en una línea.';
      return '';
    },
    dispuesta: function (v) {
      return v ? '' : 'Responde sí o no, con sinceridad.';
    },
    consentimiento: function (v) {
      return v ? '' : 'Necesitamos tu consentimiento para poder contactarte.';
    }
  };

  function valueOf(form, name) {
    const node = form.elements[name];
    if (!node) return '';

    /* RadioNodeList: devuelve el valor marcado o cadena vacía. */
    if (node instanceof RadioNodeList || (node.length && !node.tagName)) return node.value;
    if (node.type === 'checkbox') return node.checked ? node.value || 'on' : '';
    return node.value;
  }

  function fieldWrapper(form, name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function setError(form, name, message) {
    const wrapper = fieldWrapper(form, name);
    if (!wrapper) return;

    const output = wrapper.querySelector('.field__error');
    wrapper.classList.toggle('has-error', Boolean(message));
    if (output) output.textContent = message;

    const control = form.elements[name];
    if (control && control.setAttribute && !control.length) {
      control.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function validate(form) {
    let firstBad = null;

    Object.keys(RULES).forEach(function (name) {
      const message = RULES[name](valueOf(form, name));
      setError(form, name, message);
      if (message && !firstBad) firstBad = name;
    });

    return firstBad;
  }

  function initForm() {
    const form = document.querySelector('[data-apply-form]');
    if (!form) return;

    const button = form.querySelector('[data-submit]');
    const status = form.querySelector('[data-status]');
    const buttonLabel = button ? button.textContent : '';

    /* Limpia el error de un campo en cuanto la usuaria lo corrige. */
    form.addEventListener('input', function (event) {
      const name = event.target.name;
      if (RULES[name]) setError(form, name, '');
    });

    form.addEventListener('change', function (event) {
      const name = event.target.name;
      if (RULES[name]) setError(form, name, '');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (status) status.hidden = true;

      const firstBad = validate(form);

      if (firstBad) {
        const wrapper = fieldWrapper(form, firstBad);
        if (wrapper) {
          wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const control = wrapper.querySelector('input, textarea');
          if (control) control.focus({ preventScroll: true });
        }
        return;
      }

      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('PEGAR_AQUI') === 0) {
        if (status) {
          status.textContent = 'Configuración pendiente: falta pegar APPS_SCRIPT_URL en main.js. La solicitud no se ha enviado.';
          status.hidden = false;
        }
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Enviando…';
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form))
      })
        .then(function () {
          window.location.href = GRACIAS_URL;
        })
        .catch(function () {
          if (button) {
            button.disabled = false;
            button.textContent = buttonLabel;
          }
          if (status) {
            status.textContent = 'No hemos podido enviar tu solicitud. Revisa tu conexión e inténtalo otra vez.';
            status.hidden = false;
          }
        });
    });
  }

  /* ===================================================================
     8. Arranque
     =================================================================== */

  function init() {
    initConsent();
    initHeader();
    initStickyCta();
    initFaq();
    initReveal();
    initVideos();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
