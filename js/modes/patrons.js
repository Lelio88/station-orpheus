/**
 * patrons.js — Leçons sur les patrons de conception (onglet « Apprendre »
 * de la Forge) : vue d'ensemble comparative, une page par patron, et
 * l'entraînement « Quel patron ? » joué par O.quizSeries (plans.js).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p, code, callout } = O.util;

  function lessonById(id) { return O.data.patternLessons.lessons.find((l) => l.id === id); }

  const SIGNATURE = {
    singleton: '`private static Panier instance;` + `private Panier()` + `public static Panier getInstance()`',
    template: '`public final void commander() { this.payer(); this.livrer(); }` + étapes `abstract`',
    fabrique: '`public Vehicule createVehicule(String type) { … return new Velo(); … }`',
    adaptateur: '`class Adaptatrice implements InterfaceObjectif { private Monitoring m; }`',
    decorateur: '`class VoitureAvecOption extends Voiture { private Voiture voiture; }`',
    composite: '`class FormeComplexe implements Forme { private Forme[] formes; }`',
    strategy: '`private Drivable behavior;` + `drive() { this.behavior.driving(this); }`',
    visiteur: '`public void accept(Visitor v) { v.visit(this); }`',
    observateur: '`notifyObservers()` appelle `o.update(this, arg)` sur chaque observateur',
  };

  function overview(mount) {
    const L = O.data.patternLessons;
    const seen = (O.store.state.learn || {}).lus || {};
    O.util.add(mount, 
      O.ui.vega(['Un patron de conception, c\'est une **solution type à un problème qui revient souvent**. Au médian, il est toujours expliqué dans l\'énoncé : ton travail est de **reconnaître sa structure** et de l\'écrire.', 'Pour chaque patron : le problème qu\'il résout, une image pour le retenir, les rôles, le diagramme de classes, **un diagramme de séquence qui montre qui appelle qui**, le squelette de code et les erreurs classiques.']),
      O.ui.table(['Patron', 'Famille', 'En une phrase', 'Signature à repérer dans le code'], L.lessons.map((l) => [l.name, l.family, l.intention, SIGNATURE[l.id] || ''])),
      p('Familles : **création** (comment on fabrique les objets), **structure** (comment on assemble les classes), **comportement** (comment les objets se répartissent le travail).', 'dim'),
      h('div', { class: 'grid-3' }, L.lessons.map((l) => h('a', { class: 'module chamfer', href: '#forge--lecon-' + l.id },
        h('span', { class: 'eyebrow' }, l.family + (seen[l.id] ? ' · lue' : '')),
        h('h3', null, l.name),
        h('p', { class: 'sub', html: O.util.rich(l.problem) })))),
      h('h2', null, 'Entraînement : quel patron ?'),
      h('div', { class: 'panel', id: 'patrons-drill' }));
    O.quizSeries(mount.querySelector('#patrons-drill'), L.drill, 'patrons', 'Quel patron ?', 'learn');
  }

  function lesson(view, id) {
    const l = lessonById(id);
    if (!l) { location.hash = '#forge--apprendre'; return; }
    const ex = O.data.forge.find((f) => f.id === l.id);
    const uml = l.uml || (ex && ex.diagram);
    const all = O.data.patternLessons.lessons;
    const i = all.indexOf(l);
    O.store.update((s) => { s.learn = s.learn || {}; s.learn.lus = s.learn.lus || {}; s.learn.lus[l.id] = true; });
    O.util.add(view, 
      O.ui.pageHead('Forge · leçon · patron de ' + l.family.toLowerCase(), l.name, null, 'forge--apprendre'),
      h('article', { class: 'panel prose' },
        h('h3', null, 'Le problème'), p(l.problem),
        h('h3', null, 'L\'intention'), p(l.intention),
        callout('', 'Pour le retenir', l.image),
        h('h3', null, 'Les rôles'),
        O.ui.table(['Rôle', 'Dans les sujets', 'Responsabilité'], l.roles),
        uml ? h('h3', null, 'La structure (diagramme de classes)') : null,
        uml ? O.uml.render(uml) : null,
        h('h3', null, 'Qui appelle qui (diagramme de séquence)'),
        O.seq.render(l.seq),
        h('h3', null, 'Le squelette de code'),
        code(l.skeleton),
        h('h3', null, 'Le reconnaître dans un énoncé'),
        h('ul', null, l.cues.map((c) => h('li', null, c))),
        h('h3', null, 'Erreurs classiques sur les copies'),
        h('div', { class: 'stack' }, l.mistakes.map((m) => callout('trap', 'Erreur', m)))),
      h('nav', { class: 'row between', 'aria-label': 'Leçons' },
        all[i - 1] ? h('a', { class: 'btn ghost', href: '#forge--lecon-' + all[i - 1].id }, '← ' + all[i - 1].name) : h('span'),
        ex ? h('a', { class: 'btn primary', href: '#forge--' + ex.id }, 'S\'entraîner : ' + ex.title) : null,
        all[i + 1] ? h('a', { class: 'btn ghost', href: '#forge--lecon-' + all[i + 1].id }, all[i + 1].name + ' →') : h('span')));
  }

  O.patrons = { overview, lesson, lessonById };
})(window);
