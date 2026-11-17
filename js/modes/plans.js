/**
 * plans.js — Module « Bureau des plans » : partie UML du médian.
 *
 * Trois onglets : Décodeur d'énoncé (phrase → modélisation), Traduction
 * UML ⇄ Java, Plans complets (énoncé d'annale, brouillon sur papier,
 * corrigé guidé étape par étape, diagramme modèle, auto-évaluation).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p } = O.util;
  const asChoice = (c) => (typeof c === 'string' && c.includes('\n') ? { code: c } : c);

  /**
   * Série de QCM enchaînés ; les résultats vont dans state[bucket][key][id].
   * Partagée avec la Forge (O.quizSeries) pour l'entraînement aux patrons.
   */
  function series(mount, items, key, label, bucket) {
    const B = bucket || 'uml';
    let i = 0;
    let good = 0;
    const order = O.util.shuffle(items);
    function step() {
      mount.innerHTML = '';
      if (i >= order.length) {
        O.util.add(mount, h('h3', null, label + ' : ' + good + ' / ' + order.length),
          O.ui.vega(good === order.length ? 'Plans conformes. L\'architecte en chef serait fier.' : 'Relis les explications des erreurs : ce sont exactement les indices que le sujet glisse dans son énoncé.'),
          h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { i = 0; good = 0; step(); } }, 'Recommencer')));
        return;
      }
      const it = order[i];
      const done = (ok) => {
        if (ok) good += 1;
        O.store.update((s) => {
          s[B] = s[B] || {};
          s[B][key] = s[B][key] || {};
          s[B][key][it.id] = Math.max(s[B][key][it.id] || 0, ok ? 1 : 0);
        });
        O.store.gainXP(ok ? 10 : 2, label);
        mount.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { i += 1; step(); } }, 'Suivant')));
      };
      const head = h('div', { class: 'row between' }, h('span', { class: 'eyebrow' }, (i + 1) + ' / ' + order.length), it.src ? h('span', { class: 'tag sodium' }, it.src) : null);
      if (key === 'decoder') {
        O.util.add(mount, head, h('blockquote', { class: 'callout' }, h('b', { class: 'lbl v' }, 'Extrait de l\'énoncé'), p('« ' + it.text + ' »')),
          O.ui.mcq({ q: it.q, c: it.c, a: it.a, why: it.why, onAnswer: done }));
      } else {
        O.util.add(mount, head, O.ui.mcq({ q: it.q, uml: it.uml, seq: it.seq, code: it.code, c: it.c.map(asChoice), a: it.a, why: it.why, onAnswer: done }));
      }
    }
    step();
  }

  function planList(mount) {
    const st = O.store.state.uml.plans;
    O.util.add(mount, p('Chaque plan reprend l\'énoncé intégral d\'une annale. Fais ton diagramme **sur papier** (comme le jour J), puis déroule le corrigé étape par étape et auto-évalue-toi avec le barème.', 'dim'),
      h('div', { class: 'list' }, O.data.uml.plans.map((pl) => h('a', { class: 'list-item', href: '#plans--' + pl.id },
        h('div', { class: 'l' }, h('span', { class: 't' }, pl.title), h('span', { class: 'meta' }, pl.src)),
        h('span', { class: 'pill-score ' + O.util.scoreClass(st[pl.id] || 0) }, O.util.pct(st[pl.id] || 0) + ' %')))));
  }

  function plan(view, id) {
    const pl = O.data.uml.plans.find((x) => x.id === id);
    if (!pl) { menu(view); return; }
    const stepsMount = h('div', { class: 'stack' });
    let shown = 0;
    const nextBtn = h('button', { class: 'btn primary', type: 'button' }, 'Révéler l\'étape 1 du corrigé');
    const final = h('div', { class: 'stack', hidden: true });
    nextBtn.addEventListener('click', () => {
      const s = pl.steps[shown];
      stepsMount.appendChild(h('div', { class: 'callout' }, h('b', { class: 'lbl v' }, 'Étape ' + (shown + 1) + ' · ' + s.t), h('ul', null, s.items.map((x) => h('li', { html: O.util.rich(x) })))));
      shown += 1;
      if (shown < pl.steps.length) nextBtn.textContent = 'Révéler l\'étape ' + (shown + 1);
      else { nextBtn.remove(); final.hidden = false; }
    });
    const boxes = pl.rubric.map((r, i) => h('input', { type: 'checkbox', id: 'rb-' + i }));
    const validate = h('button', { class: 'btn primary', type: 'button' }, 'Enregistrer mon score');
    validate.addEventListener('click', () => {
      const ratio = boxes.filter((b) => b.checked).length / boxes.length;
      const prev = O.store.state.uml.plans[pl.id] || 0;
      O.store.update((s) => { s.uml.plans[pl.id] = Math.max(prev, ratio); });
      O.store.gainXP(Math.round(20 + 50 * ratio), 'Plan redessiné');
      validate.disabled = true;
      validate.textContent = 'Score enregistré : ' + O.util.pct(ratio) + ' %';
    });
    O.util.add(final, 
      h('h3', null, 'Proposition de corrigé'),
      p('Plusieurs modélisations sont acceptables si elles sont justifiées. Enums omises sauf mention contraire.', 'faint'),
      O.uml.render(pl.diagram),
      h('h3', null, 'Barème : coche ce que TON diagramme contient'),
      h('ul', { class: 'checks' }, pl.rubric.map((r, i) => h('li', null, h('label', { for: 'rb-' + i }, boxes[i], h('span', null, r))))),
      h('div', { class: 'row' }, validate));
    O.util.add(view, 
      O.ui.pageHead('Bureau des plans · ' + pl.src, pl.title, 'Lis l\'énoncé, souligne les indices, dessine sur papier. Compte 20 à 30 minutes comme au médian.', 'plans'),
      h('section', { class: 'panel prose' }, h('span', { class: 'eyebrow' }, 'Énoncé'), pl.context.map((t) => p(t))),
      h('section', { class: 'panel chamfer' }, h('span', { class: 'eyebrow' }, 'Corrigé guidé'), stepsMount, h('div', { class: 'row' }, nextBtn), final));
  }

  function lesson(mount) {
    const inner = h('div', { class: 'stack' });
    const panes = [
      () => O.notation.dictionary(inner),
      () => series(inner, O.data.umlLessons.drill, 'notation', 'Reconnais la flèche'),
      () => O.notation.traps(inner),
    ];
    O.util.add(mount, 
      O.ui.tabs(['Dictionnaire visuel', 'Entraînement', 'Pièges à éviter'], (i) => { inner.innerHTML = ''; panes[i](); }),
      inner);
    panes[0]();
  }

  function sequence(mount) {
    const inner = h('div', { class: 'stack' });
    const S = O.data.seqLessons;
    const learn = () => {
      O.util.add(inner, 
        O.ui.vega(['Le diagramme de séquence montre **qui appelle qui, et dans quel ordre**. Chaque flèche est un appel de méthode : lis-le comme du code, de haut en bas.', 'Chaque élément ci-dessous est dessiné, puis traduit en Java. Les deux exemples complets à la fin viennent de ton cours et de l\'annale A25.']),
        S.entries.map((e) => h('article', { class: 'panel' },
          h('h3', null, e.title), O.seq.render(e.d),
          h('ul', { class: 'prose' }, e.meaning.map((x) => h('li', { html: O.util.rich(x) }))),
          h('span', { class: 'eyebrow' }, 'En Java'), O.util.code(e.java),
          O.util.callout('trap', 'Piège', e.trap))),
        h('h2', null, 'Exemples complets'),
        S.examples.map((x) => h('article', { class: 'panel' }, h('h3', null, x.title), O.seq.render(x.d), p(x.text), O.util.code(x.java))));
    };
    const panes = [learn, () => series(inner, S.drill, 'seq', 'Diagramme de séquence')];
    O.util.add(mount, O.ui.tabs(['Apprendre', 'Entraînement'], (i) => { inner.innerHTML = ''; panes[i](); }), inner);
    learn();
  }

  function menu(view, tab) {
    const mount = h('div', { class: 'panel chamfer' });
    const panes = [
      () => lesson(mount),
      () => series(mount, O.data.uml.decoder, 'decoder', 'Décodeur d\'énoncé'),
      () => series(mount, O.data.uml.translate, 'translate', 'Traduction UML ⇄ Java'),
      () => planList(mount),
      () => sequence(mount),
    ];
    const select = (i) => { mount.innerHTML = ''; panes[i](); };
    const done = Object.keys(O.store.state.uml.notation || {}).length;
    const start = tab !== undefined ? tab : (done >= O.data.umlLessons.drill.length ? 1 : 0);
    O.util.add(view, 
      O.ui.pageHead('Module 03 · Bureau des plans', 'Redessiner la station en UML', 'La partie II du médian (3 à 8 points) : un énoncé, un diagramme de classes. Ordre conseillé : apprendre la notation, puis décoder des phrases d\'énoncé, traduire UML ⇄ Java, et enfin refaire les plans complets des annales.'),
      O.ui.tabs(['1 · Apprendre la notation', '2 · Décodeur d\'énoncé', '3 · Traduction UML ⇄ Java', '4 · Plans complets', 'Diagramme de séquence'], select, start),
      mount);
    select(start);
  }

  O.modes = O.modes || {};
  O.modes.plans = (view, param) => {
    if (param === 'apprendre') return menu(view, 0);
    if (param === 'sequence') return menu(view, 4);
    return param ? plan(view, param) : menu(view);
  };
  O.quizSeries = series;
})(window);
