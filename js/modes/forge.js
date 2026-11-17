/**
 * forge.js — Module « Forge » : écrire du code Java à la main.
 *
 * Pour chaque exercice, trois paliers :
 *  1. Briefing : énoncé, points clés, diagramme.
 *  2. Assemblage : remettre les lignes dans l'ordre (avec lignes pièges).
 *     Les segments d'un même groupe peuvent être permutés.
 *  3. Rédaction libre : écrire tout le code comme sur la copie ; le scanner
 *     vérifie les éléments attendus (expressions régulières), puis le
 *     corrigé s'affiche. Le brouillon est conservé dans le navigateur.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p, code, shuffle } = O.util;
  const DRAFT_KEY = 'orpheus-forge-draft-';

  function solutionText(ex) { return ex.solution.map((s) => s.lines.join('\n')).join('\n'); }

  /** Toutes les suites de lignes acceptées (permutations dans les groupes). */
  function acceptedSequences(ex) {
    let seqs = [[]];
    let k = 0;
    const segs = ex.solution;
    while (k < segs.length) {
      const g = segs[k].group;
      const run = [segs[k]];
      while (g && k + run.length < segs.length && segs[k + run.length].group === g) run.push(segs[k + run.length]);
      const perms = run.length > 1 && run.length <= 5 ? permutations(run) : [run];
      const next = [];
      seqs.forEach((s) => perms.forEach((pm) => next.push(s.concat(...pm.map((x) => x.lines)))));
      seqs = next.slice(0, 2000);
      k += run.length;
    }
    return seqs.map((s) => s.map((l) => l.trim()).join('\n'));
  }
  function permutations(a) {
    if (a.length <= 1) return [a];
    const out = [];
    a.forEach((x, i) => permutations(a.slice(0, i).concat(a.slice(i + 1))).forEach((pm) => out.push([x].concat(pm))));
    return out;
  }

  function parsons(ex, mount) {
    const lines = [].concat(...ex.solution.map((s) => s.lines)).concat(ex.distractors || []);
    const pool = shuffle(lines.map((t, i) => ({ t, i })));
    const answer = [];
    const poolEl = h('div', { class: 'p-zone', 'aria-label': 'Lignes disponibles' });
    const ansEl = h('div', { class: 'p-zone', 'aria-label': 'Ton programme' });
    const msg = h('div', { class: 'stack' });
    function draw() {
      poolEl.innerHTML = '';
      ansEl.innerHTML = '';
      pool.forEach((l) => poolEl.appendChild(h('button', { class: 'p-line', type: 'button', onclick: () => { pool.splice(pool.indexOf(l), 1); answer.push(l); O.fx.sound.click(); draw(); } }, l.t)));
      answer.forEach((l) => ansEl.appendChild(h('button', { class: 'p-line', type: 'button', title: 'Renvoyer dans la réserve', onclick: () => { answer.splice(answer.indexOf(l), 1); pool.push(l); draw(); } }, l.t)));
      if (!answer.length) ansEl.appendChild(p('Clique sur les lignes de gauche dans l\'ordre du programme. Certaines lignes sont des pièges.', 'faint'));
    }
    const check = h('button', { class: 'btn primary', type: 'button' }, 'Vérifier l\'assemblage');
    check.addEventListener('click', () => {
      msg.innerHTML = '';
      const mine = answer.map((l) => l.t.trim()).join('\n');
      const ok = acceptedSequences(ex).includes(mine);
      O.fx.sound[ok ? 'ok' : 'bad']();
      if (ok) {
        const first = !(O.store.state.forge[ex.id] || {}).parsons;
        O.store.update((s) => { s.forge[ex.id] = { ...(s.forge[ex.id] || {}), parsons: true }; });
        O.store.gainXP(first ? 30 : 5, 'Assemblage réussi');
        msg.appendChild(O.util.callout('', 'Assemblage conforme', 'Passe à la rédaction libre : c\'est elle qui ressemble au médian.'));
      } else {
        const traps = answer.filter((l) => (ex.distractors || []).includes(l.t));
        const missing = lines.length - (ex.distractors || []).length - (answer.length - traps.length);
        msg.appendChild(O.util.callout('trap', 'Pas encore', [
          traps.length ? traps.length + ' ligne(s) piège utilisée(s) : ' + traps.map((t) => '`' + t.t.trim() + '`').join(', ') : 'Aucune ligne piège utilisée.',
          missing > 0 ? 'Il manque ' + missing + ' ligne(s).' : 'Toutes les bonnes lignes sont là : vérifie l\'ordre (accolades, attributs avant méthodes).',
        ]));
      }
    });
    draw();
    O.util.add(mount, h('div', { class: 'parsons' }, h('div', { class: 'stack' }, h('span', { class: 'eyebrow' }, 'Réserve'), poolEl), h('div', { class: 'stack' }, h('span', { class: 'eyebrow' }, 'Ton programme'), ansEl)),
      h('div', { class: 'row' }, check, h('button', { class: 'btn ghost', type: 'button', onclick: () => { pool.push(...answer.splice(0)); draw(); msg.innerHTML = ''; } }, 'Tout remettre')), msg);
  }

  function readDraft(id) { try { return root.localStorage.getItem(DRAFT_KEY + id) || ''; } catch (e) { return ''; } }
  function writeDraft(id, v) { try { root.localStorage.setItem(DRAFT_KEY + id, v); } catch (e) { /* brouillon non conservé */ } }

  function writing(ex, mount) {
    const ta = h('textarea', { class: 'editor', id: 'forge-editor', spellcheck: 'false', placeholder: '// Écris ici le code complet, comme sur ta copie.\n// Indente proprement : le correcteur ne fait aucun effort de lecture.' });
    ta.value = readDraft(ex.id);
    ta.addEventListener('input', () => writeDraft(ex.id, ta.value));
    ta.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const s = ta.selectionStart;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = s + 4;
    });
    const out = h('div', { class: 'stack' });
    const scan = h('button', { class: 'btn primary', type: 'button' }, 'Lancer le scanner de la Forge');
    scan.addEventListener('click', () => {
      out.innerHTML = '';
      const src = ta.value.replace(/\/\/[^\n]*/g, '').replace(/[ \t]+/g, ' ');
      const results = ex.checks.map((c) => ({ c, ok: new RegExp(c.re, 'i').test(src) }));
      const ratio = results.filter((r) => r.ok).length / results.length;
      const prev = (O.store.state.forge[ex.id] || {}).write || 0;
      O.store.update((s) => { s.forge[ex.id] = { ...(s.forge[ex.id] || {}), write: Math.max(prev, ratio) }; });
      O.store.gainXP(ratio > prev ? Math.round(60 * (ratio - prev)) + 5 : 3, 'Scan de la Forge');
      O.fx.sound[ratio >= 0.8 ? 'ok' : 'bad']();
      O.util.add(out, 
        h('div', { class: 'row' }, h('span', { class: 'pill-score ' + O.util.scoreClass(ratio) }, O.util.pct(ratio) + ' % des éléments attendus')),
        h('ul', { class: 'checks' }, results.map((r) => h('li', { class: r.ok ? 'pass' : 'fail' }, h('span', { class: 'mark' }, r.ok ? '✓' : '✗'),
          h('span', null, h('b', null, r.c.label), r.ok ? '' : h('span', { class: 'dim' }, ' — ' + r.c.hint))))),
        p('Le scanner cherche les éléments que le correcteur attend ; il ne compile pas. Compare toujours avec le corrigé.', 'faint'),
        h('details', { class: 'reveal' }, h('summary', null, 'Corrigé de VEGA'), h('div', null, code(solutionText(ex)))));
    });
    O.util.add(mount, p('Écris tout sans regarder le corrigé. Tab insère 4 espaces. Ton brouillon est gardé dans ce navigateur.', 'dim'), ta, h('div', { class: 'row' }, scan), out);
  }

  function exercise(view, id) {
    const ex = O.data.forge.find((x) => x.id === id);
    if (!ex) { list(view); return; }
    const mount = h('div', { class: 'stack' });
    const brief = () => {
      const lessonLink = O.patrons.lessonById(ex.id)
        ? h('a', { class: 'btn ghost small', href: '#forge--lecon-' + ex.id }, 'Revoir la leçon sur ce patron (rôles, séquence, erreurs)')
        : null;
      O.util.add(mount, 
        lessonLink ? h('div', { class: 'row' }, lessonLink) : null,
        O.util.callout('', 'Énoncé (' + ex.src + ')', ex.brief),
        h('h3', null, 'À retenir'),
        h('ul', { class: 'prose' }, ex.key.map((k) => h('li', { html: O.util.rich(k) }))),
        ex.diagram ? O.uml.render(ex.diagram) : null,
        h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => tabsEl.querySelectorAll('button')[1].click() }, 'Passer à l\'assemblage')));
    };
    const panes = [brief, () => parsons(ex, mount), () => writing(ex, mount)];
    const tabsEl = O.ui.tabs(['1 · Briefing', '2 · Assemblage', '3 · Rédaction libre'], (i) => { mount.innerHTML = ''; panes[i](); });
    O.util.add(view, O.ui.pageHead('Forge · ' + (ex.kind === 'patron' ? 'patron de conception' : 'code classique'), ex.title, null, 'forge--exercices'),
      tabsEl, h('section', { class: 'panel chamfer' }, mount));
    brief();
  }

  function list(view, startTab) {
    const st = O.store.state.forge;
    const item = (ex) => {
      const s = st[ex.id] || {};
      return h('a', { class: 'list-item', href: '#forge--' + ex.id },
        h('div', { class: 'l' }, h('span', { class: 't' }, ex.title), h('span', { class: 'meta' }, ex.src)),
        h('div', { class: 'row' }, s.parsons ? h('span', { class: 'tag ok' }, 'Assemblé') : h('span', { class: 'tag' }, 'À assembler'),
          h('span', { class: 'pill-score ' + O.util.scoreClass(s.write || 0) }, 'Scan ' + O.util.pct(s.write || 0) + ' %')));
    };
    const mount = h('div', { class: 'stack' });
    const exercises = () => O.util.add(mount, 
      h('h2', null, 'Patrons de conception'), h('div', { class: 'list' }, O.data.forge.filter((x) => x.kind === 'patron').map(item)),
      h('h2', null, 'Code classique des annales'), h('div', { class: 'list' }, O.data.forge.filter((x) => x.kind === 'classique').map(item)));
    const panes = [() => O.patrons.overview(mount), exercises];
    const nLus = Object.keys(((O.store.state.learn || {}).lus) || {}).length;
    const start = startTab !== undefined ? startTab : (nLus >= 4 ? 1 : 0);
    O.util.add(view, 
      O.ui.pageHead('Module 04 · Forge', 'Forger le code à la main', 'Partie III du médian (7 à 9 points) : le patron est expliqué dans l\'énoncé, il faut l\'écrire proprement sur papier. Commence par les leçons, puis chaque exercice : briefing, assemblage, rédaction libre analysée par le scanner.'),
      O.ui.tabs(['1 · Apprendre les patrons', '2 · Exercices'], (i) => { mount.innerHTML = ''; panes[i](); }, start),
      mount);
    panes[start]();
  }

  O.modes = O.modes || {};
  O.modes.forge = (view, param) => {
    if (!param) return list(view);
    if (param === 'apprendre') return list(view, 0);
    if (param === 'exercices') return list(view, 1);
    if (param.startsWith('lecon-')) return O.patrons.lesson(view, param.slice(6));
    return exercise(view, param);
  };
  O.forgeSolution = (id) => { const ex = O.data.forge.find((x) => x.id === id); return ex ? solutionText(ex) : ''; };
})(window);
