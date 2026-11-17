/**
 * app.js — Démarrage de la station : routeur, HUD, séquence d'accueil.
 *
 * Routage par ancre simple (#codex, #reacteur…) ; un sous-écran s'écrit
 * #module--parametre (ex. #codex--polymorphisme), seule forme d'ancre que
 * l'hébergement transmet. Chaque module expose O.modes[nom](vue, param).
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h } = O.util;

  function renderHud() {
    const s = O.store.state;
    const r = O.store.rankOf(s.xp);
    const into = r.next ? (s.xp - r.xp) / (r.next.xp - r.xp) : 1;
    const days = O.util.daysUntil(s.examDate);
    const box = document.getElementById('hud-stats');
    box.innerHTML = '';
    const sound = h('button', { class: 'icon-btn', type: 'button', 'aria-label': s.sound ? 'Couper le son' : 'Activer le son', title: s.sound ? 'Son activé' : 'Son coupé' }, s.sound ? '♪' : '×');
    sound.addEventListener('click', () => O.store.update((st) => { st.sound = !st.sound; }));
    O.util.add(box, 
      h('span', { class: 'hud-chip' }, h('b', null, r.name)),
      h('span', { class: 'hud-chip', title: s.xp + ' XP' }, h('span', { class: 'xpbar' }, h('i', { style: { width: O.util.pct(into) + '%' } })), h('b', null, s.xp), 'XP'),
      h('span', { class: 'hud-chip', title: 'Jours de révision consécutifs' }, 'Série ', h('b', null, s.streak.count)),
      days !== null ? h('span', { class: 'hud-chip countdown', title: 'Jours avant le médian' }, 'Saut ', h('b', null, days >= 0 ? 'J-' + days : '—')) : null,
      sound);
  }

  function route() {
    const raw = (location.hash || '#hub').slice(1);
    const [name, ...rest] = raw.split('--');
    const param = rest.join('--') || null;
    const view = document.getElementById('view');
    view.innerHTML = '';
    view.classList.remove('view-enter');
    void view.offsetWidth;
    view.classList.add('view-enter');
    const mode = (O.modes || {})[name] || O.modes.hub;
    try {
      if (O.campaign && O.campaign.guard(name, view)) { window.scrollTo(0, 0); return; }
      mode(view, param);
      const strip = O.campaign && O.campaign.strip(raw, view);
      if (strip) view.insertBefore(strip, view.children[1] || null);
      if (O.store.state.name && O.story) O.story.onRoute(O.modes[name] ? name : 'hub');
    } catch (err) {
      view.innerHTML = '';
      O.util.add(view, h('section', { class: 'panel' }, h('h2', null, 'Ce module a rencontré une erreur'),
        h('p', null, 'Reviens au pont et réessaie. Détail : ' + (err && err.message ? err.message : String(err))),
        h('a', { class: 'btn', href: '#hub' }, 'Retour au pont')));
    }
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }

  /** Premier lancement : prologue en cinématique, puis VEGA demande le nom et la date du médian. */
  function onboarding() {
    if (O.cinema) O.cinema.play('prologue', { onEnd: askName });
    else askName();
  }

  function askName() {
    const L = O.data.lore.intro;
    const i = L.length - 1;
    const text = h('div', { class: 'vega-text', 'aria-live': 'polite' }, h('span', { class: 'who' }, 'VEGA · registre d\'équipage'));
    const line = h('p');
    text.appendChild(line);
    const zone = h('div', { class: 'stack' });
    const close = O.fx.modal([h('div', { class: 'vega' }, h('div', { class: 'vega-eye' }), text), zone], { sticky: true });

    function show() {
      line.textContent = L[i];
      {
        const name = h('input', { type: 'text', id: 'onb-name', placeholder: 'Ton nom de cadet', maxlength: 30 });
        const date = h('input', { type: 'date', id: 'onb-date', value: O.store.state.examDate });
        const go = h('button', { class: 'btn primary', type: 'button' }, 'Prendre mon poste');
        go.addEventListener('click', () => {
          O.store.update((s) => {
            s.name = name.value.trim() || 'Cadet';
            if (date.value) s.examDate = date.value;
          });
          O.fx.sound.level();
          close();
          O.store.gainXP(10, 'Prise de poste');
          route();
        });
        O.util.add(zone, 
          h('label', { class: 'stack', for: 'onb-name' }, h('span', { class: 'dim' }, 'Nom'), name),
          h('label', { class: 'stack', for: 'onb-date' }, h('span', { class: 'dim' }, 'Date du médian (tu pourras la changer dans le Journal de bord)'), date),
          go);
        name.focus();
      }
    }
    show();
  }

  function start() {
    O.fx.starfield();
    O.store.onChange(renderHud);
    renderHud();
    if (O.campaign) O.campaign.start();
    root.addEventListener('hashchange', route);
    route();
    if (!O.store.state.name) onboarding();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window);
