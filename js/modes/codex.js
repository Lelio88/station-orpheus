/**
 * codex.js — Module « Archives » : lecture des chapitres de cours et
 * test de mémoire à la fin de chacun.
 *
 * Progression : lire un chapitre (bouton « assimilé ») et réussir son test.
 * L'XP du test n'est versée en entier que si le score bat le meilleur score,
 * pour récompenser le progrès plutôt que la répétition mécanique.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p } = O.util;

  function list(view) {
    const s = O.store.state;
    O.util.add(view, 
      O.ui.pageHead('Module 01 · Archives', 'Les mémoires de VEGA', 'Quinze chapitres tirés de tes cours et des questions de cours des annales. Chaque chapitre se termine par un test de mémoire ; les encadrés « Pour la copie » donnent la phrase à écrire le jour J.'),
      h('div', { class: 'list' }, O.data.codex.map((c) => {
        const st = s.codex[c.id] || {};
        const score = st.quiz || 0;
        return h('a', { class: 'list-item', href: '#codex--' + c.id },
          h('div', { class: 'l' }, h('span', { class: 't' }, c.num + ' · ' + c.title), h('span', { class: 'meta' }, c.exam)),
          h('div', { class: 'row' },
            st.read ? h('span', { class: 'tag ok' }, 'Lu') : h('span', { class: 'tag' }, 'À lire'),
            h('span', { class: 'pill-score ' + O.util.scoreClass(score) }, O.util.pct(score) + ' %')));
      })));
  }

  function quiz(c, mount) {
    let i = 0;
    let good = 0;
    const qs = c.quiz;
    function step() {
      mount.innerHTML = '';
      if (i >= qs.length) {
        const score = good / qs.length;
        const prev = (O.store.state.codex[c.id] || {}).quiz || 0;
        O.store.update((s) => { s.codex[c.id] = { ...(s.codex[c.id] || {}), quiz: Math.max(prev, score) }; });
        O.store.gainXP(score > prev ? 8 * good : good, 'Test de mémoire');
        O.util.add(mount, 
          h('h3', null, 'Résultat : ' + good + ' / ' + qs.length),
          O.ui.vega(score >= 0.99 ? 'Fragment restauré intégralement. Passe au chapitre suivant.' : score >= ((O.campaign && O.campaign.NEED) || 0.7) ? 'Test réussi. Relis l’explication de la question manquée : c’est elle que tu risques de rater le jour du médian.' : 'Relis les encadrés du chapitre puis retente le test : la mémoire se consolide en se trompant.'),
          h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => { i = 0; good = 0; step(); } }, 'Refaire le test')));
        return;
      }
      const q = qs[i];
      O.util.add(mount, 
        h('span', { class: 'eyebrow' }, 'Question ' + (i + 1) + ' / ' + qs.length),
        O.ui.mcq({ q: q.q, c: q.c, a: q.a, why: q.why, onAnswer: (ok) => {
          if (ok) good += 1;
          mount.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { i += 1; step(); } }, i + 1 < qs.length ? 'Question suivante' : 'Voir le résultat')));
        } }));
    }
    step();
  }

  function chapter(view, id) {
    const all = O.data.codex;
    const idx = all.findIndex((c) => c.id === id);
    const c = all[idx];
    if (!c) { list(view); return; }
    const st = O.store.state.codex[c.id] || {};
    const readBtn = h('button', { class: 'btn' + (st.read ? ' ghost' : ' primary'), type: 'button', disabled: !!st.read }, st.read ? 'Chapitre assimilé' : 'Marquer comme assimilé');
    readBtn.addEventListener('click', () => {
      O.store.update((s) => { s.codex[c.id] = { ...(s.codex[c.id] || {}), read: true }; });
      O.store.gainXP(15, 'Chapitre lu');
      readBtn.disabled = true;
      readBtn.textContent = 'Chapitre assimilé';
      readBtn.className = 'btn ghost';
    });
    const quizMount = h('div', { class: 'stack' });
    const prev = all[idx - 1];
    const next = all[idx + 1];
    O.util.add(view, 
      O.ui.pageHead('Archives · chapitre ' + c.num, c.title, 'Au médian : ' + c.exam, 'codex'),
      h('article', { class: 'panel prose' }, O.ui.blocks(c.blocks), h('div', { class: 'row' }, readBtn)),
      h('section', { class: 'panel chamfer', id: 'mission-target' }, h('span', { class: 'eyebrow' }, 'Test de mémoire'), quizMount),
      h('nav', { class: 'row between', 'aria-label': 'Chapitres' },
        prev ? h('a', { class: 'btn ghost', href: '#codex--' + prev.id }, '← ' + prev.title) : h('span'),
        next ? h('a', { class: 'btn', href: '#codex--' + next.id }, next.title + ' →') : h('a', { class: 'btn', href: '#codex' }, 'Sommaire')));
    quiz(c, quizMount);
  }

  O.modes = O.modes || {};
  O.modes.codex = (view, param) => (param ? chapter(view, param) : list(view));
})(window);
