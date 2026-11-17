/**
 * store.js — Progression du cadet : XP, rang, série de jours, maîtrise par module.
 *
 * Choix : sauvegarde dans localStorage (une clé), toujours entourée de
 * try/catch. Si le stockage est indisponible (navigation privée, aperçu),
 * la station fonctionne quand même : la progression vit en mémoire.
 * Invariant : state.v identifie le schéma ; tout champ manquant est
 * recomplété par defaults() au chargement (migration douce).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const KEY = 'orpheus-lo02-v1';

  const RANKS = [
    { xp: 0, name: 'Cadet' },
    { xp: 150, name: 'Enseigne' },
    { xp: 400, name: 'Lieutenant' },
    { xp: 800, name: 'Lieutenant-commandant' },
    { xp: 1400, name: 'Commandant' },
    { xp: 2200, name: 'Capitaine' },
    { xp: 3200, name: 'Amiral de flotte' },
  ];

  function defaultExamDate() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  function defaults() {
    return {
      v: 1, name: '', examDate: defaultExamDate(), sound: true, xp: 0,
      streak: { last: null, count: 0 },
      codex: {}, verdict: { answered: 0, correct: 0, recent: [], best: 0, dossiers: {} },
      uml: { notation: {}, seq: {}, decoder: {}, translate: {}, plans: {} }, learn: { patrons: {}, lus: {} },
      forge: {}, flash: {}, exams: {}, badges: {},
      story: { seen: {}, auto: true, voice: true },
      campaign: { done: {}, pending: [], init: false },
    };
  }

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      if (!raw) return defaults();
      const s = JSON.parse(raw);
      const d = defaults();
      return { ...d, ...s, verdict: { ...d.verdict, ...s.verdict }, uml: { ...d.uml, ...s.uml }, learn: { ...d.learn, ...s.learn }, streak: { ...d.streak, ...s.streak }, story: { ...d.story, ...s.story, seen: { ...((s.story || {}).seen || {}) } }, campaign: { ...d.campaign, ...s.campaign, done: { ...((s.campaign || {}).done || {}) }, pending: ((s.campaign || {}).pending || []).slice() } };
    } catch (e) {
      return defaults();
    }
  }

  let state = load();
  const listeners = [];

  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible : on reste en mémoire */ }
    listeners.forEach((f) => f(state));
  }

  function rankOf(xp) {
    let r = RANKS[0];
    let next = null;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].xp) { r = RANKS[i]; next = RANKS[i + 1] || null; }
    }
    return { ...r, index: RANKS.indexOf(r), next };
  }

  function touchStreak() {
    const today = O.util.todayISO();
    if (state.streak.last === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yIso = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    state.streak = { last: today, count: state.streak.last === yIso ? state.streak.count + 1 : 1 };
  }

  /** Ajoute de l'XP et signale une montée en grade. */
  function gainXP(n, reason) {
    const before = rankOf(state.xp);
    state.xp += Math.max(0, Math.round(n));
    touchStreak();
    save();
    const after = rankOf(state.xp);
    if (O.fx) {
      O.fx.toast('+' + Math.round(n) + ' XP', reason);
      if (after.index > before.index) O.fx.levelUp(after.name, after.index);
    }
    if (O.badges) O.badges.check();
  }

  function update(fn) {
    fn(state);
    save();
  }

  /** Maîtrise de chaque module, de 0 à 1 : sert aux barres d'énergie du pont. */
  function mastery() {
    const D = O.data || {};
    const codexIds = (D.codex || []).map((c) => c.id);
    const codex = codexIds.length ? codexIds.reduce((a, id) => {
      const c = state.codex[id] || {};
      return a + (c.read ? 0.4 : 0) + 0.6 * (c.quiz || 0);
    }, 0) / codexIds.length : 0;

    const rec = state.verdict.recent;
    const acc = rec.length ? rec.reduce((a, b) => a + b, 0) / rec.length : 0;
    const vol = Math.min(1, state.verdict.answered / 60);
    const doss = (D.dossiers || []).length ? (D.dossiers || []).reduce((a, d) => a + (state.verdict.dossiers[d.id] || 0), 0) / D.dossiers.length : 0;
    const reacteur = 0.55 * acc * vol + 0.45 * doss;

    const avgMap = (obj, ids) => (ids.length ? ids.reduce((a, id) => a + (obj[id] || 0), 0) / ids.length : 0);
    const U = D.uml || { decoder: [], translate: [], plans: [] };
    const N = (D.umlLessons || { drill: [] }).drill;
    const SQ = (D.seqLessons || { drill: [] }).drill;
    const plans = 0.15 * avgMap(state.uml.notation, N.map((x) => x.id)) +
      0.1 * avgMap(state.uml.seq, SQ.map((x) => x.id)) +
      0.2 * avgMap(state.uml.decoder, U.decoder.map((x) => x.id)) +
      0.2 * avgMap(state.uml.translate, U.translate.map((x) => x.id)) +
      0.35 * avgMap(state.uml.plans, U.plans.map((x) => x.id));

    const F = D.forge || [];
    const exos = F.length ? F.reduce((a, f) => {
      const s = state.forge[f.id] || {};
      return a + 0.4 * (s.parsons ? 1 : 0) + 0.6 * (s.write || 0);
    }, 0) / F.length : 0;
    const PL = D.patternLessons || { lessons: [], drill: [] };
    const learn = state.learn || {};
    const lecons = PL.lessons.length ? 0.5 * Object.keys(learn.lus || {}).length / PL.lessons.length +
      0.5 * avgMap(learn.patrons || {}, PL.drill.map((x) => x.id)) : 0;
    const forge = 0.2 * Math.min(1, lecons) + 0.8 * exos;

    const cards = D.flashcards || [];
    const memoire = cards.length ? cards.reduce((a, c) => a + Math.min(1, ((state.flash[c.id] || {}).box || 0) / 4), 0) / cards.length : 0;

    const ex = D.exams || [];
    const saut = ex.length ? ex.reduce((a, e) => {
      const runs = state.exams[e.id] || [];
      const best = runs.reduce((m, r) => Math.max(m, r.score / r.max), 0);
      return a + best;
    }, 0) / ex.length : 0;

    return { codex, reacteur, plans, forge, memoire, saut };
  }

  O.store = {
    get state() { return state; }, save, update, gainXP, rankOf, RANKS, mastery,
    onChange(f) { listeners.push(f); },
    reset() { state = defaults(); save(); },
  };
})(window);
