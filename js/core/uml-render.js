/**
 * uml-render.js — Dessine un diagramme de classes UML en SVG à partir de données.
 *
 * Pourquoi un moteur maison : la station doit marcher hors ligne et le
 * contenu est injecté dynamiquement ; un petit moteur à positions manuelles
 * suffit pour des diagrammes de 3 à 12 classes et respecte la notation du cours.
 *
 * Données :
 *   { classes: [{ id, name, kind: 'class'|'abstract'|'interface'|'enum', x, y,
 *                 attrs: ['- prix : double'], methods: ['+ calculerPrix() : double'] }],
 *     edges:   [{ from, to, kind, m1, m2, label }] }
 *   kind d'arête : inherit (▷ plein trait), realize (▷ pointillé), assoc,
 *   navig (flèche ouverte), aggr (◇ côté from = le tout), comp (◆ côté from),
 *   dep (pointillé + flèche ouverte).
 *   Préfixe de membre : '*' = abstrait (italique), '_' = statique (souligné).
 *
 * Invariant : x, y désignent le coin haut-gauche d'une boîte ; la largeur
 * est calculée depuis le texte (police mono ~7.4 px par caractère à 12 px).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const NS = 'http://www.w3.org/2000/svg';
  const CH = 7.4;
  const LINE = 16;

  function el(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function measure(c) {
    const stereo = c.kind === 'interface' ? '«interface»' : c.kind === 'enum' ? '«enumeration»' : c.kind === 'abstract' ? '«abstract»' : null;
    const lines = [c.name, stereo || '', ...(c.attrs || []), ...(c.methods || [])].map((s) => s.replace(/^[*_]/, ''));
    const w = Math.max(90, Math.ceil(Math.max(...lines.map((s) => s.length)) * CH + 22));
    const head = stereo ? 38 : 24;
    const attrsH = (c.attrs || []).length * LINE + 8;
    const methH = (c.methods || []).length * LINE + 8;
    const showSections = c.kind !== 'enum' || (c.attrs || []).length;
    const h = head + (showSections ? attrsH + ((c.methods || []).length || c.kind !== 'enum' ? methH : 0) : 0);
    return { w, h, head, attrsH, stereo };
  }

  function drawClass(svg, c, m) {
    const g = el('g', { transform: 'translate(' + c.x + ',' + c.y + ')' });
    const cls = 'uml-box' + (c.kind === 'interface' ? ' iface' : c.kind === 'enum' ? ' enum' : c.kind === 'abstract' ? ' abs' : '');
    g.appendChild(el('rect', { class: cls, width: m.w, height: m.h }));
    let y = 16;
    if (m.stereo) {
      g.appendChild(el('text', { class: 'uml-stereo', x: m.w / 2, y: 14, 'text-anchor': 'middle' }, m.stereo));
      y = 30;
    }
    g.appendChild(el('text', { class: 'uml-title' + (c.kind === 'abstract' ? ' abs' : ''), x: m.w / 2, y, 'text-anchor': 'middle' }, c.name));
    let cy = m.head;
    const section = (items) => {
      g.appendChild(el('line', { class: 'uml-sep', x1: 0, y1: cy, x2: m.w, y2: cy }));
      cy += 4;
      items.forEach((s) => {
        cy += LINE;
        const mod = s[0] === '*' ? ' abs' : s[0] === '_' ? ' static' : '';
        g.appendChild(el('text', { class: 'uml-member' + mod, x: 8, y: cy - 4 }, s.replace(/^[*_]/, '')));
      });
      cy += 4;
    };
    if (c.kind !== 'enum' || (c.attrs || []).length) {
      section(c.attrs || []);
      if ((c.methods || []).length || c.kind !== 'enum') section(c.methods || []);
    }
    svg.appendChild(g);
  }

  /** Point où le segment centre→cible sort du rectangle. */
  function clip(box, tx, ty) {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    const sx = dx !== 0 ? (box.w / 2) / Math.abs(dx) : Infinity;
    const sy = dy !== 0 ? (box.h / 2) / Math.abs(dy) : Infinity;
    const s = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function center(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }

  function drawEdge(svg, e, boxes) {
    const a = boxes[e.from];
    const b = boxes[e.to];
    if (!a || !b) return;
    const ca = center(a);
    const cb = center(b);
    let pa = clip(a, cb.x, cb.y);
    let pb = clip(b, ca.x, ca.y);
    const ang = Math.atan2(pb.y - pa.y, pb.x - pa.x);
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    if (e.off) {
      // Arêtes parallèles entre deux mêmes classes : décalage perpendiculaire.
      pa = { x: pa.x - uy * e.off, y: pa.y + ux * e.off };
      pb = { x: pb.x - uy * e.off, y: pb.y + ux * e.off };
    }
    let start = pa;
    let end = pb;
    const dashed = e.kind === 'realize' || e.kind === 'dep';
    // Têtes et losanges
    if (e.kind === 'inherit' || e.kind === 'realize') {
      const L = 14; const W = 8;
      const bx = pb.x - ux * L; const by = pb.y - uy * L;
      svg.appendChild(el('polygon', { class: 'uml-head-open', points: [pb.x, pb.y, bx - uy * W, by + ux * W, bx + uy * W, by - ux * W].join(',') }));
      end = { x: bx, y: by };
    }
    if (e.kind === 'aggr' || e.kind === 'comp') {
      const L = 22; const W = 7;
      const mx = pa.x + ux * (L / 2); const my = pa.y + uy * (L / 2);
      const tip = { x: pa.x + ux * L, y: pa.y + uy * L };
      svg.appendChild(el('polygon', {
        class: e.kind === 'comp' ? 'uml-head-full' : 'uml-head-open',
        points: [pa.x, pa.y, mx - uy * W, my + ux * W, tip.x, tip.y, mx + uy * W, my - ux * W].join(','),
      }));
      start = tip;
    }
    svg.insertBefore(el('line', { class: 'uml-edge' + (dashed ? ' dashed' : ''), x1: start.x, y1: start.y, x2: end.x, y2: end.y }), svg.firstChild);
    if (e.kind === 'navig' || e.kind === 'dep') {
      const L = 11; const W = 6;
      const bx = pb.x - ux * L; const by = pb.y - uy * L;
      svg.appendChild(el('polyline', { class: 'uml-edge', points: [bx - uy * W, by + ux * W, pb.x, pb.y, bx + uy * W, by - ux * W].join(',') }));
    }
    // Étiquettes : décalées perpendiculairement au trait
    const off = (p, along, side) => ({ x: p.x + ux * along - uy * side, y: p.y + uy * along + ux * side });
    if (e.m1) { const q = off(pa, e.kind === 'aggr' || e.kind === 'comp' ? 30 : 12, -10); svg.appendChild(el('text', { class: 'uml-label', x: q.x, y: q.y + 4, 'text-anchor': 'middle' }, e.m1)); }
    if (e.m2) { const q = off(pb, -14, -10); svg.appendChild(el('text', { class: 'uml-label', x: q.x, y: q.y + 4, 'text-anchor': 'middle' }, e.m2)); }
    if (e.label) {
      const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      const q = off(mid, 0, 12);
      svg.appendChild(el('text', { class: 'uml-label name', x: q.x, y: q.y + 4, 'text-anchor': 'middle' }, e.label));
    }
  }

  /** Renvoie un élément <div class="uml-wrap"> contenant le SVG. */
  function render(diagram) {
    const boxes = {};
    let maxX = 0;
    let maxY = 0;
    diagram.classes.forEach((c) => {
      const m = measure(c);
      boxes[c.id || c.name] = { x: c.x, y: c.y, w: m.w, h: m.h, m };
      maxX = Math.max(maxX, c.x + m.w);
      maxY = Math.max(maxY, c.y + m.h);
    });
    const W = maxX + 24;
    const H = maxY + 24;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': diagram.title || 'Diagramme de classes' });
    const edges = el('g');
    svg.appendChild(edges);
    (diagram.edges || []).forEach((e) => drawEdge(edges, e, boxes));
    diagram.classes.forEach((c) => drawClass(svg, c, boxes[c.id || c.name].m));
    const wrap = document.createElement('div');
    wrap.className = 'uml-wrap';
    wrap.appendChild(svg);
    return wrap;
  }

  O.uml = { render };
})(window);
