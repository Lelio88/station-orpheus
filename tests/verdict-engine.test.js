/**
 * Tests du moteur du Réacteur sur les cas officiels des médians A23 et A25.
 * Lancer : node --test Revision/tests
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/engine/verdict-engine.js');
const U = require('../js/data/universes.js');

const W = U.menagerie;

test('A23 : les 9 cas du main de Animal', () => {
  const env = {};
  const run = (stmts) => E.runCase(W, env, stmts);
  let r = run([{ decl: 'Animal', name: 'animal1', expr: { new: 'Animal' } }, { call: 'animal1', m: 'manger' }]);
  assert.equal(r.verdict, 'ok'); assert.deepEqual(r.out, ['Un animal mange']);
  r = run([{ decl: 'Cheval', name: 'cheval1', expr: { new: 'Cheval' } }, { call: 'cheval1', m: 'manger' }]);
  assert.deepEqual(r.out, ['Un animal mange']);
  r = run([{ decl: 'Animal', name: 'albatros1', expr: { new: 'Albatros' } }, { call: 'albatros1', m: 'crier' }]);
  assert.deepEqual(r.out, ['Un animal émet un cri', '... l\'albatros piaule.']);
  r = run([{ decl: 'Animal', name: 'animal3', expr: { new: 'Cheval' } }, { decl: 'Cheval', name: 'cheval2', expr: { var: 'animal3' } }]);
  assert.equal(r.verdict, 'compile'); assert.equal(r.lines[1].fix, 'Cheval cheval2 = (Cheval) animal3');
  r = run([{ decl: 'Animal', name: 'animal4', expr: { new: 'Animal' } }, { decl: 'Cheval', name: 'cheval3', expr: { cast: 'Cheval', of: { var: 'animal4' } } }]);
  assert.equal(r.verdict, 'ClassCastException');
  r = run([{ decl: 'Restaurable', name: 'r' }, { assign: 'r', expr: { var: 'albatros1' } }, { call: 'r', m: 'manger' }]);
  assert.equal(r.verdict, 'ok'); assert.deepEqual(r.out, ['Un albatros mange du krill.']);
  r = run([{ assign: 'r', expr: { var: 'cheval1' } }, { call: 'r', m: 'manger' }]);
  assert.deepEqual(r.out, ['Un animal mange']);
  r = run([{ decl: 'Volable', name: 'v' }, { assign: 'v', expr: { var: 'albatros1' } }, { call: 'v', m: 'voler' }]);
  assert.equal(r.verdict, 'compile'); assert.deepEqual(r.out, ['L\'albatros plane']);
  r = run([{ assign: 'r', expr: { var: 'v' } },
    { instanceof: 'r', type: 'Volable', then: ' r est du type Volable', else: ' r n\'est pas du type Volable' }]);
  assert.equal(r.verdict, 'compile'); assert.deepEqual(r.out, [' r est du type Volable']);
});

test('A25 : tableau, foreach et transtypages', () => {
  const env = {};
  let r = E.runCase(W, env, [
    { array: 'Animal', name: 'liste', elems: ['Animal', 'Cheval', 'Albatros'] },
    { foreach: 'Restaurable', v: 'r', arr: 'liste', m: 'manger' },
    { foreach: 'Animal', v: 'a', arr: 'liste', m: 'crier' }]);
  assert.equal(r.verdict, 'ok');
  assert.deepEqual(r.out, ['Un animal mange', 'Un animal mange', 'Un albatros mange du krill.',
    'Un animal émet un cri', 'Un animal émet un cri', '... le cheval hennit.', 'Un animal émet un cri', '... l\'albatros piaule.']);
  r = E.runCase(W, env, [{ decl: 'Cheval', name: 'cheval1', expr: { idx: 'liste', i: 1 } }, { call: 'cheval1', m: 'crier' }]);
  assert.equal(r.verdict, 'compile'); assert.deepEqual(r.out, ['Un animal émet un cri', '... le cheval hennit.']);
  r = E.runCase(W, env, [{ decl: 'Cheval', name: 'cheval2', expr: { cast: 'Cheval', of: { idx: 'liste', i: 2 } } }]);
  assert.equal(r.verdict, 'ClassCastException');
  r = E.runCase(W, env, [{ decl: 'Volable', name: 'v', expr: { idx: 'liste', i: 2 } }, { call: 'v', m: 'voler' }]);
  assert.equal(r.verdict, 'compile'); assert.deepEqual(r.out, ['L\'albatros plane']);
});

test('règles : abstrait, interface, appel absent du type statique, null, classes finales', () => {
  const H = U.hangar;
  const env = {};
  assert.equal(E.runCase(H, env, [{ decl: 'Vehicule', name: 'v', expr: { new: 'Vehicule' } }]).verdict, 'compile');
  assert.equal(E.runCase(H, env, [{ decl: 'Pilotable', name: 'p', expr: { new: 'Pilotable' } }]).verdict, 'compile');
  E.runCase(H, env, [{ decl: 'Vehicule', name: 'v2', expr: { new: 'Voiture' } }]);
  assert.equal(E.runCase(H, env, [{ call: 'v2', m: 'accelerer' }]).verdict, 'compile');
  // Train est final et n'implémente pas Orientable : transtypage refusé à la compilation.
  E.runCase(H, env, [{ decl: 'Train', name: 't', expr: { new: 'Train' } }]);
  const r = E.runCase(H, env, [{ decl: 'Orientable', name: 'o', expr: { cast: 'Orientable', of: { var: 't' } } }]);
  assert.equal(r.verdict, 'compile');
  E.runCase(H, env, [{ decl: 'Voiture', name: 'n', expr: { null: true } }]);
  assert.equal(E.runCase(H, env, [{ call: 'n', m: 'rouler' }]).verdict, 'NullPointerException');
  const f1 = E.runCase(H, env, [{ decl: 'Vehicule', name: 'f', expr: { new: 'VoitureDeCourse' } }, { call: 'f', m: 'rouler' }]);
  assert.deepEqual(f1.out, ['La voiture roule', '... à 300 km/h']);
});

test('outputOf ne lève pas d\'erreur sur une classe abstraite incomplète', () => {
  assert.equal(E.outputOf(U.orpheus, 'Module', 'diagnostiquer'), null);
  assert.deepEqual(E.outputOf(U.orpheus, 'Reacteur', 'diagnostiquer'), ['Diagnostic standard', 'Plasma injecté']);
});

test('Template Method : this.alimenter() appelé depuis la classe mère', () => {
  const O = U.orpheus;
  const env = {};
  const r = E.runCase(O, env, [{ decl: 'Module', name: 'm', expr: { new: 'Serre' } }, { call: 'm', m: 'diagnostiquer' }]);
  assert.deepEqual(r.out, ['Diagnostic standard', 'Lampes de culture allumées', '... hygrométrie OK']);
});
