'use strict';

const APP_CONFIG = Object.freeze({
  email: {
    publicKey: ['d0xtWDQxczcxWElfczNJejk='],
    serviceId: ['c2VydmljZV91OWNjNm90'],
    templateId: ['dGVtcGxhdGVfY3psdGZtag=='],
    minSubmitDelayMs: 1500
  },
  selectors: {
    sidebar: '[data-sidebar]',
    sidebarButton: '[data-sidebar-btn]',
    filterSelect: '[data-select]',
    filterSelectItems: '[data-select-item]',
    filterSelectValue: '[data-select-value]',
    filterButtons: '[data-filter-btn]',
    filterItems: '[data-filter-item]',
    form: '[data-form]',
    formInputs: '[data-form-input]',
    formButton: '[data-form-btn]',
    formStatus: '[data-form-status]',
    navigationLinks: '[data-nav-link]',
    pages: '[data-page]'
  }
});

const dom = {
  query(selector, scope = document) {
    return scope.querySelector(selector);
  },
  queryAll(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }
};

const decodeValue = (parts) => atob(parts.join(''));

const toggleClass = (element, className = 'active', force) => {
  if (!element) {
    return false;
  }

  if (typeof force === 'boolean') {
    element.classList.toggle(className, force);
    return force;
  }

  return element.classList.toggle(className);
};

const updateText = (element, value) => {
  if (element) {
    element.textContent = value;
  }
};

const normalizeSpaces = (value) => value.replace(/\s+/g, ' ').trim();

const sanitizeFieldValue = (field) => {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return;
  }

  const trimmedValue = field.value.trim();

  if (field.name === 'from_name') {
    field.value = normalizeSpaces(trimmedValue);
    return;
  }

  if (field.name === 'reply_to') {
    field.value = trimmedValue.toLowerCase();
    return;
  }

  if (field.tagName === 'TEXTAREA') {
    field.value = trimmedValue.replace(/\r\n/g, '\n');
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const initSidebar = () => {
  const sidebar = dom.query(APP_CONFIG.selectors.sidebar);
  const sidebarButton = dom.query(APP_CONFIG.selectors.sidebarButton);

  if (!sidebar || !sidebarButton) {
    return;
  }

  sidebarButton.addEventListener('click', () => {
    const isOpen = toggleClass(sidebar);
    sidebarButton.setAttribute('aria-expanded', String(isOpen));
  });
};

const initProjectFilters = () => {
  const select = dom.query(APP_CONFIG.selectors.filterSelect);
  const selectItems = dom.queryAll(APP_CONFIG.selectors.filterSelectItems);
  const selectValue = dom.query(APP_CONFIG.selectors.filterSelectValue);
  const filterButtons = dom.queryAll(APP_CONFIG.selectors.filterButtons);
  const filterItems = dom.queryAll(APP_CONFIG.selectors.filterItems);

  if (!filterItems.length) {
    return;
  }

  const applyFilter = (selectedValue) => {
    filterItems.forEach((item) => {
      const category = (item.dataset.category || '').toLowerCase();
      const shouldShow = selectedValue === 'all' || selectedValue === category;
      toggleClass(item, 'active', shouldShow);
    });
  };

  const setActiveFilterButton = (activeButton) => {
    filterButtons.forEach((button) => {
      toggleClass(button, 'active', button === activeButton);
      button.setAttribute('aria-pressed', String(button === activeButton));
    });
  };

  const setSelectOpen = (open) => {
    toggleClass(select, 'active', open);
    select?.setAttribute('aria-expanded', String(open));
  };

  select?.addEventListener('click', () => setSelectOpen(!select.classList.contains('active')));

  selectItems.forEach((item) => {
    item.addEventListener('click', () => {
      const label = item.textContent?.trim() || 'Todo';
      const filterValue = item.dataset.selectItem || 'All';
      updateText(selectValue, label);
      setSelectOpen(false);
      applyFilter(filterValue.toLowerCase());
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = button.textContent?.trim() || 'Todo';
      const filterValue = button.dataset.filterBtn || 'All';
      updateText(selectValue, label);
      applyFilter(filterValue.toLowerCase());
      setActiveFilterButton(button);
    });
  });

  document.addEventListener('click', (event) => {
    if (select && !select.parentElement?.contains(event.target)) {
      setSelectOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && select?.classList.contains('active')) {
      setSelectOpen(false);
      select.focus();
    }
  });
};

const initNavigation = () => {
  const navigationLinks = dom.queryAll(APP_CONFIG.selectors.navigationLinks);
  const pages = dom.queryAll(APP_CONFIG.selectors.pages);

  if (!navigationLinks.length || !pages.length) {
    return;
  }

  const pageNames = pages.map((page) => page.dataset.page);

  const showPage = (targetPage) => {
    pages.forEach((page) => {
      toggleClass(page, 'active', page.dataset.page === targetPage);
    });

    navigationLinks.forEach((navLink) => {
      const isActive = navLink.dataset.navLink === targetPage;
      toggleClass(navLink, 'active', isActive);
      if (isActive) {
        navLink.setAttribute('aria-current', 'page');
      } else {
        navLink.removeAttribute('aria-current');
      }
    });
  };

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetPage = link.dataset.navLink;
      showPage(targetPage);
      history.replaceState(null, '', targetPage === pageNames[0] ? location.pathname : `#${targetPage}`);
      scrollToTop();
    });
  });

  const showPageFromHash = () => {
    const hashPage = location.hash.slice(1);
    if (pageNames.includes(hashPage)) {
      showPage(hashPage);
    }
  };

  window.addEventListener('hashchange', showPageFromHash);
  showPageFromHash();
};

