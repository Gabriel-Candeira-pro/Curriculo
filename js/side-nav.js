// js/side-nav.js - lógica do painel lateral (módulo)
export function initSideNav() {
  const links = Array.from(document.querySelectorAll('.side-nav__link'));
  if (!links.length) return;

  const idToLink = new Map(links.map(a => [a.dataset.target, a]));

  function clearActive() {
    links.forEach(a => {
      a.classList.remove('active');
      a.setAttribute('aria-current', 'false');
    });
  }

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = a.dataset.target;
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      clearActive();
      a.classList.add('active');
      a.setAttribute('aria-current', 'true');
    });
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      const id = visible.target.id;
      const link = idToLink.get(id);
      if (link) {
        clearActive();
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
      }
    }
  }, {
    root: null,
    rootMargin: '0px 0px -40% 0px',
    threshold: [0, 0.15, 0.4, 0.6, 1]
  });

  const sectionIds = ['cabecalho','descricao','habilidades','experiencia','educacao','atividades'];
  function observeExistingSections() {
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  const app = document.getElementById('app');
  if (app) {
    const mo = new MutationObserver(() => {
      observeExistingSections();
    });
    mo.observe(app, { childList: true, subtree: true });
  }

  observeExistingSections();
}
