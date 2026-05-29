/* =============================================
   OrçaMármore — Core JS
   Gerenciamento de estado via localStorage
   ============================================= */

'use strict';

// ─── Chaves de localStorage ────────────────────
const KEYS = {
  USUARIO:    'om_usuario',
  EMPRESA:    'om_empresa',
  ORCAMENTOS: 'om_orcamentos',
  CATALOGO:   'om_catalogo',
  COUNTER:    'om_counter',
};

// ─── Usuário ───────────────────────────────────
function getUsuario() {
  try { return JSON.parse(localStorage.getItem(KEYS.USUARIO)); } catch { return null; }
}

function setUsuario(u) {
  localStorage.setItem(KEYS.USUARIO, JSON.stringify(u));
}

function requireAuth() {
  if (!getUsuario()) {
    window.location.href = resolveRoot('login.html');
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem(KEYS.USUARIO);
  window.location.href = resolveRoot('login.html');
}

// ─── Empresa ───────────────────────────────────
function getEmpresa() {
  const def = {
    nome: 'Minha Marmoraria',
    telefone: '',
    whatsapp: '',
    instagram: '',
    endereco: '',
    cnpj: '',
    logo: '',
    corPDF: 'verde',
    obsOrcamento: [
      'Medições definitivas serão realizadas após aprovação do orçamento.',
      'Variações naturais de cor e veios são características do material natural.',
      'Prazo de execução: a combinar após confirmação do pedido.',
      'Garantia de 12 meses contra defeitos de fabricação.',
      'Validade deste orçamento: {{validade}}.',
    ],
    msgWhats: 'Olá {{cliente}}, segue o orçamento Nº {{numero}} no valor de R$ {{valor}}. Qualquer dúvida estou à disposição!',
  };
  try {
    const saved = JSON.parse(localStorage.getItem(KEYS.EMPRESA));
    return saved ? Object.assign({}, def, saved) : def;
  } catch { return def; }
}

function setEmpresa(e) {
  localStorage.setItem(KEYS.EMPRESA, JSON.stringify(e));
}

// ─── Orçamentos ────────────────────────────────
function getOrcamentos() {
  try { return JSON.parse(localStorage.getItem(KEYS.ORCAMENTOS)) || []; } catch { return []; }
}

function setOrcamentos(list) {
  localStorage.setItem(KEYS.ORCAMENTOS, JSON.stringify(list));
}

function saveOrcamento(orc) {
  const list = getOrcamentos();
  const idx  = list.findIndex(o => o.id === orc.id);
  if (idx >= 0) list[idx] = orc;
  else list.unshift(orc);
  setOrcamentos(list);
  return orc;
}

function deleteOrcamento(id) {
  setOrcamentos(getOrcamentos().filter(o => o.id !== id));
}

function getOrcamento(id) {
  return getOrcamentos().find(o => o.id === id) || null;
}

// ─── Catálogo ──────────────────────────────────
function getCatalogo() {
  try { return JSON.parse(localStorage.getItem(KEYS.CATALOGO)) || []; } catch { return []; }
}

function setCatalogo(list) {
  localStorage.setItem(KEYS.CATALOGO, JSON.stringify(list));
}

function saveCatalogoItem(item) {
  const list = getCatalogo();
  const idx  = list.findIndex(c => c.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  setCatalogo(list);
}

function deleteCatalogoItem(id) {
  setCatalogo(getCatalogo().filter(c => c.id !== id));
}

// ─── Utilitários ───────────────────────────────
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatBRL(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function proximoNumero() {
  const counter = parseInt(localStorage.getItem(KEYS.COUNTER) || '0', 10) + 1;
  localStorage.setItem(KEYS.COUNTER, counter);
  const ano = new Date().getFullYear();
  return `${ano}/${String(counter).padStart(4, '0')}`;
}

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function dataValidade(dias = 15) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

function formatData(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function resolveRoot(page) {
  // Detecta se estamos dentro de app/ e sobe um nível
  const path = window.location.pathname;
  if (path.includes('/app/')) return '../' + page;
  return page;
}

// ─── Inicializar avatar na sidebar ─────────────
function initAvatar() {
  const u = getUsuario();
  if (!u) return;
  const av = document.getElementById('avatar');
  const nm = document.getElementById('userName');
  if (av) av.textContent = (u.nome || 'U')[0].toUpperCase();
  if (nm) nm.textContent = u.nomeMarmoraria || u.nome || '';
}

// ─── Marcar link ativo na sidebar ──────────────
function initActiveLink() {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
  });
}

// ─── Toast ─────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ─── Toggle sidebar mobile ─────────────────────
function initSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sb  = document.getElementById('sidebar');
  if (btn && sb) {
    btn.addEventListener('click', () => sb.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (sb.classList.contains('open') && !sb.contains(e.target) && e.target !== btn) {
        sb.classList.remove('open');
      }
    });
  }
}

