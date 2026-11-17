/**
 * fx.js — Ambiance de la station : champ d'étoiles, sons synthétisés,
 * notifications, écran de promotion, badges.
 *
 * Choix : sons générés en WebAudio (aucun fichier à charger, marche hors
 * ligne) et démarrés seulement après une interaction, comme l'exigent les
 * navigateurs. Le champ d'étoiles s'arrête si prefers-reduced-motion.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h } = O.util;

  // ---------- Étoiles ----------
  function starfield() {
    const c = document.getElementById('starfield');
    if (!c || !c.getContext) return;
    const ctx = c.getContext('2d');
    const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars = [];
    function resize() {
      c.width = root.innerWidth * (root.devicePixelRatio || 1);
      c.height = root.innerHeight * (root.devicePixelRatio || 1);
      const n = Math.min(260, Math.floor((root.innerWidth * root.innerHeight) / 6000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height, z: Math.random() * 0.8 + 0.2,
        warm: Math.random() < 0.08,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach((s) => {
        ctx.fillStyle = s.warm ? 'rgba(255,181,71,' + s.z * 0.8 + ')' : 'rgba(200,215,255,' + s.z * 0.7 + ')';
        const r = s.z * 1.3 * (root.devicePixelRatio || 1);
        ctx.fillRect(s.x, s.y, r, r);
        if (!reduce) {
          s.x -= s.z * 0.15;
          if (s.x < 0) { s.x = c.width; s.y = Math.random() * c.height; }
        }
      });
      if (!reduce) root.requestAnimationFrame(draw);
    }
    resize();
    root.addEventListener('resize', resize);
    draw();
  }

  // ---------- Sons ----------
  let actx = null;
  function audio() {
    if (!O.store.state.sound) return null;
    try {
      if (!actx) actx = new (root.AudioContext || root.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      return actx;
    } catch (e) { return null; }
  }
  function tone(freq, dur, type, when, vol) {
    const a = audio();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    const t = a.currentTime + (when || 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  const sound = {
    ok() { tone(660, 0.12, 'triangle'); tone(990, 0.18, 'triangle', 0.08); },
    bad() { tone(180, 0.25, 'sawtooth', 0, 0.04); tone(120, 0.3, 'sawtooth', 0.1, 0.035); },
    click() { tone(420, 0.05, 'square', 0, 0.02); },
    level() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.11, 0.07)); },
  };

  // ---------- Notifications ----------
  function toast(title, text, kind, ms) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = h('div', { class: 'toast ' + (kind || '') }, h('b', null, title), text ? ' ' + text : '');
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => t.remove(), ms || 3200);
  }

  function modal(content, opts) {
    const ov = document.getElementById('overlay');
    ov.innerHTML = '';
    const close = () => { ov.hidden = true; ov.innerHTML = ''; if (opts && opts.onClose) opts.onClose(); };
    const panel = h('div', { class: 'panel chamfer', role: 'dialog', 'aria-modal': 'true' }, content);
    ov.appendChild(panel);
    ov.hidden = false;
    ov.onclick = (e) => { if (e.target === ov && !(opts && opts.sticky)) close(); };
    const btn = panel.querySelector('button');
    if (btn) btn.focus();
    return close;
  }

  function levelUp(rankName) {
    sound.level();
    const close = modal([
      h('div', { class: 'eyebrow' }, 'Promotion'),
      h('div', { class: 'levelup' }, h('div', { class: 'big' }, rankName)),
      h('div', { class: 'vega' }, h('div', { class: 'vega-eye' }),
        h('div', { class: 'vega-text' }, h('span', { class: 'who' }, 'VEGA'),
          h('p', null, 'L\'état-major confirme ta promotion. Un nouveau fragment de mon journal est déchiffré : consulte le Journal de bord.'))),
      h('button', { class: 'btn primary', onclick: () => close() }, 'Reprendre le service'),
    ]);
  }

  // ---------- Badges ----------
  const BADGES = [
    { id: 'first', sym: 'I', name: 'Premier contact', desc: 'Gagner tes premiers points d\'expérience.', test: (s) => s.xp > 0 },
    { id: 'combo10', sym: '×10', name: 'Réaction en chaîne', desc: 'Enchaîner 10 verdicts justes au Réacteur.', test: (s) => s.verdict.best >= 10 },
    { id: 'verdict100', sym: '100', name: 'Compilateur humain', desc: 'Répondre à 100 verdicts.', test: (s) => s.verdict.answered >= 100 },
    { id: 'dossier', sym: '§', name: 'Dossier classé', desc: 'Terminer un dossier d\'annale au Réacteur avec 100 %.', test: (s) => Object.values(s.verdict.dossiers).some((x) => x >= 1) },
    { id: 'codex', sym: 'Ω', name: 'Archiviste', desc: 'Réussir le test de mémoire de 8 chapitres des Archives.', test: (s) => Object.values(s.codex).filter((c) => (c.quiz || 0) >= 0.99).length >= 8 },
    { id: 'parsons', sym: '{ }', name: 'Assembleur', desc: 'Réussir 5 assemblages à la Forge.', test: (s) => Object.values(s.forge).filter((f) => f.parsons).length >= 5 },
    { id: 'writer', sym: '✎', name: 'Plume de compilateur', desc: 'Obtenir 90 % au scanner sur 3 rédactions de code.', test: (s) => Object.values(s.forge).filter((f) => (f.write || 0) >= 0.9).length >= 3 },
    { id: 'uml', sym: '◆', name: 'Architecte naval', desc: 'Décoder 15 phrases d\'énoncé sans erreur.', test: (s) => Object.values(s.uml.decoder).filter((x) => x >= 1).length >= 15 },
    { id: 'memo', sym: '∞', name: 'Mémoire vive', desc: 'Monter 20 cartes au niveau 3 ou plus.', test: (s) => Object.values(s.flash).filter((c) => (c.box || 0) >= 3).length >= 20 },
    { id: 'jump', sym: '⟿', name: 'Premier saut', desc: 'Terminer un sujet complet au Simulateur de saut.', test: (s) => Object.values(s.exams).some((r) => r.length) },
    { id: 'jump14', sym: '14', name: 'Saut maîtrisé', desc: 'Obtenir 14/20 ou plus à un sujet.', test: (s) => Object.values(s.exams).some((r) => r.some((x) => x.score / x.max >= 0.7)) },
    { id: 'streak3', sym: '3j', name: 'Quart de veille', desc: 'Réviser 3 jours d\'affilée.', test: (s) => s.streak.count >= 3 },
  ];

  O.badges = {
    list: BADGES,
    check() {
      const s = O.store.state;
      BADGES.forEach((b) => {
        if (!s.badges[b.id] && b.test(s)) {
          s.badges[b.id] = Date.now();
          O.store.save();
          toast('Badge : ' + b.name, b.desc, 'toast-vega');
        }
      });
    },
  };

  O.fx = { starfield, sound, toast, modal, levelUp };
})(window);
