/**
 * notation.js — Rendu de la leçon de notation UML (dictionnaire visuel et
 * pièges), utilisé par l'onglet « Apprendre la notation » du Bureau des plans.
 * L'entraînement « Reconnais la flèche » est joué par la série de QCM de plans.js.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p, code, callout } = O.util;

  function entryCard(e) {
    return h('article', { class: 'panel', id: 'notation-' + e.id },
      h('span', { class: 'eyebrow' }, e.group),
      h('h3', null, e.title),
      O.uml.render(e.d),
      h('ul', { class: 'prose' }, e.meaning.map((m) => h('li', { html: O.util.rich(m) }))),
      h('span', { class: 'eyebrow' }, 'En Java'),
      code(e.java),
      callout('', 'Dans l\'énoncé, ça ressemble à', e.cue),
      callout('trap', 'Piège', e.trap));
  }

  function dictionary(mount) {
    const L = O.data.umlLessons;
    const groups = [...new Set(L.entries.map((e) => e.group))];
    const M = L.multiplicities;
    O.util.add(mount, 
      O.ui.vega(['Commence ici. Chaque élément de notation est dessiné, traduit en Java, et relié aux mots de l\'énoncé qui doivent t\'y faire penser.', 'Ordre conseillé : les classes, puis les relations de la plus faible à la plus forte, puis les multiplicités. Ensuite, l\'onglet « Entraînement » vérifie que tu reconnais chaque dessin.']),
      h('nav', { class: 'row', 'aria-label': 'Sommaire de la notation' },
        L.entries.map((e) => h('a', { class: 'tag vega', href: '#', onclick: (ev) => { ev.preventDefault(); document.getElementById('notation-' + e.id).scrollIntoView({ behavior: 'smooth' }); } }, e.title)),
        h('a', { class: 'tag sodium', href: '#', onclick: (ev) => { ev.preventDefault(); document.getElementById('notation-mult').scrollIntoView({ behavior: 'smooth' }); } }, 'Multiplicités')));
    groups.forEach((g) => {
      O.util.add(mount, h('h2', null, g));
      if (g === 'Les relations') {
        O.util.add(mount, O.ui.table(['Relation', 'Trait', 'Extrémité', 'Sens'], [
          ['Dépendance', 'pointillé', 'flèche ouverte >', '« utilise ponctuellement »'],
          ['Association', 'plein', 'rien, ou flèche ouverte (navigabilité)', '« a un » (attribut)'],
          ['Agrégation', 'plein', '◇ losange vide côté tout', 'partage possible, vies indépendantes'],
          ['Composition', 'plein', '◆ losange plein côté tout', 'pas de partage, vies liées'],
          ['Héritage', 'plein', '▷ triangle vide côté mère', '« est un »'],
          ['Réalisation', 'pointillé', '▷ triangle vide côté interface', '« implémente »'],
        ]));
      }
      L.entries.filter((e) => e.group === g).forEach((e) => O.util.add(mount, entryCard(e)));
    });
    O.util.add(mount, h('h2', null, 'Les multiplicités'),
      h('article', { class: 'panel', id: 'notation-mult' },
        O.uml.render(M.d),
        h('ul', { class: 'prose' }, M.howto.map((m) => h('li', { html: O.util.rich(m) }))),
        O.ui.table(['Notation', 'Sens', 'Exemple tiré des sujets'], M.rows)));
  }

  function traps(mount) {
    O.util.add(mount, O.ui.vega('Les erreurs de notation les plus fréquentes. Relis cette liste juste avant de rendre ta copie.'),
      h('div', { class: 'stack' }, O.data.umlLessons.traps.map((t, i) => callout('trap', (i + 1) + '. ' + t.t, t.s))));
  }

  O.notation = { dictionary, traps };
})(window);
