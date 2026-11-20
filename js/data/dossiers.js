/**
 * dossiers.js — Les « boss » du Réacteur : les cas compile/exécute/affiche des annales.
 *
 * Un dossier = { id, title, src, boss, universe (id d'univers ou objet univers
 * propre au sujet), intro, cases: [{ label, stmts }] }.
 * Les instructions suivent le DSL de verdict-engine.js ; les réponses ne sont
 * PAS écrites ici : le moteur les calcule (et tests/ vérifie A23 et A25).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const COURSE = {
    id: 'course', name: 'Animal / Cheval (méthode courir)',
    types: {
      Animal: { kind: 'class', ext: null, impl: [], methods: { courir: [{ p: 'L\'animal court.' }] } },
      Cheval: { kind: 'class', ext: 'Animal', impl: [], methods: { courir: [{ p: 'Le cheval court.' }] } },
    },
  };

  const TIME = {
    id: 'time', name: 'Time / TimeMin / TimeSec',
    types: {
      Time: { kind: 'interface', impl: [], methods: { duree: null } },
      TimeMin: { kind: 'class', ext: null, impl: ['Time'], methods: { duree: [{ p: 'durée en minutes' }] } },
      TimeSec: { kind: 'class', ext: 'TimeMin', impl: [], methods: { duree: [{ p: 'durée en secondes' }] } },
    },
  };

  const d = (decl, name, expr) => ({ decl, name, expr });
  const v = (x) => ({ var: x });
  const n = (x) => ({ new: x });
  const c = (t, e) => ({ cast: t, of: e });

  O.data.dossiers = [
    {
      id: 'A23', title: 'Médian A23 — le main de Animal', src: 'A23 I.4 et A22 I.4 (sujet identique)', boss: 'L\'Hydre ClassCast', universe: 'menagerie',
      intro: 'Neuf cas, enchaînés dans le même main. Les variables déclarées dans un cas restent utilisables ensuite. Quand une ligne ne compile pas, on la corrige (transtypage) et on continue.',
      cases: [
        { label: 'cas 1', stmts: [d('Animal', 'animal1', n('Animal')), { call: 'animal1', m: 'manger' }] },
        { label: 'cas 2', stmts: [d('Cheval', 'cheval1', n('Cheval')), { call: 'cheval1', m: 'manger' }] },
        { label: 'cas 3', stmts: [d('Animal', 'albatros1', n('Albatros')), { call: 'albatros1', m: 'crier' }] },
        { label: 'cas 4', stmts: [d('Animal', 'animal3', n('Cheval')), d('Cheval', 'cheval2', v('animal3'))] },
        { label: 'cas 5', stmts: [d('Animal', 'animal4', n('Animal')), d('Cheval', 'cheval3', c('Cheval', v('animal4')))] },
        { label: 'cas 6', stmts: [{ decl: 'Restaurable', name: 'r' }, { assign: 'r', expr: v('albatros1') }, { call: 'r', m: 'manger' }] },
        { label: 'cas 7', stmts: [{ assign: 'r', expr: v('cheval1') }, { call: 'r', m: 'manger' }] },
        { label: 'cas 8', stmts: [{ decl: 'Volable', name: 'v' }, { assign: 'v', expr: v('albatros1') }, { call: 'v', m: 'voler' }] },
        { label: 'cas 9', stmts: [{ assign: 'r', expr: v('v') }, { instanceof: 'r', type: 'Volable', then: ' r est du type Volable', else: ' r n\'est pas du type Volable' }] },
      ],
    },
    {
      id: 'A25', title: 'Médian A25 — le tableau d\'animaux', src: 'A25 I.3', boss: 'Le Spectre du Tableau', universe: 'menagerie',
      intro: 'Le tableau liste contient un Animal, un Cheval et un Albatros (cas 1). Les cas suivants réutilisent liste.',
      cases: [
        { label: 'cas 1', stmts: [{ array: 'Animal', name: 'liste', elems: ['Animal', 'Cheval', 'Albatros'] }, { foreach: 'Restaurable', v: 'r', arr: 'liste', m: 'manger' }, { foreach: 'Animal', v: 'a', arr: 'liste', m: 'crier' }] },
        { label: 'cas 2', stmts: [d('Cheval', 'cheval1', { idx: 'liste', i: 1 }), { call: 'cheval1', m: 'crier' }] },
        { label: 'cas 3', stmts: [d('Cheval', 'cheval2', c('Cheval', { idx: 'liste', i: 2 }))] },
        { label: 'cas 4', stmts: [d('Volable', 'v', { idx: 'liste', i: 2 }), { call: 'v', m: 'voler' }] },
        { label: 'cas 5', stmts: [d('Animal', 'animal1', { idx: 'liste', i: 1 }), { call: 'animal1', m: 'crier' }] },
      ],
    },
    {
      id: 'A21', title: 'Médian A21 — Animal et Cheval qui courent', src: 'A21 I.5 (et A18 I.2)', boss: 'Le Golem du Compilateur', universe: COURSE,
      intro: 'Cheval hérite de Animal et redéfinit courir(). Dix lignes, à juger une par une.',
      cases: [
        { label: 'lignes 1-2', stmts: [d('Animal', 'animal1', n('Animal')), { call: 'animal1', m: 'courir' }] },
        { label: 'lignes 3-4', stmts: [d('Cheval', 'cheval1', n('Cheval')), { call: 'cheval1', m: 'courir' }] },
        { label: 'lignes 5-6', stmts: [d('Animal', 'animal2', n('Cheval')), { call: 'animal2', m: 'courir' }] },
        { label: 'lignes 7-8', stmts: [d('Cheval', 'cheval2', v('animal2')), { call: 'cheval2', m: 'courir' }] },
        { label: 'lignes 9-10', stmts: [d('Animal', 'animal3', n('Animal')), d('Cheval', 'cheval3', c('Cheval', v('animal3')))] },
      ],
    },
    {
      id: 'A14', title: 'Médian A14 — neuf affectations', src: 'A14 I.2', boss: 'L\'Essaim des Références', universe: COURSE,
      intro: 'Uniquement compilation et exécution : aucune méthode n\'est appelée. Chaque ligne est indépendante.',
      cases: [
        { label: 'ligne 1', stmts: [d('Animal', 'animal1', n('Animal'))] },
        { label: 'ligne 2', stmts: [d('Cheval', 'cheval1', n('Cheval'))] },
        { label: 'ligne 3', stmts: [d('Animal', 'animal2', n('Cheval'))] },
        { label: 'ligne 4', stmts: [d('Cheval', 'cheval2', n('Animal'))] },
        { label: 'ligne 5', stmts: [d('Animal', 'animal3', v('cheval1'))] },
        { label: 'ligne 6', stmts: [d('Cheval', 'cheval3', v('animal1'))] },
        { label: 'ligne 7', stmts: [d('Animal', 'animal4', c('Animal', v('cheval1')))] },
        { label: 'ligne 8', stmts: [d('Cheval', 'cheval4', c('Cheval', v('animal1')))] },
        { label: 'ligne 9', stmts: [d('Cheval', 'cheval5', c('Cheval', v('animal3')))] },
      ],
    },
    {
      id: 'A15', title: 'Médian A15 — TimeMin et TimeSec', src: 'A15 II.4', boss: 'Le Chronophage', universe: TIME,
      intro: 'TimeMin implémente l\'interface Time ; TimeSec hérite de TimeMin. Neuf déclarations à juger.',
      cases: [
        { label: 'ligne 1', stmts: [d('TimeMin', 'tm1', n('TimeMin'))] },
        { label: 'ligne 2', stmts: [d('TimeSec', 'ts1', n('TimeSec'))] },
        { label: 'ligne 3', stmts: [d('TimeMin', 'tm2', n('TimeSec'))] },
        { label: 'ligne 4', stmts: [d('TimeSec', 'ts2', n('TimeMin'))] },
        { label: 'ligne 5', stmts: [d('TimeMin', 'tm3', v('ts1'))] },
        { label: 'ligne 6', stmts: [d('TimeSec', 'ts3', v('tm1'))] },
        { label: 'ligne 7', stmts: [d('TimeMin', 'tm4', c('TimeMin', v('ts1')))] },
        { label: 'ligne 8', stmts: [d('TimeSec', 'ts4', c('TimeSec', v('tm1')))] },
        { label: 'ligne 9', stmts: [d('TimeSec', 'ts5', c('TimeSec', v('tm3')))] },
      ],
    },
    {
      id: 'HANGAR', title: 'Dossier inédit — le hangar', src: 'Cours POO avancée (Vehicule abstraite, interfaces)', boss: 'La Chimère Abstraite', universe: 'hangar',
      intro: 'Vehicule est abstraite (rouler() abstraite). Voiture implémente Pilotable et Orientable. Train est final et implémente seulement Pilotable. VoitureDeCourse est final et hérite de Voiture.',
      cases: [
        { label: 'cas 1', stmts: [d('Vehicule', 'v1', n('Vehicule'))] },
        { label: 'cas 2', stmts: [d('Vehicule', 'v2', n('VoitureDeCourse')), { call: 'v2', m: 'rouler' }] },
        { label: 'cas 3', stmts: [d('Pilotable', 'p', v('v2'))] },
        { label: 'cas 4', stmts: [d('Pilotable', 'p2', c('Pilotable', v('v2'))), { call: 'p2', m: 'accelerer' }] },
        { label: 'cas 5', stmts: [d('Train', 't', n('Train')), { call: 't', m: 'klaxonner' }] },
        { label: 'cas 6', stmts: [d('Orientable', 'o', c('Orientable', v('t')))] },
        { label: 'cas 7', stmts: [d('Vehicule', 'v3', v('t')), d('Voiture', 'vo', c('Voiture', v('v3')))] },
        { label: 'cas 8', stmts: [d('Orientable', 'o2', n('Voiture')), { call: 'o2', m: 'rouler' }] },
      ],
    },
    {
      id: 'ORPHEUS', title: 'Dossier inédit — les modules de la station', src: 'Création VEGA (Template Method caché)', boss: 'La Rouille-Mère', universe: 'orpheus',
      intro: 'Module est abstraite : diagnostiquer() affiche « Diagnostic standard » puis appelle this.alimenter(), abstraite. Reacteur et Serre héritent de Module. Drone implémente Reparable et Mobile ; DroneCargo hérite de Drone.',
      cases: [
        { label: 'cas 1', stmts: [d('Module', 'm1', n('Reacteur')), { call: 'm1', m: 'diagnostiquer' }] },
        { label: 'cas 2', stmts: [d('Module', 'm2', n('Serre')), { call: 'm2', m: 'diagnostiquer' }] },
        { label: 'cas 3', stmts: [d('Reparable', 'r1', v('m1'))] },
        { label: 'cas 4', stmts: [d('Mobile', 'mob', n('DroneCargo')), { call: 'mob', m: 'deplacer' }] },
        { label: 'cas 5', stmts: [{ call: 'mob', m: 'charger' }] },
        { label: 'cas 6', stmts: [d('Drone', 'dr', c('Drone', v('mob'))), d('Reparable', 'r2', v('dr')), { call: 'r2', m: 'reparer' }] },
        { label: 'cas 7', stmts: [d('Module', 'm3', c('Module', v('dr')))] },
        { label: 'cas 8', stmts: [d('Serre', 's', c('Serre', v('m1')))] },
      ],
    },
  ];
})(window);
