/**
 * cinema-shots.js — Décors animés (motion design SVG) des cinématiques.
 *
 * Chaque décor est une fonction (g, o, api) qui remplit le groupe SVG `g`
 * (repère 1600 × 900) selon les options `o` du plan. L'animation passe par
 * des classes CSS (css/cinema.css, préfixe cn-) ; ce qui dépend du temps ou
 * de la voix passe par api.frame(fn), appelé à chaque image avec
 * (t = secondes écoulées dans le plan, env = volume de la voix de 0 à 1).
 *
 * Choix : tout est vectoriel et généré, aucun fichier image ; les positions
 * « aléatoires » viennent d'un générateur à graine pour que chaque scène soit
 * identique d'une lecture à l'autre.
 * Invariant : un décor ne touche qu'à son groupe `g` (le moteur le supprime
 * au changement de plan, ce qui arrête aussi ses api.frame).
 * Exemple : O.cinemaShots.reactor(g, { rust: 0.4 }, api)
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1600;
  const H = 900;

  /** Crée un élément SVG ; `text` remplit le contenu texte. */
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    kids.flat(Infinity).forEach((k) => { if (k) el.appendChild(k); });
    return el;
  }
  /** Générateur pseudo-aléatoire à graine (mulberry32). */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const origin = (x, y) => 'transform-origin:' + x + 'px ' + y + 'px';
  const delay = (sec, extra) => 'animation-delay:' + sec + 's;' + (extra || '');
  const C = { vega: '#6ee7f5', sodium: '#ffb547', rust: '#ff5a4f', ink: '#e7ecf7', dim: '#6b7aa0', hull: '#151f38', line: '#2a3a62', ok: '#52e0a1' };

  /** Filtres et dégradés partagés, posés une fois dans le <defs> de la scène. */
  function defs() {
    const glow = (id, color, std) => s('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' },
      s('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: std, result: 'b' }),
      s('feFlood', { 'flood-color': color, 'flood-opacity': 0.9 }), s('feComposite', { in2: 'b', operator: 'in', result: 'c' }),
      s('feMerge', null, s('feMergeNode', { in: 'c' }), s('feMergeNode', { in: 'SourceGraphic' })));
    return s('defs', null,
      glow('cn-glow-v', C.vega, 6), glow('cn-glow-s', C.sodium, 6), glow('cn-glow-r', C.rust, 7),
      s('radialGradient', { id: 'cn-earth', cx: '50%', cy: '35%', r: '65%' },
        s('stop', { offset: '0%', 'stop-color': '#3d7bd9' }), s('stop', { offset: '60%', 'stop-color': '#173a78' }), s('stop', { offset: '100%', 'stop-color': '#07122b' })),
      s('radialGradient', { id: 'cn-core', cx: '50%', cy: '50%', r: '50%' },
        s('stop', { offset: '0%', 'stop-color': '#fff6dc' }), s('stop', { offset: '35%', 'stop-color': C.sodium }), s('stop', { offset: '100%', 'stop-color': 'rgba(255,181,71,0)' })),
      s('radialGradient', { id: 'cn-iris', cx: '50%', cy: '50%', r: '50%' },
        s('stop', { offset: '0%', 'stop-color': '#e9feff' }), s('stop', { offset: '40%', 'stop-color': C.vega }), s('stop', { offset: '100%', 'stop-color': '#0b3a52' })),
      s('linearGradient', { id: 'cn-storm', x1: '0', x2: '1' },
        s('stop', { offset: '0%', 'stop-color': 'rgba(255,90,79,0)' }), s('stop', { offset: '70%', 'stop-color': 'rgba(255,140,60,0.55)' }), s('stop', { offset: '100%', 'stop-color': 'rgba(255,230,180,0.9)' })),
      s('pattern', { id: 'cn-grid', width: 40, height: 40, patternUnits: 'userSpaceOnUse' },
        s('path', { d: 'M40 0H0V40', fill: 'none', stroke: 'rgba(110,231,245,0.12)', 'stroke-width': 1 })),
      s('pattern', { id: 'cn-scan', width: 4, height: 4, patternUnits: 'userSpaceOnUse' },
        s('rect', { width: 4, height: 2, fill: 'rgba(0,0,0,0.35)' })),
      s('filter', { id: 'cn-noise' },
        s('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: 2, seed: 3 },
          s('animate', { attributeName: 'seed', values: '1;9;4;7;2', dur: '0.4s', repeatCount: 'indefinite' })),
        s('feColorMatrix', { type: 'saturate', values: 0 })),
      s('filter', { id: 'cn-warp', x: '-20%', y: '-20%', width: '140%', height: '140%' },
        s('feTurbulence', { type: 'turbulence', baseFrequency: '0.012', numOctaves: 2, result: 't' },
          s('animate', { attributeName: 'baseFrequency', values: '0.010;0.022;0.010', dur: '6s', repeatCount: 'indefinite' })),
        s('feDisplacementMap', { in: 'SourceGraphic', in2: 't', scale: 38 })));
  }

  function stars(g, seed, n, streak) {
    const r = rng(seed);
    const layer = s('g', { class: streak ? 'cn-warpstars' : 'cn-drift' });
    for (let i = 0; i < n; i++) {
      const x = r() * W * 1.2;
      const y = r() * H;
      const z = r();
      layer.appendChild(streak
        ? s('line', { x1: x, y1: y, x2: x - 40 - z * 120, y2: y, stroke: C.ink, 'stroke-opacity': 0.2 + z * 0.6, 'stroke-width': 1 + z })
        : s('circle', { cx: x, cy: y, r: 0.6 + z * 1.6, fill: z > 0.92 ? C.sodium : C.ink, opacity: 0.25 + z * 0.6 }));
    }
    g.appendChild(layer);
  }

  /** Lignes de code en police à chasse fixe ; renvoie les éléments <text>. */
  function codeLines(g, lines, x, y, size, color) {
    return lines.map((t, i) => {
      const el = s('text', { x, y: y + i * size * 1.6, class: 'cn-mono cn-rise', style: delay(0.15 * i), fill: color || C.ink, 'font-size': size, text: t });
      g.appendChild(el);
      return el;
    });
  }
  function panel(x, y, w, h, stroke) {
    const c = 22;
    return s('path', { d: `M${x + c} ${y}H${x + w}V${y + h - c}L${x + w - c} ${y + h}H${x}V${y + c}Z`, fill: 'rgba(10,16,32,0.88)', stroke: stroke || C.line, 'stroke-width': 2 });
  }

  // ---------------------------------------------------------------- décors
  const shots = {};

  shots.title = (g, o) => {
    stars(g, 11, 160);
    g.appendChild(s('rect', { x: 0, y: 449, width: W, height: 2, fill: C.sodium, class: 'cn-wipe', style: origin(800, 450) }));
    g.appendChild(s('text', { x: 800, y: 420, 'text-anchor': 'middle', class: 'cn-display cn-title-in', 'font-size': o.big.length > 14 ? 84 : 120, fill: C.ink, text: o.big }));
    g.appendChild(s('text', { x: 800, y: 520, 'text-anchor': 'middle', class: 'cn-body cn-rise', style: delay(0.9), 'font-size': 30, fill: C.sodium, text: o.sub || '' }));
  };

  /** Station vue de l'extérieur, Terre en contrebas ; `lit` modules réparés sur 6. */
  function station(g, o) {
    stars(g, 5, 220);
    g.appendChild(s('circle', { cx: 800, cy: 1720, r: 1050, fill: 'url(#cn-earth)' }));
    g.appendChild(s('circle', { cx: 800, cy: 1720, r: 1062, fill: 'none', stroke: 'rgba(110,190,255,0.45)', 'stroke-width': 14, filter: 'url(#cn-glow-v)' }));
    const st = s('g', { class: 'cn-float', style: origin(800, 380) });
    [-1, 1].forEach((side) => {
      const px = 800 + side * 330;
      st.appendChild(s('line', { x1: 800 + side * 70, y1: 380, x2: px, y2: 380, stroke: C.line, 'stroke-width': 8 }));
      for (let i = 0; i < 4; i++) st.appendChild(s('rect', { x: px + side * i * 52 - (side < 0 ? 48 : 0), y: 330, width: 46, height: 100, fill: '#1b3266', stroke: '#4d74c4', 'stroke-width': 2 }));
    });
    const ring = s('g', { class: 'cn-spin-slow', style: origin(800, 380) });
    ring.appendChild(s('circle', { cx: 800, cy: 380, r: 210, fill: 'none', stroke: '#33476f', 'stroke-width': 22 }));
    ring.appendChild(s('circle', { cx: 800, cy: 380, r: 210, fill: 'none', stroke: '#0e1527', 'stroke-width': 3, 'stroke-dasharray': '6 18' }));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = 800 + Math.cos(a) * 210;
      const y = 380 + Math.sin(a) * 210;
      ring.appendChild(s('line', { x1: 800, y1: 380, x2: x, y2: y, stroke: '#2a3a62', 'stroke-width': 6 }));
      const lit = i < (o.lit || 0);
      ring.appendChild(s('rect', { x: x - 26, y: y - 18, width: 52, height: 36, rx: 6, fill: lit ? C.sodium : '#3a2030', stroke: lit ? '#fff2cf' : C.rust, 'stroke-width': 2,
        class: lit ? 'cn-pop' : 'cn-blink', style: delay(lit ? 0.4 + i * 0.35 : i * 0.3), filter: lit ? 'url(#cn-glow-s)' : null }));
    }
    st.appendChild(ring);
    st.appendChild(s('circle', { cx: 800, cy: 380, r: 62, fill: '#1d2a4a', stroke: C.vega, 'stroke-width': 3 }));
    st.appendChild(s('circle', { cx: 800, cy: 380, r: 20, fill: C.vega, class: 'cn-pulse', filter: 'url(#cn-glow-v)' }));
    g.appendChild(st);
    if (o.alarm) g.appendChild(s('rect', { width: W, height: H, fill: C.rust, class: 'cn-alarm' }));
  }
  shots.station = station;

  shots.storm = (g, o, api) => {
    station(g, { lit: 0, alarm: o.alarm });
    const front = s('g', { class: o.impact ? 'cn-storm-hit' : 'cn-storm' });
    front.appendChild(s('rect', { x: -900, y: 0, width: 900, height: H, fill: 'url(#cn-storm)' }));
    const r = rng(42);
    for (let i = 0; i < 140; i++) {
      const y = r() * H;
      front.appendChild(s('line', { x1: -r() * 900, y1: y, x2: -r() * 900 + 60, y2: y + (r() - 0.5) * 8, stroke: r() > 0.5 ? '#ffd8a0' : C.rust, 'stroke-width': 1 + r() * 3, opacity: 0.4 + r() * 0.6 }));
    }
    g.appendChild(front);
    if (o.impact) {
      g.appendChild(s('rect', { width: W, height: H, fill: '#fff', class: 'cn-flash' }));
      api.shake();
    }
  };

  shots.cockpit = (g, o, api) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#060a14' }));
    const win = s('g', null);
    win.appendChild(s('clipPath', { id: 'cn-win' }, s('path', { d: 'M260 90H1340L1480 300V620H120V300Z' })));
    const view = s('g', { 'clip-path': 'url(#cn-win)' });
    view.appendChild(s('rect', { width: W, height: H, fill: '#03060f' }));
    stars(view, 21, 150);
    view.appendChild(s('circle', { cx: 1180, cy: 980, r: 520, fill: 'url(#cn-earth)', class: 'cn-drift-slow' }));
    win.appendChild(view);
    win.appendChild(s('path', { d: 'M260 90H1340L1480 300V620H120V300Z', fill: 'none', stroke: '#24324f', 'stroke-width': 18 }));
    win.appendChild(s('line', { x1: 800, y1: 90, x2: 800, y2: 620, stroke: '#24324f', 'stroke-width': 12 }));
    g.appendChild(win);
    // Console de bord.
    g.appendChild(s('path', { d: 'M0 640L220 600H1380L1600 640V900H0Z', fill: '#0e1527', stroke: C.line, 'stroke-width': 2 }));
    const r = rng(8);
    for (let i = 0; i < 36; i++) {
      const x = 160 + (i % 18) * 72;
      const y = 660 + Math.floor(i / 18) * 46;
      const col = o.alarm && r() > 0.6 ? C.rust : r() > 0.7 ? C.sodium : C.vega;
      g.appendChild(s('rect', { x, y, width: 40 + r() * 20, height: 10, rx: 2, fill: col, opacity: 0.7, class: 'cn-blink', style: delay(r() * 2, 'animation-duration:' + (0.8 + r() * 2) + 's') }));
    }
    // Silhouette du cadet, de trois quarts dos, éclairée par la console.
    const rim = o.alarm ? C.rust : o.calm ? C.sodium : C.vega;
    const body = s('g', { class: 'cn-breathe', style: origin(470, 900) });
    // Dossier du siège de pilotage, puis épaules, cou, casque et micro de casque.
    body.appendChild(s('path', { d: 'M250 900V560Q250 500 310 500H630Q690 500 690 560V900Z', fill: '#0a1020', stroke: C.line, 'stroke-width': 3 }));
    body.appendChild(s('path', { d: 'M180 900C190 700 300 610 470 600C640 610 750 700 760 900Z', fill: '#04060c', stroke: rim, 'stroke-width': 3, 'stroke-opacity': 0.75 }));
    body.appendChild(s('rect', { x: 425, y: 520, width: 90, height: 100, fill: '#04060c' }));
    body.appendChild(s('circle', { cx: 470, cy: 430, r: 112, fill: '#04060c', stroke: rim, 'stroke-width': 3.5, 'stroke-opacity': 0.9 }));
    body.appendChild(s('path', { d: 'M372 380Q470 300 568 380', fill: 'none', stroke: rim, 'stroke-width': 2, 'stroke-opacity': 0.35 }));
    body.appendChild(s('rect', { x: 572, y: 400, width: 22, height: 64, rx: 8, fill: '#0e1527', stroke: rim, 'stroke-width': 2 }));
    const com = s('circle', { cx: 583, cy: 476, r: 6, fill: rim, opacity: 0.3, filter: 'url(#cn-glow-v)' });
    body.appendChild(com);
    g.appendChild(body);
    api.frame((t, env) => com.setAttribute('opacity', String(0.3 + env * 0.7)));
    if (o.alarm) {
      [0, W].forEach((x, i) => g.appendChild(s('circle', { cx: x, cy: 0, r: 420, fill: C.rust, class: 'cn-alarm', style: delay(i * 0.5) })));
    }
    if (o.calm) g.appendChild(s('rect', { width: W, height: H, fill: C.sodium, opacity: 0.06 }));
  };

  shots.vega = (g, o, api) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#040811' }));
    g.appendChild(s('rect', { width: W, height: H, fill: 'url(#cn-grid)', opacity: 0.5 }));
    const eye = s('g', { class: o.glitch ? 'cn-flicker' : '' });
    [320, 270, 225].forEach((r, i) => eye.appendChild(s('circle', { cx: 800, cy: 430, r, fill: 'none', stroke: C.vega, 'stroke-opacity': 0.25 + i * 0.15, 'stroke-width': 2 + i,
      'stroke-dasharray': i === 0 ? '4 14' : i === 1 ? '120 30 20 30' : '2 6', class: i % 2 ? 'cn-spin-rev' : 'cn-spin-slow', style: origin(800, 430) })));
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      eye.appendChild(s('line', { x1: 800 + Math.cos(a) * 340, y1: 430 + Math.sin(a) * 340, x2: 800 + Math.cos(a) * 360, y2: 430 + Math.sin(a) * 360, stroke: C.vega, 'stroke-width': 3, opacity: 0.5 }));
    }
    const iris = s('circle', { cx: 800, cy: 430, r: 150, fill: 'url(#cn-iris)', filter: 'url(#cn-glow-v)' });
    const pupil = s('circle', { cx: 800, cy: 430, r: 46, fill: '#041018' });
    const spark = s('circle', { cx: 770, cy: 400, r: 12, fill: '#fff', opacity: 0.85 });
    eye.appendChild(iris); eye.appendChild(pupil); eye.appendChild(spark);
    g.appendChild(eye);
    const words = ['MEM 0x3F2A', 'HEAP 61 %', 'GC ▲', 'THREAD main', 'JVM 21', 'CLASSPATH OK', 'STACK 12'];
    words.forEach((w, i) => g.appendChild(s('text', { x: i % 2 ? 1220 : 180, y: 220 + i * 80, class: 'cn-mono cn-rise', style: delay(0.3 + i * 0.25), 'font-size': 20, fill: C.vega, opacity: 0.6, text: w })));
    if (o.glitch) {
      for (let i = 0; i < 5; i++) g.appendChild(s('rect', { x: 0, y: 200 + i * 110, width: W, height: 14, fill: C.vega, opacity: 0.15, class: 'cn-glitch', style: delay(i * 0.37) }));
    }
    api.frame((t, env) => {
      pupil.setAttribute('r', String(40 + env * 26));
      iris.setAttribute('r', String(146 + env * 10));
    });
  };

  shots.rust = (g, o, api) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#0a0507' }));
    const blob = s('g', { filter: 'url(#cn-warp)', class: o.fade ? 'cn-dissolve' : '' });
    blob.appendChild(s('circle', { cx: 1180, cy: 430, r: 260, fill: 'rgba(255,90,79,0.14)' }));
    blob.appendChild(s('circle', { cx: 1180, cy: 430, r: 170, fill: 'rgba(255,90,79,0.22)' }));
    const core = s('circle', { cx: 1180, cy: 430, r: 70, fill: C.rust, filter: 'url(#cn-glow-r)' });
    blob.appendChild(core);
    g.appendChild(blob);
    const r = rng(99);
    const tendrils = s('g', { class: o.fade ? 'cn-dissolve' : '' });
    for (let i = 0; i < 14; i++) {
      const y0 = r() * H;
      const d = `M${W} ${y0} C ${1300 - r() * 200} ${y0 + (r() - 0.5) * 300}, ${900 - r() * 300} ${r() * H}, ${300 + r() * 500} ${r() * H}`;
      tendrils.appendChild(s('path', { d, fill: 'none', stroke: C.rust, 'stroke-width': 1 + r() * 3, 'stroke-opacity': 0.5, pathLength: 1, class: 'cn-draw', style: delay(r() * 1.5, 'animation-duration:' + (2 + r() * 2) + 's') }));
    }
    g.appendChild(tendrils);
    g.appendChild(panel(140, 230, 760, 70 + (o.lines || []).length * 48, o.contained ? C.vega : 'rgba(255,90,79,0.5)'));
    const texts = codeLines(g, o.lines || [], 180, 300, 28, C.ink);
    texts.forEach((t, i) => g.appendChild(s('rect', { x: 180 + (r() * 380), y: 300 + i * 44.8 - 26, width: 40 + r() * 120, height: 32, fill: C.rust, class: 'cn-glitch', style: delay(0.6 + r() * 2), opacity: 0.0 })));
    if (o.contained) {
      const hex = 'M1180 150L1420 290V570L1180 710L940 570V290Z';
      g.appendChild(s('path', { d: hex, fill: 'none', stroke: C.vega, 'stroke-width': 4, pathLength: 1, class: 'cn-draw', filter: 'url(#cn-glow-v)' }));
    }
    g.appendChild(s('rect', { width: W, height: H, filter: 'url(#cn-noise)', opacity: 0.07 }));
    api.frame((t, env) => {
      core.setAttribute('r', String(60 + env * 50));
      g.setAttribute('transform', env > 0.75 ? `translate(${(Math.random() - 0.5) * 10} ${(Math.random() - 0.5) * 6})` : '');
    });
  };

  shots.radio = (g, o, api) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#090703' }));
    g.appendChild(panel(380, 90, 840, 680, 'rgba(255,181,71,0.6)'));
    g.appendChild(s('text', { x: 420, y: 140, class: 'cn-mono', 'font-size': 20, fill: C.sodium, text: 'LIAISON · KOUROU-ORBITAL · CANAL 7' }));
    g.appendChild(s('circle', { cx: 1170, cy: 133, r: 8, fill: C.rust, class: 'cn-blink' }));
    const holo = s('g', { class: o.static ? 'cn-flicker-hard' : 'cn-flicker-soft' });
    // Buste de la commandante : casquette, casque audio, micro.
    holo.appendChild(s('path', { d: 'M560 770C570 610 660 560 800 552C940 560 1030 610 1040 770Z', fill: 'rgba(255,181,71,0.16)', stroke: C.sodium, 'stroke-width': 2 }));
    holo.appendChild(s('path', { d: 'M700 600L800 680L900 600', fill: 'none', stroke: C.sodium, 'stroke-width': 2, opacity: 0.6 }));
    holo.appendChild(s('ellipse', { cx: 800, cy: 420, rx: 108, ry: 128, fill: 'rgba(255,181,71,0.14)', stroke: C.sodium, 'stroke-width': 2 }));
    holo.appendChild(s('path', { d: 'M686 360Q800 250 914 360L930 380H670Z', fill: 'rgba(255,181,71,0.35)', stroke: C.sodium, 'stroke-width': 2 }));
    holo.appendChild(s('path', { d: 'M690 400Q690 300 800 296Q910 300 910 400', fill: 'none', stroke: C.sodium, 'stroke-width': 6 }));
    holo.appendChild(s('rect', { x: 672, y: 395, width: 26, height: 60, rx: 10, fill: C.sodium }));
    holo.appendChild(s('path', { d: 'M686 452Q700 520 770 520', fill: 'none', stroke: C.sodium, 'stroke-width': 4 }));
    const mic = s('circle', { cx: 776, cy: 520, r: 9, fill: C.sodium, filter: 'url(#cn-glow-s)' });
    holo.appendChild(mic);
    [760, 840].forEach((x) => holo.appendChild(s('rect', { x: x - 20, y: 410, width: 40, height: 6, rx: 3, fill: C.sodium, opacity: 0.8 })));
    holo.appendChild(s('rect', { x: 380, y: 90, width: 840, height: 680, fill: 'url(#cn-scan)' }));
    g.appendChild(holo);
    const bars = [];
    for (let i = 0; i < 48; i++) {
      const b = s('rect', { x: 430 + i * 15.5, y: 720, width: 9, height: 4, fill: C.sodium, opacity: 0.85 });
      bars.push(b);
      g.appendChild(b);
    }
    if (o.static) g.appendChild(s('rect', { x: 380, y: 90, width: 840, height: 680, filter: 'url(#cn-noise)', opacity: 0.5 }));
    api.frame((t, env) => {
      bars.forEach((b, i) => {
        const hgt = 4 + env * 60 * (0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i * 0.7)));
        b.setAttribute('height', hgt.toFixed(1));
        b.setAttribute('y', (722 - hgt / 2).toFixed(1));
      });
      mic.setAttribute('r', String(7 + env * 6));
    });
  };

  function gateRing(g, cx, cy, R, open, red) {
    const col = red ? C.rust : C.vega;
    const tunnel = s('g', null);
    for (let i = 0; i < 7; i++) tunnel.appendChild(s('circle', { cx, cy, r: R * 0.9, fill: 'none', stroke: col, 'stroke-width': 2, opacity: 0.6 * open, class: 'cn-warp', style: origin(cx, cy) + ';' + delay(i * 0.45) }));
    tunnel.appendChild(s('circle', { cx, cy, r: R * 0.85, fill: col, opacity: 0.08 + open * 0.25, filter: 'url(#cn-glow-v)' }));
    g.appendChild(tunnel);
    const ring = s('g', { class: 'cn-spin-slow', style: origin(cx, cy) });
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / n * 0.75;
      const p = (a, r) => (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
      const lit = i / n < open;
      ring.appendChild(s('path', { d: `M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, R + 46)} A${R + 46} ${R + 46} 0 0 0 ${p(a0, R + 46)}Z`,
        fill: lit ? col : '#1d2a4a', opacity: lit ? 0.9 : 1, stroke: '#0e1527', 'stroke-width': 3, class: lit ? 'cn-pop' : '', style: delay(i * 0.06), filter: lit ? 'url(#cn-glow-v)' : null }));
    }
    g.appendChild(ring);
  }

  shots.gate = (g, o) => {
    stars(g, 77, 120, true);
    gateRing(g, 800, 440, 280, o.open || 0);
  };

  shots.countdown = (g, o, api) => {
    stars(g, 3, 140);
    gateRing(g, 800, 440, 300, 0.25, o.rust);
    const col = o.rust ? C.rust : C.sodium;
    const t = s('text', { x: 800, y: 470, 'text-anchor': 'middle', class: 'cn-display' + (o.rust ? ' cn-flicker' : ''), 'font-size': 132, fill: col, filter: o.rust ? 'url(#cn-glow-r)' : 'url(#cn-glow-s)' });
    g.appendChild(t);
    g.appendChild(s('text', { x: 800, y: 540, 'text-anchor': 'middle', class: 'cn-body', 'font-size': 26, fill: C.ink, opacity: 0.7, text: 'Durée d\'ouverture de la fenêtre de saut' }));
    const from = o.from || 5400;
    api.frame((sec) => {
      const left = Math.max(0, Math.round(from - sec * (o.rust ? 37 : 1)));
      const hh = Math.floor(left / 3600);
      const mm = Math.floor((left % 3600) / 60);
      const ss = left % 60;
      t.textContent = [hh, mm, ss].map((x) => String(x).padStart(2, '0')).join(':');
    });
  };

  shots.map = (g, o) => {
    stars(g, 31, 120);
    const names = ['Archives', 'Réacteur', 'Plans', 'Forge', 'Mémoire', 'Saut'];
    g.appendChild(s('circle', { cx: 800, cy: 440, r: 280, fill: 'none', stroke: C.line, 'stroke-width': 3, 'stroke-dasharray': '3 9' }));
    g.appendChild(s('circle', { cx: 800, cy: 440, r: 60, fill: '#0e1527', stroke: C.vega, 'stroke-width': 3, class: 'cn-pulse' }));
    g.appendChild(s('text', { x: 800, y: 448, 'text-anchor': 'middle', class: 'cn-display', 'font-size': 22, fill: C.vega, text: 'VEGA' }));
    names.forEach((n, i) => {
      const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
      const x = 800 + Math.cos(a) * 280;
      const y = 440 + Math.sin(a) * 280;
      const lit = i < (o.light || 0);
      const d0 = 0.6 + i * 1.1;
      g.appendChild(s('line', { x1: 800, y1: 440, x2: x, y2: y, stroke: C.sodium, 'stroke-width': 2, pathLength: 1, class: lit ? 'cn-draw' : '', style: delay(d0), opacity: lit ? 0.7 : 0 }));
      g.appendChild(s('circle', { cx: x, cy: y, r: 34, fill: '#151f38', stroke: lit ? C.sodium : C.line, 'stroke-width': 3, class: lit ? 'cn-pop' : '', style: delay(d0), filter: lit ? 'url(#cn-glow-s)' : null }));
      g.appendChild(s('text', { x, y: y + 8, 'text-anchor': 'middle', class: 'cn-display' + (lit ? ' cn-pop' : ''), style: delay(d0), 'font-size': 22, fill: lit ? C.ink : C.dim, text: '0' + (i + 1) }));
      g.appendChild(s('text', { x: x + (Math.cos(a) >= -0.01 ? 52 : -52), y: y + 8, 'text-anchor': Math.cos(a) >= -0.01 ? 'start' : 'end', class: 'cn-body cn-rise', style: delay(d0), 'font-size': 28, fill: C.sodium, text: n }));
    });
  };

  shots.archives = (g, o) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#050913' }));
    const chapters = ['JVM', 'Concepts', 'Objets', 'static', 'enum', 'Héritage', 'Polymorphisme', 'Abstrait', 'Imbriquées', 'Collections', 'Exceptions', 'UML classes', 'UML séquence', 'Cas d\'utilisation', 'Patrons'];
    const r = rng(15);
    chapters.forEach((name, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = 230 + col * 240;
      const y = 170 + row * 210;
      const dx = ((r() - 0.5) * 300).toFixed(0);
      const dy = ((r() - 0.5) * 200).toFixed(0);
      const rot = ((r() - 0.5) * 50).toFixed(0);
      const scatter = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)';
      const card = s('g', { class: 'cn-card' + (o.sort && !o.lit ? ' cn-sorting' : ''), style: origin(x + 95, y + 75) + ';--scatter:' + scatter + ';' + (o.sort ? delay(i * 0.08) : 'transform:' + scatter) });
      const lit = o.lit;
      card.appendChild(s('rect', { x, y, width: 190, height: 150, rx: 8, fill: '#0e1527', stroke: lit ? C.vega : C.line, 'stroke-width': 2, class: lit ? 'cn-pop' : '', style: delay(1 + i * 0.12), filter: lit ? 'url(#cn-glow-v)' : null }));
      card.appendChild(s('text', { x: x + 18, y: y + 50, class: 'cn-display', 'font-size': 38, fill: lit ? C.vega : C.dim, text: String(i + 1).padStart(2, '0') }));
      card.appendChild(s('text', { x: x + 18, y: y + 110, class: 'cn-body', 'font-size': 22, fill: C.ink, text: name }));
      g.appendChild(card);
    });
  };

  shots.reactor = (g, o, api) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#0a0704' }));
    const core = s('circle', { cx: 800, cy: 450, r: 220, fill: 'url(#cn-core)', class: 'cn-pulse' });
    g.appendChild(core);
    [300, 360, 420].forEach((R, i) => {
      const ring = s('g', { class: i % 2 ? 'cn-spin-rev' : 'cn-spin', style: origin(800, 450) + ';animation-duration:' + (10 + i * 6) + 's' });
      ring.appendChild(s('circle', { cx: 800, cy: 450, r: R, fill: 'none', stroke: C.sodium, 'stroke-opacity': 0.45 - i * 0.1, 'stroke-width': 3 + (2 - i) * 2, 'stroke-dasharray': (30 + i * 20) + ' ' + (12 + i * 8) }));
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + i;
        ring.appendChild(s('rect', { x: 800 + Math.cos(a) * R - 8, y: 450 + Math.sin(a) * R - 8, width: 16, height: 16, fill: C.sodium, opacity: 0.8 }));
      }
      g.appendChild(ring);
    });
    const r = rng(7);
    const n = Math.round((o.rust || 0) * 16);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const R = 180 + r() * 260;
      g.appendChild(s('circle', { cx: 800 + Math.cos(a) * R, cy: 450 + Math.sin(a) * R, r: 14 + r() * 30, fill: C.rust, opacity: 0.55, filter: 'url(#cn-glow-r)', class: 'cn-blink', style: delay(r() * 2) }));
    }
    api.frame((t, env) => core.setAttribute('r', String(210 + env * 30 + Math.sin(t * 3) * 6)));
  };

  shots.blueprint = (g, o) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#06142b' }));
    g.appendChild(s('rect', { width: W, height: H, fill: 'url(#cn-grid)' }));
    const box = (x, y, w, name, italic, i) => {
      const grp = s('g', { class: 'cn-rise', style: delay(0.2 + i * 0.25) });
      grp.appendChild(s('rect', { x, y, width: w, height: 90, fill: 'rgba(110,231,245,0.06)', stroke: C.vega, 'stroke-width': 2 }));
      grp.appendChild(s('line', { x1: x, y1: y + 40, x2: x + w, y2: y + 40, stroke: C.vega, 'stroke-width': 1.5 }));
      grp.appendChild(s('text', { x: x + w / 2, y: y + 28, 'text-anchor': 'middle', class: 'cn-mono', 'font-size': 22, 'font-style': italic ? 'italic' : 'normal', fill: C.ink, text: name }));
      g.appendChild(grp);
    };
    box(170, 160, 230, 'Station', false, 0);
    box(680, 160, 240, 'Module', true, 1);
    box(500, 470, 230, 'Reacteur', false, 2);
    box(880, 470, 200, 'Serre', false, 3);
    box(1220, 160, 240, '«interface»', false, 4);
    box(1150, 640, 200, 'Equipe', false, 5);
    box(1370, 470, 200, 'Ingenieur', false, 6);
    const line = (d, dash, i) => g.appendChild(s('path', { d, fill: 'none', stroke: C.vega, 'stroke-width': 2.5, 'stroke-dasharray': dash || null, pathLength: dash ? null : 1, class: dash ? 'cn-rise' : 'cn-draw', style: delay(1.6 + i * 0.5) }));
    // Composition Station ◆— Module.
    line('M400 205H680', null, 0);
    g.appendChild(s('path', { d: 'M400 205l18 -10l18 10l-18 10Z', fill: C.vega, class: 'cn-pop', style: delay(1.9) }));
    // Héritage Reacteur, Serre —▷ Module.
    line('M615 470V320H770V250', null, 1);
    line('M980 470V320H830V250', null, 2);
    g.appendChild(s('path', { d: 'M800 250l-16 30h32Z', fill: '#06142b', stroke: C.vega, 'stroke-width': 2.5, class: 'cn-pop', style: delay(2.6) }));
    // Réalisation Module ..▷ interface.
    line('M920 205H1220', '10 8', 3);
    g.appendChild(s('path', { d: 'M1220 205l-30 -16v32Z', fill: '#06142b', stroke: C.vega, 'stroke-width': 2.5, class: 'cn-pop', style: delay(3.2) }));
    // Agrégation Equipe ◇— Ingenieur.
    line('M1350 685H1470V560', null, 4);
    g.appendChild(s('path', { d: 'M1350 685l18 -10l18 10l-18 10Z', fill: '#06142b', stroke: C.vega, 'stroke-width': 2.5, class: 'cn-pop', style: delay(3.6) }));
    const mults = [[420, 190, '1'], [640, 190, '1..*'], [1390, 670, '0..1'], [1480, 590, '*']];
    mults.forEach(([x, y, t], i) => {
      g.appendChild(s('text', { x, y, class: 'cn-mono ' + (o.mult ? 'cn-pop' : 'cn-ghost'), style: delay(o.mult ? 1 + i * 0.4 : 2.2 + i * 0.3), 'font-size': 26, fill: o.mult ? C.sodium : C.vega, filter: o.mult ? 'url(#cn-glow-s)' : null, text: t }));
      if (o.rust) g.appendChild(s('circle', { cx: x + 16, cy: y - 8, r: 30, fill: C.rust, opacity: 0, class: 'cn-smudge', style: delay(1 + i * 0.6), filter: 'url(#cn-glow-r)' }));
    });
  };

  shots.forge = (g, o, api) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#0b0705' }));
    g.appendChild(s('ellipse', { cx: 800, cy: 900, rx: 900, ry: 260, fill: 'rgba(255,140,60,0.18)', filter: 'url(#cn-glow-s)' }));
    g.appendChild(panel(300, 120, 1000, 560, 'rgba(255,181,71,0.55)'));
    g.appendChild(s('text', { x: 340, y: 170, class: 'cn-mono', 'font-size': 20, fill: C.sodium, text: 'FORGE · Vega.java' }));
    const src = ['public class Vega {', '  private static Vega instance;', '', '  private Vega() { }', '', '  public static Vega getInstance() {', '    if (instance == null) instance = new Vega();', '    return instance;', '  }', '}'];
    const texts = src.map((t, i) => {
      const el = s('text', { x: 350, y: 230 + i * 42, class: 'cn-mono', 'font-size': 26, fill: C.ink, text: o.type ? '' : t, opacity: o.type ? 1 : 0.35 });
      g.appendChild(el);
      return el;
    });
    const caret = s('rect', { width: 14, height: 30, fill: C.sodium, class: 'cn-blink', x: 350, y: 205 });
    if (o.type) g.appendChild(caret);
    if (o.type || o.sparks) {
      const r = rng(5);
      for (let i = 0; i < 40; i++) {
        g.appendChild(s('circle', { cx: 500 + r() * 600, cy: 860, r: 1.5 + r() * 3, fill: r() > 0.3 ? C.sodium : '#fff2cf', class: 'cn-spark',
          style: '--sx:' + ((r() - 0.5) * 300).toFixed(0) + 'px;--sy:' + (-300 - r() * 500).toFixed(0) + 'px;' + delay(r() * 2.5, 'animation-duration:' + (1.2 + r() * 1.5) + 's') }));
      }
    }
    if (!o.type) return;
    const total = src.join('').length;
    api.frame((t) => {
      let left = Math.floor(t * 34);
      if (left > total) left = total;
      let last = 0;
      src.forEach((line, i) => {
        const n = Math.max(0, Math.min(line.length, left));
        texts[i].textContent = line.slice(0, n);
        if (left > 0) last = i;
        left -= line.length;
      });
      const bb = texts[last].getBBox ? texts[last].getBBox() : { x: 350, width: 0 };
      caret.setAttribute('x', String(350 + (texts[last].textContent ? bb.width + 4 : 0)));
      caret.setAttribute('y', String(205 + last * 42));
    });
  };

  shots.memory = (g, o) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#040811' }));
    const r = rng(64);
    const pts = Array.from({ length: 32 }, (_, i) => ({ x: 160 + r() * 1280, y: 110 + r() * 680, i }));
    const lit = o.n || 0;
    pts.forEach((p, i) => {
      const q = pts[(i * 7 + 3) % pts.length];
      const on = i < lit;
      g.appendChild(s('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: on ? C.vega : C.line, 'stroke-width': on ? 2 : 1, 'stroke-opacity': on ? 0.7 : 0.35, pathLength: 1, class: on ? 'cn-draw' : '', style: delay(i * 0.12) }));
    });
    pts.forEach((p, i) => {
      const on = i < lit;
      g.appendChild(s('circle', { cx: p.x, cy: p.y, r: on ? 9 : 5, fill: on ? C.vega : C.dim, class: on ? 'cn-pop' : '', style: delay(i * 0.12), filter: on ? 'url(#cn-glow-v)' : null }));
    });
  };

  shots.code = (g, o) => {
    g.appendChild(s('rect', { width: W, height: H, fill: '#050913' }));
    g.appendChild(s('rect', { width: W, height: H, fill: 'url(#cn-grid)', opacity: 0.4 }));
    const lines = o.lines || [];
    const top = 450 - (lines.length * 54) / 2;
    g.appendChild(panel(220, top - 70, 1160, lines.length * 54 + 90 + (o.bad !== undefined ? 70 : 0)));
    const texts = codeLines(g, lines, 270, top + 10, 34, C.ink);
    if (o.bad !== undefined) {
      const y = top + 10 + o.bad * 54.4 + 12;
      g.appendChild(s('path', { d: 'M270 ' + y + ' ' + Array.from({ length: 30 }, (_, i) => 'l10 ' + (i % 2 ? -6 : 6)).join(' '), fill: 'none', stroke: C.rust, 'stroke-width': 3, pathLength: 1, class: 'cn-draw', style: delay(5) }));
      g.appendChild(s('text', { x: 270, y: y + 50, class: 'cn-mono cn-rise', style: delay(5.6), 'font-size': 24, fill: C.rust, text: 'error: incompatible types: Animal cannot be converted to Cheval' }));
    }
    if (o.fix !== undefined) {
      const y = top + 10 + o.fix * 54.4;
      g.appendChild(s('rect', { x: 240, y: y - 38, width: 1120, height: 52, fill: 'rgba(82,224,161,0.12)', stroke: C.ok, 'stroke-width': 1.5, class: 'cn-pop', style: delay(1) }));
      g.appendChild(s('text', { x: 1330, y: y, 'text-anchor': 'end', class: 'cn-display cn-pop', style: delay(1.3), 'font-size': 34, fill: C.ok, text: '✓' }));
    }
  };

  O.cinemaShots = shots;
  O.cinemaSvg = { s, defs, W, H };
})(window);
