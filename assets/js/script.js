'use strict';

/*
  EmailJS: estos tres valores son públicos por diseño (viajan al navegador
  en cualquier caso). La protección real está en el panel de EmailJS:
  limita los dominios permitidos a mayky23.github.io.
*/
const EMAIL_CONFIG = Object.freeze({
  publicKey: 'wLmX41s71XI_s3Iz9',
  serviceId: 'service_u9cc6ot',
  templateId: 'template_czltfmj',
  minSubmitDelayMs: 1500
});

document.documentElement.classList.add('js');

/* ---------- Modo claro / oscuro ---------- */

const THEME_COLORS = { light: '#E9ECEF', dark: '#121923' };

const readStoredTheme = () => {
  try { return localStorage.getItem('theme'); } catch { return null; }
};

const initThemeToggle = () => {
  const button = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
    if (button) {
      button.setAttribute('aria-label', theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
    }
  };

  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  button?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch { /* sin almacenamiento: dura solo esta visita */ }
  });

  // Si el visitante no ha elegido, se sigue el tema del sistema en vivo
  media.addEventListener?.('change', (event) => {
    if (!readStoredTheme()) apply(event.matches ? 'dark' : 'light');
  });
};

/* ---------- Filtros de proyectos ---------- */

const initFilters = () => {
  const group = document.querySelector('[data-filters]');
  const status = document.querySelector('[data-filter-status]');
  const entries = Array.from(document.querySelectorAll('.archive .entry'));
  if (!group || !entries.length) return;

  const buttons = Array.from(group.querySelectorAll('button[data-filter]'));

  const apply = (button) => {
    const value = button.dataset.filter;
    let shown = 0;

    entries.forEach((entry) => {
      const match = value === 'all' || entry.dataset.category === value;
      entry.hidden = !match;
      if (match) shown += 1;
    });

    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

    if (status) {
      const label = button.firstChild?.textContent?.trim() || '';
      status.textContent = value === 'all'
        ? `Mostrando los ${shown} proyectos`
        : `Mostrando ${shown} ${shown === 1 ? 'proyecto' : 'proyectos'} de ${label}`;
    }
  };

  buttons.forEach((button) => button.addEventListener('click', () => apply(button)));
};

/* ---------- Sección activa en el menú ---------- */

const initActiveNav = () => {
  const links = Array.from(document.querySelectorAll('[data-nav]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map((link) => [link.hash.slice(1), link]));
  const sections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.hash.slice(1) === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const visible = new Set();
  const observer = new IntersectionObserver((records) => {
    records.forEach((r) => (r.isIntersecting ? visible.add(r.target.id) : visible.delete(r.target.id)));
    const current = sections.find((s) => visible.has(s.id));
    setActive(current ? current.id : null);
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => observer.observe(s));
};

/* ---------- Formulario de contacto ---------- */

const MESSAGES = {
  from_name: 'Escribe tu nombre.',
  reply_to: 'Escribe un correo válido, por ejemplo nombre@dominio.com.',
  message: 'Escribe el mensaje.'
};

const sanitize = (field) => {
  const value = field.value.trim();
  if (field.name === 'from_name') field.value = value.replace(/\s+/g, ' ');
  else if (field.name === 'reply_to') field.value = value.toLowerCase();
  else if (field.tagName === 'TEXTAREA') field.value = value.replace(/\r\n/g, '\n');
};

const setFieldError = (field, message) => {
  const id = `${field.id}-error`;
  let node = document.getElementById(id);

  if (message) {
    if (!node) {
      node = document.createElement('p');
      node.id = id;
      node.className = 'field-error';
      field.insertAdjacentElement('afterend', node);
    }
    node.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', id);
  } else {
    node?.remove();
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
};

const errorMessageFor = (error) => {
  const code = Number(error?.status);
  const text = String(error?.text || error?.message || '').toLowerCase();

  if (code === 429) return 'Se ha alcanzado el límite de envíos. Vuelve a intentarlo más tarde o escríbeme por email.';
  if (!navigator.onLine || code === 0) return 'Sin conexión. Revisa tu conexión a internet y vuelve a enviarlo.';
  if (code === 401 || code === 403 || text.includes('origin') || text.includes('public key')) {
    return 'El formulario no está disponible ahora mismo. Escríbeme directamente a maroldandh@gmail.com.';
  }
  return 'No se ha podido enviar el mensaje. Vuelve a intentarlo en unos minutos o escríbeme a maroldandh@gmail.com.';
};

const initContactForm = () => {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const button = form.querySelector('[data-form-btn]');
  const status = form.querySelector('[data-form-status]');
  const fields = Array.from(form.querySelectorAll('input[required], textarea[required]'));
  let sending = false;
  let lastSentAt = 0;

  const setStatus = (text, state = '') => {
    status.textContent = text;
    status.dataset.state = state;
  };

  const validate = (field) => {
    sanitize(field);
    const ok = field.checkValidity();
    setFieldError(field, ok ? '' : MESSAGES[field.name]);
    return ok;
  };

  fields.forEach((field) => {
    // Al salir del campo solo se marca (sin insertar texto) para no mover el
    // botón de envío bajo el cursor; los mensajes aparecen al enviar.
    field.addEventListener('blur', () => {
      if (!field.value) return;
      sanitize(field);
      if (field.checkValidity()) setFieldError(field, '');
      else if (!document.getElementById(`${field.id}-error`)) field.setAttribute('aria-invalid', 'true');
    });
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) setFieldError(field, '');
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const honeypot = form.elements.namedItem('company_website');
    if (honeypot && honeypot.value.trim() !== '') {
      form.reset();
      return;
    }

    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      setStatus('');
      invalid[0].focus();
      return;
    }

    if (typeof window.emailjs === 'undefined') {
      setStatus('El formulario no está disponible ahora mismo. Escríbeme directamente a maroldandh@gmail.com.', 'error');
      return;
    }

    if (sending || Date.now() - lastSentAt < EMAIL_CONFIG.minSubmitDelayMs) return;

    sending = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Enviando…';
    setStatus('');

    try {
      await window.emailjs.sendForm(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, form, {
        publicKey: EMAIL_CONFIG.publicKey
      });
      lastSentAt = Date.now();
      form.reset();
      setStatus('Mensaje enviado. Te responderé lo antes posible.', 'success');
    } catch (error) {
      console.error('EmailJS:', { status: error?.status, text: error?.text });
      setStatus(errorMessageFor(error), 'error');
    } finally {
      sending = false;
      button.removeAttribute('aria-busy');
      button.textContent = 'Enviar mensaje';
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initFilters();
  initActiveNav();
  initContactForm();
});
