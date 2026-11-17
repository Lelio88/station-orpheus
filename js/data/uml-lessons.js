/**
 * uml-lessons.js — Leçon de notation UML (onglet « Apprendre la notation »).
 *
 *  entries : dictionnaire visuel. Chaque entrée = un élément de notation
 *            dessiné (diagramme pour uml-render.js), son sens, le code Java
 *            qui lui correspond, les mots de l'énoncé qui doivent y faire
 *            penser, et le piège associé.
 *  drill   : QCM d'entraînement (reconnaître un dessin, choisir le bon
 *            dessin, lire une multiplicité, trouver le sens d'une flèche).
 *  traps   : pièges classiques des copies.
 * Notation alignée sur le cours « Modélisation de la structure logique »
 * (cours 2 de LO02) : + - # ~, souligné = statique, italique = abstrait.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  const box = (id, name, x, y, attrs, methods, kind) => ({ id, name, x, y, attrs: attrs || [], methods: methods || [], kind });
  const pair = (a, b, edge, opts) => {
    const o = opts || {};
    return {
      classes: [box('A', a, 10, o.vertical ? 140 : 10, o.aAttrs, o.aMeth, o.aKind), box('B', b, o.vertical ? 10 : 290, 10, o.bAttrs, o.bMeth, o.bKind)],
      edges: [{ from: 'A', to: 'B', ...edge }],
    };
  };

  const entries = [
    {
      id: 'classe', group: 'Les classes', title: 'Anatomie d\'une classe',
      d: { classes: [box('V', 'Voiture', 10, 10, ['- vitesse : int', '# marque : String', '_+ nombreDeVoitures : int'], ['+ rouler(km : int) : void', '+ getVitesse() : int', '~ reviser() : void'])] },
      meaning: [
        'Trois compartiments : **nom** (en haut, centré, majuscule), **attributs**, **méthodes**.',
        'Attribut : `visibilité nom : Type` → `- vitesse : int`. Le type vient **après** les deux-points, c\'est l\'inverse de Java.',
        'Méthode : `visibilité nom(param : Type) : TypeRetour` → `+ rouler(km : int) : void`.',
        'Visibilité : `+` public, `-` private, `#` protected (visible des sous-classes), `~` paquetage.',
        'Membre **souligné** = `static` (membre de classe, un seul exemplaire partagé).',
      ],
      java: 'public class Voiture {\n    private int vitesse;\n    protected String marque;\n    public static int nombreDeVoitures;\n\n    public void rouler(int km) { ... }\n    public int getVitesse() { ... }\n    void reviser() { ... }           // ~ : pas de mot clé (paquetage)\n}',
      cue: 'Les sujets disent « Vous omettrez les getters/setters et les constructeurs » : ne les écris pas, tu perdrais du temps.',
      trap: 'Écrire `int vitesse` (syntaxe Java) au lieu de `vitesse : int`. Oublier la visibilité. Oublier de souligner un attribut statique (compteur, instance du Singleton).',
    },
    {
      id: 'abstraite', group: 'Les classes', title: 'Classe et méthode abstraites',
      d: { classes: [box('V', 'Vehicule', 10, 10, ['- distanceParcourue : int'], ['*+ rouler() : void', '+ faireLePlein() : void'], 'abstract')] },
      meaning: [
        'Le **nom en italique** indique une classe abstraite (sur copie, ajoute «abstract» au-dessus du nom : l\'italique manuscrit ne se voit pas).',
        'Une **méthode en italique** est abstraite : pas de code ici, les classes filles l\'implémentent.',
        'Une classe avec au moins une méthode abstraite est abstraite. Elle ne s\'instancie pas.',
      ],
      java: 'public abstract class Vehicule {\n    private int distanceParcourue;\n    public abstract void rouler();          // point-virgule, pas d\'accolades\n    public void faireLePlein() { ... }\n}',
      cue: '« le calcul … dépend du type, laissé à la charge de chaque type » ; « nous distinguons trois types de … » sans objet du type général.',
      trap: 'Sur papier, l\'italique est illisible : écris «abstract» au-dessus du nom et souligne-le d\'un trait ondulé, ou ajoute {abstract} après la méthode.',
    },
    {
      id: 'interface', group: 'Les classes', title: 'Interface',
      d: { classes: [box('P', 'Pilotable', 10, 10, [], ['+ accelerer() : void', '+ ralentir() : void'], 'interface')] },
      meaning: [
        'Le stéréotype **«interface»** au-dessus du nom.',
        'Seulement des signatures de méthodes (et éventuellement des constantes). Pas d\'attributs d\'instance.',
        'Nom souvent en *-able* : Pilotable, Restaurable, Volable, Reparable.',
      ],
      java: 'public interface Pilotable {\n    public void accelerer();\n    public void ralentir();\n}',
      cue: '« une capacité commune à des classes sans lien d\'héritage » ; « tout objet réparable propose reparer() ».',
      trap: 'Mettre des attributs dans une interface, ou relier une interface à ses classes par un trait plein (c\'est un pointillé).',
    },
    {
      id: 'enum', group: 'Les classes', title: 'Énumération',
      d: { classes: [box('C', 'Couleur', 10, 10, ['PIQUE', 'COEUR', 'CARREAU', 'TREFLE'], [], 'enum')] },
      meaning: [
        'Stéréotype **«enumeration»** (ou «enum»), et la liste des valeurs dans le compartiment des attributs, sans type ni visibilité.',
        'On s\'en sert ensuite comme **type d\'attribut** : `- couleur : Couleur`.',
        'Les sujets disent souvent « Vous omettrez les énumérations » : on ne les dessine pas, mais on les utilise comme types.',
      ],
      java: 'public enum Couleur {\n    PIQUE, COEUR, CARREAU, TREFLE\n}',
      cue: '« caractérisé par son état (neuf, reconditionné) » : une liste fermée de valeurs.',
      trap: 'Relier l\'énumération à la classe par une association : inutile, l\'attribut typé suffit.',
    },
    {
      id: 'dependance', group: 'Les relations', title: 'Dépendance',
      d: pair('Voiture', 'Date', { kind: 'dep' }, { aMeth: ['+ changerConducteur(c : Personne, d : Date)'] }),
      meaning: [
        '**Pointillé + flèche ouverte** (deux petits traits, pas de triangle) vers la classe utilisée.',
        'Utilisation **ponctuelle** : la classe apparaît comme paramètre ou variable locale d\'une méthode, **pas comme attribut**.',
        'La plus faible des relations. Le cours dit qu\'on l\'omet souvent pour alléger le diagramme.',
      ],
      java: 'public class Voiture {\n    // aucun attribut de type Date\n    public void changerConducteur(Personne c, Date d) { ... }\n}',
      cue: '« à un instant donné, a besoin de … pour effectuer … » ; une classe reçue seulement en paramètre.',
      trap: 'La confondre avec la réalisation : la dépendance a une flèche **ouverte** (>) ; la réalisation un **triangle vide** (▷).',
    },
    {
      id: 'association', group: 'Les relations', title: 'Association (et navigabilité)',
      d: pair('Personne', 'Voiture', { kind: 'navig', m1: '1', m2: '0..1', label: 'conduit' }),
      meaning: [
        '**Trait plein**. Relation durable « **a un** » : une classe garde une référence vers l\'autre **en attribut**.',
        'La **flèche ouverte** (navigabilité) indique qui possède l\'attribut : ici Personne a un attribut Voiture, pas l\'inverse. Sans flèche : navigable dans les deux sens (ou non précisé).',
        'Le **nom** de l\'association (en italique au milieu) est facultatif : « conduit », « loue ».',
        'Lecture : une Personne conduit **0..1** Voiture ; une Voiture est conduite par **1** Personne.',
      ],
      java: 'public class Personne {\n    private Voiture voiture;     // 0..1 : peut valoir null\n}\npublic class Voiture {\n    // rien : l\'association n\'est pas navigable dans ce sens\n}',
      cue: '« un client loue un véhicule » ; « une réservation associe un passager à un vol » ; « caractérisé par une liste de … (UneClasse) ».',
      trap: 'Dessiner l\'association ET ajouter aussi `- voiture : Voiture` dans les attributs : c\'est un doublon. L\'association **est** l\'attribut.',
    },
    {
      id: 'agregation', group: 'Les relations', title: 'Agrégation',
      d: pair('EquipeProjet', 'Employe', { kind: 'aggr', m1: '*', m2: '*' }),
      meaning: [
        '**Losange vide**, collé à la classe qui est **le tout** (le contenant).',
        'Le tout **détient** des parties mais **peut les partager** ; les **cycles de vie sont indépendants** : si l\'équipe est dissoute, les employés existent toujours.',
        'Un employé peut être dans plusieurs équipes (multiplicité * côté EquipeProjet).',
      ],
      java: 'public class EquipeProjet {\n    private List<Employe> membres = new ArrayList<Employe>();\n    public void ajouter(Employe e) {   // l\'employé existe déjà ailleurs\n        this.membres.add(e);\n    }\n}',
      cue: '« géré par plusieurs services » ; « peut faire partie de plusieurs … » ; « une … dissoute ne fait pas disparaître ses … ».',
      trap: 'Mettre le losange du côté de la partie. Le losange est **toujours côté tout** : EquipeProjet ◇—— Employe.',
    },
    {
      id: 'composition', group: 'Les relations', title: 'Composition',
      d: pair('Panier', 'Article', { kind: 'comp', m1: '1', m2: '*' }),
      meaning: [
        '**Losange plein (noir)**, collé au **tout**.',
        'Les parties **ne se partagent pas** et leur **cycle de vie dépend du tout** : supprimer le panier supprime ses articles.',
        'Côté tout, la multiplicité vaut presque toujours **1** (une partie n\'appartient qu\'à un seul tout).',
      ],
      java: 'public class Panier {\n    private List<Article> articles = new ArrayList<Article>();\n    public void supprimer() {\n        this.articles.clear();      // les articles disparaissent avec le panier\n    }\n}',
      cue: '« si on supprime le panier, les articles sont également supprimés » ; « l\'unique service qui gère l\'ensemble des clients » ; « est composé de ».',
      trap: 'Hésiter entre agrégation et composition sans justifier. Sur la copie, écris une ligne : « composition car les articles sont supprimés avec le panier ».',
    },
    {
      id: 'heritage', group: 'Les relations', title: 'Héritage (généralisation)',
      d: pair('Voiture', 'Vehicule', { kind: 'inherit' }, { vertical: true, bKind: 'abstract', bMeth: ['*+ rouler() : void'], aMeth: ['+ rouler() : void'] }),
      meaning: [
        '**Trait plein + triangle vide**. Le triangle touche la **classe mère**.',
        'Relation « **est un** » : une Voiture est un Vehicule. La fille hérite des membres de la mère.',
        'Pas de multiplicité sur un héritage, jamais.',
        'Une méthode réécrite dans la fille (redéfinition) est répétée dans son compartiment.',
      ],
      java: 'public class Voiture extends Vehicule {\n    public void rouler() { ... }   // redéfinition\n}',
      cue: '« Nous distinguons trois types d\'articles : … » ; « un client peut être une personne physique ou morale » ; « est un ».',
      trap: 'Inverser le sens : le triangle part de la fille et **pointe vers la mère**. Et ne pas mettre de multiplicité.',
    },
    {
      id: 'realisation', group: 'Les relations', title: 'Réalisation (implémentation d\'interface)',
      d: pair('Voiture', 'Pilotable', { kind: 'realize' }, { vertical: true, bKind: 'interface', bMeth: ['+ accelerer() : void'], aMeth: ['+ accelerer() : void'] }),
      meaning: [
        '**Pointillé + triangle vide**, qui pointe vers l\'**interface**.',
        'La classe s\'engage à implémenter toutes les méthodes de l\'interface (sinon elle est abstraite).',
        'Dans les annexes des sujets, la flèche est souvent annotée « implements ».',
      ],
      java: 'public class Voiture implements Pilotable {\n    public void accelerer() { ... }\n}',
      cue: '« implémente l\'interface » ; « tout objet … propose la méthode … » ; plusieurs classes sans lien qui partagent une capacité.',
      trap: 'Dessiner un trait plein (ce serait un héritage) ou une flèche ouverte (ce serait une dépendance).',
    },
  ];

  const multiplicities = {
    rows: [
      ['`1`', 'exactement un', 'un Vol a 1 aéroport de départ'],
      ['`0..1`', 'zéro ou un', 'un client loue au plus un véhicule à la fois'],
      ['`*` (ou `0..*`)', 'zéro, un ou plusieurs', 'un client a passé * commandes'],
      ['`1..*`', 'au moins un', 'une équipe est responsable de 1..* modules'],
      ['`1..5`', 'entre 1 et 5 (bornes incluses)', 'une voiture a 1..5 passagers'],
      ['`1,5`', 'un OU cinq (pas entre)', 'rare'],
    ],
    howto: [
      'On écrit `1..*` avec **deux points** et une **étoile**. Pas « 1...n » ni « 1-n ».',
      'La multiplicité écrite **près d\'une classe** dit combien d\'objets de **cette classe** sont liés à **un** objet de l\'autre.',
      'Méthode de lecture : pars d\'**un** objet d\'un côté, traverse le lien, lis le nombre écrit de l\'autre côté.',
      'Exemple Client `1` ——— `*` Commande : **un** client → `*` commandes (lu près de Commande) ; **une** commande → `1` client (lu près de Client).',
    ],
    d: { classes: [box('C', 'Client', 10, 10), box('K', 'Commande', 320, 10)], edges: [{ from: 'C', to: 'K', kind: 'navig', m1: '1', m2: '*', label: 'passe' }] },
  };

  const R = (k) => pair('A', 'B', { kind: k });
  const RV = (k) => pair('A', 'B', { kind: k }, { vertical: true });
  const NAMES = ['Dépendance', 'Association', 'Agrégation', 'Composition', 'Héritage', 'Réalisation'];

  const drill = [
    { id: 'n1', q: 'Quelle relation est dessinée ?', uml: R('comp'), c: NAMES, a: 3, why: 'Losange **plein** = composition. Le tout est A (le losange est collé au tout) : les B disparaissent avec A.' },
    { id: 'n2', q: 'Quelle relation est dessinée ?', uml: R('aggr'), c: NAMES, a: 2, why: 'Losange **vide** = agrégation : A détient des B mais peut les partager, cycles de vie indépendants.' },
    { id: 'n3', q: 'Quelle relation est dessinée ?', uml: RV('realize'), c: NAMES, a: 5, why: '**Pointillé + triangle vide** = réalisation : A implémente l\'interface B.' },
    { id: 'n4', q: 'Quelle relation est dessinée ?', uml: RV('inherit'), c: NAMES, a: 4, why: '**Trait plein + triangle vide** = héritage : A hérite de B (le triangle touche la mère).' },
    { id: 'n5', q: 'Quelle relation est dessinée ?', uml: R('dep'), c: NAMES, a: 0, why: '**Pointillé + flèche ouverte** = dépendance : A utilise B ponctuellement (paramètre), sans attribut.' },
    { id: 'n6', q: 'Quelle relation est dessinée ?', uml: pair('A', 'B', { kind: 'navig', m2: '1' }), c: NAMES, a: 1, why: '**Trait plein + flèche ouverte** = association navigable de A vers B : A a un attribut de type B.' },
    {
      id: 'n7', q: '« Voiture implémente l\'interface Pilotable. » Quel dessin est correct ?',
      c: [{ uml: pair('Voiture', 'Pilotable', { kind: 'realize' }, { vertical: true, bKind: 'interface' }) }, { uml: pair('Voiture', 'Pilotable', { kind: 'inherit' }, { vertical: true, bKind: 'interface' }) }, { uml: pair('Pilotable', 'Voiture', { kind: 'realize' }, { vertical: true, aKind: 'interface' }) }, { uml: pair('Voiture', 'Pilotable', { kind: 'dep' }, { vertical: true, bKind: 'interface' }) }],
      a: 0, why: 'Pointillé + triangle vide, qui part de la classe et pointe vers l\'interface. Le trait plein serait un héritage ; la flèche ouverte une dépendance ; le troisième dessin est à l\'envers.',
    },
    {
      id: 'n8', q: '« Livre est un type d\'Article. » Quel dessin est correct ?',
      c: [{ uml: pair('Article', 'Livre', { kind: 'inherit' }, { vertical: true }) }, { uml: pair('Livre', 'Article', { kind: 'inherit' }, { vertical: true }) }, { uml: pair('Livre', 'Article', { kind: 'realize' }, { vertical: true }) }, { uml: pair('Livre', 'Article', { kind: 'navig', m2: '1' }, { vertical: true }) }],
      a: 1, why: 'Le triangle touche la **mère** (Article) ; il part de la fille (Livre). Le premier dessin dirait « Article hérite de Livre ».',
    },
    {
      id: 'n9', q: '« Supprimer le panier supprime aussi ses articles. » Quel dessin est correct ?',
      c: [{ uml: pair('Panier', 'Article', { kind: 'comp', m1: '1', m2: '*' }) }, { uml: pair('Article', 'Panier', { kind: 'comp', m1: '*', m2: '1' }) }, { uml: pair('Panier', 'Article', { kind: 'aggr', m1: '1', m2: '*' }) }, { uml: pair('Panier', 'Article', { kind: 'navig', m1: '*', m2: '1' }) }],
      a: 0, why: 'Composition (losange plein) et losange **côté Panier**, le tout. Multiplicités : un panier → * articles ; un article → 1 panier.',
    },
    {
      id: 'n10', q: '« Une équipe dissoute ne fait pas disparaître ses ingénieurs, qui peuvent être dans plusieurs équipes. » Quel dessin ?',
      c: [{ uml: pair('Equipe', 'Ingenieur', { kind: 'comp', m1: '1', m2: '*' }) }, { uml: pair('Equipe', 'Ingenieur', { kind: 'aggr', m1: '*', m2: '*' }) }, { uml: pair('Ingenieur', 'Equipe', { kind: 'aggr', m1: '*', m2: '*' }) }, { uml: pair('Ingenieur', 'Equipe', { kind: 'inherit' }) }],
      a: 1, why: 'Agrégation (losange vide, partage possible) côté Equipe, le tout. * des deux côtés : un ingénieur dans plusieurs équipes, une équipe a plusieurs ingénieurs.',
    },
    { id: 'n11', q: 'Personne `1` ——conduit——▷ `0..1` Voiture. Combien de voitures une personne conduit-elle ?', uml: pair('Personne', 'Voiture', { kind: 'navig', m1: '1', m2: '0..1', label: 'conduit' }), c: ['Exactement 1', 'Zéro ou une', 'Au moins une', 'Plusieurs'], a: 1, why: 'Pour UNE personne, on lit le nombre écrit côté Voiture : 0..1.' },
    { id: 'n12', q: 'Même diagramme : par combien de personnes une voiture est-elle conduite ?', uml: pair('Personne', 'Voiture', { kind: 'navig', m1: '1', m2: '0..1', label: 'conduit' }), c: ['Exactement 1', 'Zéro ou une', 'Plusieurs', 'On ne peut pas savoir'], a: 0, why: 'Pour UNE voiture, on lit le nombre écrit côté Personne : 1.' },
    { id: 'n13', q: '« Un client a passé une ou plusieurs commandes. » Quelle multiplicité écrire côté Commande ?', c: ['1...n', '1..*', '1-*', '*..1'], a: 1, why: 'La notation UML est `1..*` : deux points, une étoile. « 1...n » est une erreur de notation fréquente.' },
    { id: 'n14', q: 'Dans ce diagramme, quelle classe contient un attribut de l\'autre ?', uml: pair('Commande', 'Client', { kind: 'navig', m1: '*', m2: '1' }), c: ['Commande a un attribut de type Client', 'Client a un attribut de type Commande', 'Les deux', 'Aucune'], a: 0, why: 'La flèche de navigabilité part de la classe qui **possède** l\'attribut vers le type de cet attribut.' },
    { id: 'n15', q: 'Un attribut est souligné dans une classe. Qu\'est-ce que ça signifie ?', d: null, c: ['Il est privé', 'Il est static (attribut de classe)', 'Il est abstrait', 'C\'est une clé'], a: 1, why: 'Souligné = statique : un seul exemplaire partagé par toutes les instances (compteur, instance du Singleton).' },
    { id: 'n16', q: 'Quel symbole note un attribut `protected` ?', c: ['+', '-', '#', '~'], a: 2, why: '# = protected (visible des sous-classes). + public, - private, ~ paquetage.' },
    { id: 'n17', q: 'Comment écrire en UML l\'attribut Java `private double prix;` ?', c: ['- double prix', '- prix : double', 'private prix : double', '+ prix : double'], a: 1, why: 'En UML : `visibilité nom : Type`. Le type vient après les deux-points.' },
    { id: 'n18', q: 'Faut-il des multiplicités sur une flèche d\'héritage ?', c: ['Oui, toujours 1', 'Oui, 1 côté mère et * côté fille', 'Non, jamais', 'Seulement si la mère est abstraite'], a: 2, why: 'L\'héritage relie des classes, pas des objets : aucune multiplicité.' },
  ];

  const traps = [
    { t: 'Le losange côté partie', s: 'Le losange (vide ou plein) se colle **au tout**, jamais à la partie. Panier ◆—— Article, et non Panier ——◆ Article.' },
    { t: 'La flèche d\'héritage à l\'envers', s: 'Le triangle touche la **classe mère**. Lis-le « est un » dans le sens de la flèche : Voiture —▷ Vehicule = « une Voiture est un Vehicule ».' },
    { t: 'Trait plein ou pointillé', s: 'Pointillé = dépendance (flèche ouverte) ou réalisation d\'interface (triangle vide). Trait plein = association, agrégation, composition, héritage.' },
    { t: 'L\'attribut en double', s: 'Si tu dessines Client —— Panier, n\'écris pas en plus `- panier : Panier` dans Client. Le correcteur y voit une incompréhension de l\'association.' },
    { t: 'Les multiplicités oubliées', s: 'Toute association, agrégation ou composition porte deux multiplicités. Sans elles, la relation est incomplète, et ce sont des points perdus.' },
    { t: '« 1...n »', s: 'On écrit `1..*`, `0..1`, `*`. Deux points, et l\'étoile pour « plusieurs ».' },
    { t: 'Syntaxe Java dans le diagramme', s: '`- prix : double` et `+ calculerPrix() : double`. Pas `private double prix;`.' },
    { t: 'L\'italique invisible', s: 'À la main, l\'italique ne se voit pas : ajoute «abstract» au-dessus du nom de la classe, et {abstract} ou un italique très marqué pour la méthode.' },
    { t: 'Le statique non souligné', s: 'Le compteur `nombreAnimaux` et l\'instance du Singleton sont soulignés. C\'est souvent noté à part dans le barème.' },
    { t: 'Les enums dessinés alors qu\'on dit de les omettre', s: 'Lis la consigne : « vous omettrez les énumérations » → pas de boîte, mais utilise-les comme types (`- etat : Etat`).' },
  ];

  O.data.umlLessons = { entries, multiplicities, drill, traps };
})(window);
