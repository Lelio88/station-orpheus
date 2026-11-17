/**
 * campaign.js — Déroulé de la campagne (O.campaign) : mission en cours,
 * modules déverrouillés, réussites et transitions.
 *
 * Boucle : briefing (scène d'ouverture du module, au lancement de sa première
 * mission) → exercice → réussite à 70 % → bandeau « Mission accomplie » →
 * scène de transition (tr-…, final) → mission suivante.
 * Choix non évidents :
 *  - la réussite est détectée en relisant l'état après chaque sauvegarde
 *    (O.store.onChange) : aucun module n'a besoin de connaître la campagne ;
 *  - la transition attend un clic sur le bandeau au lieu de couvrir l'écran de
 *    correction que l'élève est en train de lire ;
 *  - au premier chargement d'une VERSION de la campagne, les missions déjà
 *    réussies avec la progression existante sont validées sans cinématique ;
 *  - si une réussite valide d'un coup plusieurs missions (exercices déjà faits
 *    plus loin dans la liste), seule la transition de la dernière est jouée :
 *    c'est elle qui annonce la mission en cours, et les scènes ne s'enchaînent pas.
 * Invariants : les missions se valident strictement dans l'ordre ; un module
 * est accessible dès que sa première mission est la mission en cours ; le
 * pont et le Journal de bord restent toujours accessibles.
 * Exemple : if (O.campaign.guard('forge', view)) return;  // écran verrouillé
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p } = O.util;
  const NEED = 0.7;
  /** À incrémenter quand la liste ou l'ordre des missions change (data/campaign.js). */
  const VERSION = 2;
  const HINT_MS = 9000;
  const MODULES = ['codex', 'reacteur', 'plans', 'forge', 'memoire', 'saut'];

  const M = () => O.data.campaign;
  const cs = () => O.store.state.campaign;
  const need = (m) => m.need || NEED;
  const safeScore = (m) => { try { return m.score(O.store.state) || 0; } catch (e) { return 0; } };

  function currentIndex() {
    const done = cs().done;
    const i = M().findIndex((m) => !done[m.id]);
    return i === -1 ? M().length : i;
  }
  const current = () => M()[currentIndex()] || null;
  const finished = () => currentIndex() >= M().length;

  function unlocked(module) {
    if (!MODULES.includes(module) || finished()) return true;
    return M().slice(0, currentIndex() + 1).some((m) => m.module === module);
  }
  /** Première mission qui ouvre ce module (pour l'écran verrouillé). */
  const opener = (module) => M().findIndex((m) => m.module === module);

  // ------------------------------------------------------------ détection
  let busy = false;
  const last = {};
  function check() {
    if (busy || !O.data.campaign) return;
    busy = true;
    try {
      const c = cs();
      if (!c.init) {
        O.store.update((s) => {
          for (const m of M()) { if (safeScore(m) >= need(m)) s.campaign.done[m.id] = Date.now(); else break; }
          s.campaign.init = true;
        });
      }
      const won = [];
      let m = current();
      while (m && safeScore(m) >= need(m)) {
        won.push(m);
        const id = m.id;
        O.store.update((s) => { s.campaign.done[id] = Date.now(); });
        m = current();
      }
      if (won.length) {
        const scene = won[won.length - 1].scene;
        O.store.update((s) => { s.campaign.pending.push(scene); });
        O.fx.sound.level();
        banner();
      } else if (m && m.hint) {
        const sc = safeScore(m);
        if (last[m.id] !== undefined && sc > last[m.id] && sc < need(m)) {
          O.fx.toast('VEGA · objectif à ' + O.util.pct(need(m)) + ' %, tu es à ' + O.util.pct(sc) + ' %', m.hint, 'toast-vega', HINT_MS);
        }
      }
      M().forEach((x) => { last[x.id] = safeScore(x); });
    } finally {
      busy = false;
    }
  }

  // ------------------------------------------------------------ transitions
  function playPending(then) {
    const list = cs().pending.slice();
    O.store.update((s) => { s.campaign.pending = []; });
    banner();
    if (!list.length) { if (then) then(); return; }
    list.forEach((id, i) => O.cinema.play(id, i === list.length - 1 ? { onEnd: () => { if (then) then(); else if (location.hash === '' || location.hash === '#hub') root.dispatchEvent(new HashChangeEvent('hashchange')); } } : {}));
  }

  function banner() {
    let el = document.getElementById('mission-banner');
    const n = cs().pending.length;
    if (!n) { if (el) el.remove(); return; }
    if (!el) {
      el = h('div', { id: 'mission-banner', class: 'mission-banner', role: 'status' });
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    const go = h('button', { class: 'btn primary', type: 'button' }, 'Voir la transmission ▶');
    go.addEventListener('click', () => playPending());
    O.util.add(el, h('div', null, h('span', { class: 'eyebrow' }, 'Mission accomplie'), h('b', null, n > 1 ? n + ' transmissions entrantes' : 'Transmission entrante de la station')), go);
  }

  /** Lance la mission en cours : briefing du module s'il n'a pas été vu, puis l'exercice. */
  function launch(m) {
    const go = () => { location.hash = m.route; };
    const seen = O.store.state.story.seen;
    if (O.cinema && !seen[m.module]) O.cinema.play(m.module, { onEnd: go });
    else go();
  }

  // ------------------------------------------------------------ affichage
  function track() {
    const i = currentIndex();
    return h('div', { class: 'mission-track', 'aria-hidden': 'true' }, M().map((m, k) => h('i', { class: k < i ? 'done' : k === i ? 'on' : '', title: m.title })));
  }

  /** Panneau « mission en cours » du pont. */
  function panel() {
    const i = currentIndex();
    if (cs().pending.length) {
      return h('section', { class: 'panel chamfer mission-panel' }, h('span', { class: 'eyebrow' }, 'Mission accomplie'), h('h2', null, 'Une transmission t\'attend'), track(),
        O.ui.vega('Objectif atteint. Écoute la transmission : elle t\'ouvre la mission suivante.'),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => playPending() }, 'Voir la transmission ▶')));
    }
    if (i >= M().length) {
      return h('section', { class: 'panel chamfer mission-panel' }, h('span', { class: 'eyebrow' }, 'Campagne terminée · ' + M().length + ' / ' + M().length), h('h2', null, 'La station est réparée'), track(),
        O.ui.vega('Tous les modules sont ouverts en accès libre. D\'ici le médian : une session de Mémoire par jour, les dossiers du Réacteur que tu n\'as pas encore faits, et le sujet A25 la veille, en conditions réelles.'));
    }
    const m = M()[i];
    const sc = safeScore(m);
    const md = O.data.lore.modules[m.module];
    return h('section', { class: 'panel chamfer mission-panel' },
      h('div', { class: 'row between' }, h('span', { class: 'eyebrow' }, 'Mission ' + String(i + 1).padStart(2, '0') + ' / ' + M().length + ' · ' + md.name), h('span', { class: 'tag sodium' }, 'Réussite : ' + O.util.pct(need(m)) + ' %')),
      h('h2', null, m.title), track(),
      p(m.goal),
      h('div', { class: 'mission-score' }, O.ui.powerBar(Math.min(1, sc / need(m))), h('span', { class: 'dim' }, sc > 0 ? 'Meilleur résultat : ' + O.util.pct(sc) + ' %' : 'Pas encore tenté')),
      sc > 0 && sc < need(m) && m.hint ? O.ui.vega('Indice : ' + m.hint) : null,
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => launch(m) }, sc > 0 ? 'Retenter la mission' : 'Lancer la mission')));
  }

  /** Écran d'un module encore verrouillé ; renvoie true si la route est bloquée. */
  function guard(name, view) {
    if (unlocked(name)) return false;
    const k = opener(name);
    const md = O.data.lore.modules[name];
    const cur = current();
    O.util.add(view, O.ui.pageHead('Module verrouillé', md.name, 'Ce module s\'ouvre avec la mission ' + (k + 1) + ' de la campagne.'),
      h('section', { class: 'panel chamfer' },
        O.ui.vega('La Rouille bloque encore l\'accès à ce module. Termine les missions dans l\'ordre : chacune prépare la suivante.'),
        cur ? h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => launch(cur) }, 'Mission en cours : ' + cur.title), h('a', { class: 'btn ghost', href: '#hub' }, 'Retour au pont')) : null));
    return true;
  }

  function start() {
    if (cs().version !== VERSION) {
      O.store.update((s) => { s.campaign = { done: {}, pending: [], init: false, version: VERSION }; });
    }
    check();
    banner();
    O.store.onChange(check);
  }

  O.campaign = { start, check, panel, guard, unlocked, current, currentIndex, finished, launch, playPending, opener };
})(window);
