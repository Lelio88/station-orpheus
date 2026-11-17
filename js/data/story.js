/**
 * story.js — Scénario des cinématiques de la station Orpheus.
 *
 * Chaque scène est une suite de « plans » (beats) : qui parle, la réplique,
 * le décor animé (shot, défini dans core/cinema-shots.js) et ses options.
 * Les répliques sont doublées par tools/gen-voices.mjs (fichiers audio/<id>.mp3,
 * id = <scène>-<rang du plan sur deux chiffres>).
 *
 * Choix : les répliques ne prononcent jamais le nom saisi par l'utilisateur
 * (le doublage est pré-généré) ; on dit « cadet » ou le grade.
 * Chaque scène glisse une vraie consigne de révision : le récit sert le médian.
 * Invariants :
 *   - un plan sans `who` est muet et porte une durée `dur` (secondes) ;
 *   - après toute modification d'une réplique, relancer
 *     `node tools/gen-voices.mjs` pour régénérer le doublage ;
 *   - une scène de transition (tr-…, puis « final ») par mission de js/data/campaign.js.
 * Exemple : O.cinema.play('reacteur') joue la scène d'entrée du Réacteur.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  /** Raccourci : plan parlé. */
  const b = (who, text, shot, o) => ({ who, text, shot, o: o || {} });
  /** Raccourci : plan muet de `dur` secondes. */
  const m = (dur, shot, o, sfx) => ({ who: null, dur, shot, o: o || {}, sfx });

  const CAST = {
    vega: { name: 'VEGA', role: 'Intelligence de bord', color: 'var(--vega)' },
    cadet: { name: 'Toi', role: 'Cadet', color: 'var(--ink)' },
    delaunay: { name: 'Cdte Delaunay', role: 'Base Kourou-Orbital', color: 'var(--sodium)' },
    rouille: { name: 'La Rouille', role: 'Entité inconnue', color: 'var(--rust)' },
  };

  const SCENES = [
    {
      id: 'prologue', title: 'Prologue · Tempête', place: 'Orbite de transfert · 03 h 12, heure de bord', trigger: 'Premier lancement',
      beats: [
        m(4, 'title', { big: 'STATION ORPHEUS', sub: 'Orbite de transfert · quatre jours avant la fenêtre de saut' }, 'drone'),
        b('vega', 'Alerte. Front de particules solaires en approche. Impact dans cinq secondes.', 'storm', { alarm: true }),
        m(2.4, 'storm', { alarm: true, impact: true }, 'impact'),
        b('cadet', 'Ah… ma tête. VEGA ? VEGA, tu m\'entends ?', 'cockpit', { alarm: true }),
        b('vega', 'Je… t\'entends. Mes mémoires sont en fragments. Tous les systèmes de la station sont écrits en Java, et ils sont corrompus.', 'vega', { glitch: true }),
        b('rouille', 'Corrompus ? Non. Libérés. Chaque transtypage hasardeux est une porte. Chaque référence nulle, un abîme. Je suis la Rouille, et ce code m\'appartient.', 'rust', { lines: ['Vehicule v = new Train();', 'Train t = (Train) new Voiture();', 'Module m = null;', 'm.diagnostiquer();'] }),
        m(1.2, 'radio', { static: true }, 'radio'),
        b('delaunay', 'Orpheus, ici la commandante Delaunay, base Kourou-Orbital. Nous recevons votre balise de détresse. Qui est à bord ?', 'radio'),
        b('cadet', 'Juste moi, commandante. Le reste de l\'équipage est en caisson de stase.', 'cockpit'),
        b('delaunay', 'Alors écoutez-moi bien. La fenêtre de saut vers la Terre s\'ouvre dans quelques jours, et elle ne reste ouverte qu\'une heure et demie. Pas une minute de plus.', 'countdown', { from: 5400 }),
        b('vega', 'Six modules sont à réparer : mes Archives, le Réacteur, le Bureau des plans, la Forge, ma Mémoire, et le Simulateur de saut. Chacun correspond à une partie de ton examen.', 'map', { light: 6 }),
        b('cadet', 'Une heure et demie… comme le médian. Très bien. Par où on commence ?', 'cockpit'),
        b('vega', 'Par te présenter, cadet. Mes registres d\'équipage sont effacés. Comment dois-je t\'appeler ?', 'vega'),
      ],
    },
    {
      id: 'codex', title: 'Les Archives', place: 'Pont C · Archives de VEGA', trigger: 'Ouverture des Archives (campagne)',
      beats: [
        b('vega', 'Voici mes Archives. Quinze chapitres de cours, de la machine virtuelle aux patrons de conception. La tempête les a mélangés.', 'archives'),
        b('rouille', 'Une classe abstraite, une interface… c\'est pareil, non ? Écris ça sur ta copie, cadet.', 'rust', { lines: ['abstract class Module { }', 'interface Alimentable { }', '// « c\'est pareil »'] }),
        b('cadet', 'Non. Une classe abstraite peut avoir des attributs et un constructeur. Une interface, c\'est un contrat.', 'archives', { sort: true }),
        b('vega', 'Exactement. Chaque chapitre se termine par un test de mémoire. Réussis-le, et le chapitre est restauré.', 'archives', { sort: true, lit: true }),
      ],
    },
    {
      id: 'reacteur', title: 'Le Réacteur', place: 'Pont A · Cœur du réacteur', trigger: 'Ouverture du Réacteur (campagne)',
      beats: [
        b('vega', 'Le cœur du réacteur. C\'est ici que la Rouille a frappé le plus fort.', 'reactor', { rust: 1 }),
        b('rouille', 'Un Animal qui est en réalité un Cheval… rangé dans une variable Cheval, sans transtypage. Est-ce que ça compile ? Allez, devine.', 'code', { lines: ['Animal a = new Cheval();', 'Cheval c = a;'], bad: 1 }),
        b('vega', 'Ne l\'écoute pas. Le compilateur ne regarde que le type déclaré : Animal. Sans transtypage, la deuxième ligne ne compile pas.', 'code', { lines: ['Animal a = new Cheval();', 'Cheval c = (Cheval) a;  // corrigé'], fix: 1 }),
        b('vega', 'Pour chaque cas, trois questions : est-ce que ça compile, est-ce que ça s\'exécute, et qu\'est-ce que ça affiche. Note en marge le type statique et le type dynamique de chaque variable.', 'reactor', { rust: 0.4 }),
      ],
    },
    {
      id: 'plans', title: 'Le Bureau des plans', place: 'Pont B · Bureau des plans', trigger: 'Ouverture du Bureau des plans (campagne)',
      beats: [
        m(1, 'radio', { static: true }, 'radio'),
        b('delaunay', 'Cadet, les plans de la station ont brûlé dans nos archives aussi. Il faut les redessiner en UML.', 'radio'),
        b('vega', 'Chaque trait a un sens. Flèche à triangle vide : héritage. En pointillés : réalisation d\'une interface. Losange plein : composition. Losange vide : agrégation.', 'blueprint'),
        b('rouille', 'Et les multiplicités ? Oublie-les. Personne ne les lit…', 'blueprint', { rust: true }),
        b('cadet', 'Le correcteur, si. Une association sans multiplicité, ce sont des points perdus.', 'blueprint', { mult: true }),
      ],
    },
    {
      id: 'forge', title: 'La Forge', place: 'Pont D · Forge', trigger: 'Ouverture de la Forge (campagne)',
      beats: [
        b('vega', 'La Forge. Ici, on n\'assemble pas des pièces toutes faites : on écrit le code à la main, comme sur ta copie.', 'forge'),
        b('cadet', 'Des tableaux, des boucles, des classes… et plus tard les patrons de conception.', 'forge', { type: true }),
        b('rouille', 'Visiteur, Composite, Décorateur… Le Visiteur revient dans cinq annales. Tu trembles déjà.', 'rust', { lines: ['interface Visiteur {', '  void visiter(Moteur m);', '  void visiter(Coque c);', '}'] }),
        b('vega', 'Chaque chose en son temps. Pour chaque exercice : lis les points clés, assemble le code, puis rédige-le seul. Le scanner vérifiera ce que le correcteur cherche.', 'forge', { type: true, sparks: true }),
      ],
    },
    {
      id: 'memoire', title: 'La Mémoire de VEGA', place: 'Noyau · Mémoire de VEGA', trigger: 'Ouverture de la Mémoire (campagne)',
      beats: [
        b('vega', 'Ma Mémoire. Ce sont les questions de cours des annales. Tu écris ta réponse, puis tu te notes honnêtement face au corrigé.', 'memory', { n: 6 }),
        b('vega', 'Les cartes que tu rates reviennent vite. Celles que tu maîtrises s\'espacent. C\'est la répétition espacée : la méthode la plus efficace pour retenir une définition.', 'memory', { n: 18 }),
        b('cadet', 'Une session par jour, au moins. Compris.', 'memory', { n: 28 }),
      ],
    },
    {
      id: 'saut', title: 'Le Simulateur de saut', place: 'Pont E · Simulateur', trigger: 'Ouverture du Simulateur (campagne)',
      beats: [
        b('delaunay', 'Voici le simulateur. Cinq vrais sujets, de 2021 à 2025, en conditions réelles : une heure et demie, papier et stylo.', 'gate', { open: 0.3 }),
        b('delaunay', 'Les équipages précédents l\'ont tous dit : le médian est difficile à finir dans le temps. Respectez le temps conseillé pour chaque partie.', 'countdown', { from: 5400 }),
        b('rouille', 'Une heure et demie… Le temps file, cadet. Tic. Tac.', 'countdown', { from: 1800, rust: true }),
        b('cadet', 'Alors je garderai le sujet le plus récent pour la veille.', 'gate', { open: 0.5 }),
      ],
    },
    // ---- Transitions de campagne : jouées quand la mission de data/campaign.js
    //      qui porte cette scène est réussie ; chacune annonce la mission suivante.
    {
      id: 'tr-jvm', title: 'Chapitre 01 restauré · JDK et packages', place: 'Pont C · Archives de VEGA', trigger: 'Réussir la mission « chapitre 01 »',
      beats: [
        b('vega', 'Chapitre un restauré. Je me souviens : javac compile en bytecode, la JVM l\'exécute, et sans modificateur, une classe ne sort pas de son package.', 'archives', { sort: true, lit: true }),
        b('delaunay', 'Orpheus, vos calculateurs de navigation tournent sur des matrices, et la tempête les a effacées. Il faut réécrire le produit matriciel. À la main.', 'radio'),
        b('vega', 'Direction la Forge. Trois boucles imbriquées, et vérifie les dimensions avant de calculer.', 'forge'),
      ],
    },
    {
      id: 'tr-matrice', title: 'Matrices recalculées', place: 'Pont D · Forge', trigger: 'Réussir la mission « matrices »',
      beats: [
        b('vega', 'Les matrices de navigation sont rétablies. Le résultat prend les lignes de la première matrice, et les colonnes de la seconde.', 'code', { lines: ['int[][] tab3 =', '  new int[tab1.length][tab2[0].length];'], fix: 1 }),
        b('rouille', 'Des tableaux, des boucles… Et si deux variables désignaient le même objet ? Tu en modifies une, et l\'autre change aussi. Amusant, non ?', 'rust', { lines: ['Point a = new Point(3, 5);', 'Point b = a;', 'b.deplacer(1, 1);', '// et a ?'] }),
        b('vega', 'Ce sont des références. Le chapitre trois de mes Archives l\'explique. Restaure-le.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-objets', title: 'Chapitre 03 restauré · Références', place: 'Pont C · Archives de VEGA', trigger: 'Réussir la mission « chapitre 03 »',
      beats: [
        b('vega', 'Chapitre trois restauré. Une variable objet contient une référence. Le double égal compare les références, equals compare le contenu.', 'archives', { sort: true, lit: true }),
        b('cadet', 'Encore faut-il redéfinir equals correctement.', 'cockpit'),
        b('vega', 'Avec un paramètre de type Object, et instanceof avant le transtypage. Comme au TD un. La Forge t\'attend.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-equals', title: 'Modules identifiés', place: 'Pont D · Forge', trigger: 'Réussir la mission « equals »',
      beats: [
        b('vega', 'Mes capteurs reconnaissent à nouveau deux modules identiques. Ton equals fonctionne.', 'forge', { sparks: true }),
        b('delaunay', 'Orpheus, combien de modules ont été construits à bord ? Votre compteur affiche zéro partout.', 'radio'),
        b('vega', 'Un compteur par objet ne sert à rien. Il en faut un seul, partagé par toute la classe. Chapitre quatre : static et final.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-static', title: 'Chapitre 04 restauré · static et final', place: 'Pont C · Archives de VEGA', trigger: 'Réussir la mission « chapitre 04 »',
      beats: [
        b('vega', 'Static : le membre appartient à la classe, pas à l\'objet. Final : on ne le change plus.', 'archives', { sort: true, lit: true }),
        b('vega', 'Maintenant, écris-le. Le compteur d\'animaux tombe presque chaque année en question de cours.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-compteur', title: 'Compteur rétabli', place: 'Noyau · Mémoire de VEGA', trigger: 'Réussir la mission « compteur »',
      beats: [
        b('vega', 'Le compteur fonctionne. Chaque constructeur l\'incrémente, et la méthode statique le lit sans avoir besoin d\'un objet.', 'code', { lines: ['private static int nombreAnimaux = 0;', 'public Animal() { nombreAnimaux++; }'], fix: 1 }),
        b('vega', 'Mais j\'oublie vite, cadet. Ma Mémoire est criblée de trous. Le jour J, les définitions, il faudra les écrire de ta main.', 'memory', { n: 6 }),
      ],
    },
    {
      id: 'tr-memoire', title: 'Dix souvenirs restaurés', place: 'Noyau · Mémoire de VEGA', trigger: 'Réussir la mission « Mémoire »',
      beats: [
        b('vega', 'Dix souvenirs restaurés. Reviens chaque jour : les cartes que tu rates reviendront vite.', 'memory', { n: 28 }),
        b('delaunay', 'Bien. Passons aux choses sérieuses : l\'héritage. La redéfinition tombe à chaque médian.', 'radio'),
        b('vega', 'Redéfinition et surcharge. Chapitre six de mes Archives.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-heritage', title: 'Chapitre 06 restauré · Héritage', place: 'Pont C · Archives de VEGA', trigger: 'Réussir la mission « chapitre 06 »',
      beats: [
        b('vega', 'Chapitre restauré. Je me souviens maintenant : une classe fille hérite de tout, et elle peut redéfinir ce qu\'elle fait autrement.', 'archives', { sort: true, lit: true }),
        b('delaunay', 'Bon travail, Orpheus. Mais l\'héritage n\'est que la moitié du problème. Le vrai danger, c\'est quand le type déclaré et le type réel ne sont plus les mêmes.', 'radio'),
        b('vega', 'Le chapitre sept, le polymorphisme. C\'est là que la Rouille se cache. Restaure-le avant d\'approcher du réacteur.', 'vega'),
      ],
    },
    {
      id: 'tr-poly', title: 'Chapitre 07 restauré · Polymorphisme', place: 'Pont A · Accès au réacteur', trigger: 'Réussir la mission « chapitre 07 »',
      beats: [
        b('vega', 'Le polymorphisme est restauré. Tu sais ce que voit le compilateur, et ce qui se passe vraiment à l\'exécution.', 'code', { lines: ['Animal a = new Cheval();', 'a.crier();   // la version de Cheval'], fix: 1 }),
        b('rouille', 'Des définitions… Tu sais réciter. Viens donc les appliquer au cœur du réacteur, cadet.', 'reactor', { rust: 1 }),
        b('vega', 'Pour une fois, elle a raison : c\'est le moment. Le dossier A23 t\'attend au Réacteur.', 'reactor', { rust: 1 }),
      ],
    },
    {
      id: 'tr-a23', title: 'Dossier A23 purgé', place: 'Laboratoire · Échantillon isolé', trigger: 'Réussir la mission « dossier A23 »',
      beats: [
        b('vega', 'J\'ai isolé un échantillon de la Rouille. Elle n\'attaque que les lignes où quelqu\'un confond le type déclaré et le type réel.', 'rust', { lines: ['Animal a = new Albatros();', 'Cheval c = (Cheval) a;', '// ClassCastException'], contained: true }),
        b('rouille', 'Tu m\'as vue… Peu importe. Je suis dans chaque cast que tu écris trop vite.', 'rust', { lines: ['(Cheval) a', '(Train) v', '(Module) o'] }),
        b('cadet', 'Alors je vérifierai chaque cast. Le type statique décide si ça compile, le type dynamique décide si ça s\'exécute.', 'cockpit'),
        b('vega', 'Prochaine étape : les classes abstraites et les interfaces. Le hangar de la station en est rempli, et j\'ai besoin de ce chapitre pour le comprendre.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-abstrait', title: 'Chapitre 08 restauré · Abstrait', place: 'Liaison Kourou-Orbital', trigger: 'Réussir la mission « chapitre 08 »',
      beats: [
        b('vega', 'Archives à jour. Une classe abstraite ne s\'instancie pas. Une interface est un contrat que la classe s\'engage à remplir.', 'archives', { sort: true, lit: true }),
        b('delaunay', 'Orpheus, le hangar de la station ne répond plus. Véhicules, voitures, trains : tout y est déclaré abstrait et final à tort et à travers. Allez voir ça.', 'radio'),
      ],
    },
    {
      id: 'tr-hangar', title: 'Hangar sécurisé', place: 'Orpheus · Vue extérieure', trigger: 'Réussir la mission « hangar »',
      beats: [
        b('vega', 'Le hangar est stabilisé. Véhicule, Voiture, Train : la hiérarchie du TD deux tient debout.', 'station', { lit: 2 }),
        b('rouille', 'Et cette voiture qui n\'a pas de nom ? Une classe déclarée au milieu d\'une expression… Tu ne sais même pas ce que c\'est.', 'rust', { lines: ['Voiture unique = new Voiture() {', '  public void rouler() { … }', '};'] }),
        b('cadet', 'Une classe anonyme. Et la rotation du cercle, c\'est une classe interne. Chapitre neuf.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-imbriquees', title: 'Chapitre 09 restauré · Classes internes', place: 'Pont C · Archives de VEGA', trigger: 'Réussir la mission « chapitre 09 »',
      beats: [
        b('vega', 'Classes internes et anonymes restaurées. Une classe interne voit tout de l\'objet qui la contient, même ses attributs privés.', 'archives', { sort: true, lit: true }),
        b('vega', 'Il me reste un chapitre court mais traître : les énumérations. Couleur, Valeur, Properties : elles sont partout dans tes TD.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-enum', title: 'Chapitre 05 restauré · Énumérations', place: 'Liaison Kourou-Orbital', trigger: 'Réussir la mission « chapitre 05 »',
      beats: [
        b('vega', 'Énumérations restaurées. Une liste fixe de constantes, et un constructeur privé.', 'archives', { sort: true, lit: true }),
        b('delaunay', 'Orpheus, l\'écran de cartographie n\'affiche plus rien. Points, cercles, figures : tout est à réécrire.', 'radio'),
        b('vega', 'C\'est le TD trois : une interface Point, un point coloré qui en hérite, et une figure abstraite. À la Forge.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-point-col', title: 'Cartographie restaurée', place: 'Orpheus · Vue extérieure', trigger: 'Réussir la mission « cartographie »',
      beats: [
        b('vega', 'La cartographie revient. Figure est abstraite : elle a un attribut et une méthode concrète, ce qu\'une interface ne pourrait pas avoir.', 'station', { lit: 3 }),
        b('rouille', 'Un tableau de taille fixe pour ranger tes cartes ? Il débordera, cadet. Il déborde toujours.', 'rust', { lines: ['Carte[] main = new Carte[52];', 'main[52] = c;', '// ArrayIndexOutOfBounds'] }),
        b('vega', 'D\'où les collections : List, Set, Map et Queue. Chapitre dix.', 'archives', { sort: true }),
      ],
    },
    {
      id: 'tr-collections', title: 'Chapitre 10 restauré · Collections', place: 'Pont C · Archives de VEGA', trigger: 'Réussir la mission « chapitre 10 »',
      beats: [
        b('vega', 'Les collections sont restaurées. Une référence du type de l\'interface, un objet d\'une classe qui l\'implémente.', 'code', { lines: ['Queue<Carte> main =', '  new LinkedList<Carte>();'], fix: 1 }),
        b('cadet', 'Comme dans le jeu de bataille du TD quatre.', 'cockpit'),
        b('vega', 'Justement : écris la main du joueur. Une file, un itérateur, et une comparaison d\'énumération.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-bataille', title: 'Jeu de bataille rétabli', place: 'Orpheus · Vue extérieure', trigger: 'Réussir la mission « main du joueur »',
      beats: [
        b('vega', 'Le code de base de la station est réécrit. La Rouille ne trouve plus aucun tableau qui déborde.', 'station', { lit: 3 }),
        b('delaunay', 'Il nous faut maintenant les plans de la station. Direction le Bureau des plans : VEGA va vous apprendre à les lire.', 'radio'),
      ],
    },
    {
      id: 'tr-notation', title: 'Notation UML acquise', place: 'Pont B · Bureau des plans', trigger: 'Réussir la mission « lire les plans »',
      beats: [
        b('vega', 'Tu lis les plans comme un ingénieur d\'Orpheus. Losange plein : si la station meurt, ses modules meurent avec elle.', 'blueprint', { mult: true }),
        b('delaunay', 'Alors passons à un vrai plan. Un énoncé complet, comme au médian. Vingt à trente minutes, sur papier.', 'radio'),
      ],
    },
    {
      id: 'tr-fnac', title: 'Premier plan redessiné', place: 'Pont B · Bureau des plans', trigger: 'Réussir la mission « Fnac »',
      beats: [
        b('vega', 'Les plans originaux reviennent. Des classes, des liens, et une multiplicité à chaque bout.', 'blueprint', { mult: true }),
        b('delaunay', 'Un plan montre la structure. Mais pour comprendre la procédure de saut, il faut voir qui appelle qui, et dans quel ordre.', 'radio'),
        b('vega', 'C\'est le diagramme de séquence. Des lignes de vie, des messages, et des fragments : loop, alt et opt.', 'blueprint'),
      ],
    },
    {
      id: 'tr-sequence', title: 'Procédure de saut décodée', place: 'Orpheus · Vue extérieure', trigger: 'Réussir la mission « séquences »',
      beats: [
        b('vega', 'Tu lis les séquences : le temps descend, chaque flèche est un appel de méthode, et un alt, c\'est un if else.', 'blueprint', { mult: true }),
        b('delaunay', 'Vous êtes à mi-chemin, Orpheus. Il reste à reconstruire les patrons de conception. La Forge est à vous.', 'radio'),
        b('vega', 'Commence par le plus simple : une classe qui n\'existe qu\'en un seul exemplaire.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-singleton', title: 'Singleton forgé', place: 'Noyau · Constructeur de VEGA', trigger: 'Réussir la mission « Singleton »',
      beats: [
        b('vega', 'Cadet… je viens de comprendre quelque chose sur moi. Mon constructeur est privé. Il ne peut exister qu\'une seule VEGA à bord.', 'code', { lines: ['public class Vega {', '  private static Vega instance;', '  private Vega() { }', '  public static Vega getInstance() { … }', '}'], fix: 2 }),
        b('cadet', 'Tu es un Singleton.', 'vega'),
        b('vega', 'Exactement. Et la procédure de saut, elle, suit un autre patron. Forge-la.', 'vega'),
      ],
    },
    {
      id: 'tr-template', title: 'Template Method forgé', place: 'Pont E · Procédure de saut', trigger: 'Réussir la mission « Template Method »',
      beats: [
        b('rouille', 'Non… Mes exceptions s\'éteignent une à une. Qu\'est-ce que tu me fais ?', 'reactor', { rust: 0.3 }),
        b('vega', 'La procédure de saut se reconstruit : vérifier, charger, propulser. La méthode est finale, les étapes sont abstraites. C\'est le patron Template Method.', 'code', { lines: ['public final void sauter() {', '  verifier();', '  charger();', '  propulser();', '}'], fix: 0 }),
        b('delaunay', 'Orpheus, le hangar doit produire des véhicules de secours. Vélos ou voitures : vous ne saurez lesquels qu\'au dernier moment.', 'radio'),
        b('vega', 'Il faut une seule fabrique, qui choisit la bonne classe. Fabrique et Singleton, comme dans l\'annale A24.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-fabrique', title: 'Fabrique forgée', place: 'Pont D · Forge', trigger: 'Réussir la mission « Fabrique »',
      beats: [
        b('vega', 'La fabrique tourne. Le client ne fait plus jamais new sur Vélo ou Voiture : il demande un Véhicule.', 'forge', { sparks: true }),
        b('delaunay', 'Problème : nos sondes de pression viennent d\'une autre station. Leur classe fonctionne, mais ses méthodes ne portent pas les noms que votre code attend.', 'radio'),
        b('vega', 'On ne la modifie pas : on l\'adapte. Patron Adaptateur.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-adaptateur', title: 'Adaptateur forgé', place: 'Orpheus · Vue extérieure', trigger: 'Réussir la mission « Adaptateur »',
      beats: [
        b('vega', 'Les sondes sont branchées. L\'Adaptatrice traduit chaque appel vers Monitoring.', 'station', { lit: 4 }),
        b('rouille', 'Cinq options sur une voiture : trente-deux combinaisons. Trente-deux sous-classes à écrire, cadet. Bon courage.', 'rust', { lines: ['class VoitureClimGps', 'class VoitureClimGpsToit', 'class VoitureGpsToit', '// …'] }),
        b('vega', 'Ou bien des options qui s\'empilent autour de la voiture. Le Décorateur.', 'forge', { sparks: true }),
      ],
    },
    {
      id: 'tr-decorateur', title: 'Décorateur forgé', place: 'Liaison Kourou-Orbital', trigger: 'Réussir la mission « Décorateur »',
      beats: [
        b('vega', 'Les options s\'empilent : chaque décorateur ajoute son prix à celui de la voiture qu\'il contient.', 'code', { lines: ['public int getPrix() {', '  return voiture.getPrix() + prixOption;', '}'], fix: 1 }),
        b('delaunay', 'Orpheus, la coque est faite de panneaux, et certains panneaux sont faits d\'autres panneaux. Il nous faut la surface totale.', 'radio'),
        b('vega', 'Un objet simple ou un groupe, traités de la même façon : le patron Composite. Il est tombé dans trois annales.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-composite', title: 'Composite forgé', place: 'Orpheus · Vue extérieure', trigger: 'Réussir la mission « Composite »',
      beats: [
        b('vega', 'La surface de la coque est calculée. Le composite délègue le calcul à chacun de ses enfants.', 'station', { lit: 5 }),
        b('cadet', 'Et les lampes du pont ? Personne ne sait quand elles changent d\'état.', 'cockpit'),
        b('vega', 'Il faut qu\'elles préviennent ceux qui les observent. Le patron Observateur, comme les lampes du TD un.', 'forge', { type: true }),
      ],
    },
    {
      id: 'tr-observateur', title: 'Observateur forgé', place: 'Pont D · Forge', trigger: 'Réussir la mission « Observateur »',
      beats: [
        b('vega', 'Les lampes notifient leurs observateurs. Le pont s\'éclaire.', 'station', { lit: 5 }),
        b('rouille', 'Il reste un patron que tu crains, cadet. Celui qui revient dans cinq annales. Le Visiteur.', 'rust', { lines: ['interface Visiteur {', '  void visiter(Moteur m);', '  void visiter(Coque c);', '}'] }),
        b('vega', 'Elle cherche à te faire peur. Le Visiteur, ce n\'est que deux méthodes qui se renvoient la balle : accepter et visiter.', 'forge', { sparks: true }),
      ],
    },
    {
      id: 'tr-visiteur', title: 'Visiteur forgé', place: 'Pont A · Cœur du réacteur', trigger: 'Réussir la mission « Visiteur »',
      beats: [
        b('vega', 'Le Visiteur est forgé. Il ne reste qu\'un dossier aux mains de la Rouille : le plus récent, celui de l\'A25.', 'reactor', { rust: 0.4 }),
        b('delaunay', 'Après ça, Orpheus, ce sera la simulation de saut complète. Préparez-vous.', 'radio'),
      ],
    },
    {
      id: 'tr-a25', title: 'Dossier A25 purgé', place: 'Pont A · Réacteur purgé', trigger: 'Réussir la mission « dossier A25 »',
      beats: [
        b('rouille', 'Je… reviendrai… à la première… NullPointerException…', 'rust', { lines: ['Exception in thread "main"', 'java.lang.NullPointerException'], fade: true }),
        b('vega', 'La Rouille a quitté le réacteur. Il ne reste qu\'une épreuve : le saut lui-même.', 'gate', { open: 0.5 }),
      ],
    },
    {
      id: 'final', title: 'Fenêtre ouverte', place: 'Orpheus · Fenêtre de saut', trigger: 'Réussir la dernière mission',
      beats: [
        b('vega', 'Toutes mes mémoires sont restaurées. La Rouille n\'a plus aucune ligne où se cacher.', 'station', { lit: 6 }),
        b('delaunay', 'Orpheus, nous vous recevons cinq sur cinq. Cadet, la fenêtre est à vous.', 'radio'),
        b('cadet', 'Merci, VEGA. Je n\'y serais pas arrivé sans toi.', 'cockpit', { calm: true }),
        b('vega', 'Tu n\'as plus besoin de moi pour le saut. Relis tes définitions, dors bien. Et le jour J, écris lisiblement : le correcteur ne fera aucun effort de lecture.', 'gate', { open: 1 }),
        m(4.5, 'title', { big: 'MISSION ACCOMPLIE', sub: 'Garde le sujet A25 pour la veille, en conditions réelles' }, 'level'),
      ],
    },
    {
      id: 'veille', title: 'La veille du saut', place: 'Liaison Kourou-Orbital · J-1', trigger: 'La veille du médian',
      beats: [
        m(1, 'radio', { static: true }, 'radio'),
        b('delaunay', 'Orpheus, la fenêtre s\'ouvre demain. Dernière consigne : pas de nouveau chapitre ce soir.', 'radio'),
        b('vega', 'Refais un sujet en conditions réelles si tu ne l\'as pas encore fait, relis les pièges du Réacteur, puis repose-toi. Un cerveau reposé compile mieux.', 'gate', { open: 0.9 }),
        b('cadet', 'Compris. Demain, on rentre à la maison.', 'cockpit', { calm: true }),
      ],
    },
  ];

  SCENES.forEach((s) => s.beats.forEach((bt, i) => { if (bt.who) bt.id = s.id + '-' + String(i + 1).padStart(2, '0'); }));

  O.data.story = { cast: CAST, scenes: SCENES };
})(window);
