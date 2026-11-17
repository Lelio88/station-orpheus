/**
 * util.js — Petits outils partagés : création de DOM, coloration Java,
 * mélange aléatoire, échappement HTML.
 *
 * Choix : pas de framework. h() construit les éléments ; tout texte passé en
 * enfant devient un nœud texte (donc jamais interprété comme HTML). Seuls
 * les contenus rédigés dans les fichiers de données passent par html(), qui
 * accepte un balisage léger maîtrisé (**gras**, `code`, retours à la ligne).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v === null || v === undefined || v === false) return;
        if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    append(el, kids);
    return el;
  }

  function append(el, kids) {
    kids.flat(Infinity).forEach((k) => {
      if (k === null || k === undefined || k === false) return;
      el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    });
    return el;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /** Balisage léger des textes de cours : **gras**, *italique*, `code`. */
  function rich(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
      .replace(/\n/g, '<br>');
  }
  function p(s, cls) {
    return h('p', { class: cls || null, html: rich(s) });
  }

  const KW = new Set(('abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws true false try void while var String').split(' '));

  /** Coloration syntaxique Java minimale. hlLines : numéros de lignes (1-based) à surligner. */
  function highlightJava(src, hlLines) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b([A-Za-z_]\w*)\b|\b(\d+(?:\.\d+)?[fFdDlL]?)\b/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += '<span class="cm">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="st">' + esc(m[2]) + '</span>';
      else if (m[3]) {
        if (KW.has(m[3]) && m[3] !== 'String') out += '<span class="kw">' + m[3] + '</span>';
        else if (/^[A-Z]/.test(m[3])) out += '<span class="ty">' + m[3] + '</span>';
        else out += m[3];
      } else if (m[4]) out += '<span class="nu">' + m[4] + '</span>';
      last = re.lastIndex;
    }
    out += esc(src.slice(last));
    if (hlLines && hlLines.length) {
      out = out.split('\n').map((l, i) => (hlLines.includes(i + 1) ? '<span class="hl">' + l + '</span>' : l)).join('\n');
    }
    return out;
  }

  function code(src, hlLines) {
    return h('pre', { class: 'code', html: highlightJava(src, hlLines) });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pct(x) {
    return Math.round(Math.max(0, Math.min(1, x)) * 100);
  }

  function scoreClass(x) {
    if (x >= 0.75) return 'good';
    if (x >= 0.45) return 'mid';
    return 'low';
  }

  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function daysUntil(iso) {
    if (!iso) return null;
    const target = new Date(iso + 'T08:00:00');
    const ms = target - new Date();
    return Math.ceil(ms / 86400000);
  }

  /** Bloc de rappel (piège, phrase pour la copie, info VEGA). */
  function callout(kind, label, text) {
    return h('div', { class: 'callout ' + (kind || '') },
      h('b', { class: 'lbl' + (kind ? '' : ' v') }, label),
      ...(Array.isArray(text) ? text : [text]).map((t) => (typeof t === 'string' ? p(t) : t)));
  }

  /** Comme el.append, mais déplie les listes et ignore null/false (el.append afficherait « null »). */
  function add(el, ...kids) {
    return append(el, kids);
  }

  O.util = { h, append, add, esc, rich, p, code, highlightJava, shuffle, pick, pct, scoreClass, todayISO, daysUntil, callout };
})(window);
