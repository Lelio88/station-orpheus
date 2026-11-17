/**
 * codex.js — Les Archives de VEGA : la théorie, chapitre par chapitre.
 *
 * Source : les 7 cours de LO02 (Concepts POO, Classe UML, Séquences, POO,
 * POO avancée, Collections, Exceptions), Bases du langage, Environnement Java,
 * et les questions de cours des médians A09 → A25.
 * Les définitions reprennent la formulation du cours quand elle existe ;
 * les encadrés « Pour la copie » donnent la phrase à écrire le jour J.
 *
 * Format d'un bloc : { t: 'p'|'h'|'list'|'code'|'trap'|'copy'|'vega'|'table'|'uml', ... }
 * Chaque chapitre finit par un test de mémoire (quiz) : { q, c: [choix], a: index, why }.
 * Ce fichier dépasse 800 lignes : c'est un fichier de contenu, pas de logique.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  O.data.codex = [
    {
      id: 'jvm', num: '01', title: 'Java, le JDK, les packages et les bases', exam: 'Questions de cours (A24 I.1, I.7 ; A21 I.4) — TP 1 et TP 2',
      blocks: [
        { t: 'p', s: 'Un programme Java passe par **deux étapes** : `javac` **compile** le fichier source `Voiture.java` en **bytecode** `Voiture.class` ; puis la **machine virtuelle Java (JVM)**, lancée par `java Voiture`, **interprète** ce bytecode (et en compile à la volée les parties souvent exécutées, compilation JIT).' },
        { t: 'copy', s: 'Java est **à la fois compilé et interprété** : compilé en bytecode indépendant de la machine par javac, puis interprété par la JVM propre à chaque système. C\'est ce qui rend un programme Java portable (« write once, run anywhere »).' },
        { t: 'h', s: 'Les outils du JDK' },
        { t: 'table', head: ['Outil', 'Rôle', 'Exemple'], rows: [
          ['`javac`', 'compile les .java en .class (bytecode)', '`javac Voiture.java`'],
          ['`java`', 'lance la JVM sur la classe qui contient main', '`java Voiture`'],
          ['`javadoc`', 'génère la documentation HTML depuis les commentaires /** */', '`javadoc Voiture.java`'],
          ['`jar`', 'regroupe des .class dans une archive', '`jar cf app.jar *.class`'],
          ['`jdb`', 'débogueur', ''],
        ] },
        { t: 'p', s: 'JDK = outils de développement + JRE. JRE = JVM + bibliothèques standard (l\'API Java), suffisant pour exécuter.' },
        { t: 'h', s: 'La méthode main' },
        { t: 'code', s: 'public static void main(String[] args) {\n    // ici commence le programme Java\n}' },
        { t: 'list', items: [
          '`public` : la JVM, extérieure à la classe, doit pouvoir l\'appeler.',
          '`static` : au démarrage **aucun objet n\'existe** ; la méthode doit donc être indépendante de toute instance (méthode de classe).',
          '`void` : elle ne renvoie rien à la JVM.',
          '`main` : nom imposé, la JVM le connaît à l\'avance (on ne lui donne que le nom de la classe).',
          '`String[] args` : les arguments passés en ligne de commande (`java Voiture 12 rouge` → `args[0]` vaut "12").',
        ] },
        { t: 'p', s: 'On peut avoir une méthode main par classe : pratique pour tester chaque classe unitairement (cours POO).' },
        { t: 'trap', s: '« Java est interprété donc lent » ou « Java est compilé comme le C » sont deux réponses à moitié fausses. Le correcteur attend les **deux** étapes et le mot **bytecode**.' },
        { t: 'h', s: 'Packages et visibilité (TP 2)' },
        { t: 'p', s: 'Un **package** regroupe des classes liées, comme un dossier : `package fr.utt.lo02.tp2;` est la **première ligne** du fichier, et le fichier se range dans le dossier `fr/utt/lo02/tp2`. Le nom complet d\'une classe (**FQN**, *fully qualified name*) inclut son package : `paquetC.ClassC`.' },
        { t: 'p', s: 'Pour utiliser une classe d\'un **autre** package : soit `import paquetC.ClassC;` en tête du fichier, soit son nom complet dans le code (`new paquetC.ClassC()`). Les classes du même package et celles de `java.lang` (String, Math, System) n\'ont pas besoin d\'import.' },
        { t: 'table', head: ['Modificateur', 'La classe', 'Le même package', 'Une sous-classe (autre package)', 'Tout le monde'], rows: [
          ['`private`', 'oui', 'non', 'non', 'non'],
          ['*(rien)* : visibilité package', 'oui', 'oui', 'non', 'non'],
          ['`protected`', 'oui', 'oui', 'oui', 'non'],
          ['`public`', 'oui', 'oui', 'oui', 'oui'],
        ] },
        { t: 'code', s: 'package paquetnivo1.paquetnivo2;\nclass ClassZ { }                  // pas de public : visible dans paquetnivo1.paquetnivo2 seulement\n\npackage paquetnivo0;\nimport paquetnivo1.paquetnivo2.*;\npublic class Test {\n    public static void main(String[] args) {\n        ClassA a = new ClassA(30, 40);  // ClassA est public : OK\n        ClassZ z = new ClassZ();        // ERREUR de compilation : ClassZ n\'est pas visible ici\n        // a.j = 5;  ERREUR aussi : j (sans modificateur) n\'est visible que dans le package de ClassA\n    }\n}' },
        { t: 'copy', s: 'Sans modificateur, un membre ou une classe a la **visibilité package** : accessible uniquement depuis les classes du même package. Pour l\'utiliser ailleurs, il faut le déclarer `public` (ou `protected` pour les sous-classes).' },
        { t: 'h', s: 'Bases du langage (TP 1)' },
        { t: 'list', items: [
          '**Types primitifs** : `int`, `double`, `boolean`, `char`, `long`, `float`, `byte`, `short`. Ils contiennent une valeur, pas une référence. `String` n\'est **pas** un type primitif : c\'est une classe.',
          '**Division** : `7 / 2` vaut `3` (division entière entre deux int) ; `7 / 2.0` vaut `3.5`. `Math.sqrt(delta)` donne la racine carrée (TP 1 : racines d\'un polynôme).',
          '**Tableau** : un objet de taille fixe. `int[] t = new int[5];` (cases à 0) ou `int[] t = {1, 2, 3};`. Indices de `0` à `t.length - 1` ; au-delà, `ArrayIndexOutOfBoundsException` à l\'exécution.',
          '**Tableau à deux dimensions** : un tableau de tableaux. `int[][] m = new int[3][4];` ; `m.length` = nombre de lignes, `m[0].length` = nombre de colonnes.',
          '**Boucles** : `for (int i = 0; i < t.length; i++)`, `while (condition)`, et le foreach `for (int x : t)` pour lire chaque case.',
          '**Mode debug** (Eclipse ou VS Code) : point d\'arrêt, exécution pas à pas, lecture des variables. C\'est l\'outil `jdb` du JDK derrière une interface.',
        ] },
        { t: 'code', s: '// Produit matriciel (TP 1, exercice 2)\nint[][] tab3 = new int[tab1.length][tab2[0].length];\nfor (int ligne = 0; ligne < tab1.length; ligne++) {\n    for (int colonne = 0; colonne < tab2[0].length; colonne++) {\n        int produit = 0;\n        for (int k = 0; k < tab2.length; k++) {\n            produit += tab1[ligne][k] * tab2[k][colonne];\n        }\n        tab3[ligne][colonne] = produit;\n    }\n}' },
      ],
      quiz: [
        { q: 'Que produit `javac Animal.java` ?', c: ['Un exécutable natif Animal.exe', 'Un fichier Animal.class contenant du bytecode', 'La documentation HTML de Animal', 'Rien, Java est interprété directement'], a: 1, why: 'javac compile vers du bytecode (.class), que la JVM interprétera.' },
        { q: 'Pourquoi `main` est-elle `static` ?', c: ['Pour être plus rapide', 'Parce qu\'aucun objet n\'existe au lancement du programme', 'Pour ne pas être redéfinie', 'Parce qu\'elle est publique'], a: 1, why: 'Une méthode de classe s\'appelle sans instance : la JVM l\'appelle avant toute création d\'objet.' },
        { q: 'Quel outil génère la documentation d\'une classe ?', c: ['java', 'javac', 'javadoc', 'jar'], a: 2, why: 'javadoc lit les commentaires /** ... */ et produit des pages HTML.' },
        { q: '`class ClassZ { }` (sans public) est déclarée dans le package p1. Peut-on écrire `new ClassZ()` dans une classe du package p0 ?', c: ['Oui, avec import p1.*', 'Non : sans modificateur, ClassZ n\'est visible que dans p1', 'Oui, si on utilise le nom complet p1.ClassZ', 'Non, une classe sans public ne s\'instancie jamais'], a: 1, why: 'Visibilité package : ni import ni FQN ne la rendent visible ailleurs. Il faut la déclarer public.' },
        { q: 'Un attribut `protected` de Vehicule est accessible…', c: ['seulement dans Vehicule', 'dans le package de Vehicule et dans ses sous-classes', 'seulement dans les sous-classes', 'partout'], a: 1, why: 'protected = visibilité package + sous-classes, même dans un autre package.' },
        { q: 'Avec `int[][] m = new int[3][4];`, que vaut `m[0].length` ?', c: ['3', '4', '12', '0'], a: 1, why: 'm.length compte les lignes (3) ; m[0] est la première ligne, qui a 4 cases.' },
        { q: 'Que vaut `7 / 2` en Java ?', c: ['3.5', '3', '4', 'Erreur de compilation'], a: 1, why: 'Entre deux int, la division est entière. Il faut un double (7 / 2.0) pour obtenir 3.5.' },
      ],
    },

    {
      id: 'concepts', num: '02', title: 'Les concepts de l\'orienté objet', exam: 'Questions de cours (A11 I.2, A21 I.2-I.3)',
      blocks: [
        { t: 'p', s: 'Un **objet** est la représentation d\'une donnée du monde réel, concrète (une voiture, une carte) ou abstraite (un prêt, une stratégie, un nombre complexe). Il est caractérisé par son **identité** (identifiant donné par le système), son **état** (ses attributs) et son **comportement** (ses méthodes).' },
        { t: 'p', s: 'Une **classe** est le modèle qui décrit tous les objets d\'un même type : ses membres (attributs et méthodes) et un mécanisme d\'**instanciation**. La classe est un moule ; les objets en sont des instances. Une classe **est un type**, au même titre que `int`.' },
        { t: 'p', s: 'Un programme orienté objet, c\'est : la définition de classes, l\'instanciation d\'objets à partir de ces classes, et la communication entre objets par appels de méthodes (envoi de messages).' },
        { t: 'h', s: 'Encapsulation' },
        { t: 'p', s: 'Un objet a une mécanique interne et n\'offre qu\'une **vue** à l\'extérieur. L\'encapsulation consiste à **masquer l\'état interne** en rendant les attributs privés et à n\'y accéder que par des méthodes publiques qui **contrôlent la cohérence** des valeurs.' },
        { t: 'code', s: '// Sans encapsulation : n\'importe qui écrit v.vitesse = -230;\npublic class Voiture {\n    public int vitesse;\n}\n\n// Avec encapsulation : la classe garde le contrôle\npublic class Voiture {\n    private int vitesse;\n    public void modifierVitesse(int nouvelleVitesse) {\n        if (nouvelleVitesse >= 0 && nouvelleVitesse <= 250) {\n            this.vitesse = nouvelleVitesse;\n        }\n    }\n}' },
        { t: 'copy', s: 'L\'encapsulation sépare la vue interne d\'un objet de la vue offerte à ses utilisateurs. Les attributs sont privés ; on les modifie par des méthodes publiques qui vérifient la cohérence des valeurs. L\'objet garde ainsi le contrôle de son état.' },
        { t: 'h', s: 'Héritage' },
        { t: 'p', s: 'Mécanisme de transmission des membres d\'une classe (mère, super-classe) à d\'autres classes (filles, sous-classes). Il organise les classes par **généralisation / spécialisation**, factorise le code et accroît la modularité. Relation « **est un** » : une voiture est un véhicule.' },
        { t: 'h', s: 'Polymorphisme et liaison dynamique (définitions du cours)' },
        { t: 'list', items: [
          '**Redéfinition** : une méthode de la classe mère est réécrite dans une classe fille avec un code différent, **même nom et même signature**.',
          '**Polymorphisme** : faculté d\'une opération à pouvoir être appliquée à des objets de classes différentes **issus de la même hiérarchie**.',
          '**Liaison dynamique** : le code exécuté est choisi **à l\'exécution**, selon le **type effectif (réel)** de l\'objet, et non à la compilation. En Java, c\'est implicite (en C++, il faut `virtual`).',
        ] },
        { t: 'p', s: 'Héritage multiple : possible en C++ (problème du losange), **interdit en Java** pour les classes. Java le remplace par l\'implémentation de plusieurs interfaces.' },
      ],
      quiz: [
        { q: 'Quelles sont les trois caractéristiques d\'un objet selon le cours ?', c: ['Classe, méthode, attribut', 'Identité, état, comportement', 'Public, privé, protégé', 'Nom, type, valeur'], a: 1, why: 'Identité (identifiant système), état (attributs), comportement (méthodes).' },
        { q: 'Pourquoi rendre l\'attribut `vitesse` privé ?', c: ['Pour que le code soit plus rapide', 'Pour que seul l\'objet contrôle les valeurs acceptées', 'Parce que Java l\'impose', 'Pour pouvoir le redéfinir'], a: 1, why: 'C\'est l\'encapsulation : on passe par une méthode qui vérifie la cohérence.' },
        { q: 'Java autorise-t-il l\'héritage multiple de classes ?', c: ['Oui, avec extends A, B', 'Non, mais une classe peut implémenter plusieurs interfaces', 'Oui, seulement pour les classes abstraites', 'Non, ni pour les classes ni pour les interfaces'], a: 1, why: 'Héritage simple pour les classes ; plusieurs interfaces possibles (pseudo héritage multiple).' },
      ],
    },

    {
      id: 'objets', num: '03', title: 'Classes, objets et références', exam: 'Questions de cours (A24 I.6, A25 I.5) — TD 1',
      blocks: [
        { t: 'p', s: 'Ordre conventionnel d\'une classe : constantes, attributs, constructeurs, méthodes, puis éventuellement `main` pour la tester.' },
        { t: 'code', s: 'public class Voiture {\n    public final int capaciteReservoir = 50;   // constante\n    private int kilometres;                    // attributs privés\n    private boolean roule;\n\n    public Voiture(int kilometres) {           // constructeur : nom de la classe, pas de type de retour\n        this.kilometres = kilometres;\n        this.roule = false;\n    }\n    public Voiture() {                         // surcharge du constructeur\n        this(0);\n    }\n    public void stopper() {\n        this.roule = false;\n    }\n}' },
        { t: 'h', s: 'Créer un objet : trois phases' },
        { t: 'list', items: [
          '**Déclaration** d\'une référence : `Voiture v;` (aucun objet n\'est créé !).',
          '**Instanciation** avec `new`, qui réserve la mémoire.',
          '**Initialisation** par l\'appel d\'un constructeur.',
        ] },
        { t: 'h', s: 'La référence, notion essentielle' },
        { t: 'p', s: 'Une variable de type objet contient une **référence** (un pointeur) vers la zone mémoire de l\'objet, pas l\'objet lui-même. Plusieurs références peuvent désigner le même objet.' },
        { t: 'code', s: 'Point a, b;\na = new Point(3, 5);\nb = new Point(2, 0);\na = b;      // a et b désignent maintenant LE MÊME objet (2,0)\n            // l\'objet (3,5) n\'est plus référencé : le garbage collector le libérera' },
        { t: 'copy', s: '`a = b` copie la **référence**, pas le contenu de l\'objet. Après l\'affectation, a et b désignent le même objet. Le premier objet n\'est plus référencé ; il n\'est pas « remplacé » mais sera libéré par le garbage collector.' },
        { t: 'h', s: 'Supprimer un objet : rien à faire' },
        { t: 'p', s: 'Pas de `free` ni `delete` en Java. Le **garbage collector** (ramasse-miettes), processus de la JVM tournant en tâche de fond : 1) marque les objets non référencés, 2) balaye le tas (heap) et libère la mémoire allouée par `new`, 3) compacte la mémoire.' },
        { t: 'h', s: 'Passage des paramètres' },
        { t: 'p', s: 'Types primitifs : passés **par valeur** (la méthode travaille sur une copie). Objets : la méthode reçoit **une référence** sur l\'objet, elle peut donc modifier l\'objet d\'origine.' },
        { t: 'h', s: '== ou equals ?' },
        { t: 'p', s: '`==` compare les références (même objet ?). `equals` compare le contenu, à condition de l\'avoir **redéfinie**. Modèle du TD 1 :' },
        { t: 'code', s: 'public boolean equals(Object o) {\n    if (o instanceof Point) {\n        Point p = (Point) o;          // transtypage après vérification\n        return this.x == p.x && this.y == p.y;\n    }\n    return false;\n}\n\npublic String toString() {\n    StringBuffer sb = new StringBuffer();\n    sb.append("Point (").append(this.x).append(", ").append(this.y).append(")");\n    return sb.toString();\n}' },
        { t: 'trap', s: 'La signature est `equals(Object o)` et non `equals(Point p)` : avec `Point p`, tu fais une **surcharge**, pas une redéfinition, et `List.contains` ne l\'utilisera pas. Pour des String, compare avec `equals`, pas `==` (le TD utilise `==` sur `marque`, c\'est une approximation).' },
        { t: 'p', s: '`this` désigne l\'objet courant : il lève l\'ambiguïté entre attribut et paramètre (`this.x = x`) et permet d\'appeler un autre constructeur (`this(0)`, en première ligne).' },
      ],
      quiz: [
        { q: '`Cheval c1 = new Cheval(); Cheval c2 = new Cheval(); c1 = c2;` Combien d\'objets Cheval restent référencés ?', c: ['2', '1', '0', 'Ça ne compile pas'], a: 1, why: 'c1 et c2 désignent le second cheval ; le premier n\'est plus référencé (garbage collector).' },
        { q: '`Voiture v;` crée-t-il un objet ?', c: ['Oui, avec le constructeur par défaut', 'Non, seulement une référence (non initialisée)', 'Oui mais vide', 'Non, c\'est une erreur de compilation'], a: 1, why: 'Il faut new pour instancier.' },
        { q: 'Quelle signature redéfinit correctement equals ?', c: ['public boolean equals(Point p)', 'public boolean equals(Object o)', 'public int equals(Object o)', 'private boolean equals(Object o)'], a: 1, why: 'Même signature que dans Object, sinon c\'est une surcharge.' },
      ],
    },

    {
      id: 'static', num: '04', title: 'static et final', exam: 'Questions de cours (A14/A18/A21 I.1, A23 I.3, A25 I.8, A24 I.5)',
      blocks: [
        { t: 'p', s: '**Membre d\'instance** : chaque objet possède sa propre copie des attributs. **Membre de classe** (`static`) : il est lié à la **classe** et existe indépendamment des objets ; il n\'y en a **qu\'un exemplaire, partagé** par toutes les instances. En UML, un membre statique est **souligné**.' },
        { t: 'p', s: 'Usages typiques donnés en cours : compter le nombre d\'instances d\'une classe ; ne permettre la création que d\'une seule instance (Singleton) ; constantes de classe (`static final`).' },
        { t: 'code', s: 'public class Animal {\n    private static int nombreAnimaux = 0;   // un seul compteur pour toute la classe\n\n    public Animal() {\n        Animal.nombreAnimaux++;              // incrémenté à chaque instanciation\n    }\n    public static int getNombreAnimaux() {\n        return Animal.nombreAnimaux;\n    }\n}\n// Appel : Animal.getNombreAnimaux();' },
        { t: 'copy', s: '« nombreAnimaux est un attribut de classe (static) : il n\'existe qu\'en un seul exemplaire, partagé par toutes les instances. Il n\'est donc pas vrai que chaque Animal a sa propre valeur. On y accède par Animal.nombreAnimaux. »' },
        { t: 'trap', s: 'Une méthode `static` ne peut pas utiliser `this` ni accéder directement aux attributs d\'instance : elle n\'est liée à aucun objet. Et il n\'y a **pas de redéfinition** des méthodes statiques à proprement parler.' },
        { t: 'h', s: 'final : trois usages' },
        { t: 'table', head: ['Sur…', 'Effet', 'Exemple'], rows: [
          ['un attribut', 'constante, valeur non modifiable', '`public static final int VITESSE_MAX = 240;`'],
          ['une méthode', 'ne peut pas être redéfinie', '`public final void rouler() { ... }`'],
          ['une classe', 'ne peut pas être dérivée (comme String)', '`public final class Voiture extends Vehicule { }`'],
        ] },
        { t: 'copy', s: 'A25 I.6 : `public final class AlbatrosRoyal extends Albatros { }` — `extends` pour dériver de Albatros, `final` pour qu\'elle ne soit plus dérivable.' },
      ],
      quiz: [
        { q: 'Comment interdire qu\'une classe soit dérivée ?', c: ['La déclarer abstract', 'La déclarer final', 'La déclarer static', 'Rendre son constructeur public'], a: 1, why: 'final sur une classe interdit extends.' },
        { q: 'Tous les Animal ont-ils leur propre valeur de `static int nombreAnimaux` ?', c: ['Oui, chaque objet a sa copie', 'Non, une seule valeur partagée par la classe', 'Oui si l\'attribut est privé', 'Seulement les sous-classes'], a: 1, why: 'Un attribut static est un attribut de classe.' },
        { q: 'Dans une méthode static, peut-on écrire `this.nom` ?', c: ['Oui', 'Non, il n\'y a pas d\'objet courant', 'Oui si nom est public', 'Seulement dans main'], a: 1, why: 'Une méthode de classe n\'est liée à aucune instance.' },
      ],
    },

    {
      id: 'enum', num: '05', title: 'Les énumérations', exam: 'UML (enum dans les diagrammes) — TD 3 et TD 4',
      blocks: [
        { t: 'p', s: 'Une **énumération** définit une liste fixe de constantes. Elle se déclare comme une classe, dans un fichier à son nom, avec le mot clé `enum`. Pas d\'héritage possible : elle hérite automatiquement de `java.lang.Enum`. Constantes en MAJUSCULES, séparées par des virgules.' },
        { t: 'code', s: 'public enum Couleur {\n    PIQUE, COEUR, CARREAU, TREFLE\n}\n\n// Une énumération est une classe : attributs, constructeur PRIVÉ, méthodes\npublic enum Valeur {\n    SEPT(7), HUIT(8), NEUF(9), DIX(10), VALET(11), DAME(12), ROI(13), AS(14);\n\n    private int points;\n    private Valeur(int points) { this.points = points; }\n    public int getPoints() { return this.points; }\n}' },
        { t: 'list', items: [
          'Type sûr (*type safe*) : impossible de passer une valeur incohérente, le compilateur vérifie. À préférer aux constantes `public static final int`.',
          '`ordinal()` donne la position (0 pour la première constante) ; l\'ordre de déclaration compte.',
          '`values()` renvoie le tableau de toutes les constantes : `for (Couleur c : Couleur.values())`.',
          '`toString()` / `name()` donnent le nom de la constante.',
        ] },
        { t: 'p', s: 'En UML : une boîte avec le stéréotype «enumeration» et la liste des valeurs. Dans les sujets, on t\'autorise souvent à les omettre ou à les supposer existantes ; utilise-les alors comme types d\'attributs (`- etat : Etat`).' },
      ],
      quiz: [
        { q: 'Que renvoie `Valeur.SEPT.ordinal()` ?', c: ['7', '0', '1', '"SEPT"'], a: 1, why: 'ordinal() donne la position de déclaration, à partir de 0.' },
        { q: 'Le constructeur d\'une énumération est…', c: ['public', 'privé', 'protected', 'interdit'], a: 1, why: 'Il est privé : seules les constantes déclarées créent des instances.' },
        { q: 'Comment parcourir toutes les couleurs de l\'énumération Couleur (TD 4, jeu de cartes) ?', c: ['for (Couleur c : Couleur.values())', 'for (Couleur c : new Couleur())', 'for (int i = 0; i < Couleur.length; i++)', 'Couleur.forEach()'], a: 0, why: 'values() renvoie le tableau des constantes, dans l\'ordre de déclaration.' },
      ],
    },

    {
      id: 'heritage', num: '06', title: 'Héritage, redéfinition, surcharge', exam: 'Questions de cours (presque chaque année)',
      blocks: [
        { t: 'p', s: '`extends` indique qu\'une classe hérite d\'une autre. **Héritage simple** : une seule classe mère. Les membres `private` de la mère ne sont pas visibles dans la fille (on passe par des getters/setters) ; `protected` les rend visibles aux sous-classes.' },
        { t: 'code', s: 'public class Vehicule {\n    protected int nombreDePlaces;\n    public Vehicule(int nombreDePlaces) {\n        this.nombreDePlaces = nombreDePlaces;\n    }\n    public void rouler(int kilometres) { /* code générique */ }\n    public void rouler() { /* surcharge : autre signature */ }\n}\n\npublic class Voiture extends Vehicule {\n    public Voiture() {\n        super(4);                       // appel du super-constructeur, en 1re ligne\n    }\n    public void rouler(int kilometres) {   // redéfinition : même signature\n        super.rouler(kilometres);       // appel de la super-méthode\n        // code spécifique\n    }\n}' },
        { t: 'h', s: 'Redéfinition (overriding)' },
        { t: 'copy', s: 'Redéfinir une méthode, c\'est écrire dans une classe fille une méthode qui a **la même signature** (nom + paramètres) **et le même type de retour** (ou un sous-type) qu\'une méthode héritée de la classe mère, pour **spécialiser son comportement** au type de l\'objet. La visibilité peut être élargie, jamais restreinte. Exemple : `crier()` de Animal redéfinie dans Cheval et Albatros.' },
        { t: 'h', s: 'Surcharge (overloading)' },
        { t: 'copy', s: 'Surcharger une méthode, c\'est définir **dans la même classe** (ou dans une classe fille) plusieurs méthodes de **même nom** mais avec des **listes de paramètres différentes** (nombre ou types). Le compilateur choisit selon les arguments, **à la compilation**. Exemple : `rouler()` et `rouler(int kilometres)`.' },
        { t: 'table', head: ['', 'Surcharge', 'Redéfinition'], rows: [
          ['Nom', 'identique', 'identique'],
          ['Paramètres', 'différents', 'identiques'],
          ['Où', 'même classe (ou fille)', 'classe fille'],
          ['Choisie', 'à la compilation (types des arguments)', 'à l\'exécution (type de l\'objet)'],
        ] },
        { t: 'p', s: 'Le cours compte les deux comme des **formes de polymorphisme** en Java.' },
        { t: 'h', s: 'super et this (A24 I.4)' },
        { t: 'list', items: [
          '`this` : référence sur l\'objet courant. `this.attribut`, `this.methode()`, `this(...)` pour appeler un autre constructeur de la même classe.',
          '`super` : accès aux membres de la classe mère. `super(...)` appelle le constructeur de la mère (1re instruction du constructeur), `super.methode()` appelle la version de la mère d\'une méthode redéfinie.',
        ] },
        { t: 'trap', s: 'Si la classe mère n\'a pas de constructeur sans paramètre, le constructeur de la fille **doit** appeler `super(...)` explicitement, sinon erreur de compilation. Et une méthode `private` n\'est pas redéfinie : elle n\'est pas héritée visiblement.' },
      ],
      quiz: [
        { q: '`rouler()` et `rouler(int km)` dans la même classe, c\'est…', c: ['une redéfinition', 'une surcharge', 'une erreur de compilation', 'du polymorphisme d\'héritage'], a: 1, why: 'Même nom, paramètres différents.' },
        { q: 'Où doit se trouver `super(4)` dans le constructeur de Voiture ?', c: ['N\'importe où', 'En première instruction', 'En dernière instruction', 'Dans une méthode init()'], a: 1, why: 'L\'appel au super-constructeur est obligatoirement la première instruction.' },
        { q: 'Une redéfinition peut-elle passer une méthode de `public` à `private` ?', c: ['Oui', 'Non, la visibilité ne peut être que conservée ou élargie', 'Oui si la classe est final', 'Seulement pour les méthodes static'], a: 1, why: 'Règle du cours : le modificateur peut avoir un accès plus large, jamais plus restreint.' },
      ],
    },

    {
      id: 'polymorphisme', num: '07', title: 'Types, transtypage, liaison dynamique', exam: 'Les « cas » compile / exécute / affiche (≈ 4 à 6 points chaque année)',
      blocks: [
        { t: 'vega', s: 'Cadet, c\'est le chapitre qui rapporte le plus de points. Retiens une seule règle et applique-la ligne par ligne : **le compilateur ne voit que le type statique, la JVM n\'exécute que selon le type dynamique.** Le Réacteur te fait pratiquer ça à l\'infini.' },
        { t: 'p', s: '**Type statique** : le type déclaré de la référence (`Animal a`). **Type dynamique** (ou effectif) : la classe de l\'objet réellement créé (`new Cheval()`).' },
        { t: 'p', s: 'Un objet est **du type de sa classe, de toutes ses classes ancêtres, de toutes les interfaces qu\'elles implémentent, et de Object**. Le contraire n\'est pas vrai : un véhicule n\'est pas forcément une voiture.' },
        { t: 'copy', s: 'A25 I.7 : l\'objet liste[1] (un Cheval) est de type **Cheval**, **Animal**, **Restaurable** (Animal implémente Restaurable) et **Object**.' },
        { t: 'h', s: 'La méthode en 4 questions' },
        { t: 'list', items: [
          '1. **Affectation** `T x = expr;` — compile si le type statique de expr est T ou un sous-type de T (surclassement implicite). Sinon : erreur de compilation ; correction : transtypage `(T) expr`.',
          '2. **Transtypage** `(T) expr` — compile si les types sont liés (l\'un sous-type de l\'autre, ou une interface et une classe non finale). À l\'exécution : si l\'objet réel n\'est pas un T → **ClassCastException**.',
          '3. **Appel** `x.m()` — compile si m est déclarée dans le type statique de x (ou ses ancêtres). À l\'exécution : c\'est la version la plus proche du **type dynamique** qui s\'exécute (liaison dynamique).',
          '4. **new T()** — refusé si T est abstraite ou une interface.',
        ] },
        { t: 'code', s: 'Voiture voiture1 = new Voiture();      // OK\nVehicule vehicule1 = new Voiture();    // OK : une Voiture est un Vehicule\nVoiture voiture2 = vehicule1;          // NE COMPILE PAS : type statique Vehicule\nVoiture voiture3 = (Voiture) vehicule1;// OK, et OK à l\'exécution (c\'est bien une Voiture)\nVehicule vehicule3 = new Vehicule();\nvoiture3 = (Voiture) vehicule3;        // compile, mais ClassCastException à l\'exécution\nif (vehicule3 instanceof Voiture) {    // instanceof teste le type DYNAMIQUE\n    voiture3 = (Voiture) vehicule3;    // jamais exécuté ici : pas d\'exception\n}' },
        { t: 'h', s: 'Liaison dynamique : exemple d\'examen' },
        { t: 'code', s: 'Animal animal1 = new Cheval();\nanimal1.crier();\n// Compile : crier() existe dans Animal (type statique).\n// Exécute la version de Cheval (type dynamique), qui appelle super.crier() :\n//   Un animal émet un cri\n//   ... le cheval hennit.' },
        { t: 'copy', s: 'A25 I.4 : « Le cas 5 illustre le polymorphisme : la référence animal1 est de type statique Animal mais désigne un Cheval. L\'appel crier() compile car la méthode existe dans Animal, et grâce à la liaison dynamique c\'est la version redéfinie dans Cheval, type effectif de l\'objet, qui est exécutée. »' },
        { t: 'trap', s: 'Piège A23 cas 8 : `Volable v = albatros1;` alors que `albatros1` est déclaré `Animal`. Même si l\'objet est un Albatros, **Animal n\'implémente pas Volable** → erreur de compilation. Correction : `v = (Volable) albatros1;`.' },
        { t: 'trap', s: 'Piège A23 cas 9 : `r = v;` avec `Restaurable r` et `Volable v`. Deux interfaces non liées → erreur de compilation, correction `r = (Restaurable) v;`. À l\'exécution c\'est bon : l\'objet est un Albatros, donc un Animal, donc un Restaurable.' },
        { t: 'h', s: 'Rédiger la réponse à un « cas »' },
        { t: 'list', items: [
          'Compilation : oui / non (+ la raison en une phrase + la ligne corrigée).',
          'Exécution : oui / non (+ l\'exception : ClassCastException, NullPointerException).',
          'Affichage : recopie **exactement** les lignes, dans l\'ordre (attention aux appels super).',
        ] },
      ],
      quiz: [
        { q: '`Animal a = new Cheval(); a.crier();` — quelle version de crier() s\'exécute ?', c: ['Celle de Animal (type statique)', 'Celle de Cheval (type dynamique)', 'Les deux, Animal d\'abord, toujours', 'Erreur de compilation'], a: 1, why: 'Liaison dynamique. (Ici la version de Cheval appelle super.crier(), d\'où les deux lignes.)' },
        { q: '`Cheval c = (Cheval) new Animal();`', c: ['Erreur de compilation', 'Compile, ClassCastException à l\'exécution', 'Compile et s\'exécute', 'NullPointerException'], a: 1, why: 'Animal et Cheval sont liés : le transtypage compile. L\'objet réel n\'est pas un Cheval.' },
        { q: 'Un objet Albatros est de type…', c: ['Albatros seulement', 'Albatros et Animal', 'Albatros, Animal, Restaurable, Volable, Object', 'Albatros et Volable'], a: 2, why: 'Sa classe, ses ancêtres, toutes les interfaces implémentées (directement ou par héritage) et Object.' },
      ],
    },

    {
      id: 'abstrait', num: '08', title: 'Classes abstraites et interfaces', exam: 'Questions de cours (A23 I.2, A24 I.2, A25 I.1) + tous les patrons',
      blocks: [
        { t: 'h', s: 'Classe abstraite : implémentation partielle' },
        { t: 'p', s: 'Une classe `abstract` peut fournir certaines méthodes et laisser d\'autres **abstraites** (signature sans corps), à implémenter dans les classes filles. Toute classe qui possède au moins une méthode abstraite est abstraite. **On ne peut pas l\'instancier.** En UML : nom et méthodes abstraites en *italique*.' },
        { t: 'code', s: 'public abstract class Vehicule {\n    public void setKilometres(int kilometres) { /* implémentée */ }\n    public abstract void rouler();      // pas de corps, un point-virgule\n}' },
        { t: 'h', s: 'Interface : un contrat' },
        { t: 'p', s: 'Une interface déclare des méthodes **sans implémentation** (implicitement `public abstract`) et éventuellement des **constantes** (implicitement `public static final`). Une classe l\'**implémente** avec `implements` et s\'engage à fournir toutes ses méthodes. Une interface **est un type**. Nom souvent en *-able* (Pilotable, Orientable, Restaurable).' },
        { t: 'code', s: 'public interface Orientable {\n    public void tournerAGauche();\n    public void tournerADroite();\n}\n\npublic interface Volable extends Orientable {   // héritage entre interfaces\n    public final static int VITESSE_MAX = 240;\n    public void monter();\n    public void descendre();\n}\n\npublic class Voiture extends Vehicule implements Pilotable, Orientable {\n    public void tournerAGauche() { System.out.println("La voiture tourne à gauche"); }\n    public void tournerADroite() { System.out.println("La voiture tourne à droite"); }\n    // + les méthodes de Pilotable, + rouler()\n}' },
        { t: 'copy', s: 'A24 I.2 : « Une classe qui implémente une interface doit implémenter **toutes** les méthodes déclarées dans l\'interface. Si elle ne le fait pas, elle doit être déclarée **abstraite** (sinon le compilateur refuse) ; ce sont ses classes filles qui implémenteront les méthodes restantes. »' },
        { t: 'copy', s: 'A25 I.1 : « Animal **implémente** l\'interface Restaurable (relation de réalisation, flèche pointillée). Animal doit donc fournir le code de manger() ; tout objet Animal, et de ses sous-classes Cheval et Albatros, est aussi de type Restaurable et peut être manipulé par une référence Restaurable. »' },
        { t: 'h', s: 'Abstraite ou interface ?' },
        { t: 'table', head: ['Classe abstraite', 'Interface'], rows: [
          ['peut avoir des attributs, des constructeurs, des méthodes implémentées', 'que des signatures (+ constantes)'],
          ['implémentation partielle partagée', 'vue subjective, contrat transverse'],
          ['une seule (extends)', 'plusieurs (implements A, B)'],
          ['relation « est un » forte', 'capacité : « sait voler », « est pilotable »'],
        ] },
        { t: 'p', s: 'Dans un énoncé : « le calcul du prix dépend du type, laissé à la charge de chaque type » → méthode **abstraite** dans une classe mère abstraite. « D\'autres formes de paiement à venir sans remettre en cause la modélisation » → classe abstraite ou interface qu\'on pourra dériver.' },
      ],
      quiz: [
        { q: 'Une classe implémente Pilotable mais ne code pas `ralentir()`. Que se passe-t-il ?', c: ['Rien, la méthode est vide par défaut', 'Elle doit être déclarée abstract, sinon erreur de compilation', 'Erreur à l\'exécution', 'Elle hérite de ralentir() de Object'], a: 1, why: 'Règle du cours : une classe qui n\'implémente pas toutes les méthodes d\'une interface est abstraite.' },
        { q: 'Peut-on écrire `new Restaurable()` ?', c: ['Oui', 'Non, une interface ne s\'instancie pas', 'Oui si elle a des constantes', 'Seulement dans main'], a: 1, why: 'Ni les interfaces, ni les classes abstraites ne s\'instancient (sauf classe anonyme qui les implémente).' },
        { q: 'Les attributs déclarés dans une interface sont…', c: ['privés', 'des constantes public static final', 'protected', 'interdits'], a: 1, why: 'Une interface ne peut contenir que des constantes.' },
      ],
    },

    {
      id: 'imbriquees', num: '09', title: 'Classes internes et anonymes', exam: 'TD 2 et TD 3 (Rotation, voiture unique)',
      blocks: [
        { t: 'p', s: 'Une **classe imbriquée** est un membre d\'une autre classe : regroupement logique, meilleure encapsulation, code plus lisible. Quatre sortes : statique (rare), **interne** (fréquente), **anonyme**, locale.' },
        { t: 'h', s: 'Classe interne' },
        { t: 'p', s: 'Associée à une **instance** de la classe externe : elle accède à tous ses membres (même privés) et ne peut pas définir de membres statiques.' },
        { t: 'code', s: 'public class Cercle {\n    private Point centre;\n    private double rayon;\n\n    public class Rotation {               // classe interne\n        private Point cRot;\n        public Rotation(Point cRot) { this.cRot = cRot; }\n        public void rotation(double theta) {\n            // accès direct à centre, attribut de l\'objet Cercle englobant\n        }\n    }\n}\n// Création : il faut une instance de la classe externe\nCercle c = new Cercle(new PointCartesien(5, 5), 2);\nCercle.Rotation r = c.new Rotation(new PointCartesien(2, 2));' },
        { t: 'h', s: 'Classe anonyme' },
        { t: 'p', s: 'Besoin ponctuel d\'une classe particulière : on la définit et l\'instancie **en une seule expression**, sans lui donner de nom. Elle hérite d\'une classe ou implémente une interface.' },
        { t: 'code', s: 'Voiture unique = new Voiture() {        // sous-classe anonyme de Voiture\n    public void rouler() {\n        System.out.println("Je roule autrement");\n    }\n};\n\nPilotable p = new Pilotable() {          // implémentation anonyme d\'une interface\n    public void accelerer() { System.out.println("Vroum"); }\n    public void ralentir() { System.out.println("Frein"); }\n};' },
        { t: 'p', s: 'Le cours Collections utilise des classes anonymes comme « objets fonction » (des actions rangées dans une liste). Depuis Java 8, les lambdas font la même chose plus court.' },
      ],
      quiz: [
        { q: 'Comment instancier la classe interne Rotation de Cercle ?', c: ['new Rotation()', 'Cercle.new Rotation()', 'c.new Rotation(...) avec c un Cercle', 'new Cercle.Rotation() sans objet Cercle'], a: 2, why: 'Une classe interne (non statique) est liée à une instance de la classe externe.' },
        { q: '`new Pilotable() { ... }` est…', c: ['interdit : Pilotable est une interface', 'une classe anonyme qui implémente Pilotable', 'une classe interne statique', 'une énumération'], a: 1, why: 'On instancie une classe sans nom qui implémente l\'interface.' },
        { q: 'Dans la méthode rotation() de la classe interne Rotation, peut-on lire l\'attribut privé `centre` du Cercle ?', c: ['Non, il est privé', 'Oui : une classe interne accède à tous les membres de l\'objet englobant', 'Seulement avec un getter', 'Seulement s\'il est static'], a: 1, why: 'La classe interne est liée à une instance de Cercle et voit tous ses membres, même privés.' },
      ],
    },

    {
      id: 'collections', num: '10', title: 'Les collections', exam: 'Questions de cours (A14 I.4) + code (A17/A18) — TD 4',
      blocks: [
        { t: 'p', s: 'Une **collection** regroupe un ensemble d\'objets homogènes dans une structure qui facilite leur manipulation. Avantages sur le tableau : taille dynamique, méthodes toutes prêtes et optimisées. Le framework comprend des **interfaces**, des **implémentations** et des **algorithmes** (tri, recherche).' },
        { t: 'h', s: 'Les quatre interfaces (question tombée en A14)' },
        { t: 'table', head: ['Interface', 'Propriété fonctionnelle', 'Implémentations'], rows: [
          ['`Set`', 'ensemble au sens mathématique : **pas de doublon**', '`HashSet`, `TreeSet`, `LinkedHashSet`'],
          ['`List`', 'collection **ordonnée**, doublons permis, accès par **position**', '`ArrayList`, `LinkedList`'],
          ['`Queue`', 'file ordonnée, doublons permis, en général **FIFO**', '`LinkedList`, `PriorityQueue`'],
          ['`Map`', 'association **clé → valeur**, chaque clé est **unique**', '`HashMap`, `TreeMap`, `LinkedHashMap`'],
        ] },
        { t: 'p', s: '`Map` n\'hérite pas de `Collection` ; `Set`, `List`, `Queue` oui. Les objets d\'un `TreeSet` doivent être comparables (`implements Comparable`).' },
        { t: 'h', s: 'Généricité' },
        { t: 'p', s: 'Le type des éléments se donne entre chevrons : `List<Carte>`. La cohérence des types est **vérifiée à la compilation**, ce qui évite les transtypages et les ClassCastException. Les collections stockent des objets : pour des entiers, on utilise la classe enveloppe `Integer` (autoboxing automatique).' },
        { t: 'code', s: 'List<Carte> main = new ArrayList<Carte>();   // référence de type interface\nmain.add(new Carte(Valeur.AS, Couleur.PIQUE));\nCarte premiere = main.get(0);\n\nQueue<Carte> tas = new LinkedList<Carte>();\ntas.add(carte);                 // ajoute en fin de file\nCarte c = tas.poll();           // retire la tête (null si vide)\n\nMap<String, Joueur> parNom = new HashMap<String, Joueur>();\nparNom.put("Perceval", perceval);\nJoueur j = parNom.get("Perceval");\nfor (String nom : parNom.keySet()) { ... }' },
        { t: 'h', s: 'Parcourir une collection' },
        { t: 'code', s: '// 1. Itérateur : recommandé, permet de retirer pendant le parcours\nIterator<Carte> it = main.iterator();\nwhile (it.hasNext()) {\n    Carte c = it.next();\n    if (c.getValeur() == Valeur.SEPT) {\n        it.remove();\n    }\n}\n\n// 2. Boucle for étendue : simple parcours sans modification\nfor (Carte c : main) {\n    System.out.println(c);\n}' },
        { t: 'trap', s: 'Retirer un élément avec `main.remove(c)` **pendant** un for étendu provoque une `ConcurrentModificationException`. Utilise `it.remove()`.' },
        { t: 'p', s: 'Dans un énoncé qui dit « vous n\'utiliserez pas une Collection » (A21 Composite) ou « un tableau d\'objets Time » (A17/A18) : tableau + compteur, et on recopie dans un tableau plus grand quand il est plein (voir la Forge : tableau dynamique).' },
      ],
      quiz: [
        { q: 'Quelle interface garantit l\'absence de doublon ?', c: ['List', 'Set', 'Queue', 'Map'], a: 1, why: 'Set = ensemble mathématique.' },
        { q: 'Quelle méthode d\'Iterator permet de savoir s\'il reste un élément ?', c: ['next()', 'hasNext()', 'isEmpty()', 'size()'], a: 1, why: 'hasNext() ; next() renvoie l\'élément suivant et avance.' },
        { q: '`Map<String, Joueur>` : que se passe-t-il si on fait deux `put` avec la même clé ?', c: ['Deux entrées', 'La seconde valeur remplace la première', 'Exception', 'Erreur de compilation'], a: 1, why: 'Chaque clé est unique et n\'est associée qu\'à un objet.' },
      ],
    },

    {
      id: 'exceptions', num: '11', title: 'Les exceptions', exam: 'Cours 7 (à connaître si le chapitre est au programme du médian)',
      blocks: [
        { t: 'p', s: 'Une **exception** est un événement anormal qui survient pendant l\'exécution (division par zéro, référence nulle, fichier absent…). Quand elle est levée, l\'exécution en cours s\'interrompt et le programme **remonte la pile des appels** à la recherche d\'un gestionnaire. Si aucun n\'est trouvé, elle sort de `main` : la JVM affiche la pile et le programme s\'arrête.' },
        { t: 'h', s: 'Trois familles (sous Throwable)' },
        { t: 'table', head: ['Famille', 'Exemples', 'Catch or Specify ?'], rows: [
          ['**Exceptions gérées** (sous-classes de Exception, hors RuntimeException)', 'FileNotFoundException, vos propres exceptions', 'oui, obligatoire'],
          ['**Exceptions non gérées** (RuntimeException), liées à la JVM', 'NullPointerException, ClassCastException, ArithmeticException', 'non'],
          ['**Erreurs** (Error), liées au système', 'OutOfMemoryError', 'non'],
        ] },
        { t: 'h', s: 'Catch or Specify' },
        { t: 'p', s: 'Du code qui peut lever une exception gérée doit **soit l\'attraper** (`try/catch`), **soit spécifier** qu\'il la propage (`throws` dans la signature). Sinon : erreur de **compilation**.' },
        { t: 'code', s: 'public class InvalidGameException extends Exception {     // créer son exception\n    public InvalidGameException(String msg) {\n        super(msg);\n    }\n}\n\npublic void creationPartie() throws InvalidGameException {  // Specify : throws (avec un s)\n    if (nbJoueurs < 2) {\n        throw new InvalidGameException("contraintes non respectées"); // lever : throw\n    }\n}\n\npublic static void main(String[] args) {\n    try {\n        partie.creationPartie();\n        System.out.println("Partie créée");      // sauté si exception\n    } catch (InvalidGameException e) {           // Catch\n        System.out.println("Erreur : " + e.getMessage());\n    } finally {\n        System.out.println("Toujours exécuté");  // exception ou non\n    }\n}' },
        { t: 'list', items: [
          '`throw` (sans s) : lève une instance d\'exception, dans le corps d\'une méthode.',
          '`throws` (avec s) : dans la **déclaration** de la méthode, annonce qu\'elle propage.',
          '`try` : instructions susceptibles de lever ; la levée interrompt le bloc.',
          '`catch` : exécuté si l\'exception est du type du paramètre (ou d\'un sous-type). Plusieurs catch possibles, **du plus spécifique au plus général**.',
          '`finally` : facultatif, exécuté dans tous les cas (fermeture d\'un fichier).',
        ] },
        { t: 'trap', s: 'Mettre `catch (Exception e)` **avant** `catch (MonException e)` est une erreur de compilation : le second catch est inatteignable. Toujours du spécifique au général.' },
        { t: 'p', s: 'Compléments du cours : `catch (ExA | ExB e)` (catch pipe), `throws ExA, ExB`, chaînage (`new MathException("...", cause)` ou `e1.initCause(e)`), try-with-resources pour les objets `AutoCloseable`. `e.printStackTrace()` affiche la pile des appels.' },
        { t: 'copy', s: 'Apport des exceptions : on sépare le code normal du traitement des erreurs, l\'exception remonte la pile jusqu\'au bloc choisi pour la traiter, et on peut chaîner les exceptions par causalité. Limite : surcharge de travail pour la JVM.' },
      ],
      quiz: [
        { q: 'Différence entre throw et throws ?', c: ['Aucune', 'throw lève une exception ; throws déclare qu\'une méthode la propage', 'throws lève plusieurs exceptions', 'throw est réservé aux RuntimeException'], a: 1, why: 'throw dans le corps, throws dans la signature.' },
        { q: 'Une méthode appelle du code qui lève une exception gérée, sans try ni throws :', c: ['Erreur de compilation', 'Erreur à l\'exécution seulement', 'L\'exception est ignorée', 'Ça marche'], a: 0, why: 'Règle Catch or Specify vérifiée par le compilateur.' },
        { q: 'NullPointerException est…', c: ['une exception gérée (obligation de catch)', 'une exception non gérée (RuntimeException)', 'une Error', 'une erreur de compilation'], a: 1, why: 'Liée à la JVM, sous-classe de RuntimeException.' },
      ],
    },

    {
      id: 'uml-classes', num: '12', title: 'UML : le diagramme de classes', exam: 'Partie II de chaque médian (3 à 8 points)',
      blocks: [
        { t: 'p', s: 'Le diagramme de classes donne une **vue logique et statique** du système : les classes et les liens entre elles, **sans notion de temps**. Une classe = un rectangle en trois parties : nom, attributs, opérations. On omet souvent getters/setters et constructeurs (les sujets le précisent).' },
        { t: 'vega', s: 'Chaque flèche, losange et multiplicité est **dessiné et expliqué un par un** dans le Bureau des plans, avec un entraînement « Reconnais la flèche ». Commence par là si la notation te pose problème.' },
        { t: 'link', href: '#plans--apprendre', s: 'Ouvrir le dictionnaire visuel UML' },
        { t: 'table', head: ['Symbole', 'Visibilité'], rows: [['`+`', 'publique'], ['`-`', 'privée'], ['`#`', 'protégée (visible des sous-classes)'], ['`~`', 'paquetage']] },
        { t: 'list', items: [
          'Attribut : `- prix : double` ; opération : `+ calculerPrix(remise : int) : double`.',
          'Membre statique : **souligné**. Classe ou méthode abstraite : *en italique* (ou stéréotype «abstract» sur une copie).',
          'Interface : stéréotype «interface». Énumération : «enumeration».',
        ] },
        { t: 'h', s: 'Les relations, de la plus faible à la plus forte' },
        { t: 'table', head: ['Relation', 'Notation', 'Sens', 'En Java'], rows: [
          ['Dépendance', 'flèche pointillée', 'utilise ponctuellement (paramètre d\'une méthode), pas de persistance', 'paramètre ou variable locale'],
          ['Association', 'trait plein (+ flèche de navigabilité)', '« a un » durable : un attribut référence l\'autre classe', '`private Voiture voiture;`'],
          ['Agrégation', 'losange **vide** côté tout', 'détient mais **peut partager** ; cycles de vie **indépendants**', 'objets passés de l\'extérieur'],
          ['Composition', 'losange **plein** côté tout', 'composé **sans partage** ; cycles de vie **dépendants**', 'objets créés et détruits avec le tout'],
          ['Héritage', 'trait plein + triangle vide vers la mère', '« est un »', '`extends`'],
          ['Réalisation', 'pointillé + triangle vide vers l\'interface', 'implémente un contrat', '`implements`'],
        ] },
        { t: 'uml', d: {
          title: 'Relations', classes: [
            { id: 'C', name: 'Compagnie', x: 10, y: 10, attrs: [], methods: [] },
            { id: 'E', name: 'Employe', x: 230, y: 10, attrs: ['- nom : String'], methods: [] },
            { id: 'P', name: 'EquipeProjet', x: 450, y: 10, attrs: [], methods: [] },
          ], edges: [
            { from: 'C', to: 'E', kind: 'comp', m1: '1', m2: '*' },
            { from: 'P', to: 'E', kind: 'aggr', m1: '*', m2: '*' },
          ] } },
        { t: 'copy', s: 'Exemple du cours : un Employé ne travaille que dans une seule Compagnie (**composition** : si la compagnie disparaît, ses employés en tant que tels aussi) et participe à plusieurs EquipeProjet (**agrégation** : si l\'équipe disparaît, les employés existent toujours et peuvent appartenir à d\'autres équipes).' },
        { t: 'h', s: 'Multiplicités' },
        { t: 'p', s: '`1` exactement un ; `0..1` zéro ou un ; `*` plusieurs (0 ou plus) ; `1..*` au moins un ; `1..5` entre 1 et 5 ; `1,5` un ou cinq. On lit : « une Personne conduit 0..1 Voiture ». Une **classe d\'association** porte les informations propres au lien (ex. Prêt entre Livre et Adhérent).' },
        { t: 'h', s: 'Méthode pour la partie UML du médian' },
        { t: 'list', items: [
          '1. Souligne les **noms** de l\'énoncé → candidats classes ; les « caractérisé par » → attributs (avec leur type donné).',
          '2. « Nous distinguons trois types de… », « peut être une personne physique ou morale » → **héritage** ; mère **abstraite** si on ne l\'instancie jamais directement, surtout si « d\'autres types à venir ».',
          '3. « dépend du type, laissé à la charge de chaque type » → méthode **abstraite** dans la mère.',
          '4. « supprime le panier, les articles sont également supprimés » → **composition**. « géré par plusieurs services » → **agrégation**.',
          '5. Les verbes (ajouter, enlever, valider, notifier) → **méthodes** de la classe concernée.',
          '6. « unique », « une seule instance » → pense **Singleton** (attribut statique souligné + méthode statique).',
          '7. Mets **toutes les multiplicités** : elles sont notées.',
        ] },
        { t: 'trap', s: 'Ne pas dupliquer en attribut ce qui est déjà une association (pas de `- articles : Article[]` en plus du lien Panier ◆— Article). Et ne pas oublier les enums comme types d\'attributs (`- etat : Etat`).' },
      ],
      quiz: [
        { q: 'Losange plein côté Panier vers Article signifie…', c: ['Panier hérite de Article', 'Composition : les articles disparaissent avec le panier', 'Agrégation : les articles sont partagés', 'Dépendance ponctuelle'], a: 1, why: 'Losange plein = composition, cycles de vie dépendants.' },
        { q: 'Comment noter un attribut statique en UML ?', c: ['En italique', 'Souligné', 'Avec #', 'En gras'], a: 1, why: 'Italique = abstrait ; souligné = statique.' },
        { q: '« Chaque Personne conduit au plus une Voiture » : multiplicité côté Voiture ?', c: ['1', '0..1', '*', '1..*'], a: 1, why: 'Au plus une, éventuellement aucune.' },
      ],
    },

    {
      id: 'uml-sequence', num: '13', title: 'UML : diagramme de séquence', exam: 'A11 II.2 et cours 3 (vue dynamique)',
      blocks: [
        { t: 'p', s: 'Le diagramme de séquence montre **comment** un cas d\'utilisation est réalisé par les objets du système : c\'est la partie algorithmique, avec la **notion d\'ordre et de temps**. Le diagramme de classes donne la structure ; le diagramme de séquence donne les échanges.' },
        { t: 'vega', s: 'Chaque élément (messages, retours, création, fragments loop/alt/opt/par/ref) est **dessiné et traduit en Java** dans le Bureau des plans, avec un entraînement.' },
        { t: 'link', href: '#plans--sequence', s: 'Ouvrir la leçon dessinée sur le diagramme de séquence' },
        { t: 'list', items: [
          '**Acteurs / objets** en haut : `james:Pilote` (nom d\'instance : classe) ou `:Poker` (instance anonyme). Chacun a une **ligne de vie** verticale (le temps descend).',
          '**Messages** : flèches entre lignes de vie, qui correspondent aux **méthodes** appelées : `retour := operation(arguments)`. Un message peut en déclencher d\'autres (messages imbriqués).',
          '**Synchrone** (flèche pleine) : l\'émetteur attend la fin du traitement. **Asynchrone** (flèche ouverte) : l\'émetteur continue (threads).',
          '**Création** : message `créer()` vers l\'objet, qui apparaît à cette hauteur (c\'est le constructeur). **Destruction** : croix (pas implémentée en Java).',
        ] },
        { t: 'h', s: 'Les fragments' },
        { t: 'table', head: ['Opérateur', 'Rôle', 'Équivalent'], rows: [
          ['`loop [garde]`', 'répète tant que la garde est vraie', 'while / for'],
          ['`alt [g1] [g2] [sinon]`', 'une seule branche exécutée selon la garde', 'if / else if / else'],
          ['`opt [garde]`', 'exécuté seulement si la garde est vraie', 'if ; relation « extend » des cas d\'utilisation'],
          ['`par`', 'interactions en parallèle', 'threads'],
          ['`ref`', 'renvoie à une interaction définie ailleurs', 'relation « include » des cas d\'utilisation'],
        ] },
        { t: 'p', s: 'Exemple du cours : `loop [distanceParcourue ≤ 1000]` contenant un `alt` : si `[quantiteCarburant ≥ 40]` → `rouler(110)`, sinon si `[20 ≤ quantiteCarburant < 40]` → `rouler(90)`, sinon → `faireLePlein()`.' },
        { t: 'h', s: 'Rôle des diagrammes (A11 I.1)' },
        { t: 'copy', s: 'Cas d\'utilisation : **le quoi**, les fonctionnalités attendues et les acteurs. Classes : **la structure** statique (classes, attributs, méthodes, relations). Séquence : **le comment** dans le temps, l\'enchaînement des messages entre objets pour réaliser un cas d\'utilisation.' },
      ],
      quiz: [
        { q: 'Quel fragment correspond à un if / else ?', c: ['loop', 'alt', 'opt', 'par'], a: 1, why: 'alt = alternatives avec gardes ; opt = un seul if sans else.' },
        { q: 'Dans `james:Pilote`, que désigne Pilote ?', c: ['L\'instance', 'La classe', 'Le message', 'La ligne de vie'], a: 1, why: 'nomInstance : NomClasse.' },
      ],
    },

    {
      id: 'uml-cas', num: '14', title: 'UML : cas d\'utilisation', exam: 'A15, A17, A18, A21, A22 (diagramme à proposer)',
      blocks: [
        { t: 'p', s: 'Le diagramme de cas d\'utilisation décrit **ce que** le système doit faire du point de vue de ses utilisateurs (exigences fonctionnelles), sans dire comment.' },
        { t: 'list', items: [
          '**Acteur** (bonhomme) : rôle joué par un utilisateur ou un système externe (Client, Bibliothécaire, Service bancaire). Hors du système.',
          '**Cas d\'utilisation** (ellipse) : une fonctionnalité nommée par un verbe à l\'infinitif (Emprunter un livre, Payer).',
          '**Système** : rectangle contenant les cas, avec le nom de l\'application.',
          '**Association** acteur — cas : trait plein.',
          '**«include»** : le cas de base inclut **toujours** l\'autre (flèche du cas de base vers le cas inclus). Ex. « Gérer les prêts » «include» « S\'identifier ».',
          '**«extend»** : comportement **optionnel** qui étend un cas sous condition (flèche du cas d\'extension vers le cas de base). Ex. « Envoyer un courriel » «extend» « Gérer un retard ».',
          '**Généralisation** : entre acteurs (un Administrateur est un Utilisateur) ou entre cas (Payer par chèque / Payer par virement spécialisent Payer).',
        ] },
        { t: 'copy', s: 'Indices d\'énoncé : « doit systématiquement s\'identifier » → **include** S\'identifier. « peut éventuellement faire l\'objet de l\'envoi d\'un courriel » → **extend**. « par chèque ou par virement » → **généralisation** du cas Payer.' },
        { t: 'trap', s: 'Le sens des flèches : include part du cas de base vers le cas inclus ; extend part de l\'extension vers le cas de base. C\'est l\'erreur la plus fréquente.' },
      ],
      quiz: [
        { q: '« L\'utilisateur doit systématiquement s\'identifier pour gérer les prêts » :', c: ['Gérer les prêts «extend» S\'identifier', 'Gérer les prêts «include» S\'identifier', 'Généralisation', 'Association simple'], a: 1, why: 'Systématique → include, du cas de base vers le cas inclus.' },
        { q: 'Un acteur est…', c: ['une classe du système', 'un rôle extérieur au système qui interagit avec lui', 'une méthode', 'un cas particulier'], a: 1, why: 'Il est hors du rectangle système.' },
      ],
    },

    {
      id: 'patrons', num: '15', title: 'Patrons de conception : vue d\'ensemble', exam: 'Partie III (7 à 9 points) — détails et entraînement à la Forge',
      blocks: [
        { t: 'vega', s: 'Bonne nouvelle, Cadet : dans tous les sujets, le patron est **expliqué dans l\'énoncé**. Personne ne te demande de le réciter. On te demande de **traduire l\'explication en code propre**. Il faut donc reconnaître la structure en dix secondes et connaître le squelette par cœur.' },
        { t: 'link', href: '#forge--apprendre', s: 'Ouvrir les leçons détaillées des 8 patrons' },
        { t: 'table', head: ['Patron', 'Intention en une ligne', 'Signature à reconnaître', 'Sujets'], rows: [
          ['Singleton', 'garantir une **instance unique**', 'constructeur privé, `private static` instance, `public static getInstance()`', 'A15, A24, A25'],
          ['Template Method', 'squelette d\'algorithme fixé dans la mère, étapes dans les filles', 'classe abstraite, méthode `final` qui appelle des méthodes `abstract`', 'A23, A25'],
          ['Fabrique (Factory)', 'créer des objets dont le type exact n\'est pas connu à l\'avance', 'méthode `createX(param)` qui renvoie le type mère', 'A15, A24'],
          ['Adaptateur', 'faire utiliser une classe existante via l\'interface attendue', 'classe qui `implements` l\'interface cible et **compose** la classe adaptée', 'A19, A24'],
          ['Décorateur', 'ajouter des fonctionnalités dynamiquement, sans 2ⁿ sous-classes', 'hérite de la classe ET contient une référence vers elle', 'A22'],
          ['Composite', 'traiter pareil un objet simple et un groupe d\'objets', 'le composite implémente l\'interface ET contient des objets de cette interface', 'A11, A19, A21'],
          ['Visiteur', 'séparer les traitements des structures de données', '`accept(Visitor v) { v.visit(this); }`', 'A10, A12-A14, A17'],
          ['Observateur', 'prévenir automatiquement les objets abonnés d\'un changement', 'liste d\'observateurs, `notifyObservers()` appelle `update()`', 'P09'],
        ] },
        { t: 'h', s: 'Le principe d\'Hollywood (A23 III.3, A25 III.3)' },
        { t: 'copy', s: '« Ne nous appelez pas, on vous rappellera » : ce ne sont pas les classes filles qui appellent la classe mère pour dérouler l\'algorithme, c\'est la méthode commander() de la classe mère qui **rappelle** les méthodes payer() et livrer() implémentées dans les filles (inversion de contrôle). Le Template Method respecte donc ce principe : la mère garde le contrôle de l\'enchaînement, les filles ne fournissent que les étapes, et la liaison dynamique choisit la bonne implémentation.' },
        { t: 'p', s: 'Le principe **Ouvert / Fermé** (cité dans le cours UML) : une conception doit être ouverte à l\'extension (ajouter un type de commande, de paiement, de client) et fermée à la modification (sans toucher au code existant). C\'est ce que les sujets appellent « sans remettre en cause la modélisation initiale ».' },
      ],
      quiz: [
        { q: 'Quel patron utilise une méthode `final` qui appelle des méthodes abstraites ?', c: ['Singleton', 'Template Method', 'Composite', 'Adaptateur'], a: 1, why: 'La méthode squelette est final pour ne pas être redéfinie.' },
        { q: 'Quel patron contient `v.visit(this);` ?', c: ['Observateur', 'Visiteur', 'Décorateur', 'Fabrique'], a: 1, why: 'accept(Visitor v) délègue au visiteur en lui passant l\'objet courant.' },
        { q: 'Une classe hérite de Voiture ET a un attribut de type Voiture : c\'est…', c: ['un Composite', 'un Décorateur', 'un Singleton', 'une erreur de conception'], a: 1, why: 'Le décorateur est une Voiture qui enveloppe une Voiture.' },
      ],
    },
  ];
})(window);