// ─── Seed de demonstração ──────────────────────
function seedDemo() {
  // Catálogo padrão
  const catalogoPadrao = [
    { id: gerarId(), nome: 'Nicho embutido', descricao: 'Sob medida, com acabamento polido', unidade: 'un' },
    { id: gerarId(), nome: 'Alisar 3cm',      descricao: 'Por metro linear, espessura 3cm',  unidade: 'ml' },
    { id: gerarId(), nome: 'Bancada',          descricao: 'Bancada em mármore ou granito',    unidade: 'm²' },
    { id: gerarId(), nome: 'Piso sob medida',  descricao: 'Piso em mármore ou granito',       unidade: 'm²' },
    { id: gerarId(), nome: 'Soleira',          descricao: 'Por metro linear',                 unidade: 'ml' },
    { id: gerarId(), nome: 'Peitoril',         descricao: 'Por metro linear',                 unidade: 'ml' },
    { id: gerarId(), nome: 'Prateleira',       descricao: 'Prateleira sob medida',            unidade: 'un' },
    { id: gerarId(), nome: 'Pia de banheiro',  descricao: 'Pia esculpida sob medida',         unidade: 'un' },
    { id: gerarId(), nome: 'Cuba integrada',   descricao: 'Cuba escavada na pedra',           unidade: 'un' },
    { id: gerarId(), nome: 'Escada',           descricao: 'Degrau por degrau',                unidade: 'un' },
  ];
  setCatalogo(catalogoPadrao);

  // Orçamentos de exemplo
  const orcs = [
    {
      id: gerarId(),
      numero: '2026/0001',
      cliente: 'Residência Família Almeida',
      data: '2026-05-10',
      validade: '2026-05-25',
      status: 'aprovado',
      material: 'Mármore Champagne',
      valorTotal: 16160,
      ambientes: [
        {
          nome: 'Suíte Master',
          itens: [
            { descricao: 'Nicho embutido', dimensoes: '89 x 36 cm', quantidade: '2 un', observacao: 'Com prateleiras' },
            { descricao: 'Alisar 3cm',     dimensoes: '1,12 x 36 cm', quantidade: '4 ml', observacao: '' },
            { descricao: 'Bancada',        dimensoes: '1,50 x 0,55 m', quantidade: '1 un', observacao: 'Borda reta' },
          ],
        },
        {
          nome: 'Banho Master',
          itens: [
            { descricao: 'Pia de banheiro', dimensoes: '1,20 x 0,55 m', quantidade: '1 un', observacao: 'Cuba integrada' },
            { descricao: 'Nicho embutido',  dimensoes: '60 x 30 cm', quantidade: '1 un', observacao: '' },
            { descricao: 'Alisar 3cm',      dimensoes: '3,80 ml', quantidade: '3,80 ml', observacao: '' },
          ],
        },
      ],
    },
    {
      id: gerarId(),
      numero: '2026/0002',
      cliente: 'Obra Condomínio Verde Mar — Unid. 304',
      data: '2026-05-15',
      validade: '2026-05-30',
      status: 'em-aberto',
      material: 'Granito Preto São Gabriel',
      valorTotal: 8750,
      ambientes: [
        {
          nome: 'Cozinha',
          itens: [
            { descricao: 'Bancada',   dimensoes: '2,80 x 0,60 m', quantidade: '1 un', observacao: 'Recorte cooktop' },
            { descricao: 'Soleira',   dimensoes: '0,90 x 0,15 m', quantidade: '2 un', observacao: '' },
            { descricao: 'Peitoril',  dimensoes: '1,20 ml', quantidade: '1 un', observacao: '' },
          ],
        },
        {
          nome: 'Área de Serviço',
          itens: [
            { descricao: 'Bancada',  dimensoes: '1,50 x 0,55 m', quantidade: '1 un', observacao: 'Recorte tanque' },
            { descricao: 'Soleira',  dimensoes: '0,80 x 0,15 m', quantidade: '1 un', observacao: '' },
          ],
        },
      ],
    },
    {
      id: gerarId(),
      numero: '2026/0003',
      cliente: 'Dr. Rodrigo Ferreira — Casa Nova',
      data: '2026-05-20',
      validade: '2026-06-04',
      status: 'em-producao',
      material: 'Quartzo Branco Polar',
      valorTotal: 22400,
      ambientes: [
        {
          nome: 'Cozinha Gourmet',
          itens: [
            { descricao: 'Bancada',         dimensoes: '4,20 x 0,60 m', quantidade: '1 un', observacao: 'Borda dupla' },
            { descricao: 'Ilha central',    dimensoes: '2,00 x 1,00 m', quantidade: '1 un', observacao: 'Waterfall lateral' },
          ],
        },
        {
          nome: 'Banheiro Social',
          itens: [
            { descricao: 'Pia de banheiro', dimensoes: '0,80 x 0,50 m', quantidade: '1 un', observacao: '' },
            { descricao: 'Nicho embutido',  dimensoes: '45 x 30 cm', quantidade: '2 un', observacao: '' },
          ],
        },
        {
          nome: 'Piso Hall',
          itens: [
            { descricao: 'Piso sob medida', dimensoes: '12 m²', quantidade: '12 m²', observacao: 'Padronagem a definir' },
          ],
        },
      ],
    },
  ];

  // Ajustar contador
  localStorage.setItem(KEYS.COUNTER, '3');
  setOrcamentos(orcs);
}

// ─── Init app ──────────────────────────────────
function initApp() {
  if (!requireAuth()) return;
  initAvatar();
  initActiveLink();
  initSidebarToggle();
}

// ─── Inicialização automática ao carregar ──────
document.addEventListener('DOMContentLoaded', () => {
  // Apenas páginas dentro de app/ precisam de auth
  if (window.location.pathname.includes('/app/')) {
    initApp();
  }
});
