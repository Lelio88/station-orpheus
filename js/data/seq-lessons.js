/**
 * seq-lessons.js — Leçon sur le diagramme de séquence (cours 3 de LO02).
 *
 *  entries  : chaque élément de notation dessiné (seq-render.js), son sens,
 *             le code Java équivalent et le piège associé.
 *  examples : diagrammes complets du cours (James et son Aston Martin)
 *             et un diagramme tiré d'une annale (Template Method A25).
 *  drill    : QCM (reconnaître un fragment, passer du code au diagramme et
 *             inversement, lire l'ordre des messages).
 * Les exemples reprennent les objets du cours : james:Pilote,
 * astonmartin:Voiture, spiritOfSaintLouis:Avion.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const JA = [{ id: 'j', label: 'james:Pilote' }, { id: 'a', label: 'astonmartin:Voiture' }];
  const msg = (from, to, label, kind) => ({ from, to, label, kind: kind || 'sync' });

  const TRAJET = {
    actors: JA,
    items: [
      msg('j', 'a', 'demarrer()'),
      { frame: 'loop', guard: '[distanceParcourue <= 1000]', items: [
        { frame: 'alt', branches: [
          { guard: '[quantiteCarburant >= 40]', items: [msg('j', 'a', 'rouler(110)')] },
          { guard: '[20 <= quantiteCarburant < 40]', items: [msg('j', 'a', 'rouler(90)')] },
          { guard: '[sinon]', items: [msg('j', 'a', 'faireLePlein()')] },
        ] },
      ] },
    ],
  };

  const entries = [
    {
      id: 'objets', title: 'Objets et lignes de vie',
      d: { actors: [{ id: 'j', label: 'james:Pilote' }, { id: 'p', label: ':Poker' }], items: [] },
      meaning: [
        'En haut, des **objets** (des instances, pas des classes) : `nomInstance:NomClasse`, souligné. `:Poker` = un objet anonyme de la classe Poker.',
        'Sous chaque objet, sa **ligne de vie** en pointillé : **le temps descend**.',
        'Le diagramme de séquence montre **comment** un cas d\'utilisation est réalisé par les objets : c\'est la partie algorithmique, avec un **ordre**.',
      ],
      java: 'Pilote james = new Pilote();   // l\'objet james, instance de Pilote\nPoker partie = new Poker();     // un objet Poker',
      trap: 'Écrire le nom de la classe seul (« Pilote ») : on représente des objets. Mets au minimum `:Pilote`.',
    },
    {
      id: 'sync', title: 'Message synchrone',
      d: { actors: JA, items: [msg('j', 'a', 'rouler(110)')] },
      meaning: [
        'Flèche **pleine à pointe pleine** (triangle noir) de l\'émetteur vers le récepteur.',
        'Un message = un **appel de méthode** sur l\'objet récepteur. Le label est la signature : `rouler(110)`.',
        '**Synchrone** : l\'émetteur est bloqué tant que le récepteur n\'a pas fini (le cas normal en Java).',
      ],
      java: '// dans une méthode de Pilote :\nthis.astonmartin.rouler(110);',
      trap: 'Mettre la flèche à l\'envers : elle part de l\'objet qui **appelle** et pointe vers l\'objet dont la méthode est **exécutée**.',
    },
    {
      id: 'retour', title: 'Message de retour',
      d: { actors: JA, items: [msg('j', 'a', 'km := rouler(110)'), msg('a', 'j', 'km', 'return')] },
      meaning: [
        'Flèche **en pointillé à pointe ouverte**, du récepteur vers l\'émetteur : la valeur renvoyée par `return`.',
        'Le cours note la signature générale : `variableRetour := operation(arguments)`.',
        'Le retour est souvent omis pour alléger le diagramme quand il n\'apporte rien.',
      ],
      java: 'int km = this.astonmartin.rouler(110);',
      trap: 'Dessiner un retour en trait plein : il serait lu comme un nouvel appel de méthode de la Voiture vers le Pilote.',
    },
    {
      id: 'async', title: 'Message asynchrone',
      d: { actors: JA, items: [msg('j', 'a', 'allumerRadio()', 'async')] },
      meaning: [
        'Flèche **pleine à pointe ouverte** (deux petits traits).',
        '**Asynchrone** : l\'émetteur n\'attend pas, il continue pendant que le récepteur traite (threads, événements).',
      ],
      java: '// exécuté dans un autre fil d\'exécution :\nnew Thread(() -> astonmartin.allumerRadio()).start();',
      trap: 'Confondre la pointe ouverte (asynchrone) avec la pointe pleine (synchrone). Au médian, tes messages sont presque tous synchrones.',
    },
    {
      id: 'imbrique', title: 'Messages imbriqués',
      d: { actors: [{ id: 'c', label: ':Client' }, { id: 'p', label: 'panier:Panier' }, { id: 'r', label: 'a1:Article' }], items: [msg('c', 'p', 'total := calculerTotal()'), msg('p', 'r', 'p := getPrix()'), msg('r', 'p', 'p', 'return'), msg('p', 'c', 'total', 'return')] },
      meaning: [
        'Le récepteur d\'un message peut lui-même envoyer des messages pendant son traitement : on lit **de haut en bas**.',
        'Ici `calculerTotal()` du panier appelle `getPrix()` de l\'article avant de répondre au client.',
      ],
      java: '// Client\ndouble total = panier.calculerTotal();\n\n// Panier\npublic double calculerTotal() {\n    double t = 0;\n    t += a1.getPrix();\n    return t;\n}',
      trap: 'Mettre `getPrix()` entre Client et Article : c\'est le Panier qui appelle l\'article, pas le client.',
    },
    {
      id: 'soi', title: 'Message à soi-même',
      d: { actors: [{ id: 'm', label: ':Main' }, { id: 'c', label: 'com:EnBoutique' }], items: [msg('m', 'c', 'commander()'), msg('c', 'c', 'payer()'), msg('c', 'c', 'livrer()')] },
      meaning: [
        'Une flèche qui **revient sur la même ligne de vie** : l\'objet appelle une de ses propres méthodes (`this.payer()`).',
        'C\'est exactement ce qui se passe dans le patron **Template Method** : `commander()` appelle `this.payer()` puis `this.livrer()` sur le même objet.',
      ],
      java: 'public final void commander() {\n    this.payer();\n    this.livrer();\n}',
      trap: 'Inventer un objet séparé :Commande pour recevoir payer() : il n\'y a qu\'un seul objet, un EnBoutique, qui exécute toutes les méthodes.',
    },
    {
      id: 'creation', title: 'Création d\'un objet',
      d: { actors: [{ id: 'j', label: 'james:Pilote' }, { id: 's', label: 'spiritOfSaintLouis:Avion', created: true }], items: [{ from: 'j', to: 's', label: 'créer()', kind: 'create' }, msg('j', 's', 'decoller()')] },
      meaning: [
        'Le message de création (`créer()`, ou «create») pointe vers la **boîte de l\'objet**, dessinée **à la hauteur du message** et non en haut : l\'objet n\'existe qu\'à partir de là.',
        'Ce message correspond au **constructeur** (mécanisme d\'instanciation, `new`).',
        'Destruction : une croix en bas de la ligne de vie. Le cours précise qu\'elle **n\'existe pas en Java** (garbage collector) mais existe en C++.',
      ],
      java: 'Avion spiritOfSaintLouis = new Avion();\nspiritOfSaintLouis.decoller();',
      trap: 'Placer l\'objet créé en haut avec les autres : il aurait existé avant sa création.',
    },
    {
      id: 'loop', title: 'Fragment loop',
      d: { actors: JA, items: [{ frame: 'loop', guard: '[distanceParcourue <= 1000]', items: [msg('j', 'a', 'rouler(110)')] }] },
      meaning: [
        'Un **cadre** avec l\'opérateur `loop` en haut à gauche et une **condition de garde** entre crochets.',
        'Les messages du cadre sont **répétés tant que la garde est vraie** : c\'est un `while` (ou un `for`).',
        'Le cours mentionne aussi `loop(min, max)` pour un nombre de tours borné.',
      ],
      java: 'while (this.distanceParcourue <= 1000) {\n    astonmartin.rouler(110);\n}',
      trap: 'Oublier la garde entre crochets : sans elle, on ne sait pas quand la boucle s\'arrête.',
    },
    {
      id: 'alt', title: 'Fragment alt',
      d: { actors: JA, items: [{ frame: 'alt', branches: [{ guard: '[quantiteCarburant >= 40]', items: [msg('j', 'a', 'rouler(110)')] }, { guard: '[sinon]', items: [msg('j', 'a', 'faireLePlein()')] }] }] },
      meaning: [
        '`alt` = **alternatives** : le cadre est découpé par des **pointillés** en zones, chacune avec sa garde.',
        '**Une seule** zone est exécutée : celle dont la garde est vraie. C\'est un `if / else if / else`.',
      ],
      java: 'if (quantiteCarburant >= 40) {\n    astonmartin.rouler(110);\n} else {\n    astonmartin.faireLePlein();\n}',
      trap: 'Utiliser deux cadres opt pour un if/else : ce n\'est pas faux, mais alt dit explicitement qu\'une seule branche s\'exécute.',
    },
    {
      id: 'opt', title: 'Fragment opt',
      d: { actors: JA, items: [{ frame: 'opt', guard: '[reservoir vide]', items: [msg('j', 'a', 'faireLePlein()')] }] },
      meaning: [
        '`opt` = **optionnel** : les messages ne sont exécutés **que si** la garde est vraie. C\'est un `if` sans `else`.',
        'Le cours le relie à la relation **«extend»** des cas d\'utilisation (comportement optionnel).',
      ],
      java: 'if (reservoirVide) {\n    astonmartin.faireLePlein();\n}',
      trap: 'Écrire alt avec une seule zone : c\'est opt.',
    },
    {
      id: 'par', title: 'Fragment par',
      d: { actors: [{ id: 'j', label: 'james:Pilote' }, { id: 'a', label: 'astonmartin:Voiture' }, { id: 'n', label: 'drNo:Mechant' }], items: [{ frame: 'par', branches: [{ guard: '', items: [msg('j', 'a', 'rouler(110)')] }, { guard: '', items: [msg('j', 'n', 'boireLeThe()')] }] }] },
      meaning: [
        '`par` = **parallèle** : les zones séparées par des pointillés s\'exécutent **en même temps** (threads).',
        'Exemple du cours : James roule avec son Aston Martin et, en même temps, prend le thé avec le Docteur No.',
      ],
      java: 'new Thread(() -> astonmartin.rouler(110)).start();\nnew Thread(() -> drNo.boireLeThe()).start();',
      trap: 'Confondre par (simultané) et alt (une seule branche).',
    },
    {
      id: 'ref', title: 'Fragment ref',
      d: { actors: [{ id: 'j', label: 'james:Pilote' }, { id: 'a', label: 'astonmartin:Voiture' }, { id: 's', label: 'spirit:Avion' }], items: [{ ref: 'Trajet 1000 kms en voiture', over: ['j', 'a'] }, msg('j', 's', 'voler()')] },
      meaning: [
        '`ref` = **référence** à une interaction décrite dans un **autre** diagramme de séquence. On n\'en répète pas le détail.',
        'Le cours le relie à la relation **«include»** des cas d\'utilisation.',
        'Exemple du cours : James fait le « Trajet 1000 kms en voiture » (un autre diagramme), puis pilote un avion.',
      ],
      java: 'this.trajetEnVoiture();   // détaillé ailleurs\nspirit.voler();',
      trap: 'Recopier tout le détail d\'une interaction déjà dessinée : ref existe pour alléger.',
    },
  ];

  const examples = [
    { title: 'Exemple du cours : trajet de 1000 km en voiture', d: TRAJET, text: 'Tant que la distance parcourue ne dépasse pas 1000 km : si le réservoir contient au moins 40 L, James roule à 110 ; entre 20 et 40 L, à 90 ; sinon il fait le plein. Un alt imbriqué dans un loop.',
      java: 'astonmartin.demarrer();\nwhile (distanceParcourue <= 1000) {\n    if (quantiteCarburant >= 40) {\n        astonmartin.rouler(110);\n    } else if (quantiteCarburant >= 20) {\n        astonmartin.rouler(90);\n    } else {\n        astonmartin.faireLePlein();\n    }\n}' },
    { title: 'Annale A25 : le Template Method en séquence', d: { actors: [{ id: 'm', label: ':Main' }, { id: 'b', label: 'com:EnBoutique', created: true }, { id: 'l', label: 'com2:EnLigne', created: true }], items: [{ from: 'm', to: 'b', label: 'créer()', kind: 'create' }, msg('m', 'b', 'commander()'), msg('b', 'b', 'payer()'), msg('b', 'b', 'livrer()'), { from: 'm', to: 'l', label: 'créer()', kind: 'create' }, msg('m', 'l', 'commander()'), msg('l', 'l', 'payer()'), msg('l', 'l', 'livrer()')] },
      text: 'Le main crée une EnBoutique et appelle commander() ; la méthode héritée de Commande appelle payer() puis livrer() sur le même objet (messages à soi-même), et la liaison dynamique exécute les versions de EnBoutique. Même chose ensuite avec EnLigne.',
      java: 'Commande com = new EnBoutique();\ncom.commander();\ncom = new EnLigne();\ncom.commander();' },
  ];

  const drill = [
    { id: 'q1', q: 'Quel fragment correspond à un if / else ?', c: ['loop', 'alt', 'opt', 'par'], a: 1, why: 'alt découpe le cadre en zones gardées : une seule est exécutée. opt = if sans else.' },
    { id: 'q2', q: 'Quel fragment correspond à un if sans else ?', c: ['loop', 'alt', 'opt', 'ref'], a: 2, why: 'opt : les messages ne s\'exécutent que si la garde est vraie.' },
    { id: 'q3', q: 'Quel code correspond à ce diagramme ?', seq: entries.find((e) => e.id === 'loop').d,
      c: [{ code: 'if (distanceParcourue <= 1000) {\n    astonmartin.rouler(110);\n}' }, { code: 'while (distanceParcourue <= 1000) {\n    astonmartin.rouler(110);\n}' }, { code: 'astonmartin.rouler(110);\nastonmartin.rouler(1000);' }, { code: 'while (distanceParcourue <= 1000) {\n    james.rouler(110);\n}' }],
      a: 1, why: 'loop + garde = boucle while. Le message va de james vers astonmartin : c\'est la méthode de la Voiture qui est appelée.' },
    { id: 'q4', q: 'Quel diagramme correspond à ce code ?', code: 'public final void commander() {   // dans Commande\n    this.payer();\n    this.livrer();\n}\n// main : Commande com = new EnLigne(); com.commander();',
      c: [
        { seq: { actors: [{ id: 'm', label: ':Main' }, { id: 'c', label: 'com:EnLigne' }], items: [msg('m', 'c', 'commander()'), msg('c', 'c', 'payer()'), msg('c', 'c', 'livrer()')] } },
        { seq: { actors: [{ id: 'm', label: ':Main' }, { id: 'c', label: 'com:EnLigne' }], items: [msg('m', 'c', 'commander()'), msg('m', 'c', 'payer()'), msg('m', 'c', 'livrer()')] } },
        { seq: { actors: [{ id: 'm', label: ':Main' }, { id: 'c', label: 'com:EnLigne' }], items: [msg('m', 'c', 'commander()'), msg('c', 'c', 'livrer()'), msg('c', 'c', 'payer()')] } },
      ],
      a: 0, why: 'C\'est commander() qui appelle payer() puis livrer() sur le même objet : deux messages à soi-même, dans cet ordre. Le main n\'appelle que commander().' },
    { id: 'q5', q: 'Dans `james:Pilote`, que désigne `Pilote` ?', c: ['Le nom de l\'objet', 'La classe de l\'objet', 'Une méthode', 'Le type de retour'], a: 1, why: 'Notation nomInstance:NomClasse.' },
    { id: 'q6', q: 'À quoi correspond un message `créer()` vers un objet ?', c: ['À un appel de toString()', 'Au constructeur (new)', 'À la destruction de l\'objet', 'À un message asynchrone'], a: 1, why: 'Le cours : « Cette opération est le constructeur de la classe. C\'est le mécanisme d\'instanciation. »' },
    { id: 'q7', q: 'Une flèche en pointillé à pointe ouverte, du récepteur vers l\'émetteur, représente…', c: ['un message asynchrone', 'un message de retour', 'une création', 'une dépendance'], a: 1, why: 'Pointillé vers l\'émetteur = valeur de retour. Asynchrone = trait plein et pointe ouverte.' },
    { id: 'q8', q: 'Avec le diagramme ci-dessous, que fait James si quantiteCarburant vaut 30 ?', seq: TRAJET, c: ['rouler(110)', 'rouler(90)', 'faireLePlein()', 'Rien, il sort de la boucle'], a: 1, why: '30 n\'est pas ≥ 40 mais vérifie 20 ≤ 30 < 40 : deuxième zone du alt.' },
    { id: 'q9', q: 'Le fragment `ref` correspond à quelle relation des cas d\'utilisation ?', c: ['«extend»', '«include»', 'généralisation', 'association'], a: 1, why: 'Le cours : ref ↔ include ; opt ↔ extend.' },
    { id: 'q10', q: 'Dans ce diagramme, qui appelle getPrix() ?', seq: entries.find((e) => e.id === 'imbrique').d, c: [':Client', 'panier:Panier', 'a1:Article', 'Personne, c\'est un retour'], a: 1, why: 'La flèche getPrix() part de la ligne de vie du panier : c\'est calculerTotal() qui appelle a1.getPrix().' },
    { id: 'q11', q: 'Quelle information le diagramme de séquence donne-t-il que le diagramme de classes ne donne pas ?', c: ['Les attributs', 'Les multiplicités', 'L\'ordre des appels dans le temps', 'L\'héritage'], a: 2, why: 'Le diagramme de classes est statique (aucune temporalité) ; la séquence ajoute l\'ordre des messages.' },
    { id: 'q12', q: 'Comment représenter : « pour chaque article du panier, si l\'article est en promotion, appliquer la remise » ?', c: ['un alt contenant un loop', 'un loop contenant un opt', 'un par contenant un opt', 'un ref'], a: 1, why: '« Pour chaque » = loop ; « si … » sans sinon = opt, à l\'intérieur de la boucle.' },
  ];

  O.data.seqLessons = { entries, examples, drill };
})(window);
