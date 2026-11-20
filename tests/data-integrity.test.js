/**
 * Intégrité du contenu : références croisées, QCM bien formés, corrigés de
 * la Forge reconnus par leur propre scanner, dossiers exécutables.
 * Lancer : node --test Revision/tests
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

globalThis.window = globalThis;
const load = (f) => require(path.join(__dirname, '..', 'js', f));
const E = load('engine/verdict-engine.js');
['data/universes.js', 'data/lore.js', 'data/codex.js', 'data/flashcards.js', 'data/dossiers.js', 'data/uml.js', 'data/uml-lessons.js', 'data/seq-lessons.js', 'data/patterns-lessons.js', 'data/forge.js', 'data/exams.js'].forEach(load);
const D = globalThis.ORPHEUS.data;
const U = globalThis.ORPHEUS.UNIVERSES;

const checkMcq = (where, q) => {
  assert.ok(Array.isArray(q.c) && q.c.length >= 2, where + ' : au moins deux choix');
  assert.ok(q.a >= 0 && q.a < q.c.length, where + ' : index de bonne réponse valide');
  assert.ok(q.why, where + ' : explication présente');
};

test('QCM des Archives et du Bureau bien formés', () => {
  D.codex.forEach((c) => c.quiz.forEach((q, i) => checkMcq(c.id + '#' + i, q)));
  D.uml.decoder.forEach((q) => checkMcq(q.id, q));
  D.uml.translate.forEach((q) => checkMcq(q.id, q));
  D.umlLessons.drill.forEach((q) => checkMcq(q.id, q));
});

test('diagrammes de séquence : messages entre objets existants, créations cohérentes', () => {
  const seqs = [];
  const S = D.seqLessons;
  S.entries.forEach((e) => seqs.push([e.id, e.d]));
  S.examples.forEach((e) => seqs.push([e.title, e.d]));
  S.drill.forEach((q) => { if (q.seq) seqs.push([q.id, q.seq]); q.c.filter((c) => c.seq).forEach((c) => seqs.push([q.id, c.seq])); });
  D.patternLessons.lessons.forEach((l) => seqs.push([l.id, l.seq]));
  const walk = (items, acc) => items.forEach((it) => {
    if (it.from) acc.push(it);
    if (it.items) walk(it.items, acc);
    if (it.branches) it.branches.forEach((b) => walk(b.items, acc));
  });
  seqs.forEach(([id, d]) => {
    const ids = new Set(d.actors.map((a) => a.id));
    const msgs = [];
    walk(d.items, msgs);
    msgs.forEach((m) => assert.ok(ids.has(m.from) && ids.has(m.to), id + ' : message ' + m.label));
    d.actors.filter((a) => a.created).forEach((a) => assert.ok(msgs.some((m) => m.kind === 'create' && m.to === a.id), id + ' : ' + a.label + ' créé sans message de création'));
  });
});

test('leçons de patrons : une par exercice de la Forge, QCM valides', () => {
  const L = D.patternLessons;
  L.lessons.forEach((l) => {
    assert.ok(D.forge.find((f) => f.id === l.id && f.kind === 'patron'), l.id + ' sans exercice');
    assert.ok(l.uml || D.forge.find((f) => f.id === l.id).diagram, l.id + ' sans diagramme de classes');
    if (l.uml) {
      const ids = new Set(l.uml.classes.map((c) => c.id));
      l.uml.edges.forEach((e) => assert.ok(ids.has(e.from) && ids.has(e.to), l.id + ' arête'));
    }
  });
  assert.equal(L.lessons.length, D.forge.filter((f) => f.kind === 'patron').length);
  L.drill.forEach((q) => checkMcq(q.id, q));
  D.seqLessons.drill.forEach((q) => checkMcq(q.id, q));
});

test('leçon UML : chaque relation du dictionnaire est dessinée avec la bonne arête', () => {
  const expected = { dependance: 'dep', association: 'navig', agregation: 'aggr', composition: 'comp', heritage: 'inherit', realisation: 'realize' };
  Object.entries(expected).forEach(([id, kind]) => {
    const e = D.umlLessons.entries.find((x) => x.id === id);
    assert.ok(e, id);
    assert.equal(e.d.edges[0].kind, kind, id);
  });
  const names = ['Dépendance', 'Association', 'Agrégation', 'Composition', 'Héritage', 'Réalisation'];
  const kinds = ['dep', 'navig', 'aggr', 'comp', 'inherit', 'realize'];
  D.umlLessons.drill.filter((q) => q.q === 'Quelle relation est dessinée ?').forEach((q) => {
    assert.equal(names[q.a], names[kinds.indexOf(q.uml.edges[0].kind)], q.id + ' : la bonne réponse correspond au dessin');
  });
});

test('identifiants uniques', () => {
  const uniq = (arr, name) => assert.equal(new Set(arr).size, arr.length, name);
  uniq(D.codex.map((x) => x.id), 'codex');
  uniq(D.flashcards.map((x) => x.id), 'cartes');
  uniq(D.forge.map((x) => x.id), 'forge');
  uniq(D.dossiers.map((x) => x.id), 'dossiers');
  uniq(D.uml.decoder.concat(D.uml.translate).map((x) => x.id), 'uml');
});

test('chaque corrigé de la Forge passe son propre scanner', () => {
  D.forge.forEach((ex) => {
    const src = ex.solution.map((s) => s.lines.join('\n')).join('\n').replace(/\/\/[^\n]*/g, '').replace(/[ \t]+/g, ' ');
    ex.checks.forEach((c) => assert.ok(new RegExp(c.re, 'i').test(src), ex.id + ' : « ' + c.label + ' » non reconnu dans le corrigé'));
    const lines = [].concat(...ex.solution.map((s) => s.lines));
    (ex.distractors || []).forEach((d) => assert.ok(!lines.includes(d), ex.id + ' : la ligne piège « ' + d + ' » est aussi dans le corrigé'));
  });
});

