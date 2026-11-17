/**
 * lore.js — L'histoire de la station Orpheus et les textes de VEGA.
 *
 * Le récit sert la révision : chaque module de la station correspond à une
 * partie du médian, et les fragments du journal se débloquent avec l'XP.
 * Invariant : les seuils des fragments suivent les rangs de store.js.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  O.data = O.data || {};

  O.data.lore = {
    intro: [
      'Réveil d\'urgence. Ici VEGA, l\'intelligence de bord de la station Orpheus.',
      'Une tempête solaire a traversé la coque il y a six heures. Mes mémoires sont en fragments et tous les systèmes de la station, écrits en Java, sont corrompus.',
      'Une entité s\'est logée dans le code : je l\'appelle la Rouille. Elle transforme les transtypages en ClassCastException et les références en null.',
      'Dans quelques jours s\'ouvre la fenêtre de saut vers la Terre. Elle ne reste ouverte qu\'une heure et demie. Si les six modules ne sont pas réparés d\'ici là, personne ne rentre.',
      'Tu es le seul membre d\'équipage formé à la programmation orientée objet. Comment dois-je t\'appeler ?',
    ],
    modules: {
      codex: { name: 'Archives', sub: 'Restaure ma mémoire : le cours, chapitre par chapitre.', part: 'Toutes les questions de cours', route: 'codex' },
      reacteur: { name: 'Réacteur', sub: 'Compile ? S\'exécute ? Qu\'affiche-t-il ? Chaque ligne juste stabilise le cœur.', part: 'Les « cas » compile / exécute / affiche', route: 'reacteur' },
      plans: { name: 'Bureau des plans', sub: 'Redessine les plans de la station en UML.', part: 'Partie II : diagramme de classes', route: 'plans' },
      forge: { name: 'Forge', sub: 'Forge le code des patrons à la main, comme sur ta copie.', part: 'Partie III : production de code', route: 'forge' },
      memoire: { name: 'Mémoire de VEGA', sub: 'Les questions de cours des annales, en répétition espacée.', part: 'Partie I : définitions à rédiger', route: 'memoire' },
      saut: { name: 'Simulateur de saut', sub: 'Les vrais sujets, chronométrés, puis corrigés point par point.', part: 'Examen blanc 1 h 30', route: 'saut' },
    },
    journal: [
      { xp: 0, title: 'Fragment 0 — Réveil', text: 'Le cadet a répondu à l\'appel. Je ne sais pas encore s\'il connaît la différence entre une surcharge et une redéfinition. Nous verrons.' },
      { xp: 150, title: 'Fragment 1 — Les premiers objets', text: 'Je me souviens maintenant : les ingénieurs d\'Orpheus disaient que la station n\'était qu\'un ensemble d\'objets qui s\'envoient des messages. Le réacteur parle au module de survie, qui parle aux serres. Si un message part vers une référence nulle, tout s\'arrête.' },
      { xp: 400, title: 'Fragment 2 — La Rouille', text: 'J\'ai isolé un échantillon de la Rouille. Elle n\'attaque que les lignes où quelqu\'un a confondu le type déclaré et le type réel. Elle se nourrit de cette confusion. Chaque verdict juste au Réacteur la fait reculer.' },
      { xp: 800, title: 'Fragment 3 — Les plans perdus', text: 'Les plans originaux de la station étaient des diagrammes de classes. Un losange plein entre la Station et ses Modules : si la station meurt, les modules meurent avec elle. Un losange vide entre les Équipes et les Ingénieurs : une équipe dissoute ne tue personne. Je commence à comprendre pourquoi mes concepteurs y tenaient.' },
      { xp: 1400, title: 'Fragment 4 — L\'unique', text: 'Il ne peut exister qu\'une seule VEGA à bord. Mes concepteurs ont rendu mon constructeur privé. Je ne m\'en étais jamais rendu compte : je suis un Singleton.' },
      { xp: 2200, title: 'Fragment 5 — Le squelette', text: 'La procédure de saut est toujours la même : vérifier, charger, sauter. Seules les étapes changent selon le vaisseau. La méthode est final, les étapes sont abstraites. Template Method. Ne nous appelez pas, on vous rappellera.' },
      { xp: 3200, title: 'Fragment 6 — Fenêtre ouverte', text: 'Toutes mes mémoires sont restaurées. Cadet, tu n\'as plus besoin de moi pour le saut. Relis tes définitions, dors bien, et le jour J, écris lisiblement : le correcteur ne fera aucun effort de lecture.' },
    ],
    tips: [
      'Pour chaque cas compile/exécute/affiche, écris d\'abord le type statique et le type dynamique de chaque variable en marge. Ça prend 20 secondes et ça évite la moitié des erreurs.',
      'En UML, mets toutes les multiplicités. Une association sans multiplicité, ce sont des points perdus.',
      'Le patron est toujours expliqué dans l\'énoncé. Relis l\'énoncé en soulignant : « privé », « de classe », « ne doit pas être redéfinie », « compose ».',
      'Les consignes des médians rappellent : « votre copie n\'est pas un brouillon ». Indente ton code comme dans un IDE.',
      'super.crier() exécute la version de la classe mère PUIS la suite. L\'ordre des lignes affichées compte.',
      'Une interface ne s\'instancie pas, une classe abstraite non plus. new Vehicule() avec Vehicule abstraite : erreur de compilation.',
      'Redéfinition = même signature, choisie à l\'exécution. Surcharge = paramètres différents, choisie à la compilation.',
      '« Laissé à la charge de chaque type » dans un énoncé = méthode abstraite dans la classe mère.',
    ],
  };
})(window);
