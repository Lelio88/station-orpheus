/**
 * Syntaxe de tous les scripts du site : chaque fichier de js/ doit se compiler.
 * Les autres tests ne chargent que les données ; une erreur dans un module
 * d'écran (js/modes, js/core) ne serait vue qu'en ouvrant la page.
 * Les pages déclarent aussi leur encodage : sans <meta charset>, le navigateur
 * lit les scripts en Windows-1252 et tous les accents sont abîmés (« sÃ©quence »).
 * Lancer : node --test tests/*.test.js
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..', 'js');
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []));

test('chaque script de js/ se compile', () => {
  const all = files(root);
  assert.ok(all.length > 20, 'scripts trouvés');
  all.forEach((f) => assert.doesNotThrow(() => new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f }), path.relative(root, f)));
});

test("les pages déclarent l'UTF-8 dès leurs premiers octets", () => {
  ['index.html', 'Station-Orpheus.html'].forEach((f) => {
    const head = fs.readFileSync(path.join(root, '..', f), 'utf8').slice(0, 1024);
    assert.match(head, /<meta charset="utf-8">/i, f + ' : <meta charset="utf-8"> absent des 1024 premiers octets');
    assert.equal((head.match(/<meta charset/gi) || []).length, 1, f + ' : un seul <meta charset>');
  });
});
