/**
 * hub.js — Le pont de la station : mission de campagne en cours, compte à
 * rebours du médian, carte des six modules, et le Journal de bord (récit,
 * salle de projection, badges, réglages).
 *
 * Les modules pas encore ouverts par la campagne (core/campaign.js)
 * s'affichent verrouillés.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p } = O.util;
  const ORDER = ['codex', 'reacteur', 'plans', 'forge', 'memoire', 'saut'];

  function ringSvg(m) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 320 320');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Carte de la station : énergie de chaque module');
    const add = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); svg.appendChild(e); return e; };
    add('circle', { cx: 160, cy: 160, r: 118, fill: 'none', stroke: '#2a3a62', 'stroke-width': 14 });
    add('circle', { cx: 160, cy: 160, r: 118, fill: 'none', stroke: '#151f38', 'stroke-width': 8 });
    const total = ORDER.reduce((a, k) => a + m[k], 0) / ORDER.length;
    add('circle', { cx: 160, cy: 160, r: 38, fill: '#0e1527', stroke: '#ffb547', 'stroke-width': 2 });
    const core = add('circle', { cx: 160, cy: 160, r: 10 + 22 * total, fill: '#ffb547', opacity: 0.85 });
    core.style.filter = 'drop-shadow(0 0 10px #ffb547)';
    const t = add('text', { x: 160, y: 166, 'text-anchor': 'middle', fill: '#070b16', 'font-family': 'Chakra Petch, sans-serif', 'font-weight': 700, 'font-size': 16 });
    t.textContent = O.util.pct(total) + '%';
    ORDER.forEach((k, i) => {
      const a = (-90 + i * 60) * Math.PI / 180;
      const x = 160 + Math.cos(a) * 118;
      const y = 160 + Math.sin(a) * 118;
      add('line', { x1: 160 + Math.cos(a) * 40, y1: 160 + Math.sin(a) * 40, x2: x, y2: y, stroke: '#2a3a62', 'stroke-width': 3 });
      const lit = m[k];
      const color = lit >= 0.75 ? '#52e0a1' : lit >= 0.3 ? '#ffb547' : '#ff7171';
      const link = document.createElementNS(NS, 'a');
      link.setAttribute('href', '#' + O.data.lore.modules[k].route);
      const pod = document.createElementNS(NS, 'circle');
      Object.entries({ cx: x, cy: y, r: 26, fill: '#151f38', stroke: color, 'stroke-width': 3 }).forEach(([kk, v]) => pod.setAttribute(kk, v));
      const fill = document.createElementNS(NS, 'circle');
      Object.entries({ cx: x, cy: y, r: Math.max(3, 21 * lit), fill: color, opacity: 0.55 }).forEach(([kk, v]) => fill.setAttribute(kk, v));
      const label = document.createElementNS(NS, 'text');
      Object.entries({ x, y: y + 4, 'text-anchor': 'middle', fill: '#e7ecf7', 'font-family': 'Chakra Petch, sans-serif', 'font-size': 11, 'font-weight': 600 }).forEach(([kk, v]) => label.setAttribute(kk, v));
      label.textContent = String(i + 1).padStart(2, '0');
      const title = document.createElementNS(NS, 'title');
      title.textContent = O.data.lore.modules[k].name + ' : ' + O.util.pct(lit) + ' %';
      O.util.add(link, title, pod, fill, label);
      svg.appendChild(link);
    });
    return svg;
  }

  function hub(view) {
    const s = O.store.state;
    const m = O.store.mastery();
    const days = O.util.daysUntil(s.examDate);
    const L = O.data.lore;
    const tip = O.util.pick(L.tips);

    const daysLabel = days === null ? '—' : days > 1 ? 'J-' + days : days === 1 ? 'Demain' : days === 0 ? 'Aujourd\'hui' : 'Passé';
    const mission = h('section', { class: 'panel chamfer mission' },
      h('span', { class: 'eyebrow' }, 'Fenêtre de saut · médian LO02'),
      h('div', { class: 'row between' },
        h('div', { class: 'big' }, daysLabel),
        h('a', { class: 'btn small ghost', href: '#journal' }, 'Journal de bord')),
      O.ui.vega((s.name ? s.name + ', un conseil de vol : ' : 'Conseil de vol : ') + tip));

    const map = h('section', { class: 'panel chamfer station-map' },
      h('span', { class: 'eyebrow' }, 'Carte de la station Orpheus'),
      ringSvg(m),
      p('Chaque module correspond à une partie du médian. Vert : réparé. Ambre : en cours. Rouge : hors service.', 'faint'));

    const cards = ORDER.map((k, i) => {
      const md = L.modules[k];
      const x = m[k];
      if (!O.campaign.unlocked(k)) {
        return h('div', { class: 'module chamfer locked', 'aria-disabled': 'true' },
          h('span', { class: 'eyebrow' }, 'Module ' + String(i + 1).padStart(2, '0') + ' · verrouillé'),
          h('h3', null, md.name),
          h('p', { class: 'sub' }, 'S\'ouvre avec la mission ' + (O.campaign.opener(k) + 1) + ' de la campagne.'),
          h('p', { class: 'exam-part' }, 'Médian : ' + md.part));
      }
      return h('a', { class: 'module chamfer', href: '#' + md.route },
        h('span', { class: 'status-light ' + (x >= 0.75 ? 'on' : x >= 0.3 ? 'mid' : '') }),
        h('span', { class: 'eyebrow' }, 'Module ' + String(i + 1).padStart(2, '0')),
        h('h3', null, md.name),
        h('p', { class: 'sub' }, md.sub),
        h('p', { class: 'exam-part' }, 'Médian : ' + md.part),
        O.ui.powerBar(x));
    });

    O.util.add(view, 
      h('div', { class: 'page-head' }, h('span', { class: 'eyebrow' }, 'Pont de commandement'), h('h1', null, 'Six modules à réparer avant le saut')),
      O.campaign.panel(),
      h('div', { class: 'bridge' }, mission, map),
      h('div', { class: 'modules' }, cards));
  }

  function journal(view) {
    const s = O.store.state;
    const r = O.store.rankOf(s.xp);
    O.util.add(view, 
      O.ui.pageHead('Journal de bord', 'Mémoires de VEGA', 'Les fragments se déchiffrent à mesure que tu montes en grade. Les badges récompensent les habitudes qui paient le jour du médian.'),
      h('section', { class: 'panel' },
        h('div', { class: 'row between' },
          h('div', null, h('span', { class: 'eyebrow' }, 'Grade'), h('h2', null, r.name)),
          h('div', null, h('span', { class: 'eyebrow' }, 'Expérience'), h('h2', null, s.xp + ' XP')),
          h('div', null, h('span', { class: 'eyebrow' }, 'Série'), h('h2', null, s.streak.count + ' jour' + (s.streak.count > 1 ? 's' : '')))),
        r.next ? p('Prochain grade : **' + r.next.name + '** à ' + r.next.xp + ' XP.', 'dim') : p('Grade maximal atteint.', 'dim')),
      h('section', { class: 'panel' }, h('h2', null, 'Fragments'),
        h('div', { class: 'stack' }, O.data.lore.journal.map((j) => (s.xp >= j.xp
          ? h('div', { class: 'log-entry' }, h('b', null, j.title), p(j.text))
          : h('div', { class: 'log-entry locked' }, h('b', null, j.title), p('Chiffré. Débloqué à ' + j.xp + ' XP.')))))),
      O.story ? h('section', { class: 'panel' }, h('h2', null, 'Salle de projection'),
        p('Revois les transmissions déjà reçues. Les scènes verrouillées se débloquent au fil des missions de la campagne.', 'dim'),
        O.story.projection(),
        h('div', { class: 'row' },
          toggle('story-auto', 'Lancer les cinématiques automatiquement', s.story.auto, (v) => { s.story.auto = v; }),
          toggle('story-voice', 'Voix des personnages', s.story.voice, (v) => { s.story.voice = v; }))) : null,
      h('section', { class: 'panel' }, h('h2', null, 'Badges'),
        h('div', { class: 'badges' }, O.badges.list.map((b) => h('div', { class: 'badge' + (s.badges[b.id] ? '' : ' locked') },
          h('span', { class: 'sym' }, b.sym), h('b', null, b.name), h('span', { class: 'dim' }, b.desc))))),
      h('section', { class: 'panel' }, h('h2', null, 'Réglages'),
        h('label', { class: 'stack', for: 'exam-date' }, h('span', null, 'Date du médian'),
          h('input', { type: 'date', id: 'exam-date', value: s.examDate, onchange: (e) => O.store.update((st) => { st.examDate = e.target.value; }) })),
        h('label', { class: 'stack', for: 'cadet-name' }, h('span', null, 'Nom de cadet'),
          h('input', { type: 'text', id: 'cadet-name', value: s.name, maxlength: 30, onchange: (e) => O.store.update((st) => { st.name = e.target.value.trim(); }) })),
        resetZone()));
  }

  /** Case à cocher de réglage ; `set` modifie l'état, la sauvegarde est faite ici. */
  function toggle(id, label, value, set) {
    const box = h('input', { type: 'checkbox', id, checked: value ? true : null });
    box.addEventListener('change', () => O.store.update(() => set(box.checked)));
    return h('label', { class: 'row', for: id }, box, h('span', null, label));
  }

  function resetZone() {
    const zone = h('div', { class: 'row' });
    const ask = h('button', { class: 'btn small ghost', type: 'button' }, 'Effacer toute la progression');
    ask.addEventListener('click', () => {
      zone.innerHTML = '';
      O.util.add(zone, h('span', { class: 'dim' }, 'Toute la progression sera perdue.'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { O.store.reset(); location.hash = '#hub'; location.reload(); } }, 'Confirmer'),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => { zone.innerHTML = ''; zone.appendChild(ask); } }, 'Annuler'));
    });
    zone.appendChild(ask);
    return zone;
  }

  O.modes = O.modes || {};
  O.modes.hub = hub;
  O.modes.journal = journal;
})(window);
