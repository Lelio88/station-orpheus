/**
 * gen-voices.mjs — Double les répliques de js/data/story.js.
 *
 * Pour chaque plan parlé : synthèse neuronale (edge-tts, service vocal en
 * ligne de Microsoft ; seul le texte des répliques est envoyé), puis effet
 * propre au personnage avec ffmpeg, puis enveloppe sonore (volume toutes les
 * 50 ms) pour animer les ondes à l'écran sans WebAudio (qui serait muet en
 * file:// à cause des règles CORS).
 *
 * Sorties : audio/<id>.mp3 et js/data/voices.js (durée + enveloppe par id).
 * Cache : tools/voices-cache.json garde l'empreinte texte+voix de chaque
 * réplique ; seules les répliques modifiées sont régénérées.
 * Prérequis : `pip install edge-tts`, ffmpeg dans le PATH.
 * Usage : node tools/gen-voices.mjs        (ajouter --force pour tout refaire)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');

/** Voix et effet ffmpeg de chaque personnage. */
const VOICES = {
  vega: {
    voice: 'fr-FR-VivienneMultilingualNeural', rate: '-4%', pitch: '+0Hz',
    fx: 'highpass=f=110,chorus=0.7:0.9:32|47:0.25|0.2:0.3|0.25:1.6|1.1,aecho=0.85:0.5:45|90:0.22|0.12,acompressor=threshold=-20dB:ratio=3,volume=1.3',
  },
  cadet: {
    voice: 'fr-FR-HenriNeural', rate: '+0%', pitch: '+0Hz',
    fx: 'highpass=f=80,aecho=0.9:0.4:18:0.12,acompressor=threshold=-20dB:ratio=3,volume=1.2',
  },
  delaunay: {
    voice: 'fr-FR-DeniseNeural', rate: '+2%', pitch: '-2Hz',
    fx: 'highpass=f=380,lowpass=f=3300,acrusher=bits=11:mix=0.25,acompressor=threshold=-24dB:ratio=6,volume=2.2',
    noise: 0.012,
  },
  rouille: {
    voice: 'fr-CA-ThierryNeural', rate: '+6%', pitch: '-12Hz',
    fx: 'asetrate=24000*0.84,aresample=24000,atempo=1.12,flanger=delay=2:depth=3:speed=0.4,aecho=0.8:0.6:70|140:0.35|0.2,acrusher=bits=9:mix=0.2,acompressor=threshold=-22dB:ratio=4,volume=1.5',
  },
};

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(root, 'js/data/story.js'), 'utf8'), sandbox);
const story = sandbox.window.ORPHEUS.data.story;

const cachePath = join(root, 'tools/voices-cache.json');
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const manifestPath = join(root, 'js/data/voices.js');
const previous = {};
if (existsSync(manifestPath)) {
  const box = { window: {} };
  vm.createContext(box);
  vm.runInContext(readFileSync(manifestPath, 'utf8'), box);
  Object.assign(previous, box.window.ORPHEUS.data.voices);
}
mkdirSync(join(root, 'audio'), { recursive: true });
const tmp = join(root, 'tools/.tmp-voice.mp3');

/** Enveloppe : un chiffre 0-9 par tranche de 50 ms, normalisé au 95e centile. */
function envelope(file) {
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 64 << 20 });
  const n = pcm.length / 2;
  const win = 400;
  const rms = [];
  for (let i = 0; i < n; i += win) {
    let s = 0;
    const end = Math.min(n, i + win);
    for (let j = i; j < end; j++) { const v = pcm.readInt16LE(j * 2) / 32768; s += v * v; }
    rms.push(Math.sqrt(s / (end - i)));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  return { d: Math.round((n / 8000) * 100) / 100, e: rms.map((r) => Math.min(9, Math.round((r / ref) * 9))).join('') };
}

const out = {};
let made = 0;
for (const scene of story.scenes) {
  for (const beat of scene.beats) {
    if (!beat.who) continue;
    const v = VOICES[beat.who];
    if (!v) throw new Error('Voix inconnue : ' + beat.who);
    const key = createHash('sha1').update(JSON.stringify([v, beat.text])).digest('hex');
    const file = join(root, 'audio', beat.id + '.mp3');
    if (!force && cache[beat.id] === key && existsSync(file) && previous[beat.id]) { out[beat.id] = previous[beat.id]; continue; }
    execFileSync('python', ['-m', 'edge_tts', '--voice', v.voice, '--rate=' + v.rate, '--pitch=' + v.pitch, '--text=' + beat.text, '--write-media', tmp], { stdio: 'pipe' });
    const args = ['-v', 'error', '-y', '-i', tmp];
    if (v.noise) {
      args.push('-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=' + v.noise + ':sample_rate=24000',
        '-filter_complex', '[0:a]' + v.fx + '[v];[1:a]highpass=f=500,lowpass=f=4000[n];[v][n]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-17:TP=-1.5,apad=pad_dur=0.15,afade=t=in:d=0.04[o]', '-map', '[o]');
    } else {
      args.push('-af', v.fx + ',loudnorm=I=-17:TP=-1.5,apad=pad_dur=0.15,afade=t=in:d=0.03');
    }
    args.push('-ac', '1', '-ar', '24000', '-b:a', '48k', file);
    execFileSync('ffmpeg', args, { stdio: 'pipe' });
    out[beat.id] = envelope(file);
    cache[beat.id] = key;
    made += 1;
    process.stdout.write('· ' + beat.id + ' (' + out[beat.id].d + ' s)\n');
  }
}
if (existsSync(tmp)) rmSync(tmp);
writeFileSync(cachePath, JSON.stringify(Object.fromEntries(Object.entries(cache).filter(([k]) => out[k])), null, 1));
const header = '/**\n * voices.js — FICHIER GÉNÉRÉ par tools/gen-voices.mjs, ne pas modifier à la main.\n *\n' +
  ' * Pour chaque réplique doublée (audio/<id>.mp3) : durée `d` en secondes et\n' +
  ' * enveloppe `e` (un chiffre 0-9 par tranche de 50 ms) qui anime les ondes.\n */\n';
writeFileSync(manifestPath, header + '(function (root) {\n  \'use strict\';\n  const O = (root.ORPHEUS = root.ORPHEUS || {});\n  O.data = O.data || {};\n  O.data.voices = ' +
  JSON.stringify(out, null, 1).replace(/\n/g, '\n  ') + ';\n})(window);\n');
console.log(made + ' réplique(s) générée(s), ' + Object.keys(out).length + ' au total.');
