/**
 * exams.js — Sujets complets pour le Simulateur de saut (examens blancs).
 *
 * Un sujet : { id, title, duration (min), parts: [{ title, pts, minutes,
 *   intro: [textes], annex: 'animaux' | code | uml, questions: [...] }] }.
 * Une question : { n, q, pts, keys: [points de barème], answer (texte ou code),
 *   dossier?: id de dossier du Réacteur (correction calculée par le moteur),
 *   forge?: id d'exercice de la Forge (corrigé = sa solution), uml?: diagramme }.
 * Note sur 20 = somme des pts × (points de barème cochés / total).
 * Les barèmes par question sont des estimations (le sujet ne donne que le
 * total par partie) ; les corrigés sont rédigés par VEGA, pas par l'enseignant.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const ANIMAUX_UML = {
    classes: [
      { id: 'R', name: 'Restaurable', kind: 'interface', x: 420, y: 10, attrs: [], methods: ['+ manger()'] },
      { id: 'A', name: 'Animal', x: 170, y: 20, attrs: ['_- nombreAnimaux : int'], methods: ['+ manger()', '+ crier()'] },
      { id: 'V', name: 'Volable', kind: 'interface', x: 420, y: 180, attrs: [], methods: ['+ voler()'] },
      { id: 'C', name: 'Cheval', x: 20, y: 190, attrs: [], methods: ['+ crier()'] },
      { id: 'B', name: 'Albatros', x: 230, y: 190, attrs: [], methods: ['+ manger()', '+ crier()', '+ voler()'] },
    ],
    edges: [
      { from: 'A', to: 'R', kind: 'realize' }, { from: 'C', to: 'A', kind: 'inherit' },
      { from: 'B', to: 'A', kind: 'inherit' }, { from: 'B', to: 'V', kind: 'realize' },
    ],
  };
  const ANIMAUX_CODE = '// Animal\npublic static int nombreAnimaux = 0;\npublic void manger() { System.out.println("Un animal mange"); }\npublic void crier()  { System.out.println("Un animal émet un cri"); }\n\n// Cheval\npublic void crier() {\n    super.crier();\n    System.out.println("... le cheval hennit.");\n}\n\n// Albatros\npublic void manger() { System.out.println("Un albatros mange du krill."); }\npublic void crier() {\n    super.crier();\n    System.out.println("... l\'albatros piaule.");\n}\npublic void voler() { System.out.println("L\'albatros plane"); }';

  const Q_REDEF = { n: 'I.1', q: 'Expliquez précisément ce qu\'est la redéfinition d\'une méthode. Identifiez un exemple sur le diagramme de classes.', pts: 1.5,
    keys: ['Classe fille, méthode héritée', 'Même nom, même signature, même type de retour', 'Spécialise le comportement ; choisie à l\'exécution', 'Exemple : crier() dans Cheval / Albatros (ou manger() dans Albatros)'],
    answer: 'Redéfinir une méthode, c\'est réécrire dans une classe fille une méthode héritée de la classe mère, avec le même nom, la même signature et le même type de retour, pour spécialiser son comportement. La version exécutée est choisie à l\'exécution selon le type dynamique (liaison dynamique). Exemple : crier() de Animal est redéfinie dans Cheval et Albatros ; manger() est redéfinie dans Albatros.' };
  const Q_VOLABLE = { n: 'I.2', q: 'Quelle est la nature de la relation entre Albatros et Volable et ce que cela implique ?', pts: 1.5,
    keys: ['Réalisation : Albatros implémente l\'interface Volable', 'Obligation de fournir le code de voler()', 'Un Albatros est aussi de type Volable (référence Volable possible)'],
    answer: 'Relation de réalisation : Albatros implémente (implements) l\'interface Volable. Albatros doit fournir le code de voler() (sinon elle serait abstraite). Tout Albatros est aussi de type Volable et peut être manipulé via une référence Volable.' };
  const Q_STATIC = { n: 'I.3', q: 'Comment interpréter l\'attribut nombreAnimaux de Animal ?', pts: 1,
    keys: ['Souligné = statique (attribut de classe)', 'Une seule valeur partagée par toutes les instances', 'Usage : compter les animaux créés'],
    answer: 'nombreAnimaux est souligné : c\'est un attribut statique (de classe). Il n\'en existe qu\'un exemplaire, partagé par tous les objets Animal (et ses sous-classes). Il sert à compter le nombre d\'animaux instanciés (incrémenté dans le constructeur).' };

  O.data.exams = [
    {
      id: 'X-A25', title: 'Médian A25', duration: 90,
      parts: [
        {
          title: 'I. Questions de cours', pts: 9, minutes: 35, annex: 'animaux',
          intro: ['En vous appuyant sur le diagramme de classes ci-dessous (annexe A).'],
          questions: [
            { n: 'I.1', q: 'Quelle est la nature de la relation entre Animal et Restaurable et ce que cela implique ?', pts: 1,
              keys: ['Réalisation : Animal implémente Restaurable', 'Animal doit implémenter manger()', 'Animal et ses sous-classes sont de type Restaurable'],
              answer: 'Animal implémente l\'interface Restaurable (réalisation, flèche pointillée). Animal doit donc fournir le code de manger(). Tout Animal, et donc tout Cheval et tout Albatros, est aussi de type Restaurable et peut être manipulé par une référence Restaurable.' },
            { n: 'I.2', q: Q_REDEF.q, pts: 1, keys: Q_REDEF.keys, answer: Q_REDEF.answer },
            { n: 'I.3', q: 'Pour chaque cas (code ci-dessous), indiquez si la compilation s\'effectue, si l\'exécution s\'effectue et l\'affichage produit. En cas de problème à la compilation, modifiez la ligne.', pts: 3.5, dossier: 'A25',
              keys: ['Cas 1 : compile, affichages des deux boucles dans l\'ordre', 'Cas 2 : erreur de compilation, correction (Cheval) liste[1]', 'Cas 3 : ClassCastException', 'Cas 4 : erreur de compilation, correction (Volable) liste[2], puis L\'albatros plane', 'Cas 5 : compile, les deux lignes du cheval'] },
            { n: 'I.4', q: 'En quoi le cas 5 reflète-t-il un exemple de polymorphisme ?', pts: 1,
              keys: ['Type statique Animal, type dynamique Cheval', 'Compile car crier() existe dans Animal', 'Liaison dynamique : version de Cheval exécutée'],
              answer: 'animal1 est déclarée Animal mais référence un Cheval. L\'appel crier() compile car la méthode existe dans Animal ; à l\'exécution, la liaison dynamique choisit la version redéfinie dans Cheval, type effectif de l\'objet : « Un animal émet un cri » puis « ... le cheval hennit. ». Une même opération s\'applique différemment selon la classe de l\'objet : c\'est le polymorphisme.' },
            { n: 'I.5', q: 'Cheval c1, c2; c1=new Cheval(); c2=new Cheval(); c1=c2; — À la fin, la zone mémoire du 1er cheval est-elle remplacée par le contenu du 2nd ? Justifiez.', pts: 1,
              keys: ['Non', 'c1 = c2 copie la référence', 'Les deux références désignent le 2nd cheval', 'Le 1er n\'est plus référencé, libéré par le garbage collector'],
              answer: 'Non. c1 et c2 sont des références : c1 = c2 copie la référence, pas le contenu. Les deux désignent le second cheval. Le premier n\'est pas écrasé ; il n\'est plus référencé et sera libéré par le garbage collector.' },
            { n: 'I.6', q: 'L\'albatros royal dérive de Albatros. Donnez la déclaration de la classe AlbatrosRoyal choisie non dérivable.', pts: 0.5,
              keys: ['public final class AlbatrosRoyal extends Albatros'], answer: 'public final class AlbatrosRoyal extends Albatros {\n}' },
            { n: 'I.7', q: 'Quels sont les types de l\'objet liste[1] ?', pts: 0.5,
              keys: ['Cheval', 'Animal', 'Restaurable', 'Object'], answer: 'liste[1] est un Cheval : il est de type Cheval, Animal, Restaurable (implémentée par Animal) et Object.' },
            { n: 'I.8', q: 'Est-il vrai que tous les objets de type Animal ont leur propre valeur de l\'attribut nombreAnimaux ? Justifiez.', pts: 0.5,
              keys: ['Non', 'Attribut statique (souligné) : une seule valeur partagée'], answer: Q_STATIC.answer },
          ],
        },
        {
          title: 'II. UML — Diagramme de classes — Fnac', pts: 3, minutes: 20,
          intro: ['Énoncé complet dans le Bureau des plans (plan « La boutique Fnac »).'],
          questions: [
            { n: 'II.1', q: 'Donnez le diagramme de classes pour ce contexte (sans getters/setters, constructeurs ni énumérations ; seulement les méthodes utiles).', pts: 3, plan: 'p-fnac',
              keys: ['Article abstraite + calculerPrix() abstraite, 3 sous-classes', 'Client abstraite + 2 sous-classes', 'Composition Panier — Article avec multiplicités', 'Association Client — Panier', 'Méthodes du panier et attributs typés'] },
          ],
        },
        {
          title: 'III. Production de code — Patrons de conception', pts: 8, minutes: 35,
          intro: ['Template Method : la commande, en boutique ou en ligne, suit toujours deux étapes : 1. payer les articles ; 2. livrer les articles. La méthode commander de Commande propose le squelette et ne doit pas être redéfinie ; payer et livrer (void, sans paramètre, un affichage) sont implémentées dans EnBoutique et EnLigne. Le main de l\'annexe B crée une EnBoutique puis une EnLigne et appelle commander() sur une référence Commande.', 'Singleton : on doit garantir à chaque instant l\'unicité d\'une instance de Panier.'],
          questions: [
            { n: 'III.1', q: 'Donnez le code Java de la classe Commande.', pts: 2.5, forge: 'template',
              keys: ['abstract class Commande', 'commander() final qui appelle payer() puis livrer()', 'payer() et livrer() abstraites', 'main conforme à l\'annexe B'] },
            { n: 'III.2', q: 'Donnez le code Java des classes dérivées EnBoutique et EnLigne.', pts: 2,
              keys: ['extends Commande', 'payer() et livrer() implémentées dans chacune', 'Affichages de l\'annexe B'],
              answer: 'public class EnBoutique extends Commande {\n    protected void payer() {\n        System.out.println("A la boutique, je paie en espèces ou avec ma carte bancaire.");\n    }\n    protected void livrer() {\n        System.out.println("Puis, je récupère mes achats au retrait des marchandises.");\n    }\n}\n\npublic class EnLigne extends Commande {\n    protected void payer() {\n        System.out.println("En ligne, je paie avec mon compte Paypal ou avec ma carte bancaire.");\n    }\n    protected void livrer() {\n        System.out.println("Puis, je précise mon adresse de livraison.");\n    }\n}' },
            { n: 'III.3', q: 'Ce patron répond au principe d\'Hollywood « Ne nous appelez pas, on vous rappellera ! ». Qu\'en pensez-vous ?', pts: 1,
              keys: ['Oui', 'La mère (commander) rappelle les méthodes des filles', 'Inversion de contrôle, liaison dynamique'],
              answer: 'C\'est exact : la méthode commander(), définie (final) dans la classe mère, contrôle l\'enchaînement et « rappelle » payer() et livrer() implémentées dans les filles. Les filles ne font que fournir les étapes ; elles n\'appellent pas la mère. La liaison dynamique choisit l\'implémentation selon le type réel de la commande.' },
            { n: 'III.4', q: 'Rappelez les caractéristiques du Singleton.', pts: 1,
              keys: ['Constructeur privé', 'Attribut privé et statique référençant l\'instance (null au départ)', 'Méthode publique statique qui crée si besoin et renvoie l\'instance'],
              answer: 'Une seule instance garantie : 1) constructeur privé ; 2) attribut privé et statique référençant l\'unique instance, initialisé à null ; 3) méthode publique et statique getInstance() qui crée l\'instance si elle n\'existe pas encore puis la renvoie.' },
            { n: 'III.5', q: 'Donnez le code de la classe Panier (uniquement ce qui concerne le Singleton).', pts: 1.5, forge: 'singleton',
              keys: ['private static Panier instance = null', 'private Panier()', 'public static Panier getInstance() avec test null'] },
          ],
        },
      ],
    },
    {
      id: 'X-A24', title: 'Médian A24', duration: 90,
      parts: [
        {
          title: 'I. Questions de cours', pts: 5, minutes: 20,
          questions: [
            { n: 'I.1', q: 'Java est-il un langage compilé, interprété ou les deux ? Justifiez.', pts: 0.75, card: 'f-compil' },
            { n: 'I.2', q: 'Quelle est l\'obligation pour une classe qui implémente une interface ? Qu\'en est-il de cette classe si cette obligation n\'est pas respectée ?', pts: 0.75, card: 'f-iface' },
            { n: 'I.3', q: 'Expliquez précisément ce qu\'est la redéfinition d\'une méthode.', pts: 0.75, card: 'f-redef' },
            { n: 'I.4', q: 'Quelle est l\'utilité des mots clés super et this ?', pts: 0.75, card: 'f-superthis' },
            { n: 'I.5', q: 'Comment interdire la dérivation d\'une classe ainsi que la redéfinition d\'une méthode ? Exemple avec Vehicule, Voiture et rouler.', pts: 0.75, card: 'f-final' },
            { n: 'I.6', q: 'Point a,b; a=new Point(3,5); b=new Point(2,0); a=b; — a et b désignent-ils le même objet ou deux objets différents ? Justifiez.', pts: 0.5, card: 'f-refs' },
            { n: 'I.7', q: 'Quels sont les outils du JDK qui permettent de compiler, d\'exécuter et de documenter une classe Java ?', pts: 0.75, card: 'f-jdk' },
          ],
        },
        {
          title: 'II. UML — Diagramme de classes — HelloMoving', pts: 6, minutes: 30,
          intro: ['Énoncé complet dans le Bureau des plans (plan « HelloMoving »).'],
          questions: [
            { n: 'II.1', q: 'Donnez le diagramme de classes de HelloMoving (sans getters/setters ni constructeurs).', pts: 6, plan: 'p-hello',
              keys: ['Composition HelloMoving — Client', 'Agrégation(s) vers Vehicule', 'Vehicule abstraite + Velo/Voiture', 'Paiement extensible', 'Associations Client — Vehicule (0..1) et Client — Paiement (*)', 'Méthodes et multiplicités'] },
          ],
        },
        {
          title: 'III. Fabrique, Singleton, Adaptateur', pts: 9, minutes: 40,
          intro: ['FabriqueVehicule : unique (Singleton) ; public Vehicule createVehicule(String typeV) crée un Velo pour "vélo", une Voiture pour "voiture" (equals). Constructeurs par défaut de Velo et Voiture.', 'Adaptateur : InterfaceObjectif (public record(Vehicule o)) ; Adaptatrice implémente l\'interface et compose Monitoring (recordTirePressure, recordUnlockMechanism pour tous ; recordAntiBlockSystemEfficiency, recordPowerSteering pour les voitures).'],
          questions: [
            { n: 'III.1', q: 'Donnez le code de la méthode public Vehicule createVehicule(String typeV).', pts: 1.5,
              keys: ['Prototype exact', 'equals pour comparer', 'return new Velo() / new Voiture()', 'Cas par défaut (null)'],
              answer: 'public Vehicule createVehicule(String typeV) {\n    if (typeV.equals("vélo")) {\n        return new Velo();\n    } else if (typeV.equals("voiture")) {\n        return new Voiture();\n    }\n    return null;\n}' },
            { n: 'III.2', q: 'Donnez le code de la classe FabriqueVehicule (sans réécrire createVehicule).', pts: 2, forge: 'fabrique',
              keys: ['private static FabriqueVehicule instance = null', 'Constructeur privé', 'public static getInstance() avec test null'] },
            { n: 'III.3', q: 'Donnez le main de TestMaintenance : instancie la fabrique, crée un vélo et une voiture dans des variables Vehicule, appelle recordEvent sur chacun.', pts: 1.5,
              keys: ['FabriqueVehicule.getInstance()', 'Deux variables de type Vehicule', 'recordEvent() sur chacune'],
              answer: 'public class TestMaintenance {\n    public static void main(String[] args) {\n        FabriqueVehicule fabrique = FabriqueVehicule.getInstance();\n        Vehicule v1 = fabrique.createVehicule("vélo");\n        Vehicule v2 = fabrique.createVehicule("voiture");\n        v1.recordEvent();\n        v2.recordEvent();\n    }\n}' },
            { n: 'III.4', q: 'Quel est le principe fondamental de la POO qui fait que l\'appel de recordEvent donne le résultat attendu ?', pts: 1, card: 'f-poly' },
            { n: 'III.5', q: 'Donnez le diagramme de classes incluant uniquement Monitoring, InterfaceObjectif et Adaptatrice.', pts: 1,
              keys: ['InterfaceObjectif «interface» avec record', 'Adaptatrice ⇢▷ InterfaceObjectif', 'Adaptatrice ◆— Monitoring (composition)'],
              uml: { classes: [
                { id: 'I', name: 'InterfaceObjectif', kind: 'interface', x: 10, y: 10, attrs: [], methods: ['+ record(o : Vehicule) : void'] },
                { id: 'A', name: 'Adaptatrice', x: 10, y: 170, attrs: ['- monitoring : Monitoring'], methods: ['+ record(o : Vehicule) : void'] },
                { id: 'M', name: 'Monitoring', x: 360, y: 150, attrs: [], methods: ['+ recordTirePressure() : void', '+ recordUnlockMechanism() : void', '+ recordAntiBlockSystemEfficiency() : void', '+ recordPowerSteering() : void'] }],
                edges: [{ from: 'A', to: 'I', kind: 'realize' }, { from: 'A', to: 'M', kind: 'comp', m1: '1', m2: '1' }] } },
            { n: 'III.6', q: 'Donnez le code de la classe Adaptatrice.', pts: 2, forge: 'adaptateur',
              keys: ['implements InterfaceObjectif', 'Attribut Monitoring', 'Délégation des mesures communes', 'instanceof Voiture pour les mesures spécifiques'] },
          ],
        },
      ],
    },
    {
      id: 'X-A23', title: 'Médian A23', duration: 90,
      parts: [
        {
          title: 'I. Questions de cours', pts: 9, minutes: 35, annex: 'animaux',
          questions: [
            Q_REDEF, Q_VOLABLE, Q_STATIC,
            { n: 'I.4', q: 'Étudiez les 9 cas du main de Animal : compilation, exécution, affichage. En cas de problème à la compilation, modifiez la ligne.', pts: 5, dossier: 'A23',
              keys: ['Cas 1-3 : affichages exacts (dont super.crier())', 'Cas 4 : erreur de compilation + (Cheval) animal3', 'Cas 5 : ClassCastException', 'Cas 6-7 : liaison dynamique via Restaurable', 'Cas 8 : erreur de compilation + (Volable), puis L\'albatros plane', 'Cas 9 : erreur de compilation + (Restaurable) v, puis « r est du type Volable »'] },
          ],
        },
        {
          title: 'II. UML — Diagramme de classes — Ykea', pts: 4, minutes: 20,
          questions: [
            { n: 'II.1', q: 'Donnez le diagramme de classes du site Ykea.', pts: 4, plan: 'p-ykea',
              keys: ['Article + 3 sous-classes', 'Client abstraite + 2 sous-classes (extension)', 'Panier — Article justifié', 'Client — Panier', 'Méthodes et attributs typés'] },
          ],
        },
        {
          title: 'III. Production de code — Template Method', pts: 7, minutes: 35,
          intro: ['Classe abstraite Commande, méthode commander (squelette : payer puis livrer) non redéfinissable ; classes dérivées Boutique et EnLigne ; toutes les méthodes void, sans paramètre, un affichage (annexe B).'],
          questions: [
            { n: 'III.1', q: 'Donnez le code Java de la classe Commande.', pts: 3, forge: 'template', keys: ['abstract class', 'commander final', 'payer/livrer abstraites', 'main'] },
            { n: 'III.2', q: 'Donnez le code Java des classes dérivées Boutique et EnLigne.', pts: 3, keys: ['extends Commande', 'Les deux étapes dans chaque classe', 'Affichages de l\'annexe'],
              answer: 'public class Boutique extends Commande {\n    protected void payer() { System.out.println("A la boutique, je paie en espèces ou avec ma carte bancaire."); }\n    protected void livrer() { System.out.println("Puis, je récupère mes achats au retrait des marchandises."); }\n}\npublic class EnLigne extends Commande {\n    protected void payer() { System.out.println("En ligne, je paie avec mon compte Paypal ou avec ma carte bancaire."); }\n    protected void livrer() { System.out.println("Puis, je précise mon adresse de livraison."); }\n}' },
            { n: 'III.3', q: 'Principe d\'Hollywood : qu\'en pensez-vous ?', pts: 1, card: 'f-hollywood' },
          ],
        },
      ],
    },
    {
      id: 'X-A22', title: 'Médian A22', duration: 90,
      parts: [
        {
          title: 'I. Questions de cours (~35 %)', pts: 7, minutes: 30, annex: 'animaux',
          questions: [
            { ...Q_REDEF, pts: 1 }, { ...Q_VOLABLE, pts: 1 }, { ...Q_STATIC, pts: 1 },
            { n: 'I.4', q: 'Les 9 cas du main de Animal (identiques à A23).', pts: 4, dossier: 'A23', keys: ['Cas 1-3', 'Cas 4-5', 'Cas 6-7', 'Cas 8-9 avec corrections'] },
          ],
        },
        {
          title: 'II. UML — Cas d\'utilisation (~35 %)', pts: 7, minutes: 25,
          intro: ['Application d\'achat de voiture en ligne. Le client configure son véhicule (motorisation, couleur) et peut ajouter des options (GPS, arrêt à distance, peinture métallisée, Internet, streaming). Il ajoute le véhicule au panier, puis continue ses achats ou paie. Paiement par chèque ou par virement ; le virement nécessite la saisie des données d\'une carte bancaire. Lors du paiement, il choisit l\'adresse de livraison (domicile ou concession). Pour payer, il doit se connecter ; la création d\'un compte fait partie des attendus.'],
          questions: [
            { n: 'II.1', q: 'Proposez un diagramme des cas d\'utilisation pour cette application.', pts: 7,
              keys: ['Acteur Client (et éventuellement Banque en secondaire), système nommé', 'Configurer le véhicule ; Ajouter une option en «extend»', 'Ajouter au panier ; Payer', 'Payer «include» Se connecter ; Payer «include» Choisir l\'adresse de livraison', 'Généralisation Payer ← Payer par chèque / Payer par virement', 'Payer par virement «include» Saisir les données de carte', 'Créer un compte'],
              answer: 'Acteur : Client (+ Service bancaire éventuel). Système : « Achat de voiture en ligne ».\nCas : Créer un compte ; Se connecter ; Configurer son véhicule ; Ajouter une option (extend → Configurer son véhicule) ; Ajouter au panier ; Payer ; Choisir l\'adresse de livraison.\nRelations : Payer «include» Se connecter ; Payer «include» Choisir l\'adresse de livraison ; Payer par chèque et Payer par virement spécialisent Payer (généralisation) ; Payer par virement «include» Saisir les données de carte bancaire.' },
          ],
        },
        {
          title: 'III. Production de code — Décorateur (~30 %)', pts: 6, minutes: 35,
          intro: ['Voiture (annexe B) : prixBase = 10000, prix, couleur, typeMotorisation ; constructeur Voiture(String couleur, String typeMotorisation) ; getPrix() ; toString(). VoitureAvecOption hérite de Voiture, possède une référence sur une Voiture, une description (String) et un prix (int). Exemple : v1 = new VoitureAvecOption(v1, "avec gps", 500);'],
          questions: [
            { n: 'III.1', q: 'Complétez le diagramme de classes (Voiture + VoitureAvecOption).', pts: 2,
              keys: ['VoitureAvecOption hérite de Voiture', 'Association de VoitureAvecOption vers Voiture (multiplicité 1)', 'Attributs et méthodes redéfinies'],
              uml: { classes: [
                { id: 'V', name: 'Voiture', x: 10, y: 10, attrs: ['- prixBase : int', '- prix : int', '- couleur : String', '- typeMotorisation : String'], methods: ['+ getPrix() : int', '+ toString() : String'] },
                { id: 'O', name: 'VoitureAvecOption', x: 10, y: 230, attrs: ['- voiture : Voiture', '- description : String', '- prixOption : int'], methods: ['+ getPrix() : int', '+ toString() : String'] }],
                edges: [{ from: 'O', to: 'V', kind: 'inherit', off: -40 }, { from: 'O', to: 'V', kind: 'navig', m2: '1', off: 40 }] } },
            { n: 'III.2', q: 'Donnez le code de VoitureAvecOption : attributs, constructeur, getPrix() et toString() redéfinies.', pts: 4, forge: 'decorateur',
              keys: ['extends Voiture + attribut Voiture', 'Constructeur avec super(...) explicite', 'getPrix = voiture.getPrix() + prix option', 'toString = voiture.toString() + option'] },
          ],
        },
      ],
    },
    {
      id: 'X-A21', title: 'Médian A21', duration: 90,
      parts: [
        {
          title: 'I. Questions de cours (~20 %)', pts: 4, minutes: 20,
          intro: ['Animal.courir() affiche « L\'animal court. » ; Cheval extends Animal et redéfinit courir() : « Le cheval court. »'],
          questions: [
            { n: 'I.1', q: 'Expliquez la notion de membre statique et modifiez Animal pour compter le nombre d\'objets à chaque instanciation.', pts: 1, forge: 'static-compteur', keys: ['Définition (membre de classe partagé)', 'Attribut static', 'Incrément dans le constructeur'] },
            { n: 'I.2', q: 'Expliquez précisément ce qu\'est la surcharge d\'une méthode.', pts: 0.5, card: 'f-surch' },
            { n: 'I.3', q: 'Expliquez précisément ce qu\'est la redéfinition d\'une méthode.', pts: 0.5, card: 'f-redef' },
            { n: 'I.4', q: 'Pourquoi main est-elle static, et à quoi sert args ?', pts: 0.5, card: 'f-main' },
            { n: 'I.5', q: 'Pour chaque ligne : compilation, exécution, affichage. Corrigez en cas d\'erreur de compilation.', pts: 1.5, dossier: 'A21', keys: ['Lignes 1-6 justes', 'Ligne 7 : erreur + transtypage, ligne 8 : Le cheval court.', 'Ligne 10 : ClassCastException'] },
          ],
        },
        {
          title: 'II. Cas d\'utilisation — bibliothèque (~20 %)', pts: 4, minutes: 15,
          intro: ['Trois utilisateurs : bibliothécaire (ajouter / supprimer un livre ; enregistrer / modifier un prêt), responsable des adhérents (enregistrer / supprimer un adhérent, gérer un retard, qui peut éventuellement donner lieu à l\'envoi d\'un courriel), responsable du personnel (enregistrer un personnel, modifier son statut). Pour toute gestion, l\'utilisateur doit systématiquement s\'identifier.'],
          questions: [
            { n: 'II.1', q: 'Proposez un diagramme des cas d\'utilisation.', pts: 4,
              keys: ['Trois acteurs', 'Cas : Gérer les livres, Gérer les prêts, Gérer les adhérents, Gérer le personnel (ou cas détaillés)', 'Chaque gestion «include» S\'identifier', 'Envoyer un courriel «extend» Gérer un retard'],
              answer: 'Acteurs : Bibliothécaire, Responsable adhérents, Responsable personnel. Cas : Gérer les livres (ajouter, supprimer), Gérer les prêts (enregistrer, modifier), Gérer les adhérents (enregistrer, supprimer), Gérer un retard, Gérer le personnel (enregistrer, modifier le statut). Chaque cas de gestion «include» S\'identifier. Envoyer un courriel «extend» Gérer un retard.' },
          ],
        },
        {
          title: 'III. UML → Java (~20 %)', pts: 4, minutes: 15,
          intro: ['Pour chaque diagramme, donnez le code Java des classes en gras (signatures seulement pour les méthodes). Entraînement complet : Bureau des plans, onglet « Traduction UML ⇄ Java » (diagrammes 1 à 8).'],
          questions: [
            { n: 'III.1', q: 'Diagrammes 1 à 8 (Personne, Empruntable, Adherent, Fichier/Affichable/Imprimable, A→B (1), A→B (*), Joueur, Partie).', pts: 4,
              keys: ['Visibilités + - # traduites', 'interface et implements', 'extends', 'Associations traduites en attributs (B b / tableau ou List de B)'],
              answer: 'public class Personne { public String surnom; private String nom; private String prenom; protected Date dateNaissance; public int calculerAge() {...} }\npublic interface Empruntable { public double calculerMensualitePret(); }\npublic class Adherent extends Personne { private int numAdh; }\npublic class Fichier implements Affichable, Imprimable { public void afficher() {...} public void imprimer() {...} }\npublic class A { private B b; }            // multiplicité 1\npublic class A { private B[] lesB; }        // multiplicité * (ou List<B>)\npublic class Joueur { private String nom; protected Date dateNaissance; public void jouer() {...} }\npublic class Partie { public void distribuerCartes() {...} }' },
          ],
        },
        {
          title: 'IV. Patron Composite (~40 %)', pts: 8, minutes: 40,
          intro: ['Forme (interface, surface()), Cercle (centreX, centreY, rayon), FormeComplexe composée de Forme, sans collection Java, avec un compteur cptDeForme.'],
          questions: [
            { n: 'IV.1', q: 'Diagramme de classes du patron appliqué aux formes.', pts: 1, keys: ['Forme «interface»', 'Cercle (et autres formes) ⇢▷ Forme', 'FormeComplexe ⇢▷ Forme ET agrège * Forme'],
              uml: { classes: [
                { id: 'F', name: 'Forme', kind: 'interface', x: 170, y: 10, attrs: [], methods: ['+ surface() : double'] },
                { id: 'C', name: 'Cercle', x: 10, y: 160, attrs: ['- centreX : double', '- centreY : double', '- rayon : double'], methods: ['+ surface() : double'] },
                { id: 'X', name: 'FormeComplexe', x: 300, y: 160, attrs: ['- formes : Forme[]', '- cptDeForme : int'], methods: ['+ surface() : double', '+ ajouterForme(f : Forme) : boolean'] }],
                edges: [{ from: 'C', to: 'F', kind: 'realize' }, { from: 'X', to: 'F', kind: 'realize', off: -30 }, { from: 'X', to: 'F', kind: 'aggr', m1: '1', m2: '*', off: 30 }] } },
            { n: 'IV.2', q: 'Code de l\'interface Forme.', pts: 0.5, keys: ['public interface Forme { public double surface(); }'], answer: 'public interface Forme {\n    public double surface();\n}' },
            { n: 'IV.3-5', q: 'Classe Cercle : implémentation de l\'interface, constructeur, toString(), equals(Object o).', pts: 2.5, forge: 'equals', keys: ['implements Forme + surface()', 'Constructeur', 'toString', 'equals(Object) avec instanceof'] },
            { n: 'IV.6', q: 'Classe FormeComplexe (constructeur, interface, ajouterForme, estVide, retirerPremiereForme, retirerDernièreForme).', pts: 4, forge: 'composite', keys: ['Tableau Forme[] + cptDeForme', 'surface() récursive', 'ajouterForme borné', 'estVide', 'retirer première (décalage) et dernière'] },
          ],
        },
      ],
    },
  ];

  O.data.annexes = { animaux: { uml: ANIMAUX_UML, code: ANIMAUX_CODE } };
})(window);
