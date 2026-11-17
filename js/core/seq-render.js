/**
 * seq-render.js — Dessine un diagramme de séquence UML en SVG à partir de données.
 *
 * Données :
 *   { actors: [{ id, label: 'james:Pilote', created? }],
 *     items:  [ message | cadre | ref ] }
 *   message : { from, to, label, kind: 'sync'|'async'|'return'|'create' }
 *             (from === to : message envoyé à soi-même)
 *   cadre   : { frame: 'loop'|'opt'|'par'|'alt', guard, items }
 *             alt : { frame: 'alt', branches: [{ guard, items }] }
 *   ref     : { ref: 'Nom de l\'interaction', over: [ids] }
 * Mise en page automatique : une colonne par acteur, le temps descend.
 * Un acteur `created` apparaît à la hauteur de son message 'create'.
 * Notation du cours 3 : synchrone = flèche pleine, asynchrone = flèche
 * ouverte, retour = pointillé, création = message vers la boîte de l'objet.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const NS = 'http://www.w3.org/2000/svg';
  const COL = 200;
  const ROW = 38;
  const HEAD = 30;
  const CH = 7.2;

  function el(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function render(d) {
    const idx = {};
    d.actors.forEach((a, i) => { idx[a.id] = i; });
    const cx = (id) => 20 + idx[id] * COL + COL / 2;
    const width = 40 + d.actors.length * COL;
    const layer = { frames: el('g'), lines: el('g'), top: el('g') };
    const startY = {};
    let y = 20 + HEAD + 14;
    let maxY = y;

    function touched(items, acc) {
      items.forEach((it) => {
        if (it.from) { acc.add(idx[it.from]); acc.add(idx[it.to]); }
        if (it.over) it.over.forEach((o) => acc.add(idx[o]));
        if (it.items) touched(it.items, acc);
        if (it.branches) it.branches.forEach((b) => touched(b.items, acc));
      });
      return acc;
    }

    function arrowHead(x, yy, dir, kind) {
      const L = 10; const W = 5;
      if (kind === 'sync') {
        layer.top.appendChild(el('polygon', { class: 'uml-head-full', points: [x, yy, x - dir * L, yy - W, x - dir * L, yy + W].join(',') }));
      } else {
        layer.top.appendChild(el('polyline', { class: 'uml-edge', points: [x - dir * L, yy - W, x, yy, x - dir * L, yy + W].join(',') }));
      }
    }

    function message(m) {
      y += ROW;
      const x1 = cx(m.from);
      if (m.from === m.to) {
        layer.lines.appendChild(el('path', { class: 'uml-edge', d: 'M' + x1 + ',' + y + ' h34 v18 h-34' }));
        arrowHead(x1, y + 18, -1, m.kind || 'sync');
        layer.top.appendChild(el('text', { class: 'seq-msg', x: x1 + 40, y: y + 6 }, m.label));
        y += 18;
        maxY = Math.max(maxY, y);
        return;
      }
      let x2 = cx(m.to);
      const dir = x2 > x1 ? 1 : -1;
      if (m.kind === 'create') {
        const a = d.actors[idx[m.to]];
        const w = Math.max(80, a.label.length * CH + 20);
        startY[m.to] = y + HEAD / 2;
        layer.top.appendChild(el('rect', { class: 'seq-actor', x: x2 - w / 2, y: y - HEAD / 2, width: w, height: HEAD }));
        layer.top.appendChild(el('text', { class: 'seq-actor-t', x: x2, y: y + 4, 'text-anchor': 'middle' }, a.label));
        x2 -= dir * (w / 2);
      }
      const dashed = m.kind === 'return' || m.kind === 'create';
      layer.lines.appendChild(el('line', { class: 'uml-edge' + (dashed ? ' dashed' : ''), x1, y1: y, x2, y2: y }));
      arrowHead(x2, y, dir, m.kind === 'sync' || !m.kind ? 'sync' : 'open');
      layer.top.appendChild(el('text', { class: 'seq-msg' + (m.kind === 'return' ? ' ret' : ''), x: (x1 + x2) / 2, y: y - 7, 'text-anchor': 'middle' }, m.label));
      maxY = Math.max(maxY, y);
    }

    function frameBox(op, guard, items, branches, depth) {
      const cols = [...touched(branches ? [].concat(...branches.map((b) => b.items)) : items, new Set())];
      const pad = COL * 0.44 - depth * 12;
      const xa = 20 + Math.min(...cols) * COL + COL / 2 - pad;
      const xb = 20 + Math.max(...cols) * COL + COL / 2 + pad;
      y += 16;
      const top = y;
      y += 8;
      const seps = [];
      if (branches) {
        branches.forEach((b, i) => {
          if (i > 0) { y += 14; seps.push({ y, guard: b.guard }); }
          walk(b.items, depth + 1);
        });
      } else {
        walk(items, depth + 1);
      }
      y += 16;
      const tabW = op.length * 8 + 20;
      layer.frames.appendChild(el('rect', { class: 'seq-frame', x: xa, y: top, width: xb - xa, height: y - top }));
      layer.frames.appendChild(el('path', { class: 'seq-tab', d: 'M' + xa + ',' + top + ' h' + tabW + ' v12 l-8,8 h-' + (tabW - 8) + ' z' }));
      layer.frames.appendChild(el('text', { class: 'seq-op', x: xa + 6, y: top + 14 }, op));
      const g = branches ? branches[0].guard : guard;
      if (g) layer.frames.appendChild(el('text', { class: 'seq-guard', x: xa + tabW + 8, y: top + 14 }, g));
      seps.forEach((s) => {
        layer.frames.appendChild(el('line', { class: 'seq-sep', x1: xa, y1: s.y, x2: xb, y2: s.y }));
        layer.frames.appendChild(el('text', { class: 'seq-guard', x: xa + 8, y: s.y + 14 }, s.guard));
      });
      maxY = Math.max(maxY, y);
    }

    function refBox(r) {
      const cols = r.over.map((o) => idx[o]);
      const xa = 20 + Math.min(...cols) * COL + COL / 2 - 70;
      const xb = 20 + Math.max(...cols) * COL + COL / 2 + 70;
      y += 18;
      layer.frames.appendChild(el('rect', { class: 'seq-ref', x: xa, y, width: xb - xa, height: 40 }));
      layer.frames.appendChild(el('path', { class: 'seq-tab', d: 'M' + xa + ',' + y + ' h36 v12 l-8,8 h-28 z' }));
      layer.frames.appendChild(el('text', { class: 'seq-op', x: xa + 6, y: y + 14 }, 'ref'));
      layer.frames.appendChild(el('text', { class: 'seq-msg', x: (xa + xb) / 2, y: y + 26, 'text-anchor': 'middle' }, r.ref));
      y += 40;
      maxY = Math.max(maxY, y);
    }

    function walk(items, depth) {
      items.forEach((it) => {
        if (it.frame) frameBox(it.frame, it.guard, it.items, it.branches, depth);
        else if (it.ref) refBox(it);
        else message(it);
      });
    }

    walk(d.items, 0);
    const H = maxY + 36;
    const svg = el('svg', { viewBox: '0 0 ' + width + ' ' + H, width, height: H, role: 'img', 'aria-label': d.title || 'Diagramme de séquence' });
    const heads = el('g');
    d.actors.forEach((a) => {
      const x = cx(a.id);
      const sy = a.created ? startY[a.id] : 20 + HEAD;
      if (sy === undefined) return;
      svg.appendChild(el('line', { class: 'seq-life', x1: x, y1: sy, x2: x, y2: H - 10 }));
      if (!a.created) {
        const w = Math.max(80, a.label.length * CH + 20);
        heads.appendChild(el('rect', { class: 'seq-actor', x: x - w / 2, y: 20, width: w, height: HEAD }));
        heads.appendChild(el('text', { class: 'seq-actor-t', x, y: 20 + HEAD / 2 + 4, 'text-anchor': 'middle' }, a.label));
      }
    });
    svg.append(layer.frames, layer.lines, heads, layer.top);
    const wrap = document.createElement('div');
    wrap.className = 'uml-wrap';
    wrap.appendChild(svg);
    return wrap;
  }

  O.seq = { render };
})(window);
