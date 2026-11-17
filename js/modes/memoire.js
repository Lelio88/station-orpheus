/**
 * memoire.js — Module « Mémoire de VEGA » : questions de cours en
 * répétition espacée (boîtes de Leitner 0 à 5).
 *
 * Déroulé d'une carte : l'élève RÉDIGE sa réponse (comme sur la copie),
 * puis la compare au modèle et coche les points de barème présents.
 * ≥ 75 % des points → la carte monte d'une boîte ; < 40 % → retour boîte 0.
 * Intervalles (jours) par boîte : 0, 1, 2, 3, 5, 8 — resserrés car l'examen
 * est dans quelques jours.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p } = O.util;
  const INTERVAL = [0, 1, 2, 3, 5, 8];
  const DAY = 86400000;

  function dueCards() {
    const now = Date.now();
    const st = O.store.state.flash;
    return O.data.flashcards
      .filter((c) => !st[c.id] || (st[c.id].due || 0) <= now)
      .sort((a, b) => ((st[a.id] || {}).box || 0) - ((st[b.id] || {}).box || 0));
  }

  function grade(card, ratio) {
    const prev = O.store.state.flash[card.id] || { box: 0 };
    let box = prev.box || 0;
    if (ratio >= 0.75) box = Math.min(5, box + 1);
    else if (ratio < 0.4) box = 0;
    O.store.update((s) => { s.flash[card.id] = { box, due: Date.now() + INTERVAL[box] * DAY, seen: (prev.seen || 0) + 1 }; });
    O.store.gainXP(Math.round(4 + 10 * ratio), 'Mémoire de VEGA');
  }

  function cardView(mount, card, onDone) {
    const ans = h('textarea', { class: 'answer', id: 'mem-answer', placeholder: 'Rédige ta réponse comme sur la copie (phrases complètes, exemple si demandé)…' });
    const reveal = h('button', { class: 'btn primary', type: 'button' }, 'Comparer au modèle');
    const after = h('div', { class: 'stack', hidden: true });
    const chap = O.data.codex.find((c) => c.id === card.ch);
    O.util.add(mount, 
      h('div', { class: 'row between' }, h('span', { class: 'tag sodium' }, 'Annale ' + card.src), chap ? h('a', { class: 'tag vega', href: '#codex--' + chap.id }, 'Cours : ' + chap.title) : null),
      h('p', { class: 'card-q' }, card.q),
      h('label', { for: 'mem-answer', class: 'faint' }, 'Ta réponse'),
      ans, h('div', { class: 'row' }, reveal), after);
    reveal.addEventListener('click', () => {
      reveal.disabled = true;
      const boxes = card.pts.map((pt, i) => h('input', { type: 'checkbox', id: 'pt-' + i }));
      const validate = h('button', { class: 'btn primary', type: 'button' }, 'Valider mon auto-correction');
      after.hidden = false;
      O.util.add(after, 
        O.util.callout('copy', 'Réponse modèle', card.model),
        h('h3', null, 'Coche les points présents dans TA réponse'),
        h('ul', { class: 'checks' }, card.pts.map((pt, i) => h('li', null, h('label', { for: 'pt-' + i }, boxes[i], h('span', null, pt))))),
        h('div', { class: 'row' }, validate));
      validate.addEventListener('click', () => {
        const ratio = boxes.filter((b) => b.checked).length / boxes.length;
        validate.disabled = true;
        boxes.forEach((b) => { b.disabled = true; });
        O.fx.sound[ratio >= 0.75 ? 'ok' : 'bad']();
        grade(card, ratio);
        after.appendChild(h('div', { class: 'row' },
          h('span', { class: 'pill-score ' + O.util.scoreClass(ratio) }, O.util.pct(ratio) + ' % des points'),
          h('button', { class: 'btn', type: 'button', onclick: onDone }, 'Carte suivante')));
      });
    });
    ans.focus();
  }

  function view(viewEl) {
    const st = O.store.state.flash;
    const counts = [0, 0, 0, 0, 0, 0];
    O.data.flashcards.forEach((c) => { counts[(st[c.id] || {}).box || 0] += 1; });
    const mount = h('section', { class: 'panel chamfer' });
    O.util.add(viewEl, 
      O.ui.pageHead('Module 05 · Mémoire de VEGA', 'Les questions de cours, à rédiger', 'Les ' + O.data.flashcards.length + ' questions de cours des médians A11 à A25 (et les notions des cours 6 et 7). Rédige d\'abord, compare ensuite : c\'est la rédaction qui rapporte des points, pas la reconnaissance.'),
      h('div', { class: 'panel' },
        h('span', { class: 'eyebrow' }, 'Répartition par niveau de mémoire'),
        h('div', { class: 'boxes' }, counts.map((n, i) => h('span', null, 'Niveau ' + i + ' : ' + n))),
        p(dueCards().length + ' carte(s) à revoir maintenant. Une carte réussie revient de plus en plus tard ; une carte ratée revient tout de suite.', 'dim')),
      mount);
    function next() {
      mount.innerHTML = '';
      const due = dueCards();
      if (!due.length) {
        O.util.add(mount, O.ui.vega('Toutes tes cartes sont à jour. Reviens demain, ou entraîne-toi au Réacteur en attendant.'),
          h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => { mount.innerHTML = ''; cardView(mount, O.util.pick(O.data.flashcards), next); } }, 'Réviser une carte au hasard quand même')));
        return;
      }
      cardView(mount, due[0], next);
    }
    next();
  }

  O.modes = O.modes || {};
  O.modes.memoire = view;
})(window);
