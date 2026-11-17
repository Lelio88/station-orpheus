/**
 * uml.js — Contenu du Bureau des plans (partie II du médian).
 *
 *  decoder   : une phrase d'énoncé d'annale → quelle modélisation ? (QCM)
 *  translate : diagramme ⇄ code Java (style A21 III.1)
 *  plans     : énoncés complets d'annales, corrigé guidé par étapes et
 *              diagramme modèle dessiné par uml-render.js.
 *
 * Les corrigés des plans sont des PROPOSITIONS (aucun corrigé officiel
 * n'était fourni) ; plusieurs modélisations peuvent être acceptées, le
 * barème d'auto-évaluation liste ce que le correcteur regarde à coup sûr.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const REL = ['Héritage (classe mère + classes filles)', 'Composition (losange plein)', 'Agrégation (losange vide)', 'Association simple', 'Interface / réalisation', 'Méthode abstraite dans une classe mère abstraite'];

  const decoder = [
    { id: 'd1', src: 'A25 Fnac', text: 'Il peut aussi supprimer le panier. Dans ce cas les articles sont également supprimés.', q: 'Quel lien entre Panier et Article ?', c: REL, a: 1, why: 'Les articles disparaissent avec le panier : cycles de vie dépendants → composition, losange plein côté Panier.' },
    { id: 'd2', src: 'A25 Fnac', text: 'Nous distinguons trois types d\'article avec les livres, les jeux pour console et les smartphones.', q: 'Comment modéliser Livre, JeuConsole, Smartphone ?', c: REL, a: 0, why: '« Trois types d\'article » : Livre, JeuConsole et Smartphone héritent de Article (relation « est un »).' },
    { id: 'd3', src: 'A25 Fnac', text: 'Le calcul du prix d\'un article dépend étroitement du type de l\'article. L\'implémentation de cette fonctionnalité commune est laissée à la charge de chaque type.', q: 'Que fais-tu de calculerPrix() ?', c: REL, a: 5, why: 'Fonctionnalité commune, implémentation propre à chaque type : méthode abstraite (italique) dans Article, donc Article est abstraite, redéfinie dans chaque fille.' },
    { id: 'd4', src: 'A23 Ykea / A25', text: 'Un client peut être une personne physique ou morale impliquant des modalités différentes pour la création du compte. A des fins d\'extension, il faut s\'attendre à d\'autres types de clients non encore connus.', q: 'Comment modéliser les clients ?', c: ['Un attribut boolean estPhysique dans Client', 'Client abstraite + PersonnePhysique et PersonneMorale qui redéfinissent creerCompte()', 'Une énumération TypeClient', 'Deux classes sans lien'], a: 1, why: 'Plusieurs types, comportement différent (création du compte), extension future : classe mère abstraite et sous-classes (principe ouvert/fermé).' },
    { id: 'd5', src: 'A24 HelloMoving', text: 'HelloMoving est l\'unique service qui gère l\'ensemble des clients.', q: 'Quel lien entre HelloMoving et Client ?', c: REL, a: 1, why: 'Un seul gestionnaire, pas de partage : composition HelloMoving ◆— Client (1 — *).' },
    { id: 'd6', src: 'A24 HelloMoving', text: 'L\'ensemble des véhicules est quant à lui géré par plusieurs services dont le service marketing.', q: 'Quel lien entre ServiceMarketing et Vehicule ?', c: REL, a: 2, why: 'Les véhicules sont partagés entre plusieurs services : agrégation (losange vide), cycles de vie indépendants. Le contraste avec la phrase sur les clients est voulu par le sujet.' },
    { id: 'd7', src: 'A24 HelloMoving', text: 'Pour le moment, deux manières de payer sont identifiées […]. Il faudra aussi tenir compte d\'autres formes de paiement à venir sans remettre en cause la modélisation initiale.', q: 'Comment modéliser le paiement ?', c: ['Une méthode payer() avec un if sur le mode', 'Paiement abstraite (ou interface) + une sous-classe par mode de paiement', 'Deux attributs dans Client', 'Une composition Client ◆— Banque'], a: 1, why: 'Ouvert à l\'extension, fermé à la modification : on ajoutera une sous-classe pour un nouveau mode sans toucher au reste.' },
    { id: 'd8', src: 'A24 HelloMoving', text: 'Un client peut louer un seul véhicule à la fois.', q: 'Multiplicité côté Vehicule de l\'association « loue » ?', c: ['1', '0..1', '*', '1..*'], a: 1, why: 'Au plus un à la fois, et éventuellement aucun : 0..1.' },
    { id: 'd9', src: 'A24 HelloMoving', text: 'Un client est caractérisé par […] une liste des paiements effectués (Paiement).', q: 'Comment représenter « une liste des paiements » ?', c: ['Un attribut - paiements : String', 'Une association Client — Paiement de multiplicité * côté Paiement', 'Un héritage Paiement → Client', 'Rien, c\'est un détail'], a: 1, why: 'Un attribut dont le type est une classe du diagramme devient une association, avec la multiplicité * pour une liste.' },
    { id: 'd10', src: 'A24 HelloMoving', text: 'Le service marketing peut notifier les clients afin de leur demander de lire du contenu publicitaire.', q: 'Que retenir de cette phrase ?', c: ['Une méthode notifier(c : Client) dans ServiceMarketing (et accepter/refuser côté Client)', 'Un héritage ServiceMarketing → Client', 'Une énumération Notification', 'Une composition Client ◆— ServiceMarketing'], a: 0, why: 'Les verbes deviennent des méthodes ; la relation est une association (ou dépendance) de ServiceMarketing vers Client.' },
    { id: 'd11', src: 'A23 Ykea', text: 'Un luminaire est caractérisé par le type d\'éclairage (led, ampoule), sa puissance (réel).', q: 'Le type d\'éclairage devient…', c: ['une classe Eclairage associée', 'un attribut - eclairage : Eclairage, Eclairage étant une énumération', 'deux sous-classes LuminaireLed et LuminaireAmpoule', 'un attribut String'], a: 1, why: 'Liste fixe de valeurs : énumération (le sujet la donne), utilisée comme type d\'attribut.' },
    { id: 'd12', src: 'A19 Air Grand Est', text: 'Une réservation est caractérisée par le numéro de place associé et un niveau de confort. Elle associe un passager à un vol.', q: 'Comment placer Reservation ?', c: ['Reservation hérite de Vol', 'Reservation est associée à 1 Passager et 1 Vol (ou classe d\'association entre Passager et Vol)', 'Reservation est un attribut String de Passager', 'Passager ◆— Vol'], a: 1, why: 'Elle porte ses propres attributs (place, confort) et relie un passager à un vol : classe associée aux deux, ou classe d\'association.' },
    { id: 'd13', src: 'A19 Air Grand Est', text: 'Un aéroport est caractérisé par son nom ainsi que par tous les vols qu\'il propose au départ et à l\'arrivée.', q: 'Combien d\'associations entre Aeroport et Vol ?', c: ['Une seule', 'Deux : départ (1 — *) et arrivée (1 — *)', 'Aucune, un héritage', 'Une composition'], a: 1, why: 'Deux rôles différents : un vol a un aéroport de départ ET un aéroport d\'arrivée.' },
    { id: 'd14', src: 'A14/A17 Vente', text: 'Un pack est un produit qui regroupe un ensemble de produits. Il est caractérisé par la remise, donnée en pourcentage.', q: 'Comment modéliser Pack ?', c: ['Pack hérite de Produit ET agrège des Produit (structure Composite)', 'Pack est un attribut de Produit', 'Pack hérite de Produit seulement', 'Une énumération'], a: 0, why: '« est un produit » → héritage ; « regroupe un ensemble de produits » → agrégation de Produit. C\'est le patron Composite caché dans un énoncé UML.' },
    { id: 'd15', src: 'A15/A18 Trafic', text: 'On relie chaque morceau de route à son/ses morceau(x) précédent(s) et suivant(s).', q: 'Comment représenter ce lien ?', c: ['Une association réflexive de Route vers Route (précédent * / suivant *)', 'Un héritage Route → Route', 'Un attribut int numero', 'Une composition Route ◆— Route'], a: 0, why: 'Une classe peut être associée à elle-même : association réflexive avec deux rôles.' },
    { id: 'd16', src: 'A17 Vente', text: 'Le client doit pouvoir accéder à l\'ensemble des commandes qu\'il a effectuées sur le site.', q: 'Navigabilité de l\'association Client — Commande ?', c: ['De Commande vers Client seulement', 'De Client vers Commande (Client a un attribut liste de commandes)', 'Aucune', 'Héritage'], a: 1, why: 'Le client doit retrouver ses commandes : la flèche part de Client, multiplicité * côté Commande.' },
    { id: 'd17', src: 'Cours UML', text: 'Lors du changement de conducteur, la Voiture a besoin d\'une Personne et d\'une Date, passées en paramètres de changerConducteur.', q: 'Quel lien entre Voiture et Date ?', c: REL.concat(['Dépendance (pointillé, ponctuelle)']), a: 6, why: 'Utilisation ponctuelle via un paramètre, pas d\'attribut : dépendance.' },
    { id: 'd18', src: 'Cours UML', text: 'Un Employé ne peut travailler qu\'au sein d\'une seule Compagnie et peut participer à plusieurs EquipeProjet.', q: 'Lien EquipeProjet — Employe ?', c: REL, a: 2, why: 'Une équipe dissoute ne fait pas disparaître ses employés, qui peuvent être dans plusieurs équipes : agrégation.' },
    { id: 'd19', src: 'A25 Panier', text: 'On doit pouvoir garantir à chaque instant l\'unicité d\'une instance de la classe Panier.', q: 'Que montre le diagramme ?', c: ['Un attribut souligné - instance : Panier et une méthode soulignée + getInstance() : Panier', 'Une multiplicité 1 sur une association', 'Panier est abstraite', 'Rien de particulier'], a: 0, why: 'Singleton : attribut et méthode statiques (soulignés), constructeur privé (- Panier()).' },
    { id: 'd20', src: 'Cours UML', text: 'Un adhérent est lié à un livre par le biais d\'un prêt. La durée du prêt et sa date de retour dépendent du statut de l\'adhérent et du type de livre.', q: 'Comment modéliser Prêt ?', c: ['Classe d\'association entre Livre et Adhérent', 'Attribut de Livre', 'Sous-classe de Livre', 'Énumération'], a: 0, why: 'Les informations appartiennent au lien lui-même : classe d\'association (reliée en pointillé à l\'association).' },
    { id: 'd21', src: 'A24', text: 'Pour un véhicule, il est possible de le déverrouiller deverouillerQRcode(), de signaler les défauts signalerDefauts() […]. Deux types de véhicules sont identifiés : le vélo et la voiture.', q: 'Où placer deverouillerQRcode() ?', c: ['Dans Velo et dans Voiture seulement', 'Dans Vehicule (classe mère), héritée par Velo et Voiture', 'Dans Client', 'Dans une interface Velo'], a: 1, why: 'Factorisation : ce qui est commun va dans la classe mère.' },
    { id: 'd22', src: 'A22', text: 'Le paiement se fait par chèque ou par virement bancaire. L\'achat par virement nécessite la saisie des données d\'une carte bancaire.', q: '(Cas d\'utilisation) Comment relier Payer, Payer par chèque, Payer par virement ?', c: ['include', 'extend', 'Généralisation : les deux spécialisent Payer', 'Association'], a: 2, why: 'Deux façons de réaliser le même cas : généralisation. « Saisir les données de carte » serait inclus (include) dans Payer par virement.' },
  ];

  const translate = [
    {
      id: 't1', src: 'A21 III.1 diagramme 1', q: 'Quel code correspond à cette classe ?',
      uml: { classes: [{ id: 'P', name: 'Personne', x: 10, y: 10, attrs: ['+ surnom : String', '- nom : String', '- prenom : String', '# dateNaissance : Date'], methods: ['+ calculerAge() : int'] }] },
      c: [
        'public class Personne {\n    public String surnom;\n    private String nom;\n    private String prenom;\n    protected Date dateNaissance;\n    public int calculerAge() { ... }\n}',
        'public class Personne {\n    public String surnom;\n    private String nom;\n    private String prenom;\n    private Date dateNaissance;\n    public int calculerAge() { ... }\n}',
        'public class Personne {\n    public static String surnom;\n    private String nom, prenom;\n    protected Date dateNaissance;\n    public void calculerAge(int age) { ... }\n}',
      ], a: 0, why: '# = protected. Rien n\'est souligné, donc rien de static. calculerAge() ne prend pas de paramètre et renvoie un int.',
    },
    {
      id: 't2', src: 'A21 III.1 diagramme 2', q: 'Quel code correspond à cette interface ?',
      uml: { classes: [{ id: 'E', name: 'Empruntable', kind: 'interface', x: 10, y: 10, attrs: [], methods: ['+ calculerMensualitePret() : double'] }] },
      c: [
        'public abstract class Empruntable {\n    public abstract double calculerMensualitePret();\n}',
        'public interface Empruntable {\n    public double calculerMensualitePret();\n}',
        'public interface Empruntable {\n    public double calculerMensualitePret() {\n        return 0;\n    }\n}',
      ], a: 1, why: 'Une interface déclare des méthodes sans corps, terminées par un point-virgule.',
    },
    {
      id: 't3', src: 'A21 III.1 diagramme 3', q: 'Quel code pour Adherent ?',
      uml: { classes: [{ id: 'P', name: 'Personne', x: 10, y: 10, attrs: ['- nom : String'], methods: [] }, { id: 'A', name: 'Adherent', x: 10, y: 130, attrs: ['- numAdh : int'], methods: [] }], edges: [{ from: 'A', to: 'P', kind: 'inherit' }] },
      c: [
        'public class Adherent implements Personne {\n    private int numAdh;\n}',
        'public class Adherent extends Personne {\n    private int numAdh;\n    private String nom;\n}',
        'public class Adherent extends Personne {\n    private int numAdh;\n}',
      ], a: 2, why: 'Trait plein + triangle vide = héritage (extends). On ne redéclare pas nom : il est hérité (privé, accessible via getter).',
    },
    {
      id: 't4', src: 'A21 III.1 diagramme 4', q: 'Quel code pour Fichier ?',
      uml: { classes: [
        { id: 'A', name: 'Affichable', kind: 'interface', x: 10, y: 10, attrs: [], methods: ['+ afficher()'] },
        { id: 'I', name: 'Imprimable', kind: 'interface', x: 200, y: 10, attrs: [], methods: ['+ imprimer()'] },
        { id: 'F', name: 'Fichier', x: 110, y: 150, attrs: [], methods: [] }],
      edges: [{ from: 'F', to: 'A', kind: 'realize' }, { from: 'F', to: 'I', kind: 'realize' }] },
      c: [
        'public class Fichier extends Affichable, Imprimable {\n}',
        'public class Fichier implements Affichable, Imprimable {\n    public void afficher() { ... }\n    public void imprimer() { ... }\n}',
        'public interface Fichier implements Affichable, Imprimable {\n}',
      ], a: 1, why: 'Pointillé + triangle = réalisation (implements), plusieurs interfaces possibles. Fichier n\'est pas abstraite : elle doit implémenter les deux méthodes.',
    },
    {
      id: 't5', src: 'A21 III.1 diagramme 5', q: 'Association navigable de A vers B, multiplicité 1 côté B :',
      uml: { classes: [{ id: 'A', name: 'A', x: 10, y: 10, attrs: [], methods: [] }, { id: 'B', name: 'B', x: 260, y: 10, attrs: [], methods: [] }], edges: [{ from: 'A', to: 'B', kind: 'navig', m2: '1' }] },
      c: ['public class A {\n    private B b;\n}', 'public class B {\n    private A a;\n}', 'public class A extends B {\n}'], a: 0,
      why: 'La flèche indique quelle classe contient l\'attribut : A a un attribut de type B.',
    },
    {
      id: 't6', src: 'A21 III.1 diagramme 6', q: 'Association navigable de A vers B, multiplicité * côté B :',
      uml: { classes: [{ id: 'A', name: 'A', x: 10, y: 10, attrs: [], methods: [] }, { id: 'B', name: 'B', x: 260, y: 10, attrs: [], methods: [] }], edges: [{ from: 'A', to: 'B', kind: 'navig', m1: '1', m2: '*' }] },
      c: ['public class A {\n    private B b;\n}', 'public class A {\n    private List<B> lesB = new ArrayList<B>();\n}', 'public class B {\n    private List<A> lesA;\n}'], a: 1,
      why: 'Plusieurs B : un tableau ou une collection de B dans A (ici une List).',
    },
    {
      id: 't7', src: 'Cours UML', q: 'Quel code traduit le mieux une COMPOSITION Voiture ◆— 1 Moteur ?',
      uml: { classes: [{ id: 'V', name: 'Voiture', x: 10, y: 10, attrs: [], methods: [] }, { id: 'M', name: 'Moteur', x: 260, y: 10, attrs: [], methods: [] }], edges: [{ from: 'V', to: 'M', kind: 'comp', m1: '1', m2: '1' }] },
      c: [
        'public class Voiture {\n    private Moteur moteur;\n    public Voiture() {\n        this.moteur = new Moteur();   // créé avec la voiture\n    }\n}',
        'public class Voiture {\n    private Moteur moteur;\n    public Voiture(Moteur m) {\n        this.moteur = m;              // fourni et partageable\n    }\n}',
        'public class Voiture extends Moteur {\n}',
      ], a: 0, why: 'En composition, la partie est créée (et disparaît) avec le tout, sans partage. Recevoir un objet existant de l\'extérieur évoque plutôt une agrégation.',
    },
    {
      id: 't8', src: 'Cours UML', q: 'Quelle notation UML pour ce code ?',
      code: 'public abstract class Forme {\n    protected Point centre;\n    private static int nbFormes;\n    public abstract double surface();\n}',
      c: ['Forme en italique ; # centre : Point ; - nbFormes : int souligné ; + surface() : double en italique', 'Forme normale ; + centre : Point ; - nbFormes : int ; + surface() : double', 'Forme «interface» ; # centre : Point ; + surface() : double', 'Forme en italique ; - centre : Point ; nbFormes en italique ; + surface() souligné'], a: 0,
      why: 'Abstrait → italique (classe et méthode). protected → #. static → souligné.',
    },
    {
      id: 't9', src: 'A21 III.1 diagrammes 7-8', q: 'Quel code pour Joueur ?',
      uml: { classes: [{ id: 'J', name: 'Joueur', x: 10, y: 10, attrs: ['- nom : String', '# dateNaissance : Date'], methods: ['+ jouer()'] }] },
      c: [
        'public class Joueur {\n    private String nom;\n    protected Date dateNaissance;\n    public void jouer() { ... }\n}',
        'public class Joueur {\n    public String nom;\n    protected Date dateNaissance;\n    public void jouer() { ... }\n}',
        'public class Joueur {\n    private String nom;\n    private Date dateNaissance;\n    public Joueur jouer() { ... }\n}',
      ], a: 0, why: '- privé, # protégé, + public ; sans type de retour indiqué, on écrit void.',
    },
    {
      id: 't10', src: 'A24 III.5 (Adaptateur)', q: 'Quel diagramme décrit « Adaptatrice implémente InterfaceObjectif et compose Monitoring » ?',
      code: 'public class Adaptatrice implements InterfaceObjectif {\n    private Monitoring monitoring;\n    ...\n}',
      c: ['Adaptatrice ⇢▷ InterfaceObjectif (pointillé) et Adaptatrice ◆— Monitoring', 'Adaptatrice —▷ Monitoring (héritage) et InterfaceObjectif ◆— Adaptatrice', 'Monitoring ⇢▷ InterfaceObjectif', 'Adaptatrice ◇— InterfaceObjectif'], a: 0,
      why: 'implements = réalisation vers l\'interface ; l\'attribut Monitoring possédé par l\'adaptatrice = composition (ou association) côté Adaptatrice.',
    },
  ];

  const plans = [
    {
      id: 'p-fnac', src: 'Médian A25 II.1 (~3 pts)', title: 'La boutique Fnac',
      context: [
        'Le client effectue ses achats sur le site web de la boutique en remplissant son panier d\'articles. Il peut ajouter, enlever un article, sauvegarder ou annuler son panier. Il peut aussi le supprimer. Dans ce cas les articles sont également supprimés.',
        'Un article est caractérisé par son prix (double), le délai de livraison (String) et une courte description (String). Nous distinguons trois types d\'article avec les livres, les jeux pour console et les smartphones.',
        'Un livre est caractérisé par son genre, son titre (String), son auteur (String) et son support. Un jeu pour console est caractérisé par son titre (String), le type de console et son état. Un smartphone est caractérisé par sa marque (String), son OS (String), sa mémoire interne (int) et son état.',
        'Un client est caractérisé par un compte (String), un mot de passe (String), une adresse de facturation (String), une adresse de livraison (String). Un client peut être une personne physique ou morale (comité d\'entreprise) impliquant des modalités différentes pour la création du compte. Dans le premier cas, un client est également défini par son nom et son prénom ; dans le second par sa raison sociale.',
        'Enfin, le calcul du prix d\'un article dépend étroitement du type de l\'article. L\'implémentation de cette fonctionnalité commune est laissée à la charge de chaque type.',
        'Énumérations supposées : Genre {romans, BD, polar}, Support {ebook, poche}, Etat {neuf, reconditionné}, Console {PS5, Xbox, Switch}. Omettre getters/setters, constructeurs et énumérations.',
      ],
      steps: [
        { t: 'Classes', items: ['Client (abstraite), PersonnePhysique, PersonneMorale', 'Panier', 'Article (abstraite), Livre, JeuConsole, Smartphone'] },
        { t: 'Héritages', items: ['Livre, JeuConsole, Smartphone → Article', 'PersonnePhysique, PersonneMorale → Client'] },
        { t: 'Abstraction', items: ['calculerPrix() : double abstraite (italique) dans Article, redéfinie dans les 3 filles', 'creerCompte() abstraite dans Client (« modalités différentes »), redéfinie dans les 2 filles'] },
        { t: 'Relations', items: ['Panier ◆— Article : composition, 1 — * (supprimer le panier supprime les articles)', 'Client — Panier : association navigable de Client vers Panier, 1 — 1 (ou 0..1)'] },
        { t: 'Méthodes de Panier', items: ['ajouter(a : Article), enlever(a : Article), sauvegarder(), annuler(), supprimer()'] },
        { t: 'Attributs typés par les enums', items: ['Livre : - genre : Genre, - support : Support', 'JeuConsole : - console : Console, - etat : Etat', 'Smartphone : - etat : Etat'] },
      ],
      rubric: ['Héritage Article ← Livre/JeuConsole/Smartphone', 'Article abstraite + calculerPrix() abstraite et redéfinie', 'Héritage Client ← PersonnePhysique/PersonneMorale', 'Composition Panier ◆— Article avec multiplicités', 'Association Client — Panier avec multiplicités', 'Méthodes du panier', 'Attributs avec types (dont enums) et visibilités'],
      diagram: {
        classes: [
          { id: 'Cl', name: 'Client', kind: 'abstract', x: 10, y: 10, attrs: ['- compte : String', '- motDePasse : String', '- adresseFacturation : String', '- adresseLivraison : String'], methods: ['*+ creerCompte() : void'] },
          { id: 'Pa', name: 'Panier', x: 340, y: 10, attrs: [], methods: ['+ ajouter(a : Article) : void', '+ enlever(a : Article) : void', '+ sauvegarder() : void', '+ annuler() : void', '+ supprimer() : void'] },
          { id: 'Ar', name: 'Article', kind: 'abstract', x: 680, y: 10, attrs: ['- prix : double', '- delaiLivraison : String', '- description : String'], methods: ['*+ calculerPrix() : double'] },
          { id: 'PP', name: 'PersonnePhysique', x: 10, y: 250, attrs: ['- nom : String', '- prenom : String'], methods: ['+ creerCompte() : void'] },
          { id: 'PM', name: 'PersonneMorale', x: 220, y: 250, attrs: ['- raisonSociale : String'], methods: ['+ creerCompte() : void'] },
          { id: 'Li', name: 'Livre', x: 450, y: 250, attrs: ['- genre : Genre', '- titre : String', '- auteur : String', '- support : Support'], methods: ['+ calculerPrix() : double'] },
          { id: 'Je', name: 'JeuConsole', x: 680, y: 250, attrs: ['- titre : String', '- console : Console', '- etat : Etat'], methods: ['+ calculerPrix() : double'] },
          { id: 'Sm', name: 'Smartphone', x: 910, y: 250, attrs: ['- marque : String', '- os : String', '- memoireInterne : int', '- etat : Etat'], methods: ['+ calculerPrix() : double'] },
        ],
        edges: [
          { from: 'Cl', to: 'Pa', kind: 'navig', m1: '1', m2: '1' },
          { from: 'Pa', to: 'Ar', kind: 'comp', m1: '1', m2: '*' },
          { from: 'PP', to: 'Cl', kind: 'inherit' }, { from: 'PM', to: 'Cl', kind: 'inherit' },
          { from: 'Li', to: 'Ar', kind: 'inherit' }, { from: 'Je', to: 'Ar', kind: 'inherit' }, { from: 'Sm', to: 'Ar', kind: 'inherit' },
        ],
      },
    },
    {
      id: 'p-hello', src: 'Médian A24 II.1 (~6 pts)', title: 'HelloMoving (Alipay)',
      context: [
        'HelloMoving permet de louer un véhicule avec son téléphone : le client scanne le QR code pour le déverrouiller, puis paie en ligne selon la durée de location. Il peut signaler des parties défectueuses.',
        'Un client est caractérisé par un compte utilisateur (String), un mot de passe (String), un email (String), les informations de son compte bancaire (String), une liste des paiements effectués (Paiement), des points de fidélité (int).',
        'HelloMoving est aussi utilisé par le service marketing. Il est l\'unique service qui gère l\'ensemble des clients. L\'ensemble des véhicules est quant à lui géré par plusieurs services dont le service marketing. Le service marketing peut notifier les clients afin de leur demander de lire du contenu publicitaire ; le client peut accepter ou refuser. S\'il accepte, ses points de fidélité augmentent.',
        'Un véhicule est caractérisé par son QRcode (Image), s\'il est verrouillé (boolean), la liste des parties défectueuses (String), la durée de location (float). On peut le déverrouiller deverouillerQRcode(), signaler les défauts signalerDefauts() et enregistrer des évènements recordEvent(). Deux types : le vélo (couleur EnumCouleur, présence d\'un panier boolean) et la voiture (marque String, énergie EnumEnergie, catégorie EnumCategorie). Un client peut louer un seul véhicule à la fois.',
        'La location génère un paiement caractérisé par sa date (Date) et la somme payée (float). Deux manières de payer : par compte bancaire ou par points de fidélité. Il faudra tenir compte d\'autres formes de paiement à venir sans remettre en cause la modélisation initiale.',
        'Types Date et Image supposés. Pas de getters/setters ni constructeurs.',
      ],
      steps: [
        { t: 'Classes', items: ['HelloMoving, ServiceMarketing, Client', 'Vehicule (abstraite), Velo, Voiture', 'Paiement (abstraite ou interface), PaiementBancaire, PaiementFidelite', 'Énumérations EnumCouleur, EnumEnergie, EnumCategorie'] },
        { t: 'Composition / agrégation (le cœur du sujet)', items: ['HelloMoving ◆— Client, 1 — * : « l\'unique service qui gère l\'ensemble des clients »', 'HelloMoving ◇— Vehicule et ServiceMarketing ◇— Vehicule : véhicules partagés par plusieurs services'] },
        { t: 'Associations', items: ['Client — Vehicule « loue » : 0..1 côté Vehicule (un seul à la fois)', 'Client 1 — * Paiement (liste des paiements)', 'ServiceMarketing → Client : notifier()'] },
        { t: 'Extension', items: ['Paiement abstraite avec effectuer() abstraite, une sous-classe par mode : un nouveau mode = une nouvelle classe, rien à modifier'] },
        { t: 'Méthodes', items: ['Vehicule : deverouillerQRcode(), signalerDefauts(), recordEvent()', 'Client : accepterPub() : boolean (ou lireContenu()), louer(v : Vehicule)', 'ServiceMarketing : notifier(c : Client)'] },
      ],
      rubric: ['Composition HelloMoving — Client', 'Agrégation(s) vers Vehicule (partage)', 'Héritage Vehicule ← Velo/Voiture, attributs avec enums', 'Paiement extensible (abstraite + sous-classes)', 'Client 0..1 — Vehicule et 1 — * Paiement', 'Méthodes de Vehicule et notification marketing', 'Toutes les multiplicités présentes'],
      diagram: {
        classes: [
          { id: 'HM', name: 'HelloMoving', x: 10, y: 10, attrs: [], methods: ['+ inscrire(c : Client) : void'] },
          { id: 'SM', name: 'ServiceMarketing', x: 420, y: 10, attrs: [], methods: ['+ notifier(c : Client) : void'] },
          { id: 'Cl', name: 'Client', x: 10, y: 150, attrs: ['- compteUtilisateur : String', '- motDePasse : String', '- email : String', '- infosBancaires : String', '- pointsFidelite : int'], methods: ['+ louer(v : Vehicule) : void', '+ accepterPub() : boolean'] },
          { id: 'Ve', name: 'Vehicule', kind: 'abstract', x: 420, y: 150, attrs: ['- qrCode : Image', '- verrouille : boolean', '- partiesDefectueuses : String[]', '- dureeLocation : float'], methods: ['+ deverouillerQRcode() : void', '+ signalerDefauts() : void', '+ recordEvent() : void'] },
          { id: 'Vo', name: 'Velo', x: 330, y: 400, attrs: ['- couleur : EnumCouleur', '- panier : boolean'], methods: [] },
          { id: 'Vt', name: 'Voiture', x: 560, y: 400, attrs: ['- marque : String', '- energie : EnumEnergie', '- categorie : EnumCategorie'], methods: [] },
          { id: 'Pa', name: 'Paiement', kind: 'abstract', x: 40, y: 400, attrs: ['- date : Date', '- somme : float'], methods: ['*+ effectuer() : void'] },
          { id: 'PB', name: 'PaiementBancaire', x: 10, y: 560, attrs: [], methods: ['+ effectuer() : void'] },
          { id: 'PF', name: 'PaiementFidelite', x: 210, y: 560, attrs: [], methods: ['+ effectuer() : void'] },
        ],
        edges: [
          { from: 'HM', to: 'Cl', kind: 'comp', m1: '1', m2: '*' },
          { from: 'HM', to: 'Ve', kind: 'aggr', m1: '*', m2: '*' },
          { from: 'SM', to: 'Ve', kind: 'aggr', m1: '*', m2: '*' },
          { from: 'SM', to: 'Cl', kind: 'navig', m2: '*', label: 'notifie' },
          { from: 'Cl', to: 'Ve', kind: 'assoc', m1: '0..1', m2: '0..1', label: 'loue' },
          { from: 'Cl', to: 'Pa', kind: 'comp', m1: '1', m2: '*' },
          { from: 'Vo', to: 'Ve', kind: 'inherit' }, { from: 'Vt', to: 'Ve', kind: 'inherit' },
          { from: 'PB', to: 'Pa', kind: 'inherit' }, { from: 'PF', to: 'Pa', kind: 'inherit' },
        ],
      },
    },
    {
      id: 'p-ykea', src: 'Médian A23 II.1 (~4 pts)', title: 'La boutique Ykea',
      context: [
        'Ykea dispose d\'un site internet. Un client remplit son panier virtuel d\'articles. Il peut ajouter, enlever un article, valider son panier mais aussi l\'annuler.',
        'Parmi les articles, nous distinguons les luminaires, le petit électroménager et l\'ameublement. Un article est caractérisé par son prix (réel), la date d\'expiration de sa garantie, le délai de livraison (string).',
        'Un luminaire est caractérisé par le type d\'éclairage (led, ampoule), sa puissance (réel) ; le petit électroménager par sa classification énergétique (caractère), son état (neuf, reconditionné) ; un meuble par son essence de bois (bois massif, MDF), son encombrement (réel), son empreinte écologique (string).',
        'Un client est caractérisé par un compte, un mot de passe, une adresse de facturation, une adresse de livraison (string). Un client peut être une personne physique ou morale impliquant des modalités différentes pour la création du compte : nom et prénom dans le premier cas, raison sociale dans le second. A des fins d\'extension, il faut s\'attendre à d\'autres types de clients non encore connus.',
        'Classe Date et énumérations Eclairage, Bois, Etat supposées. Omettre getters/setters et constructeurs.',
      ],
      steps: [
        { t: 'Classes', items: ['Client (abstraite), PersonnePhysique, PersonneMorale', 'Panier', 'Article (abstraite), Luminaire, PetitElectromenager, Meuble'] },
        { t: 'Extension', items: ['« d\'autres types de clients non encore connus » → Client abstraite avec creerCompte() abstraite : on ajoutera une sous-classe'] },
        { t: 'Relations', items: ['Client 1 → 1 Panier', 'Panier — Article : * côté Article. Composition ou agrégation ? Le sujet ne dit pas que les articles disparaissent : une agrégation (ou association) se défend ; justifie ton choix sur la copie.'] },
        { t: 'Méthodes de Panier', items: ['ajouter(a : Article), enlever(a : Article), valider(), annuler()'] },
        { t: 'Attributs', items: ['Article : - prix : double, - dateFinGarantie : Date, - delaiLivraison : String', 'Luminaire : - eclairage : Eclairage, - puissance : double', 'PetitElectromenager : - classeEnergie : char, - etat : Etat', 'Meuble : - bois : Bois, - encombrement : double, - empreinteEcologique : String'] },
      ],
      rubric: ['Héritage Article ← 3 types', 'Héritage Client abstraite ← 2 types (extension)', 'Relation Panier — Article justifiée, avec multiplicités', 'Client — Panier', 'Méthodes du panier', 'Attributs typés (Date, char, enums)'],
      diagram: {
        classes: [
          { id: 'Cl', name: 'Client', kind: 'abstract', x: 10, y: 10, attrs: ['- compte : String', '- motDePasse : String', '- adresseFacturation : String', '- adresseLivraison : String'], methods: ['*+ creerCompte() : void'] },
          { id: 'Pa', name: 'Panier', x: 340, y: 10, attrs: [], methods: ['+ ajouter(a : Article) : void', '+ enlever(a : Article) : void', '+ valider() : void', '+ annuler() : void'] },
          { id: 'Ar', name: 'Article', kind: 'abstract', x: 680, y: 10, attrs: ['- prix : double', '- dateFinGarantie : Date', '- delaiLivraison : String'], methods: [] },
          { id: 'PP', name: 'PersonnePhysique', x: 10, y: 240, attrs: ['- nom : String', '- prenom : String'], methods: ['+ creerCompte() : void'] },
          { id: 'PM', name: 'PersonneMorale', x: 220, y: 240, attrs: ['- raisonSociale : String'], methods: ['+ creerCompte() : void'] },
          { id: 'Lu', name: 'Luminaire', x: 450, y: 240, attrs: ['- eclairage : Eclairage', '- puissance : double'], methods: [] },
          { id: 'PE', name: 'PetitElectromenager', x: 660, y: 240, attrs: ['- classeEnergie : char', '- etat : Etat'], methods: [] },
          { id: 'Me', name: 'Meuble', x: 880, y: 240, attrs: ['- bois : Bois', '- encombrement : double', '- empreinteEcologique : String'], methods: [] },
        ],
        edges: [
          { from: 'Cl', to: 'Pa', kind: 'navig', m1: '1', m2: '1' },
          { from: 'Pa', to: 'Ar', kind: 'aggr', m1: '*', m2: '*' },
          { from: 'PP', to: 'Cl', kind: 'inherit' }, { from: 'PM', to: 'Cl', kind: 'inherit' },
          { from: 'Lu', to: 'Ar', kind: 'inherit' }, { from: 'PE', to: 'Ar', kind: 'inherit' }, { from: 'Me', to: 'Ar', kind: 'inherit' },
        ],
      },
    },
    {
      id: 'p-air', src: 'Médian A19 I.1 / A11 II.1', title: 'Air Grand Est',
      context: [
        'Réservation en ligne de billets. La compagnie offre des vols depuis différents aéroports de départ vers différents aéroports de destination à des dates différentes. A chaque vol sont associés les passagers qui ont effectué une réservation.',
        'Un passager est caractérisé par son identité (nom, prénom, âge, sexe et adresse email), un numéro de passeport. Un vol est caractérisé par un aéroport de départ et un aéroport de destination, une heure de départ, une durée de vol et une référence (par ex. AGE112).',
        'Une réservation est caractérisée par le numéro de place associé et un niveau de confort (eco, premium, business, …). Elle associe un passager à un vol. Un aéroport est caractérisé par son nom ainsi que par tous les vols qu\'il propose au départ et à l\'arrivée.',
        'Utiliser enum pour les énumérations. Getters et setters inutiles.',
      ],
      steps: [
        { t: 'Classes', items: ['Passager, Vol, Reservation, Aeroport', 'Énumération Confort {eco, premium, business}'] },
        { t: 'Relations', items: ['Passager 1 — * Reservation', 'Vol 1 — * Reservation', 'Aeroport 1 — * Vol, deux fois : « départ » et « arrivée »'] },
        { t: 'Pièges', items: ['Ne pas mettre d\'attribut aeroportDepart : String dans Vol : c\'est l\'association qui le porte', 'Reservation n\'hérite de rien : elle relie deux objets (alternative : classe d\'association entre Passager et Vol)'] },
      ],
      rubric: ['Les 4 classes avec attributs typés', 'Confort en énumération', 'Reservation reliée à Passager et à Vol', 'Deux associations Aeroport — Vol avec rôles', 'Multiplicités correctes'],
      diagram: {
        classes: [
          { id: 'Ps', name: 'Passager', x: 10, y: 10, attrs: ['- nom : String', '- prenom : String', '- age : int', '- sexe : char', '- email : String', '- numPasseport : String'], methods: [] },
          { id: 'Re', name: 'Reservation', x: 300, y: 30, attrs: ['- numPlace : int', '- confort : Confort'], methods: [] },
          { id: 'Vo', name: 'Vol', x: 570, y: 20, attrs: ['- reference : String', '- heureDepart : Date', '- duree : int'], methods: [] },
          { id: 'Ae', name: 'Aeroport', x: 590, y: 260, attrs: ['- nom : String'], methods: [] },
          { id: 'Co', name: 'Confort', kind: 'enum', x: 300, y: 200, attrs: ['eco', 'premium', 'business'], methods: [] },
        ],
        edges: [
          { from: 'Ps', to: 'Re', kind: 'assoc', m1: '1', m2: '*' },
          { from: 'Vo', to: 'Re', kind: 'assoc', m1: '1', m2: '*' },
          { from: 'Ae', to: 'Vo', kind: 'assoc', m1: '1', m2: '*', label: 'départ', off: -26 },
          { from: 'Ae', to: 'Vo', kind: 'assoc', m1: '1', m2: '*', label: 'arrivée', off: 26 },
        ],
      },
    },
    {
      id: 'p-orpheus', src: 'Création VEGA (style A23-A25)', title: 'La station Orpheus',
      context: [
        'La station Orpheus est unique : il ne peut en exister qu\'une instance dans le système. Elle est composée de modules ; si la station est détruite, ses modules le sont aussi. Un module est caractérisé par son nom (String) et son niveau d\'énergie (int).',
        'On distingue pour l\'instant les réacteurs (puissance en mégawatts, double) et les serres (surface en m², double, et type de culture : hydroponie, aéroponie). La procédure d\'alimentation d\'un module dépend du type de module et est laissée à la charge de chaque type. D\'autres types de modules viendront.',
        'Les ingénieurs (nom, spécialité String) sont répartis en équipes ; un ingénieur peut faire partie de plusieurs équipes et une équipe dissoute ne fait pas disparaître ses ingénieurs. Une équipe est responsable de un à plusieurs modules.',
        'Certains objets sont réparables : les réacteurs et les drones de maintenance (modèle String). Tout objet réparable propose reparer(). La station peut lancer un diagnostic de tous ses modules.',
      ],
      steps: [
        { t: 'Classes', items: ['Station (Singleton), Module (abstraite), Reacteur, Serre', 'Ingenieur, Equipe', 'Interface Reparable, Drone', 'Énumération Culture'] },
        { t: 'Relations', items: ['Station 1 ◆— 1..* Module (composition)', 'Equipe * ◇— * Ingenieur (agrégation : partage, cycles indépendants)', 'Equipe 1 — 1..* Module (responsable)', 'Reacteur et Drone ⇢▷ Reparable'] },
        { t: 'Singleton', items: ['- instance : Station souligné, - Station() privé, + getInstance() : Station souligné'] },
        { t: 'Abstraction', items: ['alimenter() abstraite dans Module, redéfinie dans Reacteur et Serre'] },
      ],
      rubric: ['Singleton noté correctement (soulignés, constructeur privé)', 'Composition Station — Module', 'Agrégation Equipe — Ingenieur', 'Module abstraite + alimenter() abstraite', 'Interface Reparable réalisée par Reacteur et Drone', 'Multiplicités'],
      diagram: {
        classes: [
          { id: 'St', name: 'Station', x: 10, y: 10, attrs: ['_- instance : Station'], methods: ['- Station()', '_+ getInstance() : Station', '+ diagnostiquer() : void'] },
          { id: 'Mo', name: 'Module', kind: 'abstract', x: 330, y: 10, attrs: ['- nom : String', '- energie : int'], methods: ['*+ alimenter() : void'] },
          { id: 'Eq', name: 'Equipe', x: 640, y: 10, attrs: [], methods: [] },
          { id: 'In', name: 'Ingenieur', x: 640, y: 170, attrs: ['- nom : String', '- specialite : String'], methods: [] },
          { id: 'Re', name: 'Reacteur', x: 210, y: 230, attrs: ['- puissance : double'], methods: ['+ alimenter() : void', '+ reparer() : void'] },
          { id: 'Se', name: 'Serre', x: 430, y: 230, attrs: ['- surface : double', '- culture : Culture'], methods: ['+ alimenter() : void'] },
          { id: 'Rp', name: 'Reparable', kind: 'interface', x: 10, y: 400, attrs: [], methods: ['+ reparer() : void'] },
          { id: 'Dr', name: 'Drone', x: 260, y: 420, attrs: ['- modele : String'], methods: ['+ reparer() : void'] },
        ],
        edges: [
          { from: 'St', to: 'Mo', kind: 'comp', m1: '1', m2: '1..*' },
          { from: 'Eq', to: 'Mo', kind: 'assoc', m1: '1', m2: '1..*', label: 'responsable' },
          { from: 'Eq', to: 'In', kind: 'aggr', m1: '*', m2: '*' },
          { from: 'Re', to: 'Mo', kind: 'inherit' }, { from: 'Se', to: 'Mo', kind: 'inherit' },
          { from: 'Re', to: 'Rp', kind: 'realize' }, { from: 'Dr', to: 'Rp', kind: 'realize' },
        ],
      },
    },
  ];

  O.data.uml = { decoder, translate, plans };
})(window);
