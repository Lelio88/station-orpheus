/**
 * universes.js — Hiérarchies de classes utilisées par le Réacteur.
 *
 * Chaque univers décrit des types Java en données :
 *   kind: 'class' | 'interface', abstract, final, ext (classe mère),
 *   impl (interfaces implémentées, ou super-interfaces pour une interface),
 *   methods: { nom: corps | null }  (null = méthode abstraite / d'interface)
 * Un corps est une liste d'opérations : {p:'texte'} affiche une ligne,
 * {sup:true} appelle super.memeMethode(), {self:'m'} appelle this.m().
 *
 * Invariant : les textes affichés reprennent mot pour mot ceux des sujets
 * (annexe A des médians A22, A23, A25) pour l'univers « menagerie ».
 */
(function (root) {
  'use strict';

  const UNIVERSES = {
    menagerie: {
      id: 'menagerie',
      name: 'Ménagerie (annexe A des médians)',
      vars: { Animal: 'animal', Cheval: 'cheval', Albatros: 'albatros', Restaurable: 'r', Volable: 'v' },
      types: {
        Restaurable: { kind: 'interface', impl: [], methods: { manger: null } },
        Volable: { kind: 'interface', impl: [], methods: { voler: null } },
        Animal: {
          kind: 'class', ext: null, impl: ['Restaurable'],
          methods: { manger: [{ p: 'Un animal mange' }], crier: [{ p: 'Un animal émet un cri' }] },
        },
        Cheval: {
          kind: 'class', ext: 'Animal', impl: [],
          methods: { crier: [{ sup: true }, { p: '... le cheval hennit.' }] },
        },
        Albatros: {
          kind: 'class', ext: 'Animal', impl: ['Volable'],
          methods: {
            manger: [{ p: 'Un albatros mange du krill.' }],
            crier: [{ sup: true }, { p: '... l\'albatros piaule.' }],
            voler: [{ p: 'L\'albatros plane' }],
          },
        },
      },
    },

    hangar: {
      id: 'hangar',
      name: 'Hangar à véhicules (cours POO avancée)',
      vars: { Vehicule: 'veh', Voiture: 'voit', Train: 'train', VoitureDeCourse: 'f1', Pilotable: 'pil', Orientable: 'ori' },
      types: {
        Pilotable: { kind: 'interface', impl: [], methods: { accelerer: null } },
        Orientable: { kind: 'interface', impl: [], methods: { tournerAGauche: null } },
        Vehicule: {
          kind: 'class', abstract: true, ext: null, impl: [],
          methods: { rouler: null, klaxonner: [{ p: 'Tuut générique' }] },
        },
        Voiture: {
          kind: 'class', ext: 'Vehicule', impl: ['Pilotable', 'Orientable'],
          methods: {
            rouler: [{ p: 'La voiture roule' }],
            accelerer: [{ p: 'La voiture accélère' }],
            tournerAGauche: [{ p: 'La voiture tourne à gauche' }],
          },
        },
        Train: {
          kind: 'class', final: true, ext: 'Vehicule', impl: ['Pilotable'],
          methods: {
            rouler: [{ p: 'Le train roule sur ses rails' }],
            accelerer: [{ p: 'Le train accélère' }],
            klaxonner: [{ sup: true }, { p: '... version sifflet' }],
          },
        },
        VoitureDeCourse: {
          kind: 'class', final: true, ext: 'Voiture', impl: [],
          methods: { rouler: [{ sup: true }, { p: '... à 300 km/h' }] },
        },
      },
    },

    orpheus: {
      id: 'orpheus',
      name: 'Station Orpheus (modules de bord)',
      vars: { Module: 'mod', Reacteur: 'rea', Serre: 'serre', Drone: 'drone', DroneCargo: 'cargo', Reparable: 'rep', Mobile: 'mob' },
      types: {
        Reparable: { kind: 'interface', impl: [], methods: { reparer: null } },
        Mobile: { kind: 'interface', impl: [], methods: { deplacer: null } },
        Module: {
          kind: 'class', abstract: true, ext: null, impl: [],
          methods: {
            alimenter: null,
            diagnostiquer: [{ p: 'Diagnostic standard' }, { self: 'alimenter' }],
          },
        },
        Reacteur: {
          kind: 'class', ext: 'Module', impl: ['Reparable'],
          methods: {
            alimenter: [{ p: 'Plasma injecté' }],
            reparer: [{ p: 'Bobines remplacées' }],
          },
        },
        Serre: {
          kind: 'class', ext: 'Module', impl: [],
          methods: {
            alimenter: [{ p: 'Lampes de culture allumées' }],
            diagnostiquer: [{ sup: true }, { p: '... hygrométrie OK' }],
          },
        },
        Drone: {
          kind: 'class', ext: null, impl: ['Reparable', 'Mobile'],
          methods: {
            reparer: [{ p: 'Le drone soude la coque' }],
            deplacer: [{ p: 'Le drone file dans la coursive' }],
          },
        },
        DroneCargo: {
          kind: 'class', ext: 'Drone', impl: [],
          methods: { deplacer: [{ sup: true }, { p: '... avec 2 tonnes de fret' }], charger: [{ p: 'Fret arrimé' }] },
        },
      },
    },

    points: {
      id: 'points',
      name: 'Points et couleurs (TD POO avancée 2)',
      vars: { Point: 'p', PointCol: 'pc', PointCartesien: 'pcart' },
      types: {
        Point: {
          kind: 'class', ext: null, impl: [],
          methods: { afficher: [{ p: 'Point (0.0, 0.0)' }], translater: [{ p: 'Point translaté' }] },
        },
        PointCol: {
          kind: 'class', ext: 'Point', impl: [],
          methods: { afficher: [{ sup: true }, { p: 'couleur : 0' }], colorier: [{ p: 'Couleur changée' }] },
        },
      },
    },
  };

  root.ORPHEUS = root.ORPHEUS || {};
  root.ORPHEUS.UNIVERSES = UNIVERSES;
  if (typeof module !== 'undefined' && module.exports) module.exports = UNIVERSES;
})(typeof window !== 'undefined' ? window : globalThis);
