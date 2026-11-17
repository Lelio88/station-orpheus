/**
 * Intégrité des cinématiques et de la campagne : chaque réplique a son doublage
 * (fichier audio et entrée de voices.js à jour), chaque plan utilise un décor
 * existant et un personnage connu, chaque mission a sa propre transition et
 * mène à un exercice qui existe, et chaque TD, TP et patron des annales a sa mission.
 * Lancer : node --test tests/*.test.js
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

globalThis.window = globalThis;
const root = path.join(__dirname, '..');
require(path.join(root, 'js/data/story.js'));
require(path.join(root, 'js/data/voices.js'));
const D = globalThis.ORPHEUS.data;
const shotNames = [...fs.readFileSync(path.join(root, 'js/core/cinema-shots.js'), 'utf8').matchAll(/shots\.(\w+) =/g)].map((m) => m[1]);

test('chaque réplique a son fichier audio et sa durée', () => {
  D.story.scenes.forEach((sc) => sc.beats.filter((b) => b.who).forEach((b) => {
    assert.ok(D.voices[b.id], b.id + ' : absent de voices.js (relancer tools/gen-voices.mjs)');
    assert.ok(D.voices[b.id].d > 0.5, b.id + ' : durée');
    assert.ok(fs.existsSync(path.join(root, 'audio', b.id + '.mp3')), b.id + ' : fichier audio');
  }));
});

test('le doublage correspond au texte actuel des répliques', () => {
  const cache = JSON.parse(fs.readFileSync(path.join(root, 'tools/voices-cache.json'), 'utf8'));
  const ids = D.story.scenes.flatMap((sc) => sc.beats.filter((b) => b.who).map((b) => b.id));
  ids.forEach((id) => assert.ok(cache[id], id + ' : jamais doublé'));
});

test('décors, personnages et durées des plans muets', () => {
  D.story.scenes.forEach((sc) => sc.beats.forEach((b, i) => {
    const where = sc.id + '#' + (i + 1);
    assert.ok(shotNames.includes(b.shot), where + ' : décor inconnu ' + b.shot);
    if (b.who) assert.ok(D.story.cast[b.who], where + ' : personnage inconnu');
    else assert.ok(b.dur > 0, where + ' : plan muet sans durée');
  }));
});

test('scènes : identifiants uniques, ouverture de chaque module présente', () => {
  const ids = D.story.scenes.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  ['prologue', 'codex', 'reacteur', 'plans', 'forge', 'memoire', 'saut', 'veille', 'final'].forEach((id) => assert.ok(ids.includes(id), id));
});

test('campagne : chaque mission a sa transition, un exercice existant et un score lisible', () => {
  ['codex.js', 'dossiers.js', 'uml.js', 'uml-lessons.js', 'forge.js', 'exams.js', 'flashcards.js', 'campaign.js'].forEach((f) => require(path.join(root, 'js/data', f)));
  const ids = D.story.scenes.map((s) => s.id);
  const modules = ['codex', 'reacteur', 'plans', 'forge', 'memoire', 'saut'];
  const empty = { codex: {}, verdict: { dossiers: {} }, uml: { notation: {}, plans: {} }, forge: {}, flash: {}, exams: {} };
  const seenScenes = new Set();
  D.campaign.forEach((m, i) => {
    assert.ok(ids.includes(m.scene), m.id + ' : scène ' + m.scene);
    assert.ok(!seenScenes.has(m.scene), m.id + ' : transition réutilisée');
    seenScenes.add(m.scene);
    assert.ok(modules.includes(m.module), m.id + ' : module');
    const [route, param] = m.route.slice(1).split('--');
    assert.equal(route, m.module, m.id + ' : la route mène au module de la mission');
    if (route === 'codex') assert.ok(D.codex.some((c) => c.id === param), m.id + ' : chapitre');
    if (route === 'reacteur') assert.ok(D.dossiers.some((d) => 'd-' + d.id === param), m.id + ' : dossier');
    if (route === 'forge') assert.ok(D.forge.some((f) => f.id === param), m.id + ' : exercice');
    if (route === 'plans' && !['apprendre', 'sequence'].includes(param)) assert.ok(D.uml.plans.some((p) => p.id === param), m.id + ' : plan');
    if (route === 'saut') assert.ok(D.exams.some((x) => x.id === param), m.id + ' : sujet');
    assert.equal(m.score(empty), 0, m.id + ' : score nul au départ');
    assert.ok(m.goal && (m.hint || m.need === 1), m.id + ' : objectif et indice');
    if (i === D.campaign.length - 1) assert.equal(m.scene, 'final');
  });
  modules.forEach((mod) => assert.ok(D.campaign.some((m) => m.module === mod), 'module jamais ouvert : ' + mod));
});

test('campagne : tout ce qui a été vu en TD et TP, et chaque patron des annales, a sa mission', () => {
  const routes = D.campaign.map((m) => m.route);
  const need = {
    'TP 1 (tableaux) et TP 2 (packages)': ['#codex--jvm', '#forge--matrice'],
    'TD 1 (objets, equals)': ['#codex--objets', '#forge--equals'],
    'static (questions de cours)': ['#codex--static', '#forge--static-compteur'],
    'TD 2 (héritage, abstrait, anonymes)': ['#codex--heritage', '#codex--polymorphisme', '#codex--abstrait', '#reacteur--d-HANGAR', '#codex--imbriquees'],
    'TD 3 (interfaces, enum, figures)': ['#codex--enum', '#forge--point-col'],
    'TD 4 (collections)': ['#codex--collections', '#forge--collections'],
    'UML classes et séquences': ['#plans--apprendre', '#plans--sequence'],
    'patrons': ['singleton', 'template', 'fabrique', 'adaptateur', 'decorateur', 'composite', 'observateur', 'visiteur'].map((x) => '#forge--' + x),
  };
  Object.entries(need).forEach(([what, list]) => list.forEach((r) => assert.ok(routes.includes(r), what + ' : aucune mission vers ' + r)));
  assert.equal(new Set(D.campaign.map((m) => m.id)).size, D.campaign.length, 'identifiants de mission uniques');
});