const initContactForm = () => {
  const form = dom.query(APP_CONFIG.selectors.form);
  const inputs = dom.queryAll(APP_CONFIG.selectors.formInputs);
  const submitButton = dom.query(APP_CONFIG.selectors.formButton);
  const statusBox = dom.query(APP_CONFIG.selectors.formStatus);
  const submitLabel = submitButton ? dom.query('span', submitButton) : null;

  if (!form || !inputs.length || !submitButton || !statusBox) {
    return;
  }

  let isSubmitting = false;
  let lastSubmittedAt = 0;

  const setStatus = (message, state) => {
    updateText(statusBox, message);
    statusBox.dataset.state = state;
    toggleClass(statusBox, 'is-visible', Boolean(message));
  };

  const setSubmitState = (loading) => {
    isSubmitting = loading;
    submitButton.disabled = loading || !form.checkValidity();
    toggleClass(submitButton, 'is-loading', loading);
    updateText(submitLabel, loading ? 'Enviando...' : 'Enviar mensaje');
  };

  const validateForm = ({ sanitize = false } = {}) => {
    if (sanitize) {
      inputs.forEach((input) => sanitizeFieldValue(input));
    }

    submitButton.disabled = !form.checkValidity() || isSubmitting;
    return form.checkValidity();
  };

  const getEmailConfig = () => ({
    publicKey: decodeValue(APP_CONFIG.email.publicKey),
    serviceId: decodeValue(APP_CONFIG.email.serviceId),
    templateId: decodeValue(APP_CONFIG.email.templateId)
  });

  const initializeEmailJs = () => {
    if (typeof emailjs === 'undefined') {
      return null;
    }

    const config = getEmailConfig();
    emailjs.init(config.publicKey);
    return config;
  };

  const emailConfig = initializeEmailJs();

  const getEmailErrorMessage = (error) => {
    const status = Number(error?.status);
    const text = String(error?.text || error?.message || '').toLowerCase();

    if (text.includes('invalid grant') || text.includes('gmail_api')) {
      return 'No se ha podido enviar: hay que reconectar la cuenta de Gmail en EmailJS.';
    }

    if (status === 401 || status === 403 || text.includes('origin') || text.includes('public key')) {
      return 'No se ha podido enviar: revisa la configuración de EmailJS, la clave pública o los dominios permitidos.';
    }

    if (status === 400 || text.includes('template') || text.includes('service')) {
      return 'No se ha podido enviar: revisa el Service ID, Template ID o las variables de la plantilla de EmailJS.';
    }

    if (status === 429) {
      return 'No se ha podido enviar: se ha alcanzado el límite temporal de envíos. Inténtalo de nuevo más tarde.';
    }

    if (!navigator.onLine || status === 0) {
      return 'No se ha podido enviar: revisa la conexión a internet y vuelve a intentarlo.';
    }

    return 'Ha ocurrido un error al enviar tu mensaje. Inténtalo de nuevo en unos minutos.';
  };

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (statusBox.dataset.state === 'error') {
        setStatus('', '');
      }
      validateForm();
    });

    input.addEventListener('blur', () => validateForm({ sanitize: true }));
  });

  validateForm();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const honeypot = form.elements.namedItem('company_website');
    if (honeypot instanceof HTMLInputElement && honeypot.value.trim() !== '') {
      form.reset();
      validateForm({ sanitize: true });
      return;
    }

    if (!emailConfig) {
      setStatus('El servicio de contacto no está disponible temporalmente. Puedes escribirme directamente por email.', 'error');
      return;
    }

    const now = Date.now();
    if (isSubmitting || now - lastSubmittedAt < APP_CONFIG.email.minSubmitDelayMs) {
      setStatus('Espera un momento antes de enviar otro mensaje.', 'error');
      return;
    }

    if (!validateForm({ sanitize: true })) {
      setStatus('Revisa los campos del formulario antes de enviarlo.', 'error');
      return;
    }

    setStatus('', '');
    setSubmitState(true);

    try {
      await emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form, {
        publicKey: emailConfig.publicKey
      });
      lastSubmittedAt = Date.now();
      form.reset();
      setStatus('Tu mensaje se ha enviado correctamente. Responderé lo antes posible.', 'success');
    } catch (error) {
      console.error('EmailJS error:', {
        status: error?.status,
        text: error?.text,
        message: error?.message
      });
      setStatus(getEmailErrorMessage(error), 'error');
    } finally {
      setSubmitState(false);
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initProjectFilters();
  initNavigation();
  initContactForm();
});
