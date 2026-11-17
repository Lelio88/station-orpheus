/**
 * ui.js — Composants d'interface partagés par les modules de la station.
 *
 * pageHead : en-tête standard (retour, sur-titre, titre, chapô).
 * vega     : bulle de l'IA de bord.
 * blocks   : rendu des blocs de contenu des Archives (p, list, code, table…).
 * mcq      : question à choix multiple notée, avec explication.
 * Invariant : ces fonctions renvoient des nœuds DOM, sans effet de bord
 * sur le store ; c'est l'appelant qui attribue l'XP via onAnswer.
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h, p, code, callout } = O.util;

  function pageHead(eyebrow, title, lead, backHref) {
    return h('div', { class: 'page-head' },
      h('a', { class: 'back', href: '#' + (backHref || 'hub') }, '← ' + (backHref && backHref !== 'hub' ? 'Retour' : 'Pont de la station')),
      h('span', { class: 'eyebrow' }, eyebrow),
      h('h1', null, title),
      lead ? p(lead) : null);
  }

  function vega(text, extra) {
    const paras = (Array.isArray(text) ? text : [text]).map((t) => p(t));
    return h('div', { class: 'vega' }, h('div', { class: 'vega-eye', 'aria-hidden': 'true' }),
      h('div', { class: 'vega-text' }, h('span', { class: 'who' }, 'VEGA'), paras, extra || null));
  }

  function table(head, rows) {
    return h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, head.map((c) => h('th', { html: O.util.rich(c) })))),
      h('tbody', null, rows.map((r) => h('tr', null, r.map((c) => h('td', { html: O.util.rich(c) })))))));
  }

  function blocks(list) {
    return list.map((b) => {
      switch (b.t) {
        case 'p': return p(b.s);
        case 'h': return h('h3', null, b.s);
        case 'list': return h('ul', null, b.items.map((i) => h('li', { html: O.util.rich(i) })));
        case 'code': return code(b.s);
        case 'trap': return callout('trap', 'Piège d\'examen', b.s);
        case 'copy': return callout('copy', 'Pour la copie', b.s);
        case 'vega': return vega(b.s);
        case 'table': return table(b.head, b.rows);
        case 'uml': return O.uml.render(b.d);
        case 'link': return h('div', { class: 'row' }, h('a', { class: 'btn primary', href: b.href }, b.s));
        default: return null;
      }
    });
  }

  /**
   * Question à choix multiple.
   * opts.q, opts.c (choix : texte, ou {code}), opts.a (index juste), opts.why,
   * opts.onAnswer(ok), opts.shuffle (mélanger l'ordre affiché).
   */
  function mcq(opts) {
    const order = opts.shuffle === false ? opts.c.map((_, i) => i) : O.util.shuffle(opts.c.map((_, i) => i));
    const box = h('div', { class: 'stack' });
    const why = h('div', { class: 'why', hidden: true });
    let done = false;
    const buttons = order.map((idx, k) => {
      const ch = opts.c[idx];
      let content;
      if (typeof ch === 'object' && ch.code) content = h('pre', null, ch.code);
      else if (typeof ch === 'object' && ch.uml) content = O.uml.render(ch.uml);
      else if (typeof ch === 'object' && ch.seq) content = O.seq.render(ch.seq);
      else content = h('span', { html: O.util.rich(ch) });
      const b = h('button', { class: 'choice', type: 'button' }, h('span', { class: 'key' }, String.fromCharCode(65 + k)), content);
      b.addEventListener('click', () => {
        if (done) return;
        done = true;
        const ok = idx === opts.a;
        b.classList.add(ok ? 'right' : 'wrong');
        buttons.forEach((bb, kk) => { bb.disabled = true; if (order[kk] === opts.a) bb.classList.add('right'); });
        O.fx.sound[ok ? 'ok' : 'bad']();
        why.hidden = false;
        why.appendChild(callout(ok ? '' : 'trap', ok ? 'Exact' : 'Pas tout à fait', opts.why || ''));
        if (opts.onAnswer) opts.onAnswer(ok);
      });
      return b;
    });
    if (opts.q) box.appendChild(h('p', { class: 'card-q', html: O.util.rich(opts.q) }));
    if (opts.code) box.appendChild(code(opts.code));
    if (opts.uml) box.appendChild(O.uml.render(opts.uml));
    if (opts.seq) box.appendChild(O.seq.render(opts.seq));
    box.appendChild(h('div', { class: 'choices' }, buttons));
    box.appendChild(why);
    return box;
  }

  function powerBar(x) {
    const n = 10;
    const on = Math.round(x * n);
    return h('div', { class: 'power' },
      h('div', { class: 'power-bar', role: 'img', 'aria-label': 'Énergie ' + O.util.pct(x) + ' %' },
        Array.from({ length: n }, (_, i) => h('i', { class: i < on ? 'on' + (x >= 0.999 ? ' full' : '') : '' }))),
      h('b', null, O.util.pct(x) + '%'));
  }

  function tabs(names, onSelect, initial) {
    const bar = h('div', { class: 'tabs', role: 'tablist' });
    const btns = names.map((n, i) => h('button', { role: 'tab', type: 'button', 'aria-selected': String(i === (initial || 0)) }, n));
    btns.forEach((b, i) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-selected', 'false'));
      b.setAttribute('aria-selected', 'true');
      onSelect(i);
    }));
    O.util.append(bar, btns);
    return bar;
  }

  O.ui = { pageHead, vega, blocks, mcq, powerBar, tabs, table };
})(window);
