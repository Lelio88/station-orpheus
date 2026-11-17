/**
 * campaign.js — Les 30 missions de la campagne, dans l'ordre imposé.
 *
 * Une mission = un exercice précis d'un module, une jauge de réussite lue
 * dans l'état sauvegardé (`score(state)` → 0..1), un indice de VEGA en cas
 * d'échec, et la scène de transition (story.js) jouée quand elle est réussie.
 * L'ordre suit celui des TP et TD (TP 1-2, TD 1 à TD 4), puis l'UML (classes
 * et séquences), puis les huit patrons des annales, et finit par un sujet complet.
 * Choix : le score lu est toujours le MEILLEUR score déjà enregistré par le
 * module ; la campagne n'a donc besoin d'aucun branchement dans les modules.
 * Invariants :
 *   - seuil de réussite `need` : 0,7 par défaut (choix de l'utilisateur) ;
 *   - `scene` désigne une scène existante de story.js, propre à la mission ;
 *   - un module n'est accessible qu'à partir de sa première mission ;
 *   - changer l'ordre ou la liste : incrémenter VERSION dans core/campaign.js
 *     (la progression est alors revalidée, sans cinématique, d'après les scores).
 * Exemple : O.data.campaign[0].score(O.store.state) → meilleur score au test du chapitre 01.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const quiz = (ch) => (s) => (s.codex[ch] || {}).quiz || 0;
  const dossier = (id) => (s) => s.verdict.dossiers[id] || 0;
  const write = (id) => (s) => (s.forge[id] || {}).write || 0;
  /** Part des questions d'une série réussies au moins une fois. */
  const drill = (bucket, key, list) => (s) => {
    const items = list();
    const got = ((s[bucket] || {})[key]) || {};
    return items.length ? items.filter((x) => got[x.id] >= 1).length / items.length : 0;
  };
  /** Mission de test d'un chapitre des Archives. */
  const chapter = (id, ch, num, title, scene, about, hint) => ({
    id, module: 'codex', title, route: '#codex--' + ch, scene, score: quiz(ch), hint,
    goal: 'Obtenir 70 % au test de mémoire du chapitre ' + num + ' (' + about + ').',
  });
  /** Mission de rédaction libre à la Forge. */
  const forge = (id, ex, title, scene, about, hint) => ({
    id, module: 'forge', title, route: '#forge--' + ex, scene, score: write(ex), hint,
    goal: 'Obtenir 70 % au scanner en rédigeant ' + about + ' (onglet Rédaction).',
  });

  O.data.campaign = [
    // ---- TP 1 et TP 2 : le langage et son environnement
    chapter('c-jvm', 'jvm', '01', 'Restaurer le chapitre 01 : JDK, packages, bases', 'tr-jvm', 'JDK, packages et visibilité du TP 2, tableaux du TP 1',
      'javac compile en bytecode, java lance la JVM, javadoc documente. Sans modificateur, une classe ou un attribut n\'est visible que dans son package. m.length compte les lignes, m[0].length les colonnes.'),
    forge('f-matrice', 'matrice', 'Recalculer les matrices de navigation', 'tr-matrice', 'le produit matriciel du TP 1',
      'Vérifie tab1[0].length == tab2.length, alloue new int[tab1.length][tab2[0].length], puis trois boucles : ligne, colonne, et k qui accumule tab1[ligne][k] * tab2[k][colonne].'),
    // ---- TD 1 : classes, objets, références
    chapter('c-objets', 'objets', '03', 'Restaurer le chapitre 03 : objets et références', 'tr-objets', 'références, ==, equals, this ; TD 1',
      'a = b copie la référence, pas l\'objet. == compare les références ; equals(Object o) compare le contenu, à condition de la redéfinir avec un paramètre Object.'),
    forge('f-equals', 'equals', 'Reconnaître les modules identiques', 'tr-equals', 'toString et equals (TD 1)',
      'equals prend un Object : teste instanceof, transtype, puis compare toutes les valeurs. toString renvoie une String, elle n\'affiche rien.'),
    chapter('c-static', 'static', '04', 'Restaurer le chapitre 04 : static et final', 'tr-static', 'membres de classe, constantes, final',
      'static : un seul exemplaire pour toute la classe, pas de this dans une méthode static. final : classe non dérivable, méthode non redéfinissable, variable non modifiable.'),
    forge('f-static', 'static-compteur', 'Compter les modules de la station', 'tr-compteur', 'le compteur d\'animaux (membre statique)',
      'Le compteur est private static int, incrémenté dans le constructeur ; le getter est public static, appelé par Animal.getNombreAnimaux().'),
    {
      id: 'mem-10', module: 'memoire', title: 'Restaurer dix souvenirs', route: '#memoire', scene: 'tr-memoire', need: 1,
      goal: 'Valider 10 cartes de cours (réponse jugée juste à 75 % ou plus face au corrigé).',
      score: (s) => Math.min(1, Object.values(s.flash).filter((c) => (c.box || 0) >= 1).length / 10),
      hint: null,
    },
    // ---- TD 2 : héritage, polymorphisme, abstraction
    chapter('c-heritage', 'heritage', '06', 'Restaurer le chapitre 06 : héritage', 'tr-heritage', 'héritage, redéfinition, surcharge',
      'Redéfinition : même signature dans la fille, choisie à l\'exécution. Surcharge : paramètres différents, choisie à la compilation. Relis ce passage du chapitre, puis retente le test.'),
    chapter('c-poly', 'polymorphisme', '07', 'Restaurer le chapitre 07 : polymorphisme', 'tr-poly', 'types, transtypage, liaison dynamique',
      'Le compilateur ne regarde que le type déclaré ; à l\'exécution, c\'est la méthode du type réel qui est appelée. Un cast compile si les deux types sont parents.'),
    {
      id: 'r-A23', module: 'reacteur', title: 'Purger le dossier A23', route: '#reacteur--d-A23', scene: 'tr-a23',
      goal: 'Obtenir 70 % des cas justes sur le dossier A23 (compile ? s\'exécute ? affiche ?).',
      score: dossier('A23'),
      hint: 'Écris en marge le type statique et le type dynamique de chaque variable. Un cast vers un type sans lien ne compile pas ; vers le mauvais sous-type, il compile puis lève une ClassCastException.',
    },
    chapter('c-abstrait', 'abstrait', '08', 'Restaurer le chapitre 08 : abstrait', 'tr-abstrait', 'classes abstraites et interfaces',
      'Une classe abstraite peut avoir attributs et constructeur mais ne s\'instancie pas ; une interface est un contrat. Une classe concrète doit implémenter toutes les méthodes abstraites héritées.'),
    {
      id: 'r-hangar', module: 'reacteur', title: 'Sécuriser le hangar', route: '#reacteur--d-HANGAR', scene: 'tr-hangar',
      goal: 'Obtenir 70 % des cas justes sur le dossier HANGAR (Vehicule, Voiture, Train du TD 2 : abstract, final, interfaces).',
      score: dossier('HANGAR'),
      hint: 'new sur une classe abstraite : erreur de compilation. Une classe final ne peut pas avoir de fille. Une méthode absente du type déclaré ne s\'appelle pas, même si l\'objet réel l\'a.',
    },
    chapter('c-imbriquees', 'imbriquees', '09', 'Restaurer le chapitre 09 : classes internes et anonymes', 'tr-imbriquees', 'voiture anonyme du TD 2, Rotation du TD 3',
      'Classe anonyme : new Voiture() { ... } crée en une expression une sous-classe sans nom. Classe interne : liée à un objet externe, créée par c.new Rotation(...), elle voit tous ses membres.'),
    // ---- TD 3 : interfaces, énumérations, figures
    chapter('c-enum', 'enum', '05', 'Restaurer le chapitre 05 : énumérations', 'tr-enum', 'Properties du TD 3, Couleur et Valeur du TD 4',
      'Constantes en majuscules, constructeur privé, ordinal() commence à 0, values() renvoie toutes les constantes dans l\'ordre de déclaration.'),
    forge('f-point-col', 'point-col', 'Redessiner la cartographie', 'tr-point-col', 'PointCol, Figure et Cercle (TD 3)',
      'PointCol extends PointCartesien et appelle super(x, y) en première ligne. Figure a un attribut protected et une méthode concrète : c\'est une classe abstraite, avec afficher() abstraite.'),
    // ---- TD 4 : collections
    chapter('c-collections', 'collections', '10', 'Restaurer le chapitre 10 : collections', 'tr-collections', 'List, Set, Map, Queue, itérateurs ; TD 4',
      'Set : pas de doublon. List : ordonnée, indexée. Map : clé → valeur, un second put sur la même clé remplace. Iterator : hasNext() puis next().'),
    forge('f-collections', 'collections', 'Rendre ses cartes au joueur', 'tr-bataille', 'la main du joueur (jeu de bataille du TD 4)',
      'Queue<Carte> main = new LinkedList<Carte>() : on ne fait pas new sur une interface. add ajoute en fin, poll retire la tête ; parcours avec iterator(), hasNext(), next().'),
    // ---- UML : classes puis séquences
    {
      id: 'p-notation', module: 'plans', title: 'Apprendre à lire les plans', route: '#plans--apprendre', scene: 'tr-notation',
      goal: 'Réussir 70 % des questions de l\'entraînement « Reconnais la flèche » (onglet Entraînement).',
      score: drill('uml', 'notation', () => (O.data.umlLessons || { drill: [] }).drill),
      hint: 'Triangle vide : héritage. Pointillés + triangle : réalisation. Losange plein : composition. Losange vide : agrégation. Relis le Dictionnaire visuel, puis refais l\'entraînement.',
    },
    {
      id: 'p-fnac', module: 'plans', title: 'Redessiner la boutique Fnac', route: '#plans--p-fnac', scene: 'tr-fnac',
      goal: 'Faire le plan Fnac (A25) sur papier, puis cocher au moins 70 % du barème.',
      score: (s) => s.uml.plans['p-fnac'] || 0,
      hint: 'Souligne chaque nom (classe ou attribut) et chaque verbe (association) de l\'énoncé, puis mets une multiplicité à chaque bout de chaque association.',
    },
    {
      id: 'p-sequence', module: 'plans', title: 'Lire la procédure de saut', route: '#plans--sequence', scene: 'tr-sequence',
      goal: 'Lire la leçon de l\'onglet « Diagramme de séquence », puis réussir 70 % de son Entraînement.',
      score: drill('uml', 'seq', () => (O.data.seqLessons || { drill: [] }).drill),
      hint: 'loop : boucle. alt : if / else, une garde par zone. opt : if sans else. Un message d\'un objet vers lui-même, c\'est this.methode(). créer() correspond au constructeur.',
    },
    // ---- Patrons de conception
    forge('f-singleton', 'singleton', 'Forger le Singleton', 'tr-singleton', 'le Singleton',
      'Trois éléments : un attribut privé et statique, un constructeur privé, une méthode publique et statique getInstance() qui ne crée l\'instance que si elle est null.'),
    forge('f-template', 'template', 'Forger le Template Method', 'tr-template', 'le Template Method',
      'La méthode squelette est public final et appelle les étapes ; les étapes sont protected abstract, et chaque sous-classe les redéfinit.'),
    forge('f-fabrique', 'fabrique', 'Forger la Fabrique', 'tr-fabrique', 'la Fabrique unique de véhicules (A24)',
      'createVehicule(String typeV) teste le paramètre avec equals, renvoie new Velo() ou new Voiture() sous le type Vehicule. La fabrique est aussi un Singleton.'),
    forge('f-adaptateur', 'adaptateur', 'Forger l\'Adaptateur', 'tr-adaptateur', 'l\'Adaptateur de Monitoring (A24)',
      'L\'Adaptatrice implémente InterfaceObjectif et contient un objet Monitoring ; chacune de ses méthodes traduit l\'appel en appels aux méthodes de Monitoring.'),
    forge('f-decorateur', 'decorateur', 'Forger le Décorateur', 'tr-decorateur', 'le Décorateur des options de voiture (A22)',
      'VoitureAvecOption hérite de Voiture ET contient une Voiture. getPrix() renvoie le prix de la voiture contenue plus celui de l\'option.'),
    forge('f-composite', 'composite', 'Forger le Composite', 'tr-composite', 'le Composite des formes (A21, A19, A11)',
      'FormeComplexe implémente Forme et contient un tableau de Forme. Sa surface() additionne la surface() de chacune de ses formes.'),
    forge('f-observateur', 'observateur', 'Forger l\'Observateur', 'tr-observateur', 'l\'Observateur de la lampe (P09, lampes du TD 1)',
      'Observable garde une liste d\'Observer ; addObserver inscrit, notifyObservers appelle update() sur chacun. La Lampe hérite d\'Observable et notifie quand elle change d\'état.'),
    forge('f-visiteur', 'visiteur', 'Forger le Visiteur', 'tr-visiteur', 'le Visiteur (le patron le plus fréquent des annales)',
      'Chaque élément a accepter(Visiteur v) { v.visiter(this); } ; le visiteur a une méthode visiter par type d\'élément. C\'est la surcharge qui choisit la bonne.'),
    // ---- Synthèse
    {
      id: 'r-A25', module: 'reacteur', title: 'Purger le dossier A25', route: '#reacteur--d-A25', scene: 'tr-a25',
      goal: 'Obtenir 70 % des cas justes sur le dossier A25 (tableau d\'animaux).',
      score: dossier('A25'),
      hint: 'Dans un foreach sur un tableau Animal[], la variable est de type Animal : seules les méthodes d\'Animal compilent, mais c\'est la version du type réel qui s\'exécute.',
    },
    {
      id: 'x-A24', module: 'saut', title: 'Simuler le saut : médian A24', route: '#saut--X-A24', scene: 'final',
      goal: 'Faire le sujet A24 complet en 1 h 30 sur papier, puis obtenir au moins 14/20 à la correction.',
      score: (s) => (s.exams['X-A24'] || []).reduce((m, r) => Math.max(m, r.score / r.max), 0),
      hint: 'Respecte le temps conseillé par partie et commence par ce que tu maîtrises. Repère ensuite les questions où tu as perdu le plus de points : la campagne t\'a appris où les retravailler.',
    },
  ];
})(window);
