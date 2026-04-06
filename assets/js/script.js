'use strict';

const APP_CONFIG = Object.freeze({
  email: {
    publicKey: ['d0xtWDQxczcxWElfczNJejk='],
    serviceId: ['c2VydmljZV9ldzh0ZWdk'],
    templateId: ['dGVtcGxhdGVfY3psdGZtag=='],
    minSubmitDelayMs: 1500
  },
  selectors: {
    sidebar: '[data-sidebar]',
    sidebarButton: '[data-sidebar-btn]',
    testimonialItems: '[data-testimonials-item]',
    modalContainer: '[data-modal-container]',
    modalCloseButton: '[data-modal-close-btn]',
    modalOverlay: '[data-overlay]',
    modalImage: '[data-modal-img]',
    modalTitle: '[data-modal-title]',
    modalText: '[data-modal-text]',
    filterSelect: '[data-select]',
    filterSelectItems: '[data-select-item]',
    filterSelectValue: '[data-selecct-value]',
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

  sidebarButton.addEventListener('click', () => toggleClass(sidebar));
};

const initTestimonials = () => {
  const items = dom.queryAll(APP_CONFIG.selectors.testimonialItems);
  const modalContainer = dom.query(APP_CONFIG.selectors.modalContainer);
  const closeButton = dom.query(APP_CONFIG.selectors.modalCloseButton);
  const overlay = dom.query(APP_CONFIG.selectors.modalOverlay);
  const modalImage = dom.query(APP_CONFIG.selectors.modalImage);
  const modalTitle = dom.query(APP_CONFIG.selectors.modalTitle);
  const modalText = dom.query(APP_CONFIG.selectors.modalText);

  if (!items.length || !modalContainer || !overlay || !modalImage || !modalTitle || !modalText) {
    return;
  }

  const setModalState = (isOpen) => {
    toggleClass(modalContainer, 'active', isOpen);
    toggleClass(overlay, 'active', isOpen);
  };

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const avatar = dom.query('[data-testimonials-avatar]', item);
      const title = dom.query('[data-testimonials-title]', item);
      const text = dom.query('[data-testimonials-text]', item);

      if (!avatar || !title || !text) {
        return;
      }

      modalImage.src = avatar.src;
      modalImage.alt = avatar.alt;
      updateText(modalTitle, title.textContent?.trim() || 'Testimonial');
      modalText.replaceChildren(text.cloneNode(true));
      setModalState(true);
    });
  });

  closeButton?.addEventListener('click', () => setModalState(false));
  overlay.addEventListener('click', () => setModalState(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setModalState(false);
    }
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
    });
  };

  select?.addEventListener('click', () => toggleClass(select));

  selectItems.forEach((item) => {
    item.addEventListener('click', () => {
      const label = item.textContent?.trim() || 'All';
      updateText(selectValue, label);
      toggleClass(select, 'active', false);
      applyFilter(label.toLowerCase());
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = button.textContent?.trim() || 'All';
      updateText(selectValue, label);
      applyFilter(label.toLowerCase());
      setActiveFilterButton(button);
    });
  });

  document.addEventListener('click', (event) => {
    if (select && !select.parentElement?.contains(event.target)) {
      toggleClass(select, 'active', false);
    }
  });
};

const initNavigation = () => {
  const navigationLinks = dom.queryAll(APP_CONFIG.selectors.navigationLinks);
  const pages = dom.queryAll(APP_CONFIG.selectors.pages);

  if (!navigationLinks.length || !pages.length) {
    return;
  }

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetPage = link.textContent?.trim().toLowerCase();

      pages.forEach((page) => {
        toggleClass(page, 'active', page.dataset.page === targetPage);
      });

      navigationLinks.forEach((navLink) => {
        toggleClass(navLink, 'active', navLink === link);
      });

      scrollToTop();
    });
  });
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
    updateText(submitLabel, loading ? 'Sending...' : 'Send Message');
  };

  const validateForm = () => {
    inputs.forEach((input) => sanitizeFieldValue(input));
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

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      sanitizeFieldValue(input);
      if (statusBox.dataset.state === 'error') {
        setStatus('', '');
      }
      validateForm();
    });

    input.addEventListener('blur', () => sanitizeFieldValue(input));
  });

  validateForm();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const honeypot = form.elements.namedItem('company_website');
    if (honeypot instanceof HTMLInputElement && honeypot.value.trim() !== '') {
      form.reset();
      validateForm();
      return;
    }

    if (!emailConfig) {
      setStatus('The contact service is temporarily unavailable. You can reach me directly by email.', 'error');
      return;
    }

    const now = Date.now();
    if (isSubmitting || now - lastSubmittedAt < APP_CONFIG.email.minSubmitDelayMs) {
      setStatus('Please wait a moment before sending another message.', 'error');
      return;
    }

    if (!validateForm()) {
      setStatus('Please review the form fields before submitting.', 'error');
      return;
    }

    setStatus('', '');
    setSubmitState(true);

    try {
      await emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form);
      lastSubmittedAt = Date.now();
      form.reset();
      setStatus('Your message has been sent successfully. I will reply as soon as possible.', 'success');
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('There was an error sending your message. Please try again in a few minutes.', 'error');
    } finally {
      setSubmitState(false);
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initTestimonials();
  initProjectFilters();
  initNavigation();
  initContactForm();
});
