// Estrutura de fragments: id do container -> caminho relativo do arquivo
const FRAGMENTS = {
  "side-nav-placeholder": "side-nav/side-nav.html",
  cabecalho: "cabecalho/cabecalho.html",
  descricao: "descricao/descricao.html",
  habilidades: "habilidades/habilidades.html",
  experiencia: "experiencia/experiencia.html",
  educacao: "educacao/educacao.html",
  atividades: "atividades/atividades.html",
};

async function fetchHtml(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function loadFragment(id, url) {
  const container = document.getElementById(id);
  try {
    const html = await fetchHtml(url);
    container.innerHTML = html;
    container.classList.remove('fragment-loading');
  } catch (err) {
    container.classList.add('error');
    container.textContent = `Erro ao carregar ${url}: ${err.message}`;
    console.error('Erro ao carregar fragmento', id, url, err);
  }
}

export async function loadAllFragments(fragments = FRAGMENTS) {
  const tasks = Object.entries(fragments).map(([id, url]) => loadFragment(id, url));
  await Promise.all(tasks);
  cleanupPlaceholders();
}

function cleanupPlaceholders() {
  document.getElementById('app').querySelectorAll('.fragment-loading').forEach(el => {
    if (el.textContent.includes('Carregando')) el.remove();
  });
}

// Auto-inicializa quando importado no navegador
loadAllFragments().catch(err => console.error('Erro na inicialização dos fragments', err));
