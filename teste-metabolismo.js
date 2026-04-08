const QUESTIONS = [
  "Você sente que emagrece cada vez mais devagar?",
  "Já tentou várias dietas e recuperou o peso?",
  "Tem mais fome do que antes?",
  "Sua gordura se concentra mais no abdômen?",
  "Mesmo treinando, seu peso quase não muda?"
];

const RESULTS = [
  {
    type: "SENSÍVEL",
    color: "#5DC229",
    badge: "Tudo bem por aqui",
    desc: "Ótima notícia! Seu metabolismo ainda responde bem a mudanças. Você está na janela ideal para otimizar seus resultados e manter sua saúde metabólica.",
    cta: "QUERO OTIMIZAR MEUS RESULTADOS",
    msg: "Metabolismo Sensível"
  },
  {
    type: "ADAPTADO",
    color: "#D4AF37",
    badge: "Atenção necessária",
    desc: "Seu corpo já começa a se adaptar. As estratégias tradicionais podem perder eficiência em breve. Agir agora é o que evita uma resistência futura.",
    cta: "QUERO AGIR ANTES QUE PIORE",
    msg: "Metabolismo Adaptado"
  },
  {
    type: "RESISTENTE",
    color: "#FF6B35",
    badge: "Intervenção indicada",
    desc: "Seu metabolismo está resistente. Dieta e treino sozinhos dificilmente darão os resultados que você espera. Uma abordagem médica especializada é o próximo passo.",
    cta: "QUERO UMA ABORDAGEM ESPECIALIZADA",
    msg: "Metabolismo Resistente"
  },
  {
    type: "DESATIVADO",
    color: "#FF3B30",
    badge: "Reativação necessária",
    desc: "Seu metabolismo está desativado. Isso explica por que você faz tudo certo e nada funciona. A Reativação Metabólica é o caminho para mudar isso de vez.",
    cta: "QUERO REATIVAR MEU METABOLISMO",
    msg: "Metabolismo Desativado"
  }
];

let current   = 0;
let simCount  = 0;
let locked    = false;

/* ── Cursor glow (desktop) ── */
const cursorGlow = document.createElement('div');
cursorGlow.id = 'cursor-glow';
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

/* ── Ripple ── */
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.2;
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.cssText = `
    width:${size}px; height:${size}px;
    left:${(e.clientX - rect.left) - size / 2}px;
    top:${(e.clientY - rect.top) - size / 2}px;
    background:${btn.id === 'btn-sim' ? 'rgba(255,255,255,0.22)' : 'rgba(255,59,48,0.2)'};
  `;
  btn.appendChild(span);
  setTimeout(() => span.remove(), 560);
}

/* ── Particles on SIM ── */
function addParticles(btn, e) {
  const rect = btn.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const dist  = 28 + Math.random() * 36;
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.cssText = `
      left:${cx}px; top:${cy}px;
      --tx:${(Math.cos(angle) * dist).toFixed(1)}px;
      --ty:${(Math.sin(angle) * dist).toFixed(1)}px;
    `;
    btn.appendChild(p);
    setTimeout(() => p.remove(), 560);
  }
}

document.getElementById('btn-sim').addEventListener('click', function(e) {
  addRipple(this, e);
  addParticles(this, e);
  answer(true);
});

document.getElementById('btn-nao').addEventListener('click', function(e) {
  addRipple(this, e);
  answer(false);
});

/* ── Screen switch (rAF forces animation replay) ── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  requestAnimationFrame(() => document.getElementById(id).classList.add('active'));
}

/* ── Progress count roll ── */
function rollCount(text) {
  const el = document.getElementById('prog-count');
  el.classList.remove('count-roll');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('count-roll');
  el.textContent = text;
  setTimeout(() => el.classList.remove('count-roll'), 280);
}

/* ── Quiz flow ── */
function startQuiz() {
  current  = 0;
  simCount = 0;
  loadQ();
  show('s-question');
}

function loadQ() {
  const n = current + 1;
  document.getElementById('q-num').textContent  = `Pergunta ${String(n).padStart(2, '0')}`;
  document.getElementById('q-text').textContent = QUESTIONS[current];
  rollCount(`${n} / 5`);
  document.getElementById('prog-fill').style.width = `${(n / 5) * 100}%`;

  const inner = document.getElementById('q-inner');
  inner.classList.remove('exit');
  inner.classList.add('enter');
  setTimeout(() => inner.classList.remove('enter'), 380);
  locked = false;
}

function answer(isSim) {
  if (locked) return;
  locked = true;
  if (isSim) simCount++;

  const inner = document.getElementById('q-inner');
  inner.classList.add('exit');

  setTimeout(() => {
    current++;
    if (current >= QUESTIONS.length) {
      showLoading();
    } else {
      loadQ();
    }
  }, 220);
}

/* ── Loading transition ── */
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('active');

  // Restart bar animation
  const bar = overlay.querySelector('.loading-bar-fill');
  bar.style.animation = 'none';
  void bar.offsetWidth;
  bar.style.animation = '';

  setTimeout(() => {
    overlay.classList.remove('active');
    showResult();
  }, 1200);
}

/* ── Show result ── */
function showResult() {
  const idx = Math.min(simCount, 3);
  const r   = RESULTS[idx];

  document.documentElement.style.setProperty('--result-color', r.color);
  document.getElementById('r-glow').style.background  = r.color;
  document.getElementById('r-badge').textContent      = r.badge;
  document.getElementById('r-badge').style.color      = r.color;

  const typeEl = document.getElementById('r-type');
  typeEl.textContent   = r.type;
  typeEl.style.textShadow = `0 0 35px ${r.color}55, 0 0 75px ${r.color}22`;

  // Score dots — spring pop with staggered delay
  const dotsEl = document.getElementById('r-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const d     = document.createElement('div');
    const isOn  = i < simCount;
    d.className = 's-dot' + (isOn ? ' on' : '');
    if (isOn) {
      d.style.animationDelay = `${0.5 + i * 0.09}s`;
      d.style.boxShadow = `0 0 8px ${r.color}88`;
    }
    dotsEl.appendChild(d);
  }

  document.getElementById('r-desc').textContent = r.desc;

  const msg = encodeURIComponent(
    `Olá Dr. Gustavo! Fiz o teste metabólico e meu resultado foi: ${r.msg}. Gostaria de saber mais sobre o tratamento.`
  );
  const cta = document.getElementById('r-cta');
  cta.href        = `https://wa.me/5511975853526?text=${msg}`;
  cta.textContent = r.cta;
  cta.style.background = r.color;

  show('s-result');
}

/* ── Restart ── */
function restart() {
  current  = 0;
  simCount = 0;
  show('s-intro');
}
