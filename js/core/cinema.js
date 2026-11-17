/**
 * cinema.js — Lecteur de cinématiques (O.cinema) et déclencheurs du récit (O.story).
 *
 * Le lecteur enchaîne les plans d'une scène de js/data/story.js : décor animé
 * (O.cinemaShots), réplique doublée (audio/<id>.mp3), sous-titres révélés au
 * rythme de la voix, bruitages et nappe synthétisés en WebAudio.
 *
 * Choix non évidents :
 *  - la durée et l'enveloppe de chaque réplique viennent de js/data/voices.js
 *    (généré) : l'animation suit la voix sans brancher l'audio dans WebAudio,
 *    ce qui le rendrait muet en file:// ;
 *  - sans voix (son coupé, fichier absent, lecture refusée), la scène se joue
 *    quand même, sous-titrée, avec les mêmes durées ;
 *  - les navigateurs exigent un geste avant de jouer du son : si aucun clic n'a
 *    encore eu lieu, un écran « liaison entrante » demande d'appuyer.
 * Invariants : une seule scène à la fois (les suivantes attendent dans une
 * file) ; une scène vue est notée dans state.story.seen et ne se relance
 * d'elle-même qu'une fois ; Échap passe toujours la scène.
 * Exemple : O.cinema.play('forge', { onEnd: () => {} })
 */
