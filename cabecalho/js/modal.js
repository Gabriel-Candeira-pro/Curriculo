// cabecalho/js/modal.js
// Versão resiliente e autoinicializável que funciona com fragments dinâmicos,
// gerencia foco, lazy-load do iframe e respeita animação CSS (classes open/closing).

(function () {
  const ANIM_MS = 340; // deve cobrir a duração das transições CSS

  let initialized = false;

  function setupModal() {
    if (initialized) return true;

    const openBtn = document.getElementById('contateMeBtn');
    const modal = document.getElementById('contatoModal');
    const closeBtn = document.getElementById('modalClose');
    const iframe = document.getElementById('contactFormFrame');
    const overlay = modal ? modal.querySelector('[data-modal-overlay]') : null;

    if (!openBtn || !modal || !closeBtn || !iframe || !overlay) return false;

    let lastFocused = null;
    let closingTimer = null;

    function forceReflow(el) {
      void (el && el.offsetWidth);
    }

    function openModal() {
      if (closingTimer) {
        clearTimeout(closingTimer);
        closingTimer = null;
        modal.classList.remove('closing');
      }

      lastFocused = document.activeElement;
      if (iframe.dataset.src && iframe.src === 'about:blank') iframe.src = iframe.dataset.src;

      // ensure element is visible so transitions apply
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      // remove any closing state and force reflow before adding open
      modal.classList.remove('closing');
      forceReflow(modal);
      modal.classList.add('open');
      document.body.classList.add('modal-open');
      // focus the close button for keyboard users
      closeBtn.focus();
      document.addEventListener('keydown', onKeyDown);
    }

    function finalizeHidden() {
      modal.hidden = true;
      modal.classList.remove('closing');
    }

    function closeModal() {
      // begin closing animation
      modal.classList.remove('open');
      modal.classList.add('closing');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeyDown);

      // wait for animation to finish before hiding from accessibility tree
      if (closingTimer) clearTimeout(closingTimer);
      closingTimer = setTimeout(() => {
        finalizeHidden();
        closingTimer = null;
        if (lastFocused) {
          try { lastFocused.focus(); } catch (e) { /* ignore */ }
        }
      }, ANIM_MS);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'Tab') {
        trapFocus(e);
      }
    }

    function trapFocus(e) {
      const focusable = modal.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Close when clicking overlay background
    overlay.addEventListener('click', (ev) => {
      if (ev.target === ev.currentTarget) closeModal();
    });

    // Open / close handlers
    openBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

    // Keyboard activation on the open button (Enter / Space)
    openBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });

    // Defensive: if modal starts with neither hidden nor aria-hidden consistent, normalize
    if (modal.hasAttribute('hidden') || modal.getAttribute('aria-hidden') === 'true') {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('open', 'closing');
    }

    initialized = true;
    return true;
  }

  // Try immediate setup for cases where fragment is already in DOM
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (setupModal()) return;
  } else {
    document.addEventListener('DOMContentLoaded', () => { if (setupModal()) return; });
  }

  // Observe DOM for dynamically injected fragment and initialize once available
  const mo = new MutationObserver(() => {
    if (setupModal()) mo.disconnect();
  });
  mo.observe(document.body, { childList: true, subtree: true });

})();
