/**
 * patterns-lessons.js — Leçons sur les 9 patrons de conception
 * (les 8 des annales et Strategy, vu au TP 3).
 *
 * Chaque leçon : { id (= id de l'exercice de la Forge), name, family,
 *   problem, intention, image (moyen mnémotechnique), roles: [[rôle, dans le sujet, responsabilité]],
 *   uml (structure ; absent → diagramme de l'exercice de la Forge),
 *   seq (dynamique : qui appelle qui, dessiné par seq-render.js),
 *   skeleton (squelette générique), cues (indices d'énoncé), mistakes }.
 * drill : « Quel patron ? » (situations) et « Quel rôle ? ».
 * Les noms de rôles suivent le vocabulaire des énoncés (InterfaceObjectif,
 * Adaptatrice, composite…) plutôt que celui du Gang of Four en anglais.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const m = (from, to, label, kind) => ({ from, to, label, kind: kind || 'sync' });
  const box = (id, name, x, y, attrs, methods, kind) => ({ id, name, x, y, attrs: attrs || [], methods: methods || [], kind });

  const lessons = [
    {
      id: 'singleton', name: 'Singleton', family: 'Création',
      problem: 'Une classe ne doit avoir **qu\'une seule instance** dans tout le programme (un panier, une fabrique, la station), et tout le monde doit pouvoir y accéder.',
      intention: 'Garantir l\'unicité d\'une instance et fournir un point d\'accès global à celle-ci.',
      image: 'Il n\'y a qu\'une VEGA à bord. On ne la construit pas : on lui demande d\'apparaître (`getInstance()`), et c\'est toujours la même qui répond.',
      roles: [['Singleton', 'Panier, FabriqueVehicule, TimeFactory', 'garde son unique instance dans un attribut statique et la distribue']],
      seq: { actors: [{ id: 'c', label: ':Client' }, { id: 'P', label: 'Panier' }, { id: 'p', label: 'instance:Panier', created: true }], items: [
        m('c', 'P', 'getInstance()'),
        { frame: 'opt', guard: '[instance == null]', items: [{ from: 'P', to: 'p', label: 'new Panier()', kind: 'create' }] },
        m('P', 'c', 'instance', 'return'),
      ] },
      skeleton: 'public class Panier {\n    private static Panier instance = null;   // 1. instance unique, de classe\n\n    private Panier() { }                      // 2. personne ne fait new dehors\n\n    public static Panier getInstance() {      // 3. point d\'accès, de classe\n        if (instance == null) {\n            instance = new Panier();          // créée au premier appel seulement\n        }\n        return instance;\n    }\n}\n// usage : Panier p = Panier.getInstance();',
      cues: ['« garantir à chaque instant l\'unicité d\'une instance »', '« cette fabrique est unique »', '« doit garantir la présence d\'une unique instance »'],
      mistakes: ['Constructeur public : n\'importe qui peut faire new Panier().', 'getInstance() non statique : il faudrait déjà un objet pour l\'appeler.', 'return new Panier() sans if : une nouvelle instance à chaque appel.', 'Oublier de souligner instance et getInstance() dans le diagramme UML.'],
    },
    {
      id: 'template', name: 'Template Method', family: 'Comportement',
      problem: 'Plusieurs traitements suivent **toujours la même suite d\'étapes**, mais **chaque étape se réalise différemment** selon le cas (commander en boutique ou en ligne : payer puis livrer).',
      intention: 'Définir dans une classe mère le squelette d\'un algorithme, et laisser les classes filles implémenter certaines étapes sans changer l\'enchaînement.',
      image: 'La procédure de saut de la station est gravée dans la coque : vérifier, charger, sauter. Chaque vaisseau fait ces étapes à sa façon, mais personne ne change l\'ordre.',
      roles: [['Classe abstraite', 'Commande', 'contient la méthode squelette final et les étapes abstraites'], ['Méthode squelette (template)', 'commander()', 'final : appelle les étapes dans l\'ordre'], ['Étapes (opérations primitives)', 'payer(), livrer()', 'abstraites dans la mère'], ['Classes concrètes', 'EnBoutique, EnLigne', 'implémentent les étapes']],
      seq: { actors: [{ id: 'm', label: ':Main' }, { id: 'c', label: 'com:EnBoutique' }], items: [m('m', 'c', 'commander()'), m('c', 'c', 'payer()'), m('c', 'c', 'livrer()')] },
      skeleton: 'public abstract class Commande {\n    public final void commander() {   // squelette : final = non redéfinissable\n        this.payer();\n        this.livrer();\n    }\n    protected abstract void payer();  // étapes laissées aux filles\n    protected abstract void livrer();\n}\n\npublic class EnBoutique extends Commande {\n    protected void payer()  { System.out.println("..."); }\n    protected void livrer() { System.out.println("..."); }\n}',
      cues: ['« suit systématiquement le même procédé en deux étapes »', '« la procédure reste identique ; elle peut donc être factorisée »', '« La méthode commander ne doit pas être redéfinie »', 'principe d\'Hollywood'],
      mistakes: ['Oublier final sur la méthode squelette.', 'Donner un corps vide aux étapes au lieu de les déclarer abstract.', 'Redéfinir commander() dans les filles.', 'Appeler payer() et livrer() depuis le main : c\'est commander() qui les appelle.'],
    },
    {
      id: 'fabrique', name: 'Fabrique (Factory)', family: 'Création',
      problem: 'Le code client doit créer des objets **sans connaître leur classe exacte** à l\'avance : le type dépend d\'un paramètre (« vélo », « voiture », précision à la seconde ou à la minute).',
      intention: 'Centraliser la création d\'objets en un point unique qui choisit la classe concrète et renvoie le type général.',
      image: 'Le hangar de la station : tu demandes « un véhicule pour un trajet court », le hangar choisit lui-même s\'il te sort un vélo ou un drone.',
      roles: [['Fabrique', 'FabriqueVehicule, TimeFactory', 'méthode createX(param) qui choisit et instancie'], ['Produit (type général)', 'Vehicule, Time', 'type de retour de la fabrique'], ['Produits concrets', 'Velo, Voiture, TimeMin, TimeSec', 'les classes réellement instanciées']],
      uml: { classes: [box('F', 'FabriqueVehicule', 10, 10, [], ['+ createVehicule(typeV : String) : Vehicule']), box('V', 'Vehicule', 380, 10, [], ['+ recordEvent() : void'], 'abstract'), box('Ve', 'Velo', 300, 150), box('Vo', 'Voiture', 480, 150)],
        edges: [{ from: 'F', to: 'V', kind: 'dep', label: 'crée' }, { from: 'Ve', to: 'V', kind: 'inherit' }, { from: 'Vo', to: 'V', kind: 'inherit' }] },
      seq: { actors: [{ id: 't', label: ':TestMaintenance' }, { id: 'f', label: 'fab:FabriqueVehicule' }, { id: 'v', label: 'v1:Velo', created: true }], items: [m('t', 'f', 'createVehicule("vélo")'), { from: 'f', to: 'v', label: 'new Velo()', kind: 'create' }, m('f', 't', 'v1 (type Vehicule)', 'return'), m('t', 'v', 'recordEvent()')] },
      skeleton: 'public Vehicule createVehicule(String typeV) {\n    if (typeV.equals("vélo")) {\n        return new Velo();\n    } else if (typeV.equals("voiture")) {\n        return new Voiture();\n    }\n    return null;   // type inconnu\n}\n// client : Vehicule v = fabrique.createVehicule("vélo");   // ne connaît pas Velo',
      cues: ['« instancier des objets dont le type n\'est pas prédéfini »', '« créés selon des paramètres passés à la fabrique »', '« masquer le type réel de l\'objet retourné »', '« en un point central »'],
      mistakes: ['Comparer les String avec == au lieu de equals.', 'Renvoyer Velo au lieu de Vehicule : le client connaîtrait la classe concrète.', 'Stocker le résultat dans une variable Velo dans le main.'],
    },
    {
      id: 'adaptateur', name: 'Adaptateur (Adapter)', family: 'Structure',
      problem: 'Une classe **existe déjà** et fait ce qu\'on veut, mais **ses méthodes ne portent pas les noms ou paramètres** que le reste du code attend (Monitoring a recordTirePressure…, on veut record(Vehicule)).',
      intention: 'Convertir l\'interface d\'une classe existante en l\'interface attendue par le client, sans modifier cette classe.',
      image: 'Un adaptateur de prise : ton chargeur (le client) attend une prise française, la station a des prises martiennes. L\'adaptateur a la forme attendue d\'un côté, et branche le courant martien de l\'autre.',
      roles: [['Interface cible', 'InterfaceObjectif (record), Point', 'ce que le client sait appeler'], ['Classe adaptée', 'Monitoring, PointPolaire', 'existe déjà, interface incompatible'], ['Adaptateur', 'Adaptatrice, PointAdapter', 'implémente la cible, compose l\'adaptée, traduit les appels']],
      seq: { actors: [{ id: 'v', label: ':Vehicule' }, { id: 'a', label: ':Adaptatrice' }, { id: 'm', label: ':Monitoring' }], items: [m('v', 'a', 'record(this)'), m('a', 'm', 'recordTirePressure()'), m('a', 'm', 'recordUnlockMechanism()'), { frame: 'opt', guard: '[o instanceof Voiture]', items: [m('a', 'm', 'recordAntiBlockSystemEfficiency()'), m('a', 'm', 'recordPowerSteering()')] }] },
      skeleton: 'public interface InterfaceObjectif {\n    public void record(Vehicule o);\n}\n\npublic class Adaptatrice implements InterfaceObjectif {   // a la forme attendue\n    private Monitoring monitoring = new Monitoring();       // compose la classe existante\n\n    public void record(Vehicule o) {                       // traduit l\'appel\n        this.monitoring.recordTirePressure();\n        this.monitoring.recordUnlockMechanism();\n        if (o instanceof Voiture) {\n            this.monitoring.recordAntiBlockSystemEfficiency();\n            this.monitoring.recordPowerSteering();\n        }\n    }\n}',
      cues: ['« il existe déjà une classe … possédant les méthodes … »', '« adapter la classe … aux besoins de … »', '« fonctionnalités identiques mais déclarées différemment »', '« compose la classe à adapter »'],
      mistakes: ['Modifier la classe existante (Monitoring) au lieu de l\'envelopper.', 'Faire hériter l\'adaptateur de la classe adaptée alors que l\'énoncé dit « compose ».', 'Oublier implements de l\'interface cible.'],
    },
    {
      id: 'decorateur', name: 'Décorateur (Decorator)', family: 'Structure',
      problem: 'On veut **ajouter des options** à un objet, **en les combinant librement** : 5 options = 32 combinaisons, impossible d\'écrire 32 sous-classes.',
      intention: 'Ajouter dynamiquement des responsabilités à un objet en l\'enveloppant dans des objets « décorateurs » qui ont le même type que lui.',
      image: 'Des poupées russes : chaque option est une couche qui entoure la voiture précédente. Pour le prix, chaque couche demande le prix de ce qu\'elle contient et ajoute le sien.',
      roles: [['Composant', 'Voiture', 'le type commun, avec getPrix() et toString()'], ['Composant concret', 'Voiture de base', 'l\'objet au centre'], ['Décorateur', 'VoitureAvecOption', 'EST une Voiture (extends) ET A une Voiture (attribut) ; ajoute son option']],
      seq: { actors: [{ id: 'c', label: ':Client' }, { id: 'o2', label: 'v1:AvecOption(antivol)' }, { id: 'o1', label: ':AvecOption(gps)' }, { id: 'v', label: ':Voiture' }], items: [m('c', 'o2', 'getPrix()'), m('o2', 'o1', 'getPrix()'), m('o1', 'v', 'getPrix()'), m('v', 'o1', '10000', 'return'), m('o1', 'o2', '10500', 'return'), m('o2', 'c', '12500', 'return')] },
      skeleton: 'public class VoitureAvecOption extends Voiture {   // EST une Voiture\n    private Voiture voiture;                          // A une Voiture (celle décorée)\n    private String description;\n    private int prixOption;\n\n    public VoitureAvecOption(Voiture voiture, String description, int prixOption) {\n        super(null, null);   // la mère n\'a pas de constructeur sans paramètre\n        this.voiture = voiture;\n        this.description = description;\n        this.prixOption = prixOption;\n    }\n    public int getPrix() {\n        return this.voiture.getPrix() + this.prixOption;   // délègue PUIS ajoute\n    }\n}\n// v1 = new VoitureAvecOption(new VoitureAvecOption(v, "gps", 500), "antivol", 2000);',
      cues: ['« 32 combinaisons sont possibles » / « 32 classes filles … pas viable »', '« augmenter le nombre de fonctionnalités d\'un objet de manière dynamique »', '« hérite de … et possède une référence sur un objet … »'],
      mistakes: ['Utiliser super.getPrix() au lieu de voiture.getPrix() : on perdrait les options déjà empilées.', 'Oublier l\'appel explicite à super(...) quand la mère n\'a pas de constructeur sans paramètre.', 'Ne pas hériter de Voiture : on ne pourrait plus décorer un décorateur.'],
    },
    {
      id: 'composite', name: 'Composite', family: 'Structure',
      problem: 'On manipule des objets simples **et des groupes d\'objets**, groupes qui peuvent contenir d\'autres groupes (formes complexes), et on veut les traiter **de la même façon** (calculer la surface).',
      intention: 'Composer des objets en arborescence et permettre au client de traiter un objet simple et une composition de manière identique.',
      image: 'La station est faite de modules ; certains modules sont faits de sous-modules. Demander la consommation de la station, c\'est demander celle de chaque module, qui demande à ses sous-modules… sans jamais savoir à l\'avance lequel est simple.',
      roles: [['Composant', 'Forme, Figure', 'interface commune (surface(), afficher())'], ['Feuille', 'Cercle, Rectangle', 'objet simple, implémente l\'opération'], ['Composite', 'FormeComplexe, FigureComplexe', 'implémente l\'interface ET contient des Composants ; délègue à ses enfants']],
      seq: { actors: [{ id: 'c', label: ':Client' }, { id: 'x', label: 'fc:FormeComplexe' }, { id: 'f', label: 'f:Forme' }], items: [m('c', 'x', 'surface()'), { frame: 'loop', guard: '[pour chaque forme contenue]', items: [m('x', 'f', 's := surface()'), m('f', 'x', 's', 'return')] }, m('x', 'c', 'total', 'return')] },
      skeleton: 'public interface Forme {\n    public double surface();\n}\n\npublic class FormeComplexe implements Forme {   // EST une Forme\n    private Forme[] formes;                      // CONTIENT des Formes (pas des Cercles !)\n    private int cptDeForme;\n\n    public double surface() {\n        double total = 0;\n        for (int i = 0; i < cptDeForme; i++) {\n            total += formes[i].surface();          // liaison dynamique : Cercle ou FormeComplexe\n        }\n        return total;\n    }\n}',
      cues: ['« manipuler de manière identique un objet simple et un ensemble d\'objets »', '« une composition de formes, qui peuvent elles-mêmes être … »', '« Un pack est un produit qui regroupe un ensemble de produits »'],
      mistakes: ['Tableau de Cercle au lieu de Forme : impossible d\'imbriquer des compositions.', 'Le composite n\'implémente pas l\'interface : on ne peut plus le traiter comme une forme.', 'Oublier le compteur et parcourir tout le tableau (cases null → NullPointerException).'],
    },
    {
      id: 'strategy', name: 'Strategy', family: 'Comportement',
      problem: 'Un objet doit pouvoir **changer d\'algorithme en cours de route** (un conducteur conduit tantôt prudemment, tantôt dangereusement). Une sous-classe par comportement le figerait à la création ; une cascade de `if` dans `drive()` obligerait à modifier la classe à chaque nouveau comportement.',
      intention: 'Déléguer un comportement à un objet « stratégie » interchangeable, référencé par un attribut du contexte, pour pouvoir en changer à l\'exécution sans modifier le contexte.',
      image: 'Le pilote automatique de la navette : on y glisse une cartouche « croisière » ou « évitement ». La navette ne sait pas ce que fait la cartouche, elle lui dit juste « pilote-moi ». Pour une nouvelle manœuvre, on grave une nouvelle cartouche.',
      roles: [['Contexte', 'Driver', 'garde une référence vers la stratégie courante (behavior) et lui délègue le travail'], ['Stratégie (interface)', 'Drivable', 'déclare l\'algorithme : driving(Driver d)'], ['Stratégies concrètes', 'RecklessDriver, ResponsibleDriver', 'implémentent chacune une variante de l\'algorithme']],
      uml: { classes: [box('D', 'Driver', 10, 10, ['- name : String', '- behavior : Drivable'], ['+ setBehavior(b : Drivable) : void', '+ drive() : void']), box('I', 'Drivable', 420, 10, [], ['+ driving(d : Driver) : void'], 'interface'), box('R', 'RecklessDriver', 240, 170, [], ['+ driving(d : Driver) : void']), box('S', 'ResponsibleDriver', 500, 170, [], ['+ driving(d : Driver) : void'])],
        edges: [{ from: 'D', to: 'I', kind: 'navig', m2: '1', label: 'behavior' }, { from: 'R', to: 'I', kind: 'realize' }, { from: 'S', to: 'I', kind: 'realize' }] },
      seq: { actors: [{ id: 't', label: ':Test' }, { id: 'd', label: 'alice:Driver' }, { id: 'r', label: ':RecklessDriver' }], items: [m('t', 'd', 'setBehavior(new RecklessDriver())'), m('t', 'd', 'drive()'), m('d', 'r', 'driving(this)'), m('r', 'd', 'getPointMalus()')] },
      skeleton: 'public interface Drivable {\n    public void driving(Driver d);\n}\n\npublic class RecklessDriver implements Drivable {   // une stratégie concrète\n    public void driving(Driver d) {\n        d.getPointMalus().add(new Random().nextInt(101));\n    }\n}\n\npublic class Driver {                    // le contexte\n    private Drivable behavior;           // la stratégie courante (composition)\n    public void setBehavior(Drivable behavior) { this.behavior = behavior; }\n    public void drive() {\n        this.behavior.driving(this);     // délègue sans connaître l\'algorithme\n    }\n}\n// alice.setBehavior(new ResponsibleDriver()); alice.drive();',
      cues: ['« doter le contexte d\'un comportement dont l\'algorithme est délégué à une autre classe »', '« modifier de manière dynamique le comportement d\'un objet au cours de son cycle de vie »', '« l\'algorithme est interchangeable »', '« le même conducteur peut avoir plusieurs types de conduite »'],
      mistakes: ['Faire hériter RecklessDriver de Driver : le type de conduite serait figé à la création (un objet ne change pas de classe).', 'Écrire un if / else sur le type de conduite dans drive() : il faudrait modifier Driver à chaque nouveau comportement (principe ouvert / fermé violé).', 'Oublier de passer this à driving : la stratégie ne pourrait pas modifier les points du conducteur.', 'Typer l\'attribut behavior en RecklessDriver au lieu de Drivable.'],
    },
    {
      id: 'visiteur', name: 'Visiteur (Visitor)', family: 'Comportement',
      problem: 'On veut ajouter **de nouveaux traitements** (statistiques, temps moyen…) sur des objets **sans modifier leurs classes** à chaque fois.',
      intention: 'Séparer les algorithmes de traitement (dans un visiteur) des structures de données (les classes visitées), grâce à un double appel accept / visit.',
      image: 'Un inspecteur monte à bord. Chaque module l\'accueille (`accept`) et lui dit « inspecte-moi » (`visit(this)`). Pour un nouveau type d\'inspection, on envoie un autre inspecteur : les modules ne changent pas.',
      roles: [['Visiteur (interface)', 'Visitor', 'une méthode visit(X x) par classe visitée'], ['Visiteur concret', 'TempsDePreparationVisitor', 'le traitement, accumule pendant les visites'], ['Élément visité', 'Commande', 'accept(Visitor v) { v.visit(this); }']],
      uml: { classes: [box('V', 'Visitor', 10, 10, [], ['+ visit(c : Commande) : void'], 'interface'), box('T', 'TempsDePreparationVisitor', 10, 160, ['- total : int', '- nombre : int'], ['+ visit(c : Commande) : void', '+ getMoyenne() : double']), box('C', 'Commande', 420, 10, [], ['+ accept(v : Visitor) : void', '+ getDureePreparation() : int'])],
        edges: [{ from: 'T', to: 'V', kind: 'realize' }, { from: 'C', to: 'V', kind: 'dep', label: 'accept' }] },
      seq: { actors: [{ id: 'm', label: ':Gestionnaire' }, { id: 'c', label: 'c:Commande' }, { id: 'v', label: 'v:TempsDePreparationVisitor' }], items: [{ frame: 'loop', guard: '[pour chaque commande]', items: [m('m', 'c', 'accept(v)'), m('c', 'v', 'visit(this)'), m('v', 'c', 'getDureePreparation()')] }, m('m', 'v', 'getMoyenne()')] },
      skeleton: 'public interface Visitor {\n    public void visit(Commande c);\n}\n\npublic class Commande {\n    public void accept(Visitor v) {\n        v.visit(this);          // UNE instruction : se présenter au visiteur\n    }\n}\n\npublic class TempsDePreparationVisitor implements Visitor {\n    private int total = 0, nombre = 0;\n    public void visit(Commande c) {\n        if (c.estPayee()) { total += c.getDureePreparation(); nombre++; }\n    }\n    public double getMoyenne() { return nombre == 0 ? 0 : (double) total / nombre; }\n}',
      cues: ['« parcourir des classes et effectuer un traitement sur leurs données »', '« séparation entre les algorithmes de traitement et les structures de données »', '« accept(Visitor v) … ne contiendra qu\'une seule instruction »'],
      mistakes: ['Écrire v.visit(c) ou this.visit(v) dans accept : c\'est v.visit(this).', 'Mettre le calcul dans Commande : il appartient au visiteur.', 'Division entière pour la moyenne (int / int).'],
    },
    {
      id: 'observateur', name: 'Observateur (Observer)', family: 'Comportement',
      problem: 'Quand un objet **change d\'état**, d\'autres objets doivent **être prévenus automatiquement**, sans que l\'objet observé connaisse leur classe exacte.',
      intention: 'Définir une dépendance un-à-plusieurs : quand le sujet observé change, tous ses observateurs inscrits sont notifiés (update).',
      image: 'Les voyants de la passerelle sont abonnés au réacteur. Quand il change de régime, il ne les appelle pas un par un par leur nom : il prévient « tous les abonnés ».',
      roles: [['Observable (sujet)', 'Observable, Lampe', 'liste d\'observateurs, addObserver, deleteObserver, setChanged, notifyObservers'], ['Observateur (interface)', 'Observer', 'update(Observable o, Object arg)'], ['Observateur concret', 'un afficheur de la lampe', 'réagit dans update']],
      uml: { classes: [box('Ob', 'Observable', 10, 10, ['- observateurs : List<Observer>', '- changed : boolean'], ['+ addObserver(o : Observer) : void', '+ deleteObserver(o : Observer) : void', '# setChanged() : void', '+ notifyObservers(arg : Object) : void']), box('I', 'Observer', 420, 10, [], ['+ update(o : Observable, arg : Object) : void'], 'interface'), box('L', 'Lampe', 10, 230, [], ['+ allumer() : void']), box('A', 'Afficheur', 420, 200, [], ['+ update(o : Observable, arg : Object) : void'])],
        edges: [{ from: 'Ob', to: 'I', kind: 'aggr', m1: '1', m2: '*' }, { from: 'L', to: 'Ob', kind: 'inherit' }, { from: 'A', to: 'I', kind: 'realize' }] },
      seq: { actors: [{ id: 'm', label: ':Main' }, { id: 'l', label: 'lampe:Lampe' }, { id: 'a', label: 'obs:Afficheur' }], items: [m('m', 'l', 'allumer()'), m('l', 'l', 'setChanged()'), m('l', 'l', 'notifyObservers("allumée")'), { frame: 'loop', guard: '[pour chaque observateur inscrit]', items: [m('l', 'a', 'update(this, "allumée")')] }] },
      skeleton: 'public interface Observer {\n    public void update(Observable o, Object arg);\n}\n\npublic class Observable {\n    private List<Observer> observateurs = new ArrayList<Observer>();\n    private boolean changed = false;\n    public void addObserver(Observer o)    { observateurs.add(o); }\n    public void deleteObserver(Observer o) { observateurs.remove(o); }\n    protected void setChanged()            { changed = true; }\n    public void notifyObservers(Object arg) {\n        if (changed) {\n            for (Observer o : observateurs) o.update(this, arg);\n            changed = false;\n        }\n    }\n}',
      cues: ['« être tenu informé d\'un changement survenu dans une autre partie »', '« des objets doivent pouvoir observer d\'autres objets »', 'addObserver, notifyObservers, update'],
      mistakes: ['Faire de Observer une classe : un objet déjà dans une hiérarchie ne pourrait plus observer (héritage simple).', 'Oublier de remettre changed à false après la notification.', 'Passer l\'observateur au lieu de this dans update.'],
    },
  ];

  const P = ['Singleton', 'Template Method', 'Fabrique', 'Adaptateur', 'Décorateur', 'Composite', 'Visiteur', 'Observateur', 'Strategy'];
  const drill = [
    { id: 'pp1', q: 'La station ne doit avoir qu\'un seul journal de bord, accessible depuis tous les modules.', c: P, a: 0, why: 'Instance unique + accès global : Singleton.' },
    { id: 'pp2', q: 'Un rapport suit toujours trois étapes (collecter, analyser, publier), mais chaque type de rapport les réalise à sa façon. L\'ordre ne doit jamais changer.', c: P, a: 1, why: 'Squelette fixe dans la mère (final), étapes dans les filles : Template Method.' },
    { id: 'pp3', q: 'Selon une chaîne lue dans un fichier (« cercle », « carré »), on veut obtenir l\'objet forme correspondant sans que le code appelant connaisse les classes concrètes.', c: P, a: 2, why: 'Création centralisée selon un paramètre, renvoi du type général : Fabrique.' },
    { id: 'pp4', q: 'Une bibliothèque existante calcule des distances avec des méthodes nommées autrement que celles de notre interface Point. On ne peut pas la modifier.', c: P, a: 3, why: 'Classe existante à brancher sur l\'interface attendue sans la modifier : Adaptateur.' },
    { id: 'pp5', q: 'Un café peut recevoir lait, sucre, chantilly, caramel, dans n\'importe quelle combinaison ; le prix s\'additionne.', c: P, a: 4, why: 'Options combinables qui s\'empilent autour d\'un objet de base : Décorateur.' },
    { id: 'pp6', q: 'Un dossier contient des fichiers et d\'autres dossiers ; on veut calculer la taille de n\'importe lequel de la même façon.', c: P, a: 5, why: 'Arborescence où groupe et élément simple se traitent pareil : Composite.' },
    { id: 'pp7', q: 'On veut calculer plusieurs statistiques différentes sur des commandes sans ajouter une méthode à Commande pour chaque statistique.', c: P, a: 6, why: 'Nouveaux traitements sans modifier les classes visitées : Visiteur.' },
    { id: 'pp8', q: 'Quand la température du réacteur change, trois écrans doivent se mettre à jour automatiquement.', c: P, a: 7, why: 'Notification automatique des abonnés : Observateur.' },
    { id: 'pp15', q: 'Un robot de maintenance passe du mode « économie » au mode « urgence » pendant sa ronde. On veut pouvoir ajouter d\'autres modes sans toucher à la classe Robot.', c: P, a: 8, why: 'Comportement interchangeable à l\'exécution, délégué à un objet référencé par un attribut : Strategy (TP 3).' },
    { id: 'pp9', q: 'Dans le Décorateur, VoitureAvecOption…', c: ['hérite de Voiture seulement', 'contient une Voiture seulement', 'hérite de Voiture ET contient une Voiture', 'implémente une interface Option'], a: 2, why: 'Elle doit être une Voiture (pour être décorée à son tour) et envelopper la voiture qu\'elle décore.' },
    { id: 'pp10', q: 'Dans le Composite, le tableau de FormeComplexe doit être de type…', c: ['Cercle[]', 'Forme[]', 'FormeComplexe[]', 'Object[]'], a: 1, why: 'Forme[] : il peut contenir des feuilles ET d\'autres composites.' },
    { id: 'pp11', q: 'Dans le Visiteur, la méthode accept(Visitor v) de Commande contient…', c: ['v.visit(this);', 'this.visit(v);', 'v.accept(this);', 'return v;'], a: 0, why: 'L\'objet visité se présente au visiteur : v.visit(this).' },
    { id: 'pp12', q: 'Dans l\'Adaptateur de A24, la classe Adaptatrice…', c: ['hérite de Monitoring', 'implémente InterfaceObjectif et compose Monitoring', 'est une interface', 'modifie Monitoring'], a: 1, why: 'Elle a la forme attendue (implements) et délègue à la classe existante (composition), comme le dit l\'énoncé.' },
    { id: 'pp13', q: 'Quel mot clé garantit, dans le Template Method, que le squelette ne sera pas modifié par les filles ?', c: ['static', 'abstract', 'final', 'private'], a: 2, why: 'final interdit la redéfinition de commander().' },
    { id: 'pp14', q: 'Dans le Singleton, pourquoi getInstance() est-elle static ?', c: ['Pour aller plus vite', 'Parce qu\'on n\'a aucun objet pour l\'appeler avant d\'avoir l\'instance', 'Pour pouvoir la redéfinir', 'Parce que le constructeur est privé'], a: 1, why: 'On l\'appelle par le nom de la classe : Panier.getInstance().' },
    { id: 'pp16', q: 'Strategy et Visitor (TP 3) : quelle phrase est juste ?', c: ['Les deux ajoutent des traitements sans modifier les classes visitées', 'Strategy change dynamiquement le comportement d\'UN objet ; Visitor ajoute des traitements sur un ensemble d\'objets sans modifier leurs classes', 'Strategy repose sur accept / visit', 'Visitor impose un attribut behavior'], a: 1, why: 'C\'est la distinction faite dans l\'énoncé du TP 3.' },
  ];

  O.data.patternLessons = { lessons, drill, families: ['Création', 'Structure', 'Comportement'] };
})(window);
