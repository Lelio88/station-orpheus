/**
 * saut.js — Module « Simulateur de saut » : examens blancs complets.
 *
 * Déroulé : briefing (durée, temps conseillé par partie) → sujet affiché avec
 * chronomètre de 1 h 30, réponses sur papier → correction question par
 * question : corrigé + points de barème à cocher → note sur 20 enregistrée.
 * Les corrigés réutilisent les autres modules : réponses du moteur pour les
 * cas (dossier), solution de la Forge, plan du Bureau, carte de la Mémoire.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p, code } = O.util;
  const E = root.VerdictEngine;
  let timer = null;

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  root.addEventListener('hashchange', stopTimer);

  function resolve(q) {
    const card = q.card ? O.data.flashcards.find((c) => c.id === q.card) : null;
    return { keys: q.keys || (card ? card.pts : []), answer: q.answer || (card ? card.model : null) };
  }

  function dossierJava(id) {
    const d = O.data.dossiers.find((x) => x.id === id);
    const lines = [];
    d.cases.forEach((c) => { lines.push('// ' + c.label); c.stmts.forEach((s) => lines.push(E.stmtJava(s))); });
    return lines.join('\n');
  }

  function dossierCorrection(id) {
    const d = O.data.dossiers.find((x) => x.id === id);
    const w = typeof d.universe === 'string' ? O.UNIVERSES[d.universe] : d.universe;
    const env = {};
    const rows = d.cases.map((c) => {
      const r = E.runCase(w, env, c.stmts);
      const fixes = r.lines.filter((l) => l.fix).map((l) => l.fix);
      const comp = r.verdict === 'compile' ? 'Non → ' + (fixes.length ? fixes.join(' ; ') : 'pas de correction simple') : 'Oui';
      const exec = r.exc ? 'Non : ' + r.exc : 'Oui';
      return [c.label, comp, exec, r.out.length ? r.out.join(' / ') : '—'];
    });
    return O.ui.table(['Cas', 'Compile ?', 'S\'exécute ?', 'Affichage'], rows);
  }

  function isCode(s) { return /\n/.test(s) && /[{;]/.test(s); }

  function statement(ex) {
    return ex.parts.map((part) => h('section', { class: 'panel' },
      h('div', { class: 'row between' }, h('h2', null, part.title), h('span', { class: 'pts' }, '~' + part.pts + ' pts · ' + part.minutes + ' min conseillées')),
      (part.intro || []).map((t) => p(t)),
      part.annex === 'animaux' ? h('details', { class: 'reveal', open: true }, h('summary', null, 'Annexe A — diagramme et code'), h('div', null, O.uml.render(O.data.annexes.animaux.uml), code(O.data.annexes.animaux.code))) : null,
      part.questions.map((q) => h('div', { class: 'exam-q' },
        h('h4', null, q.n + ' ', h('span', { class: 'pts' }, '(' + q.pts + ' pt' + (q.pts > 1 ? 's' : '') + ')')),
        p(q.q),
        q.dossier ? code(dossierJava(q.dossier)) : null,
        q.plan ? h('details', { class: 'reveal' }, h('summary', null, 'Énoncé complet de la partie UML'), h('div', null, O.data.uml.plans.find((x) => x.id === q.plan).context.map((t) => p(t)))) : null))));
  }

  function correction(ex, mount) {
    mount.innerHTML = '';
    const checks = [];
    const sections = ex.parts.map((part) => h('section', { class: 'panel' }, h('h2', null, part.title),
      part.questions.map((q) => {
        const r = resolve(q);
        const boxes = r.keys.map((k, i) => h('input', { type: 'checkbox', id: 'k-' + q.n + '-' + i }));
        checks.push({ q, boxes });
        const body = [];
        if (q.dossier) body.push(p('Corrigé calculé par le moteur du Réacteur :'), dossierCorrection(q.dossier));
        if (q.forge) body.push(code(O.forgeSolution(q.forge)));
        if (q.plan) body.push(O.uml.render(O.data.uml.plans.find((x) => x.id === q.plan).diagram));
        if (q.uml) body.push(O.uml.render(q.uml));
        if (r.answer) body.push(isCode(r.answer) ? code(r.answer) : O.util.callout('copy', 'Réponse attendue', r.answer));
        return h('div', { class: 'exam-q' },
          h('h4', null, q.n + ' ', h('span', { class: 'pts' }, '(' + q.pts + ' pts)')), p(q.q, 'dim'),
          h('details', { class: 'reveal' }, h('summary', null, 'Voir le corrigé'), h('div', null, body)),
          h('ul', { class: 'checks' }, r.keys.map((k, i) => h('li', null, h('label', { for: boxes[i].id }, boxes[i], h('span', null, k))))));
      })));
    const total = ex.parts.reduce((a, pt) => a + pt.pts, 0);
    const result = h('div', { class: 'stack' });
    const grade = h('button', { class: 'btn primary', type: 'button' }, 'Calculer ma note');
    grade.addEventListener('click', () => {
      let score = 0;
      checks.forEach(({ q, boxes }) => { if (boxes.length) score += q.pts * boxes.filter((b) => b.checked).length / boxes.length; });
      const note = Math.round((score / total) * 20 * 10) / 10;
      O.store.update((s) => { s.exams[ex.id] = (s.exams[ex.id] || []).concat({ date: Date.now(), score: note, max: 20 }); });
      O.store.gainXP(Math.round(60 + note * 8), 'Saut simulé');
      grade.disabled = true;
      O.fx.sound[note >= 10 ? 'level' : 'bad']();
      O.util.add(result, h('div', { class: 'row' }, h('span', { class: 'eyebrow' }, 'Note estimée'), h('span', { class: 'timer' }, String(note).replace('.', ',') + ' / 20')),
        O.ui.vega(note >= 14 ? 'Saut réussi. La moyenne de l\'UE tourne autour de 10,5 : tu es nettement au-dessus.' : note >= 10 ? 'Saut réussi de justesse. Repère les questions où tu as perdu le plus de points et va dans le module correspondant.' : 'Saut avorté. Pas de panique : refais les dossiers du Réacteur et la Forge du patron de ce sujet, puis retente un autre sujet.'));
    });
    O.util.add(mount, 
      O.ui.vega('Correction. Ouvre chaque corrigé, compare avec ta copie, et coche honnêtement les points de barème que tu as. La note est une estimation : les barèmes détaillés sont reconstitués par VEGA.'),
      sections, h('section', { class: 'panel chamfer' }, h('div', { class: 'row' }, grade), result));
  }

  function run(view, id) {
    const ex = O.data.exams.find((x) => x.id === id);
    if (!ex) { list(view); return; }
    stopTimer();
    const mount = h('div', { class: 'stack' });
    O.util.add(view, O.ui.pageHead('Simulateur de saut', ex.title, 'Conditions réelles : documents interdits, 1 h 30, réponses sur papier. Le chronomètre tourne dès le lancement.', 'saut'), mount);
    const runs = O.store.state.exams[ex.id] || [];
    O.util.add(mount, h('section', { class: 'panel chamfer' },
      h('span', { class: 'eyebrow' }, 'Plan de vol'),
      O.ui.table(['Partie', 'Barème', 'Temps conseillé'], ex.parts.map((pt) => [pt.title, '~' + pt.pts + ' pts', pt.minutes + ' min'])),
      runs.length ? p('Tes passages précédents : ' + runs.map((r) => String(r.score).replace('.', ',') + '/20').join(', ') + '.', 'dim') : null,
      O.ui.vega('Prends une copie et un stylo. Les étudiants des années précédentes disent que le médian est « difficile à finir niveau temps » : respecte le temps conseillé par partie.'),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: launch }, 'Lancer le saut (1 h 30)'), h('button', { class: 'btn ghost', type: 'button', onclick: () => correction(ex, mount) }, 'Aller directement à la correction'))));

    function launch() {
      mount.innerHTML = '';
      let left = ex.duration * 60;
      let paused = false;
      const t = h('span', { class: 'timer', role: 'timer', 'aria-live': 'off' });
      const pause = h('button', { class: 'btn small ghost', type: 'button' }, 'Pause');
      pause.addEventListener('click', () => { paused = !paused; pause.textContent = paused ? 'Reprendre' : 'Pause'; });
      const end = h('button', { class: 'btn small primary', type: 'button' }, 'Terminer et corriger');
      end.addEventListener('click', () => { stopTimer(); correction(ex, mount); window.scrollTo(0, 0); });
      const draw = () => {
        const m = Math.floor(left / 60);
        const s = left % 60;
        t.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      };
      draw();
      timer = setInterval(() => {
        if (paused) return;
        left -= 1;
        draw();
        if (left === 30 * 60) O.fx.toast('30 minutes', 'Il reste une demi-heure. Assure la partie code.');
        if (left <= 0) { stopTimer(); O.fx.toast('Temps écoulé', 'Stylos posés. Passage à la correction.'); correction(ex, mount); }
      }, 1000);
      O.util.add(mount, h('section', { class: 'panel', style: { position: 'sticky', top: '70px', zIndex: 5 } }, h('div', { class: 'row between' }, t, h('div', { class: 'row' }, pause, end))), statement(ex));
    }
  }

  function list(view) {
    const st = O.store.state.exams;
    O.util.add(view, 
      O.ui.pageHead('Module 06 · Simulateur de saut', 'Les vrais sujets, en conditions réelles', 'Cinq médians complets (A21 à A25), dans l\'ordre du plus récent. Fais-les sur papier, chronométré, puis corrige-toi point par point.'),
      h('div', { class: 'list' }, O.data.exams.map((ex) => {
        const runs = st[ex.id] || [];
        const best = runs.reduce((m, r) => Math.max(m, r.score), 0);
        return h('a', { class: 'list-item', href: '#saut--' + ex.id },
          h('div', { class: 'l' }, h('span', { class: 't' }, ex.title), h('span', { class: 'meta' }, ex.parts.map((pt) => pt.title.replace(/^[IV]+\.\s*/, '')).join(' · '))),
          runs.length ? h('span', { class: 'pill-score ' + O.util.scoreClass(best / 20) }, String(best).replace('.', ',') + ' / 20') : h('span', { class: 'tag' }, 'Jamais tenté'));
      })),
      O.ui.vega('Conseil de vol : garde au moins un sujet (A25, le plus récent) pour la veille de l\'examen, en conditions réelles.'));
  }

  O.modes = O.modes || {};
  O.modes.saut = (view, param) => (param ? run(view, param) : list(view));
})(window);
