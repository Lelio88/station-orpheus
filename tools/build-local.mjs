/**
 * build-local.mjs — Génère Station-Orpheus.html, la version à ouvrir hors ligne.
 *
 * Pourquoi : index.html est écrit sans <!doctype>/<head>/<body> car
 * l'hébergeur d'artefacts ajoute lui-même ce squelette. Ouvert tel quel en
 * local, il passerait en mode « quirks ». Ce script ajoute le squelette.
 * À relancer après toute modification de index.html :
 *   node Revision/tools/build-local.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(join(root, 'index.html'), 'utf8');
const head = page.slice(0, page.indexOf('<canvas'));
const body = page.slice(page.indexOf('<canvas'));
// Le <meta charset> vient d'index.html (sa première ligne) : il n'est pas répété ici.
const html = '<!doctype html>\n<html lang="fr">\n<head>\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  head + '</head>\n<body>\n' + body + '</body>\n</html>\n';
writeFileSync(join(root, 'Station-Orpheus.html'), html);
console.log('Station-Orpheus.html généré');
