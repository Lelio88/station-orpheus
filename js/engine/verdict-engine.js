/**
 * verdict-engine.js — Mini vérificateur de types Java du module « Réacteur ».
 *
 * Rôle : à partir d'un « univers » (classes, interfaces, méthodes et leurs
 * affichages) et d'une suite d'instructions décrites en données, dire pour
 * chaque instruction si elle compile, si elle s'exécute, et ce qu'elle affiche,
 * avec une explication rédigée comme dans une copie de LO02.
 *
 * Choix non évidents :
 *  - Le moteur ne parse pas du Java : les instructions sont un petit DSL en
 *    objets JS ({decl}, {assign}, {call}, {foreach}, {instanceof}). Le texte
 *    Java affiché est généré depuis ce DSL, donc code affiché et verdict ne
 *    peuvent pas diverger.
 *  - Convention des sujets de LO02 : une ligne qui ne compile pas est
 *    « corrigée » (transtypage ajouté) puis on continue avec la version
 *    corrigée. Le moteur applique donc la correction à l'environnement.
 *  - Une exception à l'exécution arrête le cas ; la variable n'est pas affectée.
 *
 * Invariants :
 *  - Le compilateur ne regarde que les types statiques ; l'exécution ne regarde
 *    que les types dynamiques. Aucune règle ne mélange les deux.
 *  - Les règles de transtypage suivent la JLS simplifiée : classes liées par
 *    héritage, ou interface vs classe non finale, ou interface vs interface.
 *
 * Exemple :
 *   const r = VerdictEngine.runCase(univers, env, [
 *     { decl: 'Animal', name: 'a', expr: { new: 'Cheval' } },
 *     { call: 'a', m: 'crier' } ]);
 *   // r.verdict === 'ok', r.out === ['Un animal émet un cri', '... le cheval hennit.']
 */