(function (root) {
  'use strict';
  const O = (root.ORPHEUS = root.ORPHEUS || {});
  const { h } = O.util;
  const GAP = 0.35;
  const FADE_MS = 550;

  let unlocked = false;
  ['pointerdown', 'keydown'].forEach((ev) => root.addEventListener(ev, () => { unlocked = true; }, { capture: true }));

  const st = () => O.store.state.story;
  const sceneById = (id) => O.data.story.scenes.find((x) => x.id === id);
  const voiceOn = () => O.store.state.sound && st().voice;

  // ------------------------------------------------------------ sons
  let actx = null;
  function ac() {
    if (!O.store.state.sound) return null;
    try {
      if (!actx) actx = new (root.AudioContext || root.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      return actx;
    } catch (e) { return null; }
  }
  function noiseBuffer(a, sec) {
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * sec), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  /** Bruit filtré bref : impact, grésillement radio, glitch de la Rouille. */
  function burst(freq, q, sec, vol, when) {
    const a = ac();
    if (!a) return;
    const src = a.createBufferSource();
    src.buffer = noiseBuffer(a, sec);
    const f = a.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = a.createGain();
    const t = a.currentTime + (when || 0);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + sec);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  }
  function boom() {
    const a = ac();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.frequency.setValueAtTime(120, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(28, a.currentTime + 1.6);
    g.gain.setValueAtTime(0.5, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 1.8);
    o.connect(g).connect(a.destination);
    o.start(); o.stop(a.currentTime + 1.9);
    burst(500, 0.4, 1.4, 0.5);
  }
  const SFX = {
    impact: boom,
    radio() { burst(2400, 1.2, 0.18, 0.18); burst(1800, 2, 0.5, 0.06, 0.2); },
    glitch() { [0, 0.07, 0.16].forEach((w) => burst(300 + Math.random() * 3000, 6, 0.06, 0.12, w)); },
    level() { O.fx.sound.level(); },
    drone() { /* la nappe est lancée pour chaque scène */ },
  };
  /** Nappe grave continue pendant la scène ; renvoie la fonction d'arrêt. */
  function drone() {
    const a = ac();
    if (!a) return () => {};
    const out = a.createGain();
    out.gain.setValueAtTime(0.0001, a.currentTime);
    out.gain.exponentialRampToValueAtTime(0.05, a.currentTime + 2.5);
    const lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 380;
    lp.connect(out).connect(a.destination);
    const oscs = [55, 55.4, 82.4].map((f, i) => {
      const o = a.createOscillator();
      o.type = i === 2 ? 'sine' : 'sawtooth';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
      return o;
    });
    return () => {
      const t = a.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      oscs.forEach((o) => o.stop(t + 1.3));
    };
  }

  // ------------------------------------------------------------ lecteur
  const queue = [];
  let current = null;

  function speakerName(who) {
    const c = O.data.story.cast[who];
    if (who === 'cadet' && O.store.state.name) return O.store.state.name;
    return c.name;
  }

  function play(id, opts) {
    const scene = sceneById(id);
    if (!scene) { if (opts && opts.onEnd) opts.onEnd(); return; }
    if (current) { queue.push([id, opts]); return; }
    current = build(scene, opts || {});
  }

  function build(scene, opts) {
    const { s, defs } = O.cinemaSvg;
    const svg = s('svg', { viewBox: '0 0 1600 900', class: 'cine-svg', 'aria-hidden': 'true' });
    svg.appendChild(defs());
    const cam = s('g', { class: 'cine-cam' });
    svg.appendChild(cam);
    const fit = () => svg.setAttribute('preserveAspectRatio', root.innerWidth / root.innerHeight < 1.1 ? 'xMidYMid meet' : 'xMidYMid slice');
    fit();

    const who = h('div', { class: 'cine-who' });
    const wave = h('span', { class: 'cine-wave', 'aria-hidden': 'true' }, Array.from({ length: 5 }, () => h('i')));
    const line = h('p', { class: 'cine-line' });
    const sub = h('div', { class: 'cine-sub', 'aria-live': 'polite' }, h('div', { class: 'cine-speaker' }, wave, who), line);
    const progress = h('div', { class: 'cine-progress', 'aria-hidden': 'true' }, scene.beats.map(() => h('i')));
    const pauseBtn = h('button', { class: 'cine-btn', type: 'button', 'aria-label': 'Pause' }, 'Pause');
    const nextBtn = h('button', { class: 'cine-btn', type: 'button', 'aria-label': 'Réplique suivante' }, 'Suivant ›');
    const skipBtn = h('button', { class: 'cine-btn', type: 'button', 'aria-label': 'Passer la cinématique' }, 'Passer ⏭');
    const el = h('div', { class: 'cine', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Cinématique : ' + scene.title },
      h('div', { class: 'cine-stage' }, svg),
      h('div', { class: 'cine-bar top' }), h('div', { class: 'cine-bar bottom' }),
      h('div', { class: 'cine-top' },
        h('div', { class: 'cine-place' }, h('span', { class: 'cine-rec' }), h('span', null, scene.place)),
        h('div', { class: 'cine-ctrl' }, pauseBtn, nextBtn, skipBtn)),
      sub, progress);
    document.body.appendChild(el);
    document.body.classList.add('cine-open');

    const P = { scene, opts, el, svg, cam, line, who, wave, progress, i: -1, layer: null, key: null, frames: [], audio: null, paused: false, t0: 0, tPause: 0, raf: 0, stopDrone: () => {}, ended: false };

    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(P); }
      else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { if (P.started) { e.preventDefault(); next(P); } }
      else if (e.key === 'p' || e.key === 'P') togglePause(P, pauseBtn);
    };
    P.cleanup = () => { root.removeEventListener('keydown', onKey, true); root.removeEventListener('resize', fit); };
    root.addEventListener('keydown', onKey, true);
    root.addEventListener('resize', fit);
    pauseBtn.addEventListener('click', () => togglePause(P, pauseBtn));
    nextBtn.addEventListener('click', () => next(P));
    skipBtn.addEventListener('click', () => finish(P));

    const begin = () => {
      P.started = true;
      P.stopDrone = drone();
      P.raf = root.requestAnimationFrame((ts) => tick(P, ts));
      next(P);
      skipBtn.focus({ preventScroll: true });
    };
    if (unlocked) begin();
    else {
      const go = h('button', { class: 'btn primary', type: 'button' }, 'Établir la liaison');
      const gate = h('div', { class: 'cine-gate' }, h('span', { class: 'eyebrow' }, 'Transmission entrante'), h('h2', null, scene.title),
        h('p', { class: 'dim' }, 'Mets le son : les personnages parlent. ' + (root.matchMedia && root.matchMedia('(pointer: coarse)').matches ? 'Touche « Passer » en haut à droite pour sauter la scène.' : 'Échap pour passer.')), go);
      el.appendChild(gate);
      go.addEventListener('click', () => { unlocked = true; gate.remove(); begin(); });
      go.focus({ preventScroll: true });
    }
    return P;
  }

  function togglePause(P, btn) {
    P.paused = !P.paused;
    btn.textContent = P.paused ? 'Reprendre' : 'Pause';
    P.el.classList.toggle('paused', P.paused);
    if (P.paused) { P.tPause = performance.now(); if (P.audio) P.audio.pause(); }
    else { P.t0 += performance.now() - P.tPause; if (P.audio) P.audio.play().catch(() => {}); }
  }

  function elapsed(P) {
    if (P.audio && !P.audio.error && P.audioOk) return P.audio.currentTime;
    return ((P.paused ? P.tPause : performance.now()) - P.t0) / 1000;
  }

  function setShot(P, beat) {
    const key = beat.shot + JSON.stringify(beat.o);
    if (key === P.key) return;
    P.key = key;
    const { s } = O.cinemaSvg;
    const old = P.layer;
    if (old) { old.classList.add('cn-out'); setTimeout(() => old.remove(), FADE_MS); }
    const layer = s('g', { class: 'cn-layer ' + (P.i % 2 ? 'cn-cam-push' : 'cn-cam-drift') });
    P.frames = [];
    const api = {
      frame: (fn) => P.frames.push(fn),
      shake: () => { P.svg.classList.remove('cn-shake'); void P.svg.getBoundingClientRect(); P.svg.classList.add('cn-shake'); },
    };
    try { (O.cinemaShots[beat.shot] || O.cinemaShots.title)(layer, beat.o, api); } catch (e) { P.frames = []; }
    P.cam.appendChild(layer);
    P.layer = layer;
  }

  function next(P) {
    if (P.ended) return;
    if (P.audio) { P.audio.pause(); P.audio.onended = null; P.audio = null; }
    P.i += 1;
    if (P.i >= P.scene.beats.length) { finish(P); return; }
    const beat = P.scene.beats[P.i];
    [...P.progress.children].forEach((x, k) => { x.className = k < P.i ? 'done' : k === P.i ? 'on' : ''; });
    setShot(P, beat);
    if (beat.sfx && SFX[beat.sfx]) SFX[beat.sfx]();
    const meta = beat.who ? (O.data.voices || {})[beat.id] : null;
    P.dur = beat.who ? (meta ? meta.d : Math.max(2.5, beat.text.length / 15)) : beat.dur;
    P.env = meta ? meta.e : '';
    P.t0 = performance.now();
    P.audioOk = false;
    if (beat.who) {
      const c = O.data.story.cast[beat.who];
      P.el.dataset.who = beat.who;
      P.who.innerHTML = '';
      O.util.add(P.who, h('b', { style: { color: c.color } }, speakerName(beat.who)), h('span', null, c.role));
      P.line.innerHTML = '';
      P.shown = h('span');
      P.hiddenPart = h('span', { class: 'cine-ghost' }, beat.text);
      O.util.add(P.line, P.shown, P.hiddenPart);
      P.el.classList.add('talking');
      if (beat.who === 'rouille') SFX.glitch();
      if (voiceOn() && meta) {
        const a = new Audio('audio/' + beat.id + '.mp3');
        a.preload = 'auto';
        P.audio = a;
        a.onended = () => { if (P.audio === a) setTimeout(() => { if (P.audio === a) next(P); }, GAP * 1000); };
        a.onplaying = () => { if (P.audio === a) P.audioOk = true; };
        const p = a.play();
        if (p && p.catch) p.catch(() => { if (P.audio === a) { P.audio = null; P.t0 = performance.now(); } });
      }
    } else {
      P.el.dataset.who = '';
      P.el.classList.remove('talking');
      P.line.textContent = '';
      P.who.innerHTML = '';
    }
    preload(P);
  }

  function preload(P) {
    const nb = P.scene.beats[P.i + 1];
    if (nb && nb.who && voiceOn()) { const a = new Audio(); a.preload = 'auto'; a.src = 'audio/' + nb.id + '.mp3'; }
  }

  function tick(P, ts) {
    if (P.ended) return;
    P.raf = root.requestAnimationFrame((t) => tick(P, t));
    const beat = P.scene.beats[P.i];
    if (!beat) return;
    const t = elapsed(P);
    const k = Math.floor(t / 0.05);
    const env = P.env && k < P.env.length ? Number(P.env[k]) / 9 : 0;
    P.frames.forEach((fn) => { try { fn(t, env); } catch (e) { /* un décor défaillant ne bloque pas la scène */ } });
    P.wave.style.setProperty('--env', String(env));
    if (beat.who && P.shown) {
      const n = Math.min(beat.text.length, Math.ceil(beat.text.length * Math.min(1, t / (P.dur * 0.82))));
      if (P.shown.textContent.length !== n) {
        P.shown.textContent = beat.text.slice(0, n);
        P.hiddenPart.textContent = beat.text.slice(n);
      }
    }
    // Plan muet ou voix indisponible : on avance à l'horloge ; garde-fou si l'audio cale.
    if (!P.paused && (!P.audio || t > P.dur + 3) && t >= P.dur + (beat.who ? GAP : 0)) next(P);
  }

  function finish(P) {
    if (P.ended) return;
    P.ended = true;
    if (P.audio) { P.audio.pause(); P.audio = null; }
    root.cancelAnimationFrame(P.raf);
    P.stopDrone();
    P.cleanup();
    O.store.update((s) => { s.story.seen[P.scene.id] = Date.now(); });
    P.el.classList.add('cine-leave');
    setTimeout(() => {
      P.el.remove();
      document.body.classList.remove('cine-open');
      current = null;
      if (P.opts.onEnd) P.opts.onEnd();
      const q = queue.shift();
      if (q) play(q[0], q[1]);
    }, FADE_MS);
  }

  O.cinema = { play, get playing() { return !!current; } };

  // ------------------------------------------------------------ déclencheurs
  /** Joue la scène si les cinématiques automatiques sont activées et qu'elle n'a jamais été vue. */
  function maybe(id, opts) {
    if (!st().auto || st().seen[id]) return false;
    play(id, opts);
    return true;
  }

  /** 93 → « 1 min 33 », 40 → « 40 s ». */
  function duration(sec) {
    const n = Math.round(sec);
    return n < 60 ? n + ' s' : Math.floor(n / 60) + ' min ' + String(n % 60).padStart(2, '0');
  }

  O.story = {
    maybe,
    onRoute(name) {
      if (name === 'hub') {
        if (O.store.state.name && !st().seen.prologue) maybe('prologue');
        const days = O.util.daysUntil(O.store.state.examDate);
        if (days !== null && days >= 0 && days <= 1) maybe('veille');
      }
    },
    /** Salle de projection du Journal de bord : revoir les scènes déjà vues. */
    projection() {
      const seen = st().seen;
      return h('div', { class: 'list' }, O.data.story.scenes.map((sc) => {
        const ok = !!seen[sc.id] || sc.id === 'prologue';
        const total = sc.beats.reduce((a, bt) => a + (bt.who ? ((O.data.voices || {})[bt.id] || { d: 4 }).d + GAP : bt.dur), 0);
        return h(ok ? 'button' : 'div', { class: 'list-item' + (ok ? '' : ' locked'), type: ok ? 'button' : null, onclick: ok ? () => play(sc.id) : null },
          h('div', { class: 'l' }, h('span', { class: 't' }, ok ? sc.title : 'Scène verrouillée'), h('span', { class: 'meta' }, ok ? sc.place : 'Se débloque : ' + sc.trigger.toLowerCase())),
          h('span', { class: 'tag', style: { whiteSpace: 'nowrap' } }, ok ? duration(total) : '🔒'));
      }));
    },
  };
})(window);
