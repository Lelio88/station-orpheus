/**
 * reacteur.js — Module « Réacteur » : prédire compilation, exécution, affichage.
 *
 * Trois modes :
 *  - Entraînement infini : cas générés au hasard dans un univers ; bouclier
 *    de 3 points, combo qui multiplie l'XP. Le tirage vise une répartition
 *    réaliste des verdicts (beaucoup d'erreurs de compilation, comme au médian).
 *  - Dossiers : les cas des annales, en « combat de boss ».
 *  - Traces d'exceptions : QCM sur try/catch/finally (cours 7).
 * Toutes les réponses viennent de verdict-engine.js : rien n'est codé en dur.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p, code, shuffle, pick } = O.util;
  const E = root.VerdictEngine;
  const VERDICTS = [
    { id: 'compile', label: 'Ne compile pas' },
    { id: 'ClassCastException', label: 'Compile · ClassCastException' },
    { id: 'NullPointerException', label: 'Compile · NullPointerException' },
    { id: 'ok', label: 'Compile et s\'exécute' },
  ];

  function worldOf(u) { return typeof u === 'string' ? O.UNIVERSES[u] : u; }
  function cloneEnv(env) {
    const c = {};
    Object.entries(env).forEach(([k, v]) => { c[k] = { ...v, dyns: v.dyns ? v.dyns.slice() : undefined }; });
    return c;
  }

  // ---------- Statistiques ----------
  function record(ok, step) {
    O.store.update((s) => {
      if (step === 1) {
        s.verdict.answered += 1;
        if (ok) s.verdict.correct += 1;
        s.verdict.recent = s.verdict.recent.concat(ok ? 1 : 0).slice(-40);
      }
    });
  }

  // ---------- Générateur ----------
  function concreteClasses(w) { return Object.keys(w.types).filter((t) => w.types[t].kind === 'class' && !w.types[t].abstract); }
  function allTypes(w) { return Object.keys(w.types); }
  function allMethods(w) {
    const set = new Set();
    Object.values(w.types).forEach((t) => Object.keys(t.methods || {}).forEach((m) => set.add(m)));
    return [...set];
  }
  function supersOf(w, c) { return [...E.ancestors(w, c)].filter((t) => t !== 'Object'); }

  function buildContext(w) {
    const env = {};
    const stmts = [];
    const used = {};
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const c = pick(concreteClasses(w));
      const t = pick(supersOf(w, c));
      const base = (w.vars && w.vars[t]) || t.toLowerCase();
      used[base] = (used[base] || 0) + 1;
      const name = base + used[base];
      const s = { decl: t, name, expr: { new: c } };
      E.runCase(w, env, [s]);
      stmts.push(s);
    }
    if (Math.random() < 0.15) {
      const t = pick(concreteClasses(w));
      const s = { decl: t, name: 'vide', expr: { null: true } };
      E.runCase(w, env, [s]);
      stmts.push(s);
    }
    return { env, stmts };
  }

  function randomTarget(w, env) {
    const vars = Object.keys(env);
    const v = pick(vars);
    const T = pick(allTypes(w));
    const K = Math.random() < 0.5 ? T : pick(allTypes(w));
    const fresh = 'x';
    const r = Math.random();
    if (r < 0.18) return { decl: T, name: fresh, expr: { new: pick(allTypes(w)) } };
    if (r < 0.36) return { decl: T, name: fresh, expr: { var: v } };
    if (r < 0.55) return { decl: T, name: fresh, expr: { cast: K, of: { var: v } } };
    if (r < 0.85) return { call: v, m: pick(allMethods(w)) };
    if (r < 0.93) return { call: v, castTo: pick(allTypes(w)), m: pick(allMethods(w)) };
    return { instanceof: v, type: T };
  }

  const TARGET_MIX = [['compile', 0.4], ['ok', 0.38], ['ClassCastException', 0.17], ['NullPointerException', 0.05]];
  function drawVerdict() {
    let r = Math.random();
    for (const [v, w] of TARGET_MIX) { if ((r -= w) <= 0) return v; }
    return 'ok';
  }

  function generate(w) {
    const want = drawVerdict();
    let fallback = null;
    for (let tries = 0; tries < 60; tries++) {
      const ctx = buildContext(w);
      const target = randomTarget(w, ctx.env);
      if (target.call && ctx.env[target.call].dyn === null && want !== 'NullPointerException' && Math.random() < 0.7) continue;
      const env = cloneEnv(ctx.env);
      let res;
      try { res = E.runCase(w, env, [target]); } catch (e) { continue; }
      const item = { world: w, context: ctx.stmts, preEnv: ctx.env, env, stmts: [target], res };
      if (res.verdict === want) return item;
      fallback = fallback || item;
    }
    return fallback;
  }

  // ---------- Choix d'affichage ----------
  function outputChoices(item) {
    const correct = item.res.out;
    const variants = [];
    const lines = item.res.lines;
    const callIdx = lines.map((l, i) => (l.out.length ? i : -1)).filter((i) => i >= 0).pop();
    if (callIdx !== undefined) {
      const stmt = item.stmts[callIdx];
      const before = [].concat(...lines.slice(0, callIdx).map((l) => l.out));
      const after = [].concat(...lines.slice(callIdx + 1).map((l) => l.out));
      if (stmt && stmt.call) {
        E.wrongOutputs(item.world, item.env, stmt).forEach((w) => variants.push(before.concat(w, after)));
        // Leurres supplémentaires : la même méthode exécutée sur les autres classes.
        Object.keys(item.world.types).forEach((t) => {
          const o = E.outputOf(item.world, t, stmt.m);
          if (o) variants.push(before.concat(o, after));
        });
      } else if (stmt && stmt.foreach) {
        const arr = item.env[stmt.arr];
        const st = [].concat(...arr.dyns.map(() => E.outputOf(item.world, arr.elem, stmt.m) || []));
        variants.push(before.concat(st, after));
        variants.push(before.concat(...arr.dyns.map((d) => { const o = E.outputOf(item.world, d, stmt.m) || []; return o.slice(-1); }), after));
      } else if (stmt && stmt.instanceof) {
        variants.push(before.concat(lines[callIdx].out.map((x) => (x === 'true' ? 'false' : x === 'false' ? 'true' : x)), after));
      }
    }
    variants.push(correct.slice().reverse());
    // Complément : affichages d'autres méthodes de l'univers, seuls ou ajoutés
    // (erreurs typiques : mauvaise méthode, super oublié ou imaginé).
    const pool = [];
    Object.keys(item.world.types).forEach((t) => Object.keys(item.world.types[t].methods || {}).forEach((m) => {
      const o = E.outputOf(item.world, t, m);
      if (o) pool.push(o);
    }));
    shuffle(pool).forEach((o) => {
      variants.push(o);
      variants.push(o.concat(correct));
    });
    const key = (a) => a.join('\n');
    const seen = new Set([key(correct)]);
    const opts = [correct];
    variants.forEach((v) => { if (v.length && v.length <= correct.length + 2 && !seen.has(key(v))) { seen.add(key(v)); opts.push(v); } });
    return shuffle(opts.slice(0, 4)).map((o) => ({ lines: o, ok: key(o) === key(correct) }));
  }

  // ---------- Panneau de question ----------
  /**
   * Affiche un cas et gère les deux étapes de réponse.
   * done({ step1, step2 }) est appelé quand l'élève a fini (step2 null si pas d'affichage).
   */
  function questionPanel(item, codeEl, done) {
    const zone = h('div', { class: 'stack' });
    const res = item.res;
    const needsOutput = res.out.length > 0 && (res.verdict === 'ok' || res.verdict === 'compile');
    const vbtns = VERDICTS.map((v) => h('button', { class: 'choice', type: 'button' }, v.label));
    let answered = false;
    vbtns.forEach((b, i) => b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const ok = VERDICTS[i].id === res.verdict;
      vbtns.forEach((bb, k) => { bb.disabled = true; if (VERDICTS[k].id === res.verdict) bb.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      O.fx.sound[ok ? 'ok' : 'bad']();
      codeEl.classList.add(ok ? 'flash-ok' : 'shake');
      record(ok, 1);
      if (needsOutput) {
        step2(ok);
      } else {
        explain();
        done({ step1: ok, step2: null });
      }
    }));
    O.util.add(zone, h('span', { class: 'eyebrow' }, 'Étape 1 · Compilation et exécution'), h('div', { class: 'verdict-btns' }, vbtns));

    function step2(step1) {
      const opts = outputChoices(item);
      const title = res.verdict === 'compile' ? 'Étape 2 · Après correction, qu\'affiche la console ?' : 'Étape 2 · Qu\'affiche la console ?';
      let picked = false;
      const ob = opts.map((o, k) => {
        const b = h('button', { class: 'choice', type: 'button' }, h('span', { class: 'key' }, String.fromCharCode(65 + k)), h('pre', null, o.lines.join('\n')));
        b.addEventListener('click', () => {
          if (picked) return;
          picked = true;
          ob.forEach((bb, kk) => { bb.disabled = true; if (opts[kk].ok) bb.classList.add('right'); });
          if (!o.ok) b.classList.add('wrong');
          O.fx.sound[o.ok ? 'ok' : 'bad']();
          explain();
          done({ step1, step2: o.ok });
        });
        return b;
      });
      O.util.add(zone, h('span', { class: 'eyebrow' }, title), h('div', { class: 'choices' }, ob));
    }

    function explain() {
      const lines = res.lines.map((l) => h('li', null, h('code', null, l.java.split('\n')[0]), ' — ', l.why.join(' ')));
      O.util.add(zone, h('div', { class: 'callout' }, h('b', { class: 'lbl v' }, 'Analyse de VEGA'), h('ul', { class: 'why' }, lines)));
      if (res.out.length) O.util.add(zone, h('pre', { class: 'console' }, res.out.join('\n')));
    }
    return zone;
  }

  function hierarchyBlock(w) {
    return h('details', { class: 'reveal', open: root.innerWidth > 860 ? true : null },
      h('summary', null, 'Classes de l\'univers « ' + w.name + ' »'),
      h('div', null, code(E.universeJava(w))));
  }

  // ---------- Mode entraînement ----------
  function training(view, uid) {
    const w = uid && O.UNIVERSES[uid] ? O.UNIVERSES[uid] : null;
    let shield = 3;
    let combo = 0;
    let streakBest = 0;
    let count = 0;
    let good = 0;
    const hud = h('div', { class: 'row between' });
    const stage = h('div', { class: 'arena' });
    O.util.add(view, O.ui.pageHead('Réacteur · entraînement', 'Stabilise le cœur', 'Pour chaque ligne surlignée : compile-t-elle ? s\'exécute-t-elle ? qu\'affiche-t-elle ? Trois erreurs et le bouclier tombe.', 'reacteur'),
      h('section', { class: 'panel' }, hud), stage);

    function drawHud() {
      hud.innerHTML = '';
      O.util.add(hud, 
        h('div', { class: 'row' }, h('span', { class: 'eyebrow' }, 'Bouclier'), h('div', { class: 'shield' }, [0, 1, 2].map((i) => h('i', { class: i < shield ? '' : 'lost' })))),
        h('span', { class: 'combo' }, 'Combo ×' + (1 + Math.floor(combo / 3))),
        h('span', { class: 'dim' }, good + ' / ' + count + ' justes'));
    }

    function nextCase() {
      drawHud();
      stage.innerHTML = '';
      if (shield <= 0) { gameOver(); return; }
      const world = w || O.UNIVERSES[pick(Object.keys(O.UNIVERSES))];
      const item = generate(world);
      const ctxJava = item.context.map((s) => E.stmtJava(s));
      const all = ctxJava.concat(item.stmts.map((s) => E.stmtJava(s)));
      const codeEl = code(all.join('\n'), [all.length]);
      const left = h('section', { class: 'panel' }, h('span', { class: 'eyebrow' }, 'Extrait du main'), codeEl,
        p('Les lignes précédentes compilent et s\'exécutent sans erreur. Seule la ligne surlignée est jugée.', 'faint'), hierarchyBlock(world));
      const right = h('section', { class: 'panel chamfer' });
      right.appendChild(questionPanel(item, codeEl, (r) => {
        count += 1;
        const ok = r.step1 && r.step2 !== false;
        if (ok) {
          good += 1;
          combo += 1;
          streakBest = Math.max(streakBest, combo);
          O.store.update((s) => { s.verdict.best = Math.max(s.verdict.best, combo); });
          O.store.gainXP((r.step2 ? 15 : 10) * (1 + Math.floor((combo - 1) / 3)), combo >= 3 ? 'Combo ×' + combo : 'Verdict juste');
        } else {
          combo = 0;
          shield -= 1;
          if (r.step1) O.store.gainXP(4, 'Verdict juste, affichage faux');
        }
        drawHud();
        right.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: nextCase }, shield > 0 ? 'Ligne suivante' : 'Bilan')));
      }));
      O.util.add(stage, left, right);
    }

    function gameOver() {
      stage.innerHTML = '';
      O.util.add(stage, h('section', { class: 'panel chamfer', style: { gridColumn: '1 / -1' } },
        h('span', { class: 'eyebrow' }, 'Bouclier tombé'),
        h('h2', null, good + ' verdict(s) juste(s) sur ' + count),
        O.ui.vega(['Meilleur combo de la session : ' + streakBest + '.', 'Avant de relancer, relis l\'analyse des erreurs : la plupart viennent d\'une confusion entre type statique et type dynamique. Chapitre 07 des Archives si besoin.']),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { shield = 3; combo = 0; count = 0; good = 0; nextCase(); } }, 'Relancer'),
          h('a', { class: 'btn ghost', href: '#codex--polymorphisme' }, 'Chapitre 07'))));
    }
    nextCase();
  }

  // ---------- Mode dossier (boss) ----------
  function dossier(view, id) {
    const d = O.data.dossiers.find((x) => x.id === id);
    if (!d) { menu(view); return; }
    const w = worldOf(d.universe);
    const env = {};
    const results = d.cases.map((c) => {
      const before = cloneEnv(env);
      const res = E.runCase(w, env, c.stmts);
      return { c, res, preEnv: before, env: cloneEnv(env) };
    });
    const javaLines = [];
    const ranges = results.map((r) => {
      javaLines.push('// ' + r.c.label);
      const start = javaLines.length + 1;
      r.c.stmts.forEach((s) => E.stmtJava(s).split('\n').forEach((l) => javaLines.push(l)));
      return [start, javaLines.length];
    });
    let i = 0;
    let wins = 0;
    const hp = h('i', { style: { width: '100%' } });
    const stage = h('div', { class: 'arena' });
    O.util.add(view, O.ui.pageHead('Réacteur · dossier ' + d.id, d.title, d.src + '. ' + d.intro, 'reacteur'),
      h('section', { class: 'panel boss' }, h('div', { class: 'row between' }, h('span', { class: 'eyebrow' }, 'Boss : ' + d.boss), h('span', { class: 'dim' }, d.cases.length + ' cas')), h('div', { class: 'boss-hp' }, hp)),
      stage);

    function show() {
      stage.innerHTML = '';
      if (i >= results.length) { finish(); return; }
      const r = results[i];
      const hl = [];
      for (let k = ranges[i][0]; k <= ranges[i][1]; k++) hl.push(k);
      const codeEl = code(javaLines.join('\n'), hl);
      const item = { world: w, env: r.env, stmts: r.c.stmts, res: r.res };
      const left = h('section', { class: 'panel' }, h('span', { class: 'eyebrow' }, 'Le main du sujet · ' + r.c.label + ' surligné'), codeEl, hierarchyBlock(w));
      const right = h('section', { class: 'panel chamfer' }, h('h3', null, r.c.label));
      right.appendChild(questionPanel(item, codeEl, (ans) => {
        const ok = ans.step1 && ans.step2 !== false;
        if (ok) wins += 1;
        hp.style.width = O.util.pct(1 - (i + 1) / results.length) + '%';
        O.store.gainXP(ok ? 20 : 3, ok ? 'Coup porté au boss' : 'Cas étudié');
        right.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { i += 1; show(); } }, i + 1 < results.length ? 'Cas suivant' : 'Bilan du dossier')));
      }));
      O.util.add(stage, left, right);
      if (i > 0) left.querySelector('.hl') && left.querySelector('.hl').scrollIntoView({ block: 'nearest' });
    }

    function finish() {
      const score = wins / results.length;
      const prev = O.store.state.verdict.dossiers[d.id] || 0;
      O.store.update((s) => { s.verdict.dossiers[d.id] = Math.max(prev, score); });
      if (score > prev) O.store.gainXP(Math.round(60 * (score - prev)), 'Record sur le dossier');
      O.util.add(stage, h('section', { class: 'panel chamfer', style: { gridColumn: '1 / -1' } },
        h('span', { class: 'eyebrow' }, score >= 1 ? d.boss + ' est vaincue' : 'Le boss a survécu'),
        h('h2', null, wins + ' / ' + results.length + ' cas justes'),
        O.ui.vega(score >= 1 ? 'Parfait. Ce sujet ne peut plus te surprendre le jour J.' : 'Relance le dossier : au médian, chaque cas vaut environ un demi-point, c\'est le barème le plus rentable du sujet.'),
        h('div', { class: 'row' }, h('a', { class: 'btn primary', href: '#reacteur--d-' + d.id, onclick: () => setTimeout(() => root.dispatchEvent(new HashChangeEvent('hashchange')), 0) }, 'Rejouer'), h('a', { class: 'btn ghost', href: '#reacteur' }, 'Autres dossiers'))));
    }
    show();
  }

  // ---------- Traces d'exceptions ----------
  function traces(view) {
    const mount = h('div', { class: 'stack' });
    O.util.add(view, O.ui.pageHead('Réacteur · exceptions', 'Suivre une exception dans la pile', 'Cours 7 : une exception interrompt le bloc en cours et remonte la pile des appels jusqu\'au premier catch compatible. finally s\'exécute toujours.', 'reacteur'), mount);
    O.data.traces.forEach((t, i) => {
      mount.appendChild(h('section', { class: 'panel' }, h('span', { class: 'eyebrow' }, 'Trace ' + (i + 1) + ' · ' + t.title),
        O.ui.mcq({ q: t.q, code: t.code, c: t.c, a: t.a, why: t.why, onAnswer: (ok) => { record(ok, 1); O.store.gainXP(ok ? 12 : 2, 'Trace d\'exception'); } })));
    });
  }

  // ---------- Menu ----------
  function menu(view) {
    const s = O.store.state.verdict;
    const acc = s.recent.length ? s.recent.reduce((a, b) => a + b, 0) / s.recent.length : 0;
    O.util.add(view, 
      O.ui.pageHead('Module 02 · Réacteur', 'Compile ? Exécute ? Affiche ?', 'L\'exercice le plus fréquent du médian. Le moteur du Réacteur applique les vraies règles de Java (types statiques, transtypages, liaison dynamique) : chaque verdict est calculé, pas recopié.'),
      h('section', { class: 'panel' }, h('div', { class: 'row between' },
        h('div', null, h('span', { class: 'eyebrow' }, 'Précision récente'), h('h2', null, O.util.pct(acc) + ' %')),
        h('div', null, h('span', { class: 'eyebrow' }, 'Verdicts rendus'), h('h2', null, String(s.answered))),
        h('div', null, h('span', { class: 'eyebrow' }, 'Meilleur combo'), h('h2', null, '×' + s.best)))),
      h('h2', null, 'Entraînement infini'),
      h('div', { class: 'grid-3' },
        h('a', { class: 'module chamfer', href: '#reacteur--t-mix' }, h('span', { class: 'eyebrow' }, 'Recommandé'), h('h3', null, 'Tous les univers'), p('Cas tirés au hasard dans les quatre hiérarchies.', 'sub')),
        Object.values(O.UNIVERSES).map((u) => h('a', { class: 'module chamfer', href: '#reacteur--t-' + u.id }, h('span', { class: 'eyebrow' }, 'Univers'), h('h3', null, u.name), p(Object.keys(u.types).join(' · '), 'sub')))),
      h('h2', null, 'Dossiers d\'annales'),
      h('div', { class: 'list' }, O.data.dossiers.map((d) => {
        const best = s.dossiers[d.id] || 0;
        return h('a', { class: 'list-item', href: '#reacteur--d-' + d.id },
          h('div', { class: 'l' }, h('span', { class: 't' }, d.title), h('span', { class: 'meta' }, d.src + ' · boss : ' + d.boss)),
          h('span', { class: 'pill-score ' + O.util.scoreClass(best) }, O.util.pct(best) + ' %'));
      })),
      h('h2', null, 'Exceptions'),
      h('a', { class: 'list-item', href: '#reacteur--traces' }, h('div', { class: 'l' }, h('span', { class: 't' }, 'Traces d\'exceptions'), h('span', { class: 'meta' }, O.data.traces.length + ' programmes : try, catch, finally, throws, pile des appels')), h('span', { class: 'tag vega' }, 'Cours 7')));
  }

  O.modes = O.modes || {};
  O.modes.reacteur = (view, param) => {
    if (!param) return menu(view);
    if (param === 'traces') return traces(view);
    if (param.startsWith('t-')) return training(view, param.slice(2) === 'mix' ? null : param.slice(2));
    if (param.startsWith('d-')) return dossier(view, param.slice(2));
    return menu(view);
  };
})(window);