(function (root) {
  'use strict';

  const OBJECT = 'Object';

  function typeDef(world, t) {
    return world.types[t] || null;
  }

  /** Tous les super-types de t (t inclus, Object inclus). */
  function ancestors(world, t) {
    const seen = new Set();
    const stack = [t];
    while (stack.length) {
      const x = stack.pop();
      if (seen.has(x)) continue;
      seen.add(x);
      const d = typeDef(world, x);
      if (!d) continue;
      if (d.ext) stack.push(d.ext);
      (d.impl || []).forEach((i) => stack.push(i));
    }
    seen.add(OBJECT);
    return seen;
  }

  function isSub(world, a, b) {
    if (a === 'null') return true;
    return a === b || ancestors(world, a).has(b);
  }

  function isInterface(world, t) {
    const d = typeDef(world, t);
    return !!d && d.kind === 'interface';
  }

  /** Le transtypage (T) d'une expression de type statique S est-il accepté par javac ? */
  function castAllowed(world, s, t) {
    if (s === 'null') return true;
    if (isSub(world, s, t) || isSub(world, t, s)) return true;
    const ds = typeDef(world, s);
    const dt = typeDef(world, t);
    if (!ds || !dt) return false;
    if (ds.kind === 'interface' && dt.kind === 'interface') return true;
    if (ds.kind === 'interface') return !dt.final;
    if (dt.kind === 'interface') return !ds.final;
    return false;
  }

  /** La méthode m est-elle visible depuis le type statique t ? */
  function declares(world, t, m) {
    for (const a of ancestors(world, t)) {
      const d = typeDef(world, a);
      if (d && d.methods && Object.prototype.hasOwnProperty.call(d.methods, m)) return true;
    }
    return false;
  }

  /** Classe qui fournit le corps exécuté pour m, en partant de cls (liaison dynamique). */
  function findBody(world, cls, m) {
    let c = cls;
    while (c) {
      const d = typeDef(world, c);
      if (!d) return null;
      const body = d.methods ? d.methods[m] : undefined;
      if (body) return { owner: c, body };
      c = d.ext;
    }
    return null;
  }

  /** Exécute m sur un objet de type dynamique self, en commençant la recherche à start. */
  function execMethod(world, self, start, m, out, depth) {
    if (depth > 12) throw new Error('Récursion trop profonde dans ' + m);
    const found = findBody(world, start, m);
    if (!found) throw new Error('Aucun corps pour ' + m + ' depuis ' + start);
    found.body.forEach((op) => {
      if (op.p !== undefined) out.push(op.p);
      else if (op.sup) {
        const parent = typeDef(world, found.owner).ext;
        execMethod(world, self, parent, op.sup === true ? m : op.sup, out, depth + 1);
      } else if (op.self) execMethod(world, self, self, op.self, out, depth + 1);
    });
    return found.owner;
  }

  // ---------- Rendu Java ----------

  function exprJava(e) {
    if (e.new) return 'new ' + e.new + '()';
    if (e.var) return e.var;
    if (e.cast) {
      const inner = exprJava(e.of);
      return '(' + e.cast + ') ' + inner;
    }
    if (e.null) return 'null';
    if (e.idx) return e.idx + '[' + e.i + ']';
    return '?';
  }

  function stmtJava(s) {
    if (s.decl) return s.expr ? s.decl + ' ' + s.name + ' = ' + exprJava(s.expr) + ';' : s.decl + ' ' + s.name + ';';
    if (s.assign) return s.assign + ' = ' + exprJava(s.expr) + ';';
    if (s.call) {
      const target = s.castTo ? '((' + s.castTo + ') ' + s.call + ')' : s.call;
      return target + '.' + s.m + '();';
    }
    if (s.foreach) return 'for (' + s.foreach + ' ' + s.v + ' : ' + s.arr + ') ' + s.v + '.' + s.m + '();';
    if (s.instanceof) {
      if (s.then !== undefined) {
        return 'if (' + s.instanceof + ' instanceof ' + s.type + ') System.out.println("' + s.then + '");\nelse System.out.println("' + s.else + '");';
      }
      return 'System.out.println(' + s.instanceof + ' instanceof ' + s.type + ');';
    }
    if (s.array) return s.array + '[] ' + s.name + ' = { ' + s.elems.map((c) => 'new ' + c + '()').join(', ') + ' };';
    return '/* ? */';
  }

  // ---------- Évaluation ----------

  function staticOf(world, env, e) {
    if (e.new) {
      const d = typeDef(world, e.new);
      if (!d) return { err: 'Type inconnu ' + e.new };
      if (d.kind === 'interface') {
        return { err: e.new + ' est une interface : on ne peut pas l\'instancier avec new.', noFix: true };
      }
      if (d.abstract) {
        return { err: e.new + ' est une classe abstraite : on ne peut pas l\'instancier avec new.', noFix: true };
      }
      return { st: e.new };
    }
    if (e.var) {
      const v = env[e.var];
      if (!v) return { err: 'La variable ' + e.var + ' n\'existe pas.' };
      return { st: v.st };
    }
    if (e.idx) {
      const v = env[e.idx];
      return { st: v.elem };
    }
    if (e.null) return { st: 'null' };
    if (e.cast) {
      const inner = staticOf(world, env, e.of);
      if (inner.err) return inner;
      if (!castAllowed(world, inner.st, e.cast)) {
        return { err: 'Transtypage impossible : ' + inner.st + ' et ' + e.cast + ' ne sont pas liés par héritage (types inconvertibles).', noFix: true };
      }
      return { st: e.cast };
    }
    return { err: 'Expression inconnue' };
  }

  function dynamicOf(world, env, e) {
    if (e.new) return { dyn: e.new };
    if (e.var) return { dyn: env[e.var].dyn };
    if (e.idx) return { dyn: env[e.idx].dyns[e.i] };
    if (e.null) return { dyn: null };
    if (e.cast) {
      const inner = dynamicOf(world, env, e.of);
      if (inner.exc) return inner;
      if (inner.dyn !== null && inner.dyn !== undefined && !isSub(world, inner.dyn, e.cast)) {
        return {
          exc: 'ClassCastException',
          why: 'À l\'exécution, l\'objet référencé est un ' + inner.dyn + ' (type dynamique). Ce n\'est pas un ' + e.cast + ' → ClassCastException.',
        };
      }
      return { dyn: inner.dyn };
    }
    return { dyn: null };
  }

  function describeOk(world, varType, exprSt, e) {
    if (e.new && e.new === varType) return 'Instanciation directe : type statique et type dynamique identiques (' + varType + ').';
    if (e.cast) return 'Le transtypage explicite (' + e.cast + ') est accepté par le compilateur car les deux types sont liés.';
    if (exprSt === varType) return 'Même type statique des deux côtés.';
    if (exprSt === 'null') return 'null peut être affecté à toute référence.';
    return exprSt + ' est un sous-type de ' + varType + ' → transtypage implicite (surclassement) accepté.';
  }

  /** Affectation d'une expression à une variable de type varType : compile ? correction ? */
  function checkAssign(world, env, varType, e) {
    const s = staticOf(world, env, e);
    if (s.err) return { err: s.err, fix: null };
    if (isSub(world, s.st, varType)) return { ok: describeOk(world, varType, s.st, e) };
    const err = 'Le compilateur ne connaît que le type statique de l\'expression : ' + s.st + '. Un ' + s.st +
      ' n\'est pas forcément un ' + varType + ' → erreur de compilation (incompatible types).';
    if (castAllowed(world, s.st, varType)) {
      return { err, fix: { cast: varType, of: e } };
    }
    return { err: err + ' Aucun transtypage n\'est possible : les types ne sont pas liés.', fix: null };
  }

  function assignTo(world, env, name, varType, e, line) {
    const chk = checkAssign(world, env, varType, e);
    let expr = e;
    if (chk.err) {
      line.compile = false;
      line.why.push(chk.err);
      if (!chk.fix) return { stop: true };
      expr = chk.fix;
      line.fix = (line.fixPrefix || '') + exprJava(expr);
      line.why.push('Correction : ' + line.fix + '.');
    } else {
      line.why.push(chk.ok);
    }
    const d = dynamicOf(world, env, expr);
    if (d.exc) {
      line.exc = d.exc;
      line.why.push(d.why);
      return { stop: true };
    }
    env[name] = { st: varType, dyn: d.dyn };
    return {};
  }

  function callOn(world, env, s, line) {
    const v = env[s.call];
    let st = v.st;
    if (s.castTo) {
      if (!castAllowed(world, st, s.castTo)) {
        line.compile = false;
        line.why.push('Transtypage impossible entre ' + st + ' et ' + s.castTo + '.');
        return { stop: true };
      }
      st = s.castTo;
    }
    let fixed = false;
    if (!declares(world, st, s.m)) {
      line.compile = false;
      line.why.push('La méthode ' + s.m + '() n\'est pas déclarée dans le type statique ' + st +
        ' (ni dans ses super-types). Le compilateur refuse, quel que soit l\'objet réellement référencé.');
      const candidate = v.dyn && declares(world, v.dyn, s.m) ? v.dyn : null;
      if (!candidate || !castAllowed(world, st, candidate)) return { stop: true };
      line.fix = '((' + candidate + ') ' + s.call + ').' + s.m + '()';
      line.why.push('Correction : ' + line.fix + ';');
      fixed = true;
    }
    if (v.dyn === null || v.dyn === undefined) {
      line.exc = 'NullPointerException';
      line.why.push('La référence ' + s.call + ' vaut null : il n\'y a aucun objet sur lequel appeler ' + s.m + '() → NullPointerException.');
      return { stop: true };
    }
    if (s.castTo && !isSub(world, v.dyn, s.castTo)) {
      line.exc = 'ClassCastException';
      line.why.push('L\'objet référencé est un ' + v.dyn + ', pas un ' + s.castTo + ' → ClassCastException.');
      return { stop: true };
    }
    const out = [];
    const owner = execMethod(world, v.dyn, v.dyn, s.m, out, 0);
    line.out = out;
    if (!fixed) {
      if (owner === st || !s.castTo && owner === v.st) {
        line.why.push('Méthode ' + s.m + '() trouvée dans ' + st + ' à la compilation ; à l\'exécution c\'est la version de ' + owner + ' qui s\'exécute.');
      } else {
        line.why.push('Compile car ' + s.m + '() existe dans le type statique ' + st + '. Liaison dynamique : à l\'exécution, c\'est la version de ' + owner +
          ' (la plus proche du type dynamique ' + v.dyn + ') qui s\'exécute.');
      }
    }
    const def = findBody(world, v.dyn, s.m);
    if (def && def.body.some((op) => op.sup)) {
      line.why.push('super.' + s.m + '() exécute d\'abord la version de la classe mère.');
    }
    return {};
  }

  function runStmt(world, env, s) {
    const line = { java: stmtJava(s), compile: true, exc: null, out: [], why: [], fix: null };
    if (s.array) {
      env[s.name] = { st: s.array + '[]', elem: s.array, dyns: s.elems.slice() };
      line.why.push('Un tableau de références de type ' + s.array + ' : chaque case peut désigner un ' + s.array + ' ou un sous-type.');
      return { line };
    }
    if (s.decl) {
      if (!s.expr) {
        env[s.name] = { st: s.decl, dyn: undefined };
        line.why.push('Simple déclaration d\'une référence de type ' + s.decl + ' (aucun objet créé).');
        return { line };
      }
      line.fixPrefix = s.decl + ' ' + s.name + ' = ';
      const r = assignTo(world, env, s.name, s.decl, s.expr, line);
      return { line, stop: r.stop };
    }
    if (s.assign) {
      const v = env[s.assign];
      line.fixPrefix = s.assign + ' = ';
      const r = assignTo(world, env, s.assign, v.st, s.expr, line);
      return { line, stop: r.stop };
    }
    if (s.call) {
      const r = callOn(world, env, s, line);
      return { line, stop: r.stop };
    }
    if (s.foreach) {
      const arr = env[s.arr];
      if (!isSub(world, arr.elem, s.foreach)) {
        line.compile = false;
        line.why.push('Les éléments du tableau sont de type statique ' + arr.elem + ', qui n\'est pas un sous-type de ' + s.foreach + ' → erreur de compilation.');
        return { line, stop: true };
      }
      if (!declares(world, s.foreach, s.m)) {
        line.compile = false;
        line.why.push(s.m + '() n\'est pas déclarée dans ' + s.foreach + '.');
        return { line, stop: true };
      }
      line.why.push('Chaque ' + arr.elem + ' est un ' + s.foreach + ' → la boucle compile. Liaison dynamique pour chaque élément :');
      arr.dyns.forEach((dyn) => {
        const out = [];
        const owner = execMethod(world, dyn, dyn, s.m, out, 0);
        line.out.push(...out);
        line.why.push('• ' + dyn + ' → version de ' + owner + '.');
      });
      return { line };
    }
    if (s.instanceof) {
      const v = env[s.instanceof];
      if (!castAllowed(world, v.st, s.type)) {
        line.compile = false;
        line.why.push('instanceof refusé : ' + v.st + ' et ' + s.type + ' sont inconvertibles.');
        return { line, stop: true };
      }
      const res = v.dyn !== null && v.dyn !== undefined && isSub(world, v.dyn, s.type);
      line.why.push('instanceof teste le type dynamique : l\'objet est un ' + (v.dyn || 'null') + ' → ' + res + '.');
      if (s.then !== undefined) line.out.push(res ? s.then : s.else);
      else line.out.push(String(res));
      return { line };
    }
    throw new Error('Instruction inconnue');
  }

  /**
   * Exécute un « cas » (suite d'instructions) et renvoie son verdict global.
   * verdict : 'ok' | 'compile' | 'ClassCastException' | 'NullPointerException'
   * Une erreur de compilation corrigeable n'arrête pas le cas (convention des sujets).
   */
  function runCase(world, env, stmts) {
    const lines = [];
    let verdict = 'ok';
    let exc = null;
    for (const s of stmts) {
      const { line, stop } = runStmt(world, env, s);
      lines.push(line);
      if (!line.compile && verdict === 'ok') verdict = 'compile';
      if (line.exc) {
        exc = line.exc;
        break;
      }
      if (stop) break;
    }
    if (exc && verdict === 'ok') verdict = exc;
    const out = [];
    lines.forEach((l) => out.push(...l.out));
    return { verdict, exc, lines, out };
  }

  /** Affichages plausibles mais faux, pour les choix multiples. */
  function wrongOutputs(world, env, s) {
    const res = [];
    if (!s.call) return res;
    const v = env[s.call];
    if (!v || !v.dyn) return res;
    const st = s.castTo || v.st;
    const push = (arr) => { if (arr && arr.length) res.push(arr); };
    // Erreur classique 1 : croire que c'est le type statique qui décide.
    try {
      const o = [];
      if (findBody(world, st, s.m)) { execMethod(world, st, st, s.m, o, 0); push(o); }
    } catch (e) { /* type statique sans corps : pas de distracteur */ }
    // Erreur classique 2 : oublier super.m().
    const def = findBody(world, v.dyn, s.m);
    if (def) {
      push(def.body.filter((op) => op.p !== undefined).map((op) => op.p));
      const parent = typeDef(world, def.owner).ext;
      if (parent && findBody(world, parent, s.m)) {
        const o = [];
        execMethod(world, parent, parent, s.m, o, 0);
        push(o);
      }
    }
    return res;
  }

  /** Lignes affichées par m() sur un objet de type dynamique dyn (null si pas de corps). */
  function outputOf(world, dyn, m) {
    if (!findBody(world, dyn, m)) return null;
    const out = [];
    try {
      execMethod(world, dyn, dyn, m, out, 0);
    } catch (e) {
      return null; // ex. classe abstraite dont la méthode appelle une méthode abstraite
    }
    return out;
  }

  /** Code Java des classes de l'univers, tel qu'en annexe d'un sujet. */
  function universeJava(world) {
    const body = (ops) => ops.map((op) => {
      if (op.p !== undefined) return '        System.out.println("' + op.p + '");';
      if (op.sup) return '        super.' + (op.sup === true ? '§' : op.sup) + '();';
      return '        this.' + op.self + '();';
    });
    return Object.entries(world.types).map(([name, t]) => {
      const head = t.kind === 'interface'
        ? 'public interface ' + name + ((t.impl || []).length ? ' extends ' + t.impl.join(', ') : '')
        : 'public ' + (t.abstract ? 'abstract ' : '') + (t.final ? 'final ' : '') + 'class ' + name +
          (t.ext ? ' extends ' + t.ext : '') + ((t.impl || []).length ? ' implements ' + t.impl.join(', ') : '');
      const ms = Object.entries(t.methods || {}).map(([m, ops]) => {
        if (!ops) return '    public ' + (t.kind === 'interface' ? '' : 'abstract ') + 'void ' + m + '();';
        return ['    public void ' + m + '() {', ...body(ops).map((l) => l.replace('§', m)), '    }'].join('\n');
      });
      return head + ' {\n' + ms.join('\n') + '\n}';
    }).join('\n\n');
  }

  const api = { ancestors, isSub, castAllowed, declares, findBody, runCase, runStmt, stmtJava, exprJava, wrongOutputs, isInterface, outputOf, universeJava };
  root.VerdictEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