test('les dossiers s\'exécutent dans le moteur', () => {
  D.dossiers.forEach((d) => {
    const w = typeof d.universe === 'string' ? U[d.universe] : d.universe;
    assert.ok(w, d.id + ' : univers introuvable');
    const env = {};
    d.cases.forEach((c) => { const r = E.runCase(w, env, c.stmts); assert.ok(r.verdict, d.id + ' ' + c.label); });
  });
});

test('dossiers inédits : verdicts attendus', () => {
  const run = (id) => {
    const d = D.dossiers.find((x) => x.id === id);
    const w = typeof d.universe === 'string' ? U[d.universe] : d.universe;
    const env = {};
    return d.cases.map((c) => E.runCase(w, env, c.stmts));
  };
  const h = run('HANGAR').map((r) => r.verdict);
  assert.deepEqual(h, ['compile', 'ok', 'compile', 'ok', 'ok', 'compile', 'ClassCastException', 'compile']);
  const o = run('ORPHEUS').map((r) => r.verdict);
  assert.deepEqual(o, ['ok', 'ok', 'compile', 'ok', 'compile', 'ok', 'compile', 'ClassCastException']);
  const a14 = run('A14').map((r) => r.verdict);
  assert.deepEqual(a14, ['ok', 'ok', 'ok', 'compile', 'ok', 'compile', 'ok', 'ClassCastException', 'ok']);
});

test('les sujets référencent du contenu existant', () => {
  D.exams.forEach((ex) => ex.parts.forEach((pt) => pt.questions.forEach((q) => {
    const where = ex.id + ' ' + q.n;
    if (q.card) assert.ok(D.flashcards.find((c) => c.id === q.card), where + ' carte');
    if (q.forge) assert.ok(D.forge.find((f) => f.id === q.forge), where + ' forge');
    if (q.plan) assert.ok(D.uml.plans.find((f) => f.id === q.plan), where + ' plan');
    if (q.dossier) assert.ok(D.dossiers.find((f) => f.id === q.dossier), where + ' dossier');
    const hasKeys = (q.keys && q.keys.length) || q.card;
    assert.ok(hasKeys, where + ' : barème');
  })));
  D.flashcards.forEach((c) => assert.ok(D.codex.find((x) => x.id === c.ch), c.id + ' chapitre ' + c.ch));
});

test('les arêtes UML relient des classes existantes', () => {
  const diagrams = [];
  D.uml.plans.forEach((p) => diagrams.push([p.id, p.diagram]));
  D.uml.translate.filter((t) => t.uml).forEach((t) => diagrams.push([t.id, t.uml]));
  D.forge.filter((f) => f.diagram).forEach((f) => diagrams.push([f.id, f.diagram]));
  D.codex.forEach((c) => c.blocks.filter((b) => b.t === 'uml').forEach((b) => diagrams.push([c.id, b.d])));
  D.umlLessons.entries.forEach((e) => diagrams.push([e.id, e.d]));
  D.umlLessons.drill.filter((q) => q.uml).forEach((q) => diagrams.push([q.id, q.uml]));
  D.umlLessons.drill.forEach((q) => q.c.filter((c) => c.uml).forEach((c) => diagrams.push([q.id, c.uml])));
  diagrams.forEach(([id, d]) => {
    const ids = new Set(d.classes.map((c) => c.id || c.name));
    (d.edges || []).forEach((e) => assert.ok(ids.has(e.from) && ids.has(e.to), id + ' : arête ' + e.from + '→' + e.to));
  });
});
