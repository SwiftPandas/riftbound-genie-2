/* Riftbound test engine, translated automatically from the Python engine (match.py) by py2js.py. */
function $makeEngine(VFSDATA){
'use strict';
// Python-semantics runtime for the transpiled Riftbound engine.

let $oidN = 0; const $oids = new WeakMap();
function $oid(o){ let v = $oids.get(o); if (v === undefined){ v = ++$oidN; $oids.set(o, v); } return v; }
function $key(k){
  if (k === null || k === undefined) return 'N';
  const t = typeof k;
  if (t === 'string') return k;
  if (t === 'number') return '#' + k;
  if (t === 'boolean') return '#' + (k ? 1 : 0);
  if (Array.isArray(k)) return '(' + k.map($key).join('\u0001') + ')';
  return '@' + $oid(k);
}
class PyDict {
  constructor(pairs){ this.m = new Map(); if (pairs) for (const [k, v] of pairs) this.set(k, v); }
  set(k, v){ const nk = $key(k); const e = this.m.get(nk); if (e) e[1] = v; else this.m.set(nk, [k, v]); }
  has(k){ return this.m.has(typeof k === 'string' ? k : $key(k)); }
  get(k, d = null){ const e = this.m.get(typeof k === 'string' ? k : $key(k)); return e ? e[1] : d; }
  $get(k){ const e = this.m.get(typeof k === 'string' ? k : $key(k)); if (e) return e[1]; return this.$missing(k); }
  $missing(k){ throw new Error('KeyError: ' + String(k)); }
  del(k){ const nk = $key(k); if (!this.m.has(nk)) throw new Error('KeyError: ' + String(k)); this.m.delete(nk); }
  keys(){ const r = []; for (const e of this.m.values()) r.push(e[0]); return r; }
  values(){ const r = []; for (const e of this.m.values()) r.push(e[1]); return r; }
  items(){ const r = []; for (const e of this.m.values()) r.push([e[0], e[1]]); return r; }
  setdefault(k, d = null){ const nk = $key(k); const e = this.m.get(nk); if (e) return e[1]; this.m.set(nk, [k, d]); return d; }
  pop(k, d){ const nk = $key(k); const e = this.m.get(nk); if (e){ this.m.delete(nk); return e[1]; } if (arguments.length > 1) return d; throw new Error('KeyError: ' + String(k)); }
  update(o){ if (o instanceof PyDict) for (const [k, v] of o.items()) this.set(k, v); else for (const [k, v] of $it(o)) this.set(k, v); }
  copy(){ const d = new this.constructor(); if (this.factory) d.factory = this.factory; for (const [nk, e] of this.m) d.m.set(nk, [e[0], e[1]]); return d; }
  clear(){ this.m.clear(); }
  get size(){ return this.m.size; }
}
class DefaultDict extends PyDict {
  constructor(f, pairs){ super(pairs); this.factory = f; }
  $missing(k){ const v = this.factory(); this.set(k, v); return v; }
}
class CounterD extends PyDict {
  constructor(it){ super(); if (it) this.update(it); }
  $missing(k){ return 0; }
  update(it){ if (it instanceof PyDict){ for (const [k, v] of it.items()) this.set(k, this.get(k, 0) + v); return; } for (const x of $it(it)) this.set(x, this.get(x, 0) + 1); }
  most_common(n){ const a = this.items(); a.sort((x, y) => y[1] - x[1]); return n == null ? a : a.slice(0, n); }
}
class PySet {
  constructor(it){ this.m = new Map(); if (it) for (const x of $it(it)) this.add(x); }
  add(x){ const nk = $key(x); if (!this.m.has(nk)) this.m.set(nk, x); }
  has(x){ return this.m.has(typeof x === 'string' ? x : $key(x)); }
  discard(x){ this.m.delete($key(x)); }
  remove(x){ const nk = $key(x); if (!this.m.has(nk)) throw new Error('KeyError: ' + String(x)); this.m.delete(nk); }
  values(){ return [...this.m.values()]; }
  copy(){ return new PySet(this.values()); }
  clear(){ this.m.clear(); }
  pop(){ for (const [nk, x] of this.m){ this.m.delete(nk); return x; } throw new Error('KeyError: pop from empty set'); }
  update(it){ for (const x of $it(it)) this.add(x); }
  union(o){ const s = this.copy(); s.update(o); return s; }
  get size(){ return this.m.size; }
}
const $KW = Symbol('kw');
function $kw(o){ o[$KW] = true; return o; }
function $splitKw(args){ if (args.length && args[args.length - 1] && args[args.length - 1][$KW]) return [args.slice(0, -1), args[args.length - 1]]; return [args, {}]; }

function $T(x){
  if (x === true) return true; if (x === false || x === null || x === undefined) return false;
  const t = typeof x;
  if (t === 'number') return x !== 0 && !Number.isNaN(x);
  if (t === 'string') return x.length > 0;
  if (Array.isArray(x)) return x.length > 0;
  if (x instanceof PyDict || x instanceof PySet) return x.m.size > 0;
  return true;
}
function $OR(a, fb){ return $T(a) ? a : fb(); }
function $AND(a, fb){ return $T(a) ? fb() : a; }
function $it(x){
  if (Array.isArray(x)) return x;
  if (typeof x === 'string') return Array.from(x);
  if (x instanceof PyDict) return x.keys();
  if (x instanceof PySet) return x.values();
  if (x == null) throw new Error('TypeError: NoneType is not iterable');
  if (x instanceof $File) return x.lines();
  if (typeof x[Symbol.iterator] === 'function') return Array.from(x);
  throw new Error('TypeError: not iterable');
}
function $eq(a, b){
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  const ta = typeof a, tb = typeof b;
  if ((ta === 'number' || ta === 'boolean') && (tb === 'number' || tb === 'boolean')) return Number(a) === Number(b);
  if (Array.isArray(a) && Array.isArray(b)){ if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (!$eq(a[i], b[i])) return false; return true; }
  if (a instanceof PySet && b instanceof PySet){ if (a.size !== b.size) return false; for (const x of a.values()) if (!b.has(x)) return false; return true; }
  if (a instanceof PyDict && b instanceof PyDict){ if (a.size !== b.size) return false; for (const [k, v] of a.items()){ if (!b.has(k) || !$eq(v, b.get(k))) return false; } return true; }
  return false;
}
function $cmp(a, b){
  if (Array.isArray(a) && Array.isArray(b)){ const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++){ const c = $cmp(a[i], b[i]); if (c) return c; } return a.length - b.length; }
  if (typeof a === 'boolean') a = +a; if (typeof b === 'boolean') b = +b;
  return a < b ? -1 : a > b ? 1 : 0;
}
function $lt(a, b){ return $cmp(a, b) < 0; } function $le(a, b){ return $cmp(a, b) <= 0; }
function $gt(a, b){ return $cmp(a, b) > 0; } function $ge(a, b){ return $cmp(a, b) >= 0; }
function $in(x, c){
  if (c instanceof PySet || c instanceof PyDict) return c.m.has(typeof x === 'string' ? x : $key(x));
  if (Array.isArray(c)){ if (x === null || typeof x !== 'object') { if (c.includes(x)) return true; if (typeof x !== 'number' && typeof x !== 'boolean') return false; } for (const y of c) if ($eq(x, y)) return true; return false; }
  if (typeof c === 'string') return c.includes(x);
  if (c instanceof PyDict || c instanceof PySet) return c.has(x);
  if (c == null) throw new Error('TypeError: argument of type NoneType is not iterable');
  throw new Error('TypeError: in on unsupported type');
}
function $num(x){ return typeof x === 'boolean' ? +x : x; }
function $add(a, b){
  const ta = typeof a;
  if (ta === 'number' || ta === 'boolean'){ return $num(a) + $num(b); }
  if (ta === 'string') return a + b;
  if (Array.isArray(a)) return a.concat(b);
  throw new Error('TypeError: unsupported + ' + ta + ' ' + typeof b);
}
function $iadd(a, b){ if (Array.isArray(a)){ for (const x of $it(b)) a.push(x); return a; } return $add(a, b); }
function $sub(a, b){
  if (a instanceof PySet){ const s = new PySet(); for (const x of a.values()) if (!b.has(x)) s.add(x); return s; }
  return $num(a) - $num(b);
}
function $mul(a, b){
  if (Array.isArray(a) || Array.isArray(b)){ const [l, n] = Array.isArray(a) ? [a, b] : [b, a]; const r = []; for (let i = 0; i < n; i++) for (const x of l) r.push(x); return r; }
  if (typeof a === 'string') return a.repeat(Math.max(0, b)); if (typeof b === 'string') return b.repeat(Math.max(0, a));
  return $num(a) * $num(b);
}
function $bor(a, b){ if (a instanceof PySet) return a.union(b); return $num(a) | $num(b); }
function $floordiv(a, b){ return Math.floor($num(a) / $num(b)); }
function $mod(a, b){ const r = a % b; return (r !== 0 && (r < 0) !== (b < 0)) ? r + b : r; }
function $gi(o, k){
  if (o instanceof PyDict){ const e = o.m.get(typeof k === 'string' ? k : $key(k)); return e ? e[1] : o.$missing(k); }
  if (Array.isArray(o)){ if (typeof k === 'boolean') k = +k; return o[k < 0 ? o.length + k : k]; }
  if (o instanceof PyDict) return o.$get(k);
  if (typeof o === 'string') return o[k < 0 ? o.length + k : k];
  if (o == null) throw new Error('TypeError: NoneType is not subscriptable');
  return o[k];
}
function $si(o, k, v){
  if (Array.isArray(o)){ if (typeof k === 'boolean') k = +k; o[k < 0 ? o.length + k : k] = v; return v; }
  if (o instanceof PyDict){ o.set(k, v); return v; }
  o[k] = v; return v;
}
function $del(o, k){
  if (Array.isArray(o)){ o.splice(k < 0 ? o.length + k : k, 1); return; }
  if (o instanceof PyDict){ o.del(k); return; }
  delete o[k];
}
function $sidx(n, i, d){ if (i == null) return d; if (i < 0) i = Math.max(0, n + i); return Math.min(i, n); }
function $sl(o, lo, hi){ const n = o.length; const a = $sidx(n, lo, 0), b = $sidx(n, hi, n); return o.slice(a, Math.max(a, b)); }
function $ssl(o, lo, hi, v){ const n = o.length; const a = $sidx(n, lo, 0), b = Math.max(a, $sidx(n, hi, n)); o.splice(a, b - a, ...$it(v)); }
function $dsl(o, lo, hi){ const n = o.length; const a = $sidx(n, lo, 0), b = Math.max(a, $sidx(n, hi, n)); o.splice(a, b - a); }
function $ga(o, n, d){ if (o != null && (typeof o === 'object' || typeof o === 'function') && n in o && o[n] !== undefined) return o[n]; if (arguments.length > 2) return d; throw new Error('AttributeError: ' + n); }
function $ha(o, n){ return o != null && typeof o === 'object' && n in o && o[n] !== undefined; }
function $sa(o, n, v){ o[n] = v; }

// method calls on builtin types
function $cm(o, name, ...args){
  if (Array.isArray(o)){
    switch (name){
      case 'append': o.push(args[0]); return null;
      case 'extend': for (const x of $it(args[0])) o.push(x); return null;
      case 'insert': { let i = args[0]; if (i < 0) i = Math.max(0, o.length + i); o.splice(Math.min(i, o.length), 0, args[1]); return null; }
      case 'remove': { for (let i = 0; i < o.length; i++) if ($eq(o[i], args[0])){ o.splice(i, 1); return null; } throw new Error('ValueError: list.remove(x): x not in list: ' + String(args[0])); }
      case 'pop': { if (!o.length) throw new Error('IndexError: pop from empty list'); if (!args.length) return o.pop(); let i = args[0]; if (i < 0) i += o.length; if (i < 0 || i >= o.length) throw new Error('IndexError: pop index'); return o.splice(i, 1)[0]; }
      case 'index': { for (let i = 0; i < o.length; i++) if ($eq(o[i], args[0])) return i; throw new Error('ValueError: not in list'); }
      case 'count': { let c = 0; for (const x of o) if ($eq(x, args[0])) c++; return c; }
      case 'sort': { const [a, kw] = $splitKw(args); $sortInPlace(o, kw.key, kw.reverse); return null; }
      case 'reverse': o.reverse(); return null;
      case 'copy': return o.slice();
      case 'clear': o.length = 0; return null;
    }
  } else if (typeof o === 'string'){
    switch (name){
      case 'split': { const sep = args[0]; if (sep == null) return o.trim().split(/\s+/).filter(Boolean); return o.split(sep); }
      case 'strip': return args[0] == null ? o.trim() : $stripChars(o, args[0], 3);
      case 'lstrip': return args[0] == null ? o.replace(/^\s+/, '') : $stripChars(o, args[0], 1);
      case 'rstrip': return args[0] == null ? o.replace(/\s+$/, '') : $stripChars(o, args[0], 2);
      case 'startswith': return Array.isArray(args[0]) ? args[0].some(p => o.startsWith(p)) : o.startsWith(args[0]);
      case 'endswith': return Array.isArray(args[0]) ? args[0].some(p => o.endsWith(p)) : o.endsWith(args[0]);
      case 'replace': return o.split(args[0]).join(args[1]);
      case 'join': return $it(args[0]).map(String).join(o);
      case 'lower': return o.toLowerCase();
      case 'upper': return o.toUpperCase();
      case 'count': return o.split(args[0]).length - 1;
      case 'find': return o.indexOf(args[0]);
      case 'index': { const i = o.indexOf(args[0]); if (i < 0) throw new Error('ValueError: substring not found'); return i; }
      case 'format': return o;
    }
  }
  const f = o == null ? undefined : o[name];
  if (typeof f !== 'function') throw new Error('AttributeError: ' + (o == null ? 'None' : (o.constructor && o.constructor.name)) + ' has no method ' + name);
  return f.apply(o, args);
}
function $stripChars(s, ch, mode){ let a = 0, b = s.length; if (mode & 1) while (a < b && ch.includes(s[a])) a++; if (mode & 2) while (b > a && ch.includes(s[b - 1])) b--; return s.slice(a, b); }
function $sortInPlace(a, key, reverse){
  const n = a.length; if (n < 2) return;
  const k = key || (x => x);
  const ks = new Array(n); let num = true;
  for (let i = 0; i < n; i++){ const v = k(a[i]); ks[i] = v; if (typeof v !== 'number' || v !== v) num = false; }
  const idx = new Array(n); for (let i = 0; i < n; i++) idx[i] = i;
  // speed: plain numeric keys compare directly; anything else (tuples, strings, booleans) uses Python ordering. Stable either way.
  if (num) idx.sort((p, q) => { const c = ks[p] < ks[q] ? -1 : ks[p] > ks[q] ? 1 : 0; return c !== 0 ? (reverse ? -c : c) : p - q; });
  else idx.sort((p, q) => { const c = $cmp(ks[p], ks[q]); return c !== 0 ? (reverse ? -c : c) : p - q; });
  const out = idx.map(i => a[i]); for (let i = 0; i < n; i++) a[i] = out[i];
}
// builtins
function $len(x){ if (typeof x === 'string' || Array.isArray(x)) return x.length; if (x instanceof PyDict || x instanceof PySet) return x.m.size; if (x == null) throw new Error('TypeError: len(None)'); return x.length; }
function $range(a, b, s){ if (b === undefined){ b = a; a = 0; } s = s || 1; const r = []; if (s > 0) for (let i = a; i < b; i += s) r.push(i); else for (let i = a; i > b; i += s) r.push(i); return r; }
function $enumerate(x, start){ const r = []; let i = start || 0; for (const v of $it(x)) r.push([i++, v]); return r; }
function $zip(...xs){ const as = xs.map($it); const n = Math.min(...as.map(a => a.length)); const r = []; for (let i = 0; i < n; i++) r.push(as.map(a => a[i])); return r; }
function $sorted(...args){ const [a, kw] = $splitKw(args); const r = $it(a[0]).slice(); $sortInPlace(r, kw.key, kw.reverse); return r; }
function $reversed(x){ return $it(x).slice().reverse(); }
function $list(x){ return x === undefined ? [] : $it(x).slice(); }
function $tuple(x){ return x === undefined ? [] : $it(x).slice(); }
function $set(x){ return new PySet(x); }
function $dict(...args){ const [a, kw] = $splitKw(args); const d = new PyDict(); if (a.length){ const s = a[0]; if (s instanceof PyDict) d.update(s); else for (const [k, v] of $it(s)) d.set(k, v); } for (const k of Object.keys(kw)) d.set(k, kw[k]); return d; }
function $str(x){ if (x === null || x === undefined) return 'None'; if (x === true) return 'True'; if (x === false) return 'False'; if (Array.isArray(x)) return '[' + x.map($repr).join(', ') + ']'; if (x instanceof PyDict) return '{' + x.items().map(([k, v]) => $repr(k) + ': ' + $repr(v)).join(', ') + '}'; if (x instanceof PySet) return '{' + x.values().map($repr).join(', ') + '}'; if (typeof x === 'object' && typeof x.__repr__ === 'function') return x.__repr__(); return String(x); }
function $repr(x){ return typeof x === 'string' ? "'" + x + "'" : $str(x); }
function $int(x){ if (typeof x === 'string') { const v = parseInt(x.trim(), 10); if (Number.isNaN(v)) throw new Error('ValueError: int(' + x + ')'); return v; } return Math.trunc($num(x)); }
function $float(x){ return typeof x === 'string' ? parseFloat(x) : $num(x); }
function $bool(x){ return $T(x); }
function $abs(x){ return Math.abs($num(x)); }
function $round(x, n){ if (n){ const f = 10 ** n; return Math.round(x * f) / f; } const r = Math.round(x); if (Math.abs(x % 1) === 0.5 && r % 2 !== 0) return r - 1; return r; }
function $minmax(sign, args){
  let [a, kw] = $splitKw(args);
  const items = a.length === 1 ? $it(a[0]) : a;
  if (!items.length){ if ('default' in kw) return kw.default; throw new Error('ValueError: max/min of empty sequence'); }
  const key = kw.key; let best = items[0], bk = key ? key(best) : best;
  for (let i = 1; i < items.length; i++){ const x = items[i], k = key ? key(x) : x; if (sign * $cmp(k, bk) > 0){ best = x; bk = k; } }
  return best;
}
function $max(...args){ return $minmax(1, args); }
function $min(...args){ return $minmax(-1, args); }
function $sum(x, start){ let s = start || 0; for (const v of $it(x)) s += $num(v); return s; }
function $any(x){ for (const v of $it(x)) if ($T(v)) return true; return false; }
function $all(x){ for (const v of $it(x)) if (!$T(v)) return false; return true; }
function $next(x, d){ const a = $it(x); if (a.length) return a[0]; if (arguments.length > 1) return d; throw new Error('StopIteration'); }
function $comb(n, k){ if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
function $combinations(x, r){ const a = $it(x), out = [], cur = []; const rec = (s) => { if (cur.length === r){ out.push(cur.slice()); return; } for (let i = s; i < a.length; i++){ cur.push(a[i]); rec(i + 1); cur.pop(); } }; rec(0); return out; }
function $isinstance(x, t){
  const ts = Array.isArray(t) ? t : [t];
  return ts.some(T => T === $int ? (typeof x === 'number' && Number.isInteger(x)) || typeof x === 'boolean'
    : T === $float ? typeof x === 'number' : T === $str ? typeof x === 'string' : T === $list || T === $tuple ? Array.isArray(x)
    : T === $dict ? x instanceof PyDict : T === $set ? x instanceof PySet : T === $bool ? typeof x === 'boolean' : (typeof T === 'function' && x instanceof T));
}
function $print(...a){ const [args] = $splitKw(a); console.log(args.map($str).join(' ')); }
function $fmt(v, spec){
  const m = /^([<>^]?)(\d*)(?:\.(\d+))?([fd%s]?)$/.exec(spec || '');
  if (!m) return $str(v);
  let s; const prec = m[3], ty = m[4];
  if (ty === 'f') s = Number(v).toFixed(prec ? +prec : 6);
  else if (ty === '%') s = (Number(v) * 100).toFixed(prec ? +prec : 6) + '%';
  else if (prec !== undefined && typeof v === 'number') s = Number(v).toPrecision(+prec);
  else s = $str(v);
  const w = +(m[2] || 0); if (s.length < w){ const pad = ' '.repeat(w - s.length); s = (m[1] === '<' || (!m[1] && typeof v === 'string')) ? s + pad : pad + s; }
  return s;
}
// files and json (virtual file system filled before the engine loads)
const $VFS = {};
class $File { constructor(t){ this.t = t; } lines(){ return this.t.split(/(?<=\n)/); } read(){ return this.t; } }
function $open(path){ const name = String(path).split('/').pop(); if (!(name in $VFS)) throw new Error('FileNotFoundError: ' + path); return new $File($VFS[name]); }
function $py(v){ if (Array.isArray(v)) return v.map($py); if (v && typeof v === 'object'){ const d = new PyDict(); for (const k of Object.keys(v)) d.set(k, $py(v[k])); return d; } return v; }
function $json_load(f){ return $py(JSON.parse(f.read())); }
function $json_loads(s){ return $py(JSON.parse(s)); }
// seeded RNG with the random.Random methods the engine uses
class PyRandom {
  constructor(seed){ this.seed(seed == null ? Date.now() : seed); }
  seed(s){ let h = 1779033703 ^ String(s).length; const str = String(s); for (let i = 0; i < str.length; i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } this.a = h >>> 0; this.b = (h * 2654435761) >>> 0 || 1; }
  random(){ // xorshift-based 32-bit mixer (sfc-like), two draws for 53-bit precision
    const n = () => { let t = this.a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0); };
    return (n() * 2097152 + (n() >>> 11)) / 9007199254740992;
  }
  randrange(a, b){ if (b === undefined){ b = a; a = 0; } return a + Math.floor(this.random() * (b - a)); }
  randint(a, b){ return this.randrange(a, b + 1); }
  choice(s){ const a = $it(s); if (!a.length) throw new Error('IndexError: choice from empty'); return a[Math.floor(this.random() * a.length)]; }
  shuffle(a){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(this.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return null; }
  sample(s, k){ const a = $it(s).slice(); this.shuffle(a); return a.slice(0, k); }
  uniform(a, b){ return a + (b - a) * this.random(); }
}
const $random_mod = { Random: (s) => new PyRandom(s), random: () => $GLOBAL_RNG.random(), choice: (s) => $GLOBAL_RNG.choice(s), shuffle: (a) => $GLOBAL_RNG.shuffle(a), randrange: (a, b) => $GLOBAL_RNG.randrange(a, b) };
const $GLOBAL_RNG = new PyRandom(12345);
const $hasattr = $ha, $setattr = $sa, $getattr = $ga, $open_ = $open;
function $deepcopy(o, memo){
  if (o === null || typeof o !== 'object') return o;
  memo = memo || new Map(); const seen = memo.get(o); if (seen !== undefined) return seen;
  if (Array.isArray(o)){ const a = new Array(o.length); memo.set(o, a); for (let i = 0; i < o.length; i++) a[i] = $deepcopy(o[i], memo); return a; }
  if (o instanceof PyDict){ const d = Object.create(Object.getPrototypeOf(o)); memo.set(o, d); d.m = new Map(); if (o.factory) d.factory = o.factory;
    for (const e of o.m.values()) d.set($deepcopy(e[0], memo), $deepcopy(e[1], memo)); return d; }
  if (o instanceof PySet){ const st = new PySet(); memo.set(o, st); for (const x of o.m.values()) st.add($deepcopy(x, memo)); return st; }
  const c = Object.create(Object.getPrototypeOf(o)); memo.set(o, c);
  for (const k of Object.keys(o)) c[k] = $deepcopy(o[k], memo);
  return c;
}
function $delattr(o, n){ delete o[n]; }

Object.assign($VFS, VFSDATA);

var CARDS, line, n, e, p, t, f, MIGHT, KW, GEN, EQKW, GSP, STYLES, LEARN, v, c, k, tok, _OFF, DRAGONS, LEG, BFS, REMOVAL, PUMP, REACT_PUMP, SHOWDOWN_PUMP, FLOW, AMBUSH, SMART, FUZZFIX, SIMUL, DIEWATCH, META25, SAVE_PUMP, CHAIN, PB2, PB, MECHS, ORI, PLAYER_AI, REACT_VAL, DMG_KINDS, UNTARGETABLE, UNTARGETABLE_COMBAT, CHAOS, FURY, PROTECT, SAVE_FOR_REACT, LOOK_PLANS, LOOK_MARGIN, LOOK_CARDS, LOOK_DEPTH, LOOK_SH, LOOK_KEYS, AI36, RESP, FEAT, BLUFF, READ, COLOR, PRO_ERR, BLUFF_COST, RES2, RES_K, DISC_FIX, EOT, EOT_DISC, V1B, VFLOW, SATCHEL, MOVES, AI29, AI29B, AUDIT, ANVIL_AI, ANVIL_OLD, RIP2, TIDE2, HAB, RULES33, RULES34, GAPS31, MEZB, AI20, AI30, TRICK_W, CONQ_V, TRICK_MARGIN, DEBUFF, DRAW_SPELL, BOMB_KILLERS, COMBAT_OK, PRE_PUMP, AZ, QUICKDRAW, BANISH, FEAT16, SETUP, _k, _v, DOMAINS, RUNE_SPLIT;
CARDS = new PyDict([]);
for (line of $it($open("/home/claude/sim/cards.txt"))) {
  line = $cm(line, "strip");
  if ($T(line)) {
    [n, e, p, t, f] = $it($cm(line, "split", "|"));
    $si(CARDS, n, $dict($kw({"e": $int(e), "p": $int(p), "t": t, "f": f})));
  }
}
MIGHT = $json_load($open("/home/claude/sim/might.json"));
KW = $json_load($open("/home/claude/sim/kw.json"));
GEN = $cm(KW, "pop", "__gen", new PyDict([]));
EQKW = $cm(KW, "pop", "__eqkw", new PyDict([]));
GSP = $cm(KW, "pop", "__spells", new PyDict([]));
STYLES = $cm(KW, "pop", "__styles", new PyDict([]));
LEARN = [true];
for ([n, v] of $it($cm(MIGHT, "items"))) {
  $cm(CARDS, "setdefault", n, $dict($kw({"e": 0, "p": 0, "t": "Unit", "f": ""})));
  $si($gi(CARDS, n), "m", $gi(v, 0));
  if (($len(v) >= 4)) {
    $si($gi(CARDS, n), "eq", $dict($kw({"bonus": $gi(v, 1), "e": $gi(v, 2), "p": $gi(v, 3)})));
  }
  $si($gi(CARDS, n), "wm", $in("WM", v));
}
for ([n, c] of $it($cm(CARDS, "items"))) {
  $cm(c, "setdefault", "m", 0);
  $cm(c, "setdefault", "wm", false);
  k = $cm(KW, "get", n, "");
  { const $t1 = 0;
    $si(c, "shield", $t1);
    $si(c, "assault", $t1);
  }
  { const $t2 = false;
    $si(c, "tank", $t2);
    $si(c, "deflect", $t2);
    $si(c, "gank", $t2);
    $si(c, "accel", $t2);
    $si(c, "ready", $t2);
    $si(c, "back", $t2);
  }
  for (tok of $it((() => { const $r = []; for (const x of $it($cm(k, "split", ","))) { if ($T(x)) { $r.push(x); } } return $r; })())) {
    if (($gi(tok, 0) === "S")) {
      $si(c, "shield", $int($sl(tok, 1, null)));
    } else if (($gi(tok, 0) === "A")) {
      $si(c, "assault", $int($sl(tok, 1, null)));
    } else if ((tok === "T")) {
      $si(c, "tank", true);
    } else if ((tok === "D")) {
      $si(c, "deflect", true);
    } else if ((tok === "G")) {
      $si(c, "gank", true);
    } else if ((tok === "X")) {
      $si(c, "accel", true);
    } else if ((tok === "R")) {
      $si(c, "ready", true);
    } else if ((tok === "B")) {
      $si(c, "back", true);
    }
  }
}
_OFF = $gi($json_load($open("/home/claude/sim/official/cards_official.json")), "cards");
DRAGONS = (() => { const $r = new PySet(); for (const c of $it(_OFF)) { if ($in("Dragon", $OR($cm(c, "get", "tags"), () => []))) { $r.add($cm($gi(c, "display_name"), "replace", " - ", ", ")); } } return $r; })();
_OFF = undefined;
LEG = new PyDict([["Ambessa", "ambessa"], ["Shen", "shen"], ["Fiora", "fiora"], ["K'Sante", "ksante"], ["Evelynn", "evelynn"], ["Zed", "zed"], ["Ziggs", "ziggs"], ["Orianna", "orianna"], ["Renekton", "renekton"], ["Seraphine", "seraphine"], ["Kai'Sa", "kaisa"], ["Kennen", "kennen"], ["Master Yi", "masteryi"], ["Vex", "vex"], ["Jarvan", "jarvan"], ["Irelia", "irelia"], ["LeBlanc", "leblanc"], ["Azir", "azir"], ["Akali", "akali"], ["Ornn", "ornn"], ["Jayce", "jayce"], ["Rengar", "rengar"], ["Sett", "sett"], ["Ezreal", "ezreal"], ["Rek'Sai", "reksai"]]);
BFS = new PyDict([["Ambessa", ["Sunken Temple", "Risen Altar", "Black Market"]], ["Shen", ["Kinkou Temple", "Durand Memorial", "Packed Amphitheater"]], ["Fiora", ["Veiled Temple", "Ornn's Forge", "Sunken Temple"]], ["K'Sante", ["Cosmic Vista", "Ruined Monastery", "Durand Memorial"]], ["Evelynn", ["Bandle Tree", "Bandle Scouts' Academy", "Rakelstake"]], ["Zed", ["Shadow Temple", "Ruined Monastery", "Risen Altar"]], ["Ziggs", ["Durand Memorial", "Black Market", "Hunters' Circle"]], ["Orianna", ["Piltovan Forge", "Hunters' Circle", "Rakelstake"]], ["Renekton", ["Risen Altar", "Sandswept Tomb", "Protective Sands"]], ["Seraphine", ["Packed Amphitheater", "Black Rose Sanctum", "Black Market"]], ["Kai'Sa", ["Void Gate", "Rockfall Path", "Frozen Fortress"]], ["Kennen", ["Minefield", "Veiled Temple", "Zaun Warrens"]], ["Master Yi", ["Packed Amphitheater", "Navori Fighting Pit", "Grove of the God-Willow"]], ["Vex", ["Packed Amphitheater", "Bandle Scouts' Academy", "Startipped Peak"]], ["Jarvan", ["Seat of Power", "Black Market", "Hunters' Circle"]], ["Irelia", ["Abandoned Hall", "Sunken Temple", "Targon's Peak"]], ["LeBlanc", ["Dusk Rose Lab", "Windswept Hillock", "Seat of Power"]], ["Azir", ["Hall of Legends", "Seat of Power", "Trifarian War Camp"]], ["Akali", ["Forgotten Monument", "Sigil of the Storm", "Void Gate"]], ["Ornn", ["Ornn's Forge", "Seat of Power", "Veiled Temple"]], ["Jayce", ["Forgotten Monument", "Frozen Fortress", "Sigil of the Storm"]], ["Rengar", ["Seat of Power", "Targon's Peak", "Zaun Warrens"]], ["Sett", ["Valley of Idols", "Packed Amphitheater", "Monastery of Hirana"]], ["Ezreal", ["Frozen Fortress", "Vilemaw's Lair", "Sigil of the Storm"]], ["Rek'Sai", ["Forbidding Waste", "Void Gate", "The Candlelit Sanctum"]]]);
REMOVAL = new PyDict([["Lacerate", ["kill_le", 3]], ["Wind and Ghosts", ["kill_le", 3]], ["Burn Away", ["kill_le", 3]], ["Public Execution", ["kill_less", 0]], ["Hidden Blade", ["kill_any", 0]], ["Shuriken Flip", ["dmg", 2]], ["Ruthless Strike", ["dmg", 3]], ["Consuming Curse", ["dmg", 2]], ["Shock Blast", ["dmg", 4]], ["Lost to the Sands", ["dmg", 4]], ["Falling Star", ["dmg2", 3]], ["Singularity", ["dmg2", 6]], ["Scorched Earth", ["split", 5]], ["Improvised Projectile", ["gear_dmg", 0]], ["Primordial Roar", ["mine_dmg", 0]], ["Strike Down", ["equip_dmg", 0]], ["Ntofo Strikes", ["shield_dmg", 0]], ["Encore", ["dmg_tokens", 2]], ["Dockside Lock-Up", ["banish_any", 0]], ["Rampage", ["fight", 0]], ["Shadow Dash", ["pull", 0]], ["Hextech Ray", ["dmg", 3]], ["Bellows Breath", ["aoe", 2]], ["Icathian Rain", ["rain", 12]], ["Decree of Unity", ["kill_chaos", 0]], ["Challenge", ["fight", 0]], ["Rocket Barrage", ["dmg_base", 4]], ["Abandon", ["none", 0]], ["Firestorm", ["bf3", 3]], ["Rebuke", ["bounce", 99]], ["Gust", ["bounce", 3]], ["Star-Crossed", ["bounce", 99]], ["Temporal Breach", ["reset", 0]]]);
PUMP = new PyDict([["En Garde", 2], ["Perfect Execution", 3], ["Smoke Screen", 4], ["Ride the Wind", 2], ["Punch First", 5], ["Guttural Roar", 2], ["Discipline", 2], ["Hold 'Em", 3], ["Onslaught", 6], ["Battle Preparations", 2], ["Bonds of Strength", 2], ["Dominus", "x2"], ["Block", 3], ["Raucous Anthem", "all3"], ["Primal Strength", 7], ["Defiant Dance", 4], ["Deathgrip", 3]]);
REACT_PUMP = new PySet(["Defiant Dance", "Deathgrip", "Discipline", "Battle Preparations", "Bonds of Strength", "Tactical Retreat"]);
SHOWDOWN_PUMP = new PySet(["Defiant Dance", "Deathgrip", "Primal Strength", "En Garde", "Smoke Screen", "Ride the Wind", "Punch First", "Guttural Roar", "Hold 'Em", "Dominus", "Block", "Discipline", "Battle Preparations", "Bonds of Strength"]);
FLOW = new PyDict([["Shuriken Flip", [3, 1]], ["Up from the Deep", [3, 0]], ["Shadow Dash", [5, 2]], ["Perfect Execution", [3, 1]], ["Twilight Step", [4, 1]], ["Lacerate", [4, 2]], ["Public Execution", [5, 2]], ["Onslaught", [4, 0]], ["Twilight Shroud", [2, 0]], ["Dredge Up", [2, 0]], ["Death Mark", [1, 2]], ["Lightning Rush", [2, 1]], ["Brittle Steel", [4, 1]]]);
AMBUSH = new PySet(["Kha'Zix, Mutating Horror", "Inferna", "Grim Apothecary", "Vi, Peacekeeper", "Nidalee, Cat Form", "Rengar, Trophy Hunter", "Evelynn, Consuming", "Morgana, Vindictive", "Vilemaw"]);
SMART = [true];
FUZZFIX = [true];
SIMUL = [true];
DIEWATCH = [true];
META25 = [true];
SAVE_PUMP = new PyDict([["Discipline", 2], ["Battle Preparations", 2], ["Defiant Dance", 2]]);
CHAIN = [true];
PB2 = [true];
PB = [true];
MECHS = new PySet(["Adaptatron", "Antagonistic Apparatus", "Blitzcrank, Impassive", "Breakneck Mech", "Bubble Bot", "Carrion Dredger", "Clanging Sentry", "Dangerous Duo", "Ferrous Forerunner", "Forecaster", "Gem Jammer", "Incorrigible Construct", "Mega-Mech", "Patched Porobot", "Piltovan Guidebot", "Plaza Guardian", "Prize of Progress", "Rumble, Hotheaded", "Rumble, Scrapper", "Scrapyard Champion", "Mech"]);
ORI = [true];
PLAYER_AI = [true];
REACT_VAL = new PyDict([["Smoke Screen", 4], ["Hextech Ray", 3], ["Stupefy", 1], ["Ki Barrier", 7], ["Discipline", 2], ["Battle Preparations", 2], ["Bonds of Strength", 2], ["For Demacia!", 4], ["Gust", 3], ["Rebuke", 4], ["Star-Crossed", 4], ["Bellows Breath", 2], ["Riposte", 3], ["Tactical Retreat", 3], ["Mesmerize", 2], ["High Note", 2], ["Punch First", 5], ["Guttural Roar", 2], ["Hold 'Em", 3], ["Block", 3], ["Ride the Wind", 2], ["Twilight Shroud", 1], ["Satchel Charge", 4], ["Hexplosive Minefield", 3], ["Primal Strength", 6], ["Defiant Dance", 4], ["Deathgrip", 3], ["Flash", 3], ["Thrill of the Hunt", 3]]);
DMG_KINDS = new PySet(["dmg_base", "dmg", "dmg2", "split", "gear_dmg", "mine_dmg", "equip_dmg", "shield_dmg", "aoe", "rain", "dmg_tokens"]);
UNTARGETABLE = new PySet(["Ruin Runner", "Akali, Silent"]);
UNTARGETABLE_COMBAT = new PySet(["Ruin Runner"]);
CHAOS = new PySet(["Shadow Order Disciple", "Traveling Merchant", "Bedeviling Stranger", "Tideturner", "Fizz, Trickster", "Reckless Innovator", "Tail-Cloaked Matriarch", "Vex, Apathetic", "Ezreal, Prodigy", "Kennen, Storm of Shuriken", "Black Market Broker", "Gutter Guardian", "Evelynn, In Control", "Evelynn, Entrancing", "Zed, From the Shadows", "Ziggs, Explosive", "Gust Monk"]);
FURY = new PySet(["Bilgewater Tracker", "Noxus Hopeful", "Ferrous Forerunner", "Kai'Sa, Survivor", "Hextech Ray", "Falling Star", "Lost to the Sands", "Icathian Rain", "Renekton, Brute", "Renekton, Rage Fueled", "Ruthless Strike", "Consuming Curse"]);
PROTECT = new PyDict([["Defy", 5], ["Not So Fast", 5], ["Back Off", 4], ["Janna, Savior", 3], ["Charm", 3], ["Decree of Focus", 4], ["Abandon", 5], ["Existential Dread", 4], ["Unyielding Spirit", 6], ["Repulse", 5], ["Hush", 4], ["Wind Wall", 5], ["Thwonk!", 4], ["Cannon Barrage", 3]]);
SAVE_FOR_REACT = new PySet(["Hextech Ray", "Bellows Breath", "Gust", "Rebuke", "Star-Crossed"]);
LOOK_PLANS = [["normal", new PyDict([])], ["all-out attack", new PyDict([["ai20_atk", true], ["hab_push", true], ["la_react", (-99)], ["conq_v", 9.0], ["trick_w", 1.0]])], ["hold and defend", new PyDict([["la_noatk", true], ["hab_keepup", true], ["trick_w", 3.0]])], ["spend tricks", new PyDict([["trick_w", 0.5], ["trick_m", 0.0]])], ["respect their tricks", new PyDict([["la_react", 2]])], ["patient", new PyDict([["hab_patient", true], ["trick_w", 3.0], ["conq_v", 4.0]])], ["fight at battlefield 1 only", new PyDict([["la_bf", 0]])], ["fight at battlefield 2 only", new PyDict([["la_bf", 1]])], ["save spells", new PyDict([["la_nospells", true]])]];
LOOK_MARGIN = [0.5];
LOOK_CARDS = [6];
LOOK_DEPTH = [null];
LOOK_SH = [[2, 4, 6]];
LOOK_KEYS = $sorted($bor((() => { const $r = new PySet(); for (const [_, v] of $it(LOOK_PLANS)) { for (const k of $it(v)) { $r.add(k); } } return $r; })(), new PySet(["la_skip", "la_tgt"])));
AI36 = [true];
RESP = [true];
FEAT = new PyDict([["atk", false], ["rein", true], ["mull", false], ["deny", true], ["sweep", true]]);
BLUFF = [true];
READ = [true];
COLOR = [true];
PRO_ERR = [0.04];
BLUFF_COST = [2];
RES2 = [true];
RES_K = [0.5];
DISC_FIX = [true];
EOT = [true];
EOT_DISC = [1];
V1B = ["off"];
VFLOW = [true];
SATCHEL = [true];
MOVES = [true];
AI29 = [true];
AI29B = [true];
AUDIT = [true];
ANVIL_AI = [false];
ANVIL_OLD = [false];
RIP2 = [true];
TIDE2 = [true];
HAB = new PyDict([["patient", false], ["push", false], ["thrift", false], ["mull2", false], ["keepup", false]]);
RULES33 = [true];
RULES34 = [true];
GAPS31 = [true];
MEZB = [true];
AI20 = new PyDict([["atk", false], ["mull", false], ["draw", false], ["tempo", false]]);
AI30 = [true];
TRICK_W = [2.0];
CONQ_V = [6.0];
TRICK_MARGIN = [0.4];
DEBUFF = new PyDict([["Mesmerize", 2], ["High Note", "X"], ["Switcheroo", "swap"]]);
DRAW_SPELL = new PyDict([["Dredge Up", 1], ["Life from Stone", 1], ["Show of Strength", "mighty"], ["Command: Attack", "gear"]]);
BOMB_KILLERS = new PySet(["Detonate", "Brittle Steel", "An Offer You Can't Refuse", "Hexplosive Minefield"]);
COMBAT_OK = new PySet(["Abandon", "Back Off", "Battle Preparations", "Bonds of Strength", "Bellows Breath", "Block", "Cannon Barrage", "Consuming Curse", "Crumbling Sands", "Decree of Focus", "Decree of Insight", "Defy", "Discipline", "Dominus", "En Garde", "Existential Dread", "For Demacia!", "Gust", "Guttural Roar", "Hard Bargain", "Hexplosive Minefield", "Hextech Ray", "Hidden Blade", "High Note", "Hold 'Em", "Hush", "Improvised Projectile", "Ki Barrier", "Last Caress", "Life from Stone", "Lost to the Sands", "Meditation", "Mesmerize", "Not So Fast", "Ntofo Strikes", "One-Two Punch", "Punch First", "Rebuke", "Repulse", "Ride the Wind", "Riposte", "Ruthless Strike", "Satchel Charge", "Scorched Earth", "Shock Blast", "Show of Strength", "Siren's Song", "Smoke Screen", "Star-Crossed", "Stupefy", "Switcheroo", "Tactical Retreat", "Thwonk!", "Unyielding Spirit", "Wind Wall", "Wind and Ghosts", "Flurry of Blades", "An Offer You Can't Refuse", "Challenge", "Primal Strength", "Defiant Dance", "Deathgrip", "Flash", "Salvage", "Clairvoyance", "Thrill of the Hunt"]);
PRE_PUMP = new PyDict([["Onslaught", 6], ["Perfect Execution", 3], ["Twilight Shroud", 1], ["Raucous Anthem", "all3"]]);
AZ = [true];
QUICKDRAW = new PySet(["Sterak's Gage", "Long Sword", "Cloth Armor"]);
BANISH = new PySet(["Burn Away", "Wind and Ghosts", "Dockside Lock-Up", "Temporal Breach"]);
FEAT16 = new PyDict([["legends", true], ["timing", true], ["cards", true], ["rules2", true]]);
SETUP = new PySet(["Arise!", "Guards!", "Desert's Call", "Invigorating Bloom", "Lightning Rush", "Dredge Up", "Life from Stone", "Command: Attack", "Encore", "Rousing Display", "The Waters' Wage", "Satchel Charge", "Death Mark", "Sabotage", "Catalyst of Aeons", "Clairvoyance", "Mobilize", "Mirror Image", "Sprite Burst", "Up from the Deep", "Salvage", "Promising Future"]);
for ([_k, _v] of $it($cm($cm(GSP, "get", "REMOVAL", new PyDict([])), "items"))) {
  $si(REMOVAL, _k, [$gi(_v, 0), $gi(_v, 1)]);
}
for ([_k, _v] of $it($cm($cm(GSP, "get", "PUMP", new PyDict([])), "items"))) {
  $si(PUMP, _k, _v);
}
for ([_k, _v] of $it($cm($cm(GSP, "get", "DRAW_SPELL", new PyDict([])), "items"))) {
  $si(GEN, _k, $add([["draw", _v]], $cm(GEN, "get", _k, [])));
  $cm(SETUP, "add", _k);
}
for (_k of $it($cm(GSP, "get", "SETUP", []))) {
  $cm(SETUP, "add", _k);
}
$si(GEN, "Find Your Center", [["draw", 1], ["chan", 1]]);
$cm(SETUP, "add", "Find Your Center");
for (_k of $it($cm(GSP, "get", "COMBAT_OK", []))) {
  $cm(COMBAT_OK, "add", _k);
}
for (_k of $it($cm(GSP, "get", "AMBUSH", []))) {
  $cm(AMBUSH, "add", _k);
}
$cm(AMBUSH, "add", "Rengar, Pouncing");
for (_k of $it($cm(GSP, "get", "UNTARGETABLE", []))) {
  $cm(UNTARGETABLE, "add", _k);
}
for (_k of $it($cm(GSP, "get", "PUMP", new PyDict([])))) {
  if ($in(_k, COMBAT_OK)) {
    $cm(SHOWDOWN_PUMP, "add", _k);
    $si(REACT_VAL, _k, 2);
  }
}
function champion_like(name_) {
  return $in(",", name_);
}
class Unit {
  get loc() {
    return this._loc;
  }
  set loc(v) {
    let old;
    old = $ga(this, "_loc", "base");
    if (($T($gi(PB2, 0)) && (v === "base") && (old !== "base") && (Unit.G != null) && ($gi($gi(Unit.G.bf, old), "name") === "Vilemaw's Lair"))) {
      return;
    }
    this._loc = v;
    if ((!$eq(old, v) && (Unit.G != null) && $T($gi(MOVES, 0)))) {
      Unit.G.on_move(this, old, v);
    }
  }
  get exhausted() {
    return this._ex;
  }
  set exhausted(v) {
    let old;
    old = $ga(this, "_ex", true);
    this._ex = v;
    if (($T(v) && !$T(old) && (Unit.G != null) && $T($gi(MOVES, 0)))) {
      Unit.G.on_exhaust(this);
    }
  }
  constructor(name_, owner, turn, token = false, base = null) {
    let c;
    { const $t3 = Unit; $t3._id = ($t3._id + 1); }
    this.id = Unit._id;
    [this.name, this.owner, this.token] = $it([name_, owner, token]);
    c = $cm(CARDS, "get", name_, new PyDict([]));
    this.base = ((base == null) ? $cm(c, "get", "m", 1) : base);
    this.eq = [];
    this.emp = 0;
    this.temp = 0;
    this.dmg = 0;
    this._loc = "base";
    this._ex = true;
    this.turn = turn;
    this.moved_tn = (-1);
    this.shield_b = 0;
    this.tank_b = false;
    this.protect = false;
    this.retreat = false;
    this.ward = 0;
    this.stun = false;
    this.pw = false;
    this.buffed = false;
    this.jmove = false;
  }
  kw(k) {
    let v, e, w;
    v = $cm($cm(CARDS, "get", this.name, new PyDict([])), "get", k, false);
    for (e of $it(this.eq)) {
      w = $cm($cm(EQKW, "get", e, new PyDict([])), "get", k, 0);
      if ($T(w)) {
        if ($in(k, ["shield", "assault"])) {
          v = $add($OR(v, () => 0), w);
        } else {
          v = true;
        }
      }
    }
    if (((k === "gank") && $in("Boots of Swiftness", this.eq))) {
      v = true;
    }
    return v;
  }
  might(g = null) {
    let m, p, bfn, here, ef;
    m = ($add($add(this.base, this.emp), this.temp) + (() => { let $s = 0; for (const e of $it(this.eq)) { $s += $num($gi($gi($gi(CARDS, e), "eq"), "bonus")); } return $s; })());
    if (((this.name === "Steel Paws") && $T(this.pw))) {
      m = (m + 7);
    }
    if ((g != null)) {
      p = $gi(g.P, this.owner);
      if ((($T(this.pw) || (this.emp > 0)) && (() => { for (const u of $it(p.units)) { if (((u.name === "Aurok General") && $T(u.pw))) return true; } return false; })())) {
        m = (m + 2);
      }
      if (((this.name === "Forsaken Baccai") && (p.runes < $gi(g.P, (1 - this.owner)).runes))) {
        m = (m + 1);
      }
      if (((this.name !== "Darius, Executioner") && (this.loc !== "base"))) {
        m = (m + (() => { let $s = 0; for (const u of $it(p.units)) { if (((u.name === "Darius, Executioner") && $eq(u.loc, this.loc))) { $s += $num(1); } } return $s; })());
      }
      if (($T(this.token) && (() => { for (const u of $it(p.units)) { if ((u.name === "Soul Shepherd")) return true; } return false; })())) {
        m = (m + 1);
      }
      if ((this.loc !== "base")) {
        bfn = $gi($gi(g.bf, this.loc), "name");
        if (((bfn === "Kinkou Temple") && $T(this.is_tank()))) {
          m = (m + 1);
        }
        if (((bfn === "Trifarian War Camp") && $T($gi(AZ, 0)))) {
          m = (m + 1);
        }
        if (((bfn === "Packed Amphitheater") && $T(champion_like(this.name)) && !$T(this.token))) {
          m = (m + 1);
        }
      }
      if ((this.loc !== "base")) {
        here = (() => { const $r = []; for (const u of $it(p.units)) { if ($eq(u.loc, this.loc)) { $r.push(u); } } return $r; })();
        if (($in("Hand Hammer", this.eq) && ($len(here) === 2))) {
          m = (m + 2);
        }
        if (((this.name === "Steadfast Outrider") && ((($len(here) - 1) + $len($gi($gi($gi(g.bf, this.loc), "gear"), this.owner))) >= 2))) {
          m = (m + 2);
        }
        if ((this.name === "Sett, Kingpin")) {
          m = (m + (() => { let $s = 0; for (const u of $it(p.units)) { if (($eq(u.loc, this.loc) && $T(u.buffed) && (u !== this))) { $s += $num(1); } } return $s; })());
        }
        if (((this.name === "Kennen, Keeper of Balance") && (() => { for (const e of $it($gi(g.P, (1 - this.owner)).units)) { if (($T(e.stun) && $eq(e.loc, this.loc))) return true; } return false; })())) {
          m = (m + 2);
        }
        if (((this.name === "Overloaded Traveler") && (() => { for (const x of $it($gi($gi($gi(g.bf, this.loc), "gear"), this.owner))) { if ($in("D", $gi($gi(CARDS, x), "f"))) return true; } return false; })())) {
          m = (m + 1);
        }
      }
      for (ef of $it($cm(GEN, "get", this.name, []))) {
        if (($gi(ef, 0) === "static")) {
          m = $iadd(m, $gi(ef, 1));
        }
      }
      if (($in("Brutalizer", this.eq) && $eq($ga(this, "brut_tn", (-1)), g.turn_no))) {
        m = (m + 2);
      }
      if (($in("Soul Sword", this.eq) && ($ga(p, "xp", 0) >= 3))) {
        m = (m + 1);
      }
    }
    return $max(0, m);
  }
  shield(g = null) {
    let s;
    s = ($add(this.kw("shield"), this.shield_b) + (2 * $cm(this.eq, "count", "Nazuman Ntofo")));
    if (((this.name === "Serene Ascetic") && $T(this.pw))) {
      s = (s + 3);
    }
    if (((this.name === "Disciple of Shen") && (g != null) && (this.loc !== "base") && ($len((() => { const $r = []; for (const u of $it($gi(g.P, this.owner).units)) { if ($eq(u.loc, this.loc)) { $r.push(u); } } return $r; })()) === 2))) {
      s = (s + 3);
    }
    if (((g != null) && (this.loc !== "base"))) {
      if ((() => { for (const gg of $it($gi($gi($gi(g.bf, this.loc), "gear"), this.owner))) { if ((gg === "Hunting Blind")) return true; } return false; })()) {
        s = (s + 2);
      }
      if (((() => { for (const u of $it($gi(g.P, this.owner).units)) { if (((u.name === "Taric, Protector") && $eq(u.loc, this.loc))) return true; } return false; })() && (this.name !== "Taric, Protector"))) {
        s = (s + 1);
      }
    }
    if (((this.name === "Fiora, Victorious") && (this.might(g) >= 5))) {
      s = (s + 1);
    }
    if (($T($gi(PB2, 0)) && (g != null) && (this.loc !== "base") && ($gi($gi(g.bf, this.loc), "name") === "Forbidding Waste") && ($len((() => { const $r = []; for (const u of $it($gi(g.P, this.owner).units)) { if ($eq(u.loc, this.loc)) { $r.push(u); } } return $r; })()) === 1))) {
      s = $sub(s, $min(2, (this.might(g) + s)));
    }
    return s;
  }
  is_tank() {
    return $OR(this.kw("tank"), () => this.tank_b);
  }
  gank() {
    return $OR(this.kw("gank"), () => $OR(((this.name === "Fiora, Victorious") && (this.might() >= 5)), () => $OR($in("Boots of Swiftness", this.eq), () => $AND($gi(ORI, 0), () => $AND((this.name === "The Ball"), () => $ga(this, "anim", false))))));
  }
}
Unit._id = 0;
Unit.G = null;
DOMAINS = $json_load($open("domains.json"));
CHAOS = (() => { const $r = new PySet(); for (const [c, d] of $it($cm(DOMAINS, "items"))) { if ($in("Chaos", d)) { $r.add(c); } } return $r; })();
FURY = (() => { const $r = new PySet(); for (const [c, d] of $it($cm(DOMAINS, "items"))) { if ($in("Fury", d)) { $r.add(c); } } return $r; })();
RUNE_SPLIT = new PyDict([["Azir", new PyDict([["Calm", 7], ["Order", 5]])], ["Akali", new PyDict([["Calm", 6], ["Fury", 6]])], ["Ornn", new PyDict([["Calm", 8], ["Mind", 4]])], ["Ambessa", new PyDict([["Body", 7], ["Order", 5]])], ["Fiora", new PyDict([["Body", 7], ["Order", 5]])], ["K'Sante", new PyDict([["Calm", 5], ["Body", 7]])], ["Evelynn", new PyDict([["Chaos", 6], ["Body", 6]])], ["Shen", new PyDict([["Order", 7], ["Calm", 5]])], ["Renekton", new PyDict([["Fury", 6], ["Body", 6]])], ["Ziggs", new PyDict([["Fury", 6], ["Chaos", 6]])], ["Zed", new PyDict([["Fury", 6], ["Chaos", 6]])], ["Orianna", new PyDict([["Mind", 7], ["Calm", 5]])], ["Seraphine", new PyDict([["Order", 8], ["Mind", 4]])], ["Jarvan", new PyDict([["Body", 7], ["Order", 5]])], ["Irelia", new PyDict([["Calm", 7], ["Chaos", 5]])], ["LeBlanc", new PyDict([["Order", 8], ["Mind", 4]])], ["Jayce", new PyDict([["Body", 8], ["Mind", 4]])], ["Rengar", new PyDict([["Body", 8], ["Fury", 4]])], ["Vex", new PyDict([["Calm", 6], ["Chaos", 6]])], ["Kai'Sa", new PyDict([["Mind", 7], ["Fury", 5]])], ["Master Yi", new PyDict([["Body", 6], ["Calm", 6]])], ["Sett", new PyDict([["Body", 7], ["Order", 5]])], ["Ezreal", new PyDict([["Chaos", 6], ["Mind", 6]])], ["Rek'Sai", new PyDict([["Fury", 6], ["Order", 6]])]]);
function auto_split(cards) {
  let dem, c, ds, w, d, top_, a;
  dem = new CounterD();
  for (c of $it(cards)) {
    ds = (() => { const $r = []; for (const d of $it($cm(DOMAINS, "get", c, []))) { if ((d !== "Colorless")) { $r.push(d); } } return $r; })();
    w = ($in(c, CARDS) ? $gi($gi(CARDS, c), "p") : 1);
    for (d of $it(ds)) {
      { const $t4 = dem, $t5 = d; $si($t4, $t5, ($gi($t4, $t5) + ((w + 0.5) / $len(ds)))); }
    }
  }
  top_ = (() => { const $r = []; for (const [d, _] of $it($cm(dem, "most_common", 2))) { $r.push(d); } return $r; })();
  if (($len(top_) < 2)) {
    top_ = $sl($add(top_, ["Fury", "Calm"]), null, 2);
  }
  a = $round(($mul(12, $gi(dem, $gi(top_, 0))) / $add($gi(dem, $gi(top_, 0)), $gi(dem, $gi(top_, 1)))));
  a = $min(8, $max(4, a));
  return new PyDict([[$gi(top_, 0), a], [$gi(top_, 1), (12 - a)]]);
}
class Player {
  constructor(name_, champ, cards, rng) {
    let split;
    this.name = name_;
    this.leg = $gi(LEG, name_);
    this.deck = $sl(cards, null, null);
    rng.shuffle(this.deck);
    this.decklist = $sl(cards, null, null);
    this.champ = [champ];
    this.hand = [];
    this.trash = [];
    this.units = [];
    this.base_gear = [];
    this.loose_eq = [];
    this.runes = 0;
    this.points = 0;
    this.E = 0;
    this.P = 0;
    this.pending = 0;
    this.gold = 0;
    this.seal = 0;
    this.hidden = [];
    this.mighty_leg_used = false;
    this.kemp = false;
    this.extra = false;
    this.spirit = (-1);
    this.petri = (-1);
    this.ai = 5;
    this.spellP = 0;
    this.caress = false;
    this.ai20_draw = $cm(AI20, "get", "v2", true);
    this.ai20_mull = $AND($cm(AI20, "get", "v2", true), () => (name_ !== "Ambessa"));
    this.ai20_atk = $AND($cm(AI20, "get", "v2", true), () => $in(name_, ["Ziggs", "Zed"]));
    this.hab_keepup = $AND($cm(HAB, "get", "v3", true), () => (name_ === "Fiora"));
    this.shown_empty = 0;
    this.bluffs = 0;
    this.jleg = false;
    this.err = $gi(PRO_ERR, 0);
    this.mistakes = 0;
    this.tn = 0;
    this.plays = [];
    split = $OR($cm(RUNE_SPLIT, "get", name_), () => auto_split(cards));
    this.doms = $list(split);
    this.rdeck = (() => { const $r = []; for (const [col, n] of $it($cm(split, "items"))) { for (const _ of $it($range(n))) { $r.push(col); } } return $r; })();
    rng.shuffle(this.rdeck);
    this.rc = new PyDict([]);
    this.rng = rng;
  }
}
class Game {
  constructor(d1, d2, rng, verbose = false) {
    let k_, st_, kk_, vv_;
    this.rng = rng;
    this.v = verbose;
    this.P = [new Player($gi(d1, 0), $gi(d1, 1), $gi(d1, 2), rng), new Player($gi(d2, 0), $gi(d2, 1), $gi(d2, 2), rng)];
    Unit.G = this;
    this._in_move = false;
    this.bf = [$dict($kw({"name": rng.choice($gi(BFS, $gi(d1, 0))), "ctrl": null, "gear": [[], []], "bombs": [0, 0]})), $dict($kw({"name": rng.choice($gi(BFS, $gi(d2, 0))), "ctrl": null, "gear": [[], []], "bombs": [0, 0]}))];
    this.turn_no = 0;
    this.tp = 0;
    this.doomed = [];
    this.chain = [];
    this.chain_hi = 0;
    this.log = [];
    this.scored = new PyDict([]);
    this.victory = 8;
    if ($T($gi(LEARN, 0))) {
      for (k_ of $it($range(2))) {
        st_ = $cm(STYLES, "get", $add($add($gi(this.P, k_).name, "|"), $gi(this.P, (1 - k_)).name));
        if ($T(st_)) {
          for ([kk_, vv_] of $it($cm(st_, "items"))) {
            $setattr($gi(this.P, k_), kk_, vv_);
          }
        }
      }
    }
  }
  say(...a) {
    if ($T(this.v)) {
      $cm(this.log, "append", $cm(" ", "join", (() => { const $r = []; for (const x of $it(a)) { $r.push($str(x)); } return $r; })()));
    }
  }
  draw(p, n = 1) {
    let _, foe;
    for (_ of $it($range(n))) {
      if (!$T(p.deck)) {
        if ((!$T(p.trash) && !$T($gi(RULES34, 0)))) {
          return;
        }
        p.deck = $list(p.trash);
        p.trash = [];
        this.rng.shuffle(p.deck);
        foe = $gi(this.P, (1 - $cm(this.P, "index", p)));
        this.score((1 - $cm(this.P, "index", p)), 1, "burn out");
        p.burnouts = ($ga(p, "burnouts", 0) + 1);
      }
      if ($T(p.deck)) {
        $cm(p.hand, "append", $cm(p.deck, "pop"));
      }
    }
  }
  burn(p, n) {
    let _;
    for (_ of $it($range(n))) {
      if ((!$T(p.deck) && $T($gi(FEAT16, "rules2")) && ($T(p.trash) || $T($gi(RULES34, 0))))) {
        p.deck = $list(p.trash);
        p.trash = [];
        this.rng.shuffle(p.deck);
        this.score((1 - $cm(this.P, "index", p)), 1, "burn out");
        p.burnouts = ($ga(p, "burnouts", 0) + 1);
      }
      if ($T(p.deck)) {
        $cm(p.trash, "append", $cm(p.deck, "pop"));
      }
    }
  }
  banish(u, why = "") {
    let p, e;
    p = $gi(this.P, u.owner);
    if (!$in(u, p.units)) {
      return;
    }
    $cm(p.units, "remove", u);
    for (e of $it(u.eq)) {
      $cm(p.loose_eq, "append", e);
    }
    if (this.v) this.say(`  ${$str(p.name)}'s ${$str(u.name)} is banished ${$str(why)}`);
  }
  zed_banish(p) {
    if ((p.leg === "zed")) {
      p.zemp = true;
    }
  }
  mulligan(p) {
    let cheap, ranked, back, twos, c, rest;
    p.hand = (() => { const $r = []; for (const _ of $it($range(4))) { $r.push($cm(p.deck, "pop")); } return $r; })();
    if (((p.ai >= 5) && ($T($cm(FEAT, "get", "mull", true)) || $T($ga(p, "ai20_mull", $gi(AI20, "mull")))))) {
      cheap = (() => { const $r = []; for (const c of $it(p.hand)) { if ((($gi($gi(CARDS, c), "e") <= 3) && $in($gi($gi(CARDS, c), "t"), ["Unit", "Gear"]))) { $r.push(c); } } return $r; })();
      ranked = $sorted(p.hand, $kw({"key": ((c) => (-$add($add($gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p")), ($in($gi($gi(CARDS, c), "t"), ["Unit", "Gear"]) ? 0 : 1))))}));
      back = $sl((() => { const $r = []; for (const c of $it(ranked)) { if (($gi($gi(CARDS, c), "e") >= 5)) { $r.push(c); } } return $r; })(), null, 2);
      if (($len(cheap) < 2)) {
        back = $iadd(back, $sl((() => { const $r = []; for (const c of $it(ranked)) { if ((!$in(c, back) && !$in(c, $sl(cheap, null, 1)) && ($gi($gi(CARDS, c), "e") >= 3))) { $r.push(c); } } return $r; })(), null, (2 - $len(back))));
      }
      if (($T($ga(p, "hab_mull2", $gi(HAB, "mull2"))) && ($len(back) < 2))) {
        twos = (() => { const $r = []; for (const c of $it(p.hand)) { if ((!$in(c, back) && ($gi($gi(CARDS, c), "e") <= 2) && ($gi($gi(CARDS, c), "t") === "Unit"))) { $r.push(c); } } return $r; })();
        if (($len(twos) >= 3)) {
          $cm(back, "append", $min(twos, $kw({"key": ((c) => $add($cm($gi(CARDS, c), "get", "m", 0), $gi($gi(CARDS, c), "p")))})));
        }
      }
      for (c of $it(back)) {
        $cm(p.hand, "remove", c);
      }
      for (c of $it(back)) {
        $cm(p.hand, "append", $cm(p.deck, "pop"));
      }
      for (c of $it(back)) {
        $cm(p.deck, "insert", 0, c);
      }
      return;
    }
    back = $sl($sorted((() => { const $r = []; for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "e") >= 5)) { $r.push(c); } } return $r; })(), $kw({"key": ((c) => (-$gi($gi(CARDS, c), "e")))})), null, 2);
    if (($T($gi(SMART, 0)) && ($len(back) < 2) && !((() => { for (const c of $it(p.hand)) { if (!$in(c, back)) { if (($in($gi($gi(CARDS, c), "t"), ["Unit", "Gear"]) && ($gi($gi(CARDS, c), "e") <= 2))) return true; } } return false; })()))) {
      rest = $sorted((() => { const $r = []; for (const c of $it(p.hand)) { if ((!$in(c, back) && ($gi($gi(CARDS, c), "e") >= 3))) { $r.push(c); } } return $r; })(), $kw({"key": ((c) => (-$gi($gi(CARDS, c), "e")))}));
      back = $iadd(back, $sl(rest, null, (2 - $len(back))));
    }
    for (c of $it(back)) {
      $cm(p.hand, "remove", c);
    }
    for (c of $it(back)) {
      $cm(p.hand, "append", $cm(p.deck, "pop"));
    }
    for (c of $it(back)) {
      $cm(p.deck, "insert", 0, c);
    }
  }
  enemy(i) {
    return (1 - i);
  }
  cast(p, card, e, pw, trash = true) {
    let i, stopped;
    $cm(p.hand, "remove", card);
    this.pay(p, e, pw, card);
    if ($T(trash)) {
      $cm(p.trash, "append", card);
    }
    if ((!$T($gi(CHAIN, 0)) || ($cm($cm(CARDS, "get", card, new PyDict([])), "get", "t") !== "Spell"))) {
      return true;
    }
    i = $cm(this.P, "index", p);
    if ($T(this.chain)) {
      if (this.v) this.say(`  ${$str(p.name)} responds with ${$str(card)} (Chain: ${$str($cm(" > ", "join", $add(this.chain, [card])))})`);
    }
    $cm(this.chain, "append", card);
    this.chain_hi = $max(this.chain_hi, $len(this.chain));
    stopped = false;
    if ((($len(this.chain) >= 2) || ($add($gi($gi(CARDS, card), "e"), $mul(2, $gi($gi(CARDS, card), "p"))) >= 3))) {
      stopped = this.counter_any((1 - i), card);
    }
    $cm(this.chain, "pop");
    if ($T(stopped)) {
      if (this.v) this.say(`  ${$str(card)} is countered (last in, first out)`);
    }
    return !$T(stopped);
  }
  other_spell_this_turn(p, card) {
    let lst;
    if (!$eq($ga(p, "spl_tn", null), this.turn_no)) {
      return false;
    }
    lst = $list(p.spl);
    if ($in(card, lst)) {
      $cm(lst, "remove", card);
    }
    return ($len(lst) >= 1);
  }
  thrill(owner, target, why) {
    let o, loc;
    o = $gi(this.P, owner);
    if ((!$in("Thrill of the Hunt", o.hand) || (target == null) || $T(target.token) || !$in(target, o.units) || !(this.can_pay(o, 2, 1, "Thrill of the Hunt")))) {
      return false;
    }
    if ($T(this.cast(o, "Thrill of the Hunt", 2, 1))) {
      loc = ((target.loc !== "base") ? target.loc : $max($range(2), $kw({"key": ((b) => [$eq($gi($gi(this.bf, b), "ctrl"), owner), (-$len(this.units_at((1 - owner), b)))])})));
      this.banish(target, "(Thrill of the Hunt)");
      this.place_unit(owner, target.name, loc);
      if (this.v) this.say(`  ${$str(o.name)} plays Thrill of the Hunt: ${$str(target.name)} dodges ${$str(why)} and comes back at ${$str($gi($gi(this.bf, loc), "name"))}`);
      return true;
    }
  }
  answer_spell(owner, caster, card, kind, target) {
    let o, c, pw, big, v_, lethal, hp_, pc, ot, ce, cp;
    o = $gi(this.P, owner);
    c = $gi(this.P, caster);
    if ($T(this.slip(o))) {
      return false;
    }
    pw = $cm($cm(CARDS, "get", card, new PyDict([])), "get", "p", 0);
    if (((target != null) && (target.name === "Esteemed Hierophant") && (o.runes >= 7) && $in(kind, DMG_KINDS))) {
      return true;
    }
    if (($in(kind, DMG_KINDS) && $in(card, FURY) && $in("Decree of Focus", o.hand) && this.can_pay(o, 1, 0, "Decree of Focus") && (target != null) && ((target.might(this) + 4) > ((kind !== "rain") ? 4 : 2)))) {
      if ($T(this.cast(o, "Decree of Focus", 1, 0))) {
        { const $t6 = target; $t6.temp = ($t6.temp + 4); }
        if (this.v) this.say(`  ${$str(o.name)} answers ${$str(card)} with Decree of Focus`);
        return true;
      }
    }
    if (($in(kind, DMG_KINDS) && $eq(o.spirit, this.turn_no))) {
      return true;
    }
    big = $OR((target == null), () => $OR((target.might(this) >= 3), () => $OR(champion_like(target.name), () => target.eq)));
    if ((!$T(big) && $T($gi(RESP, 0)) && (target != null) && !$T(target.token) && $in("Not So Fast", o.hand) && this.can_pay(o, 2, 1, "Not So Fast"))) {
      if ($T(this.cast(o, "Not So Fast", 2, 1))) {
        if (this.v) this.say(`  ${$str(o.name)} says Not So Fast to ${$str(card)}`);
        return true;
      }
    }
    if (!$T(big)) {
      return false;
    }
    if (($T($gi(RIP2, 0)) && $T(this.riposte(owner, card, target)))) {
      return true;
    }
    if (($T($gi(MEZB, 0)) && $T($ga(o, "gaps31", $gi(GAPS31, 0))) && (target != null) && $in(target, o.units) && $in("Mesmerize", o.hand) && !$in(kind, ["bounce", "minus", "move", "none"]) && this.can_pay(o, 1, 1, "Mesmerize"))) {
      v_ = $gi($cm(REMOVAL, "get", card, [null, 99]), 1);
      lethal = (!$in(kind, ["dmg", "dmg2"]) || (v_ >= ((target.might(this) - target.dmg) + target.ward)));
      if (($T(lethal) && !$T(target.token) && ($T(target.eq) || $T(champion_like(target.name))) && ($add($cm($cm(CARDS, "get", target.name, new PyDict([])), "get", "e", 0), $cm($cm(CARDS, "get", target.name, new PyDict([])), "get", "p", 0)) >= 6))) {
        if ($T(this.cast(o, "Mesmerize", 1, 1))) {
          this.bounce(target);
          if (this.v) this.say(`  ${$str(o.name)} Mesmerizes ${$str(target.name)} back to hand to dodge ${$str(card)}`);
          return true;
        }
      }
    }
    if (((target != null) && $in(target, o.units) && !$in(kind, ["bounce", "move", "none", "aoe", "rain"]) && $in("Thrill of the Hunt", o.hand))) {
      v_ = $gi($cm(REMOVAL, "get", card, [null, 99]), 1);
      lethal = (!$in(kind, ["dmg", "dmg2"]) || (v_ >= ((target.might(this) - target.dmg) + target.ward)));
      if (($T(lethal) && ($T(target.eq) || $T(champion_like(target.name)) || ($cm($cm(CARDS, "get", target.name, new PyDict([])), "get", "e", 0) >= 4)) && $T(this.thrill(owner, target, card)))) {
        return true;
      }
    }
    if (($in("Crumbling Sands", o.hand) && $T(this.other_spell_this_turn(c, card)) && this.can_pay(o, 1, 1, "Crumbling Sands"))) {
      if ($T(this.cast(o, "Crumbling Sands", 1, 1))) {
        if (this.v) this.say(`  ${$str(o.name)} counters ${$str(card)} with Crumbling Sands`);
        return true;
      }
    }
    if (($in("Repulse", o.hand) && (target != null) && (target.loc !== "base") && !$in(kind, ["aoe", "rain"]) && this.can_pay(o, 1, 1, "Repulse"))) {
      if ($T(this.cast(o, "Repulse", 1, 1))) {
        if (this.v) this.say(`  ${$str(o.name)} Repulses ${$str(card)}`);
        return true;
      }
    }
    if (($in(kind, DMG_KINDS) && $in("Unyielding Spirit", o.hand) && this.can_pay(o, 1, 1, "Unyielding Spirit"))) {
      if ($T(this.cast(o, "Unyielding Spirit", 1, 1))) {
        o.spirit = this.turn_no;
        if (this.v) this.say(`  ${$str(o.name)} plays Unyielding Spirit vs ${$str(card)}`);
        return true;
      }
    }
    if (($T($gi(CHAIN, 0)) && (target != null) && $in(target, o.units) && $in(kind, ["kill_le", "dmg"]))) {
      v_ = $gi($cm(REMOVAL, "get", card, [null, 0]), 1);
      hp_ = (() => ((kind === "kill_le") ? target.might(this) : ((target.might(this) - target.dmg) + target.ward)));
      for (pc of $it($sorted((() => { const $r = []; for (const c of $it(o.hand)) { if ($in(c, SAVE_PUMP)) { $r.push(c); } } return $r; })(), $kw({"key": ((c) => [$add($gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p")), (c !== "Discipline")])})))) {
        if ((($add(hp_(), $gi(SAVE_PUMP, pc)) > v_) && this.can_pay(o, $gi($gi(CARDS, pc), "e"), $gi($gi(CARDS, pc), "p"), pc))) {
          if ($T(this.cast(o, pc, $gi($gi(CARDS, pc), "e"), $gi($gi(CARDS, pc), "p")))) {
            { const $t7 = target; $t7.temp = $iadd($t7.temp, $gi(SAVE_PUMP, pc)); }
            if ((pc === "Discipline")) {
              this.draw(o);
            }
            if ((pc === "Defiant Dance")) {
              ot = ((target.loc !== "base") ? (() => { const $r = []; for (const x of $it(c.units)) { if ($eq(x.loc, target.loc)) { $r.push(x); } } return $r; })() : []);
              if ($T(ot)) {
                { const $t8 = $max(ot, $kw({"key": ((x) => x.might(this))})); $t8.temp = ($t8.temp - 2); }
              }
            }
            if (this.v) this.say(`  ${$str(o.name)} answers ${$str(card)} with ${$str(pc)}: ${$str(target.name)} is out of reach`);
            if ((kind === "dmg")) {
              this.deal(target, v_, card);
            }
            return true;
          }
          break;
        }
      }
    }
    if (((pw >= 2) && $in("Hush", o.hand) && this.can_pay(o, 1, 2, "Hush"))) {
      if ($T(this.cast(o, "Hush", 1, 2))) {
        if (this.v) this.say(`  ${$str(o.name)} Hushes ${$str(card)}`);
        return true;
      }
    }
    [ce, cp] = $it([$cm($cm(CARDS, "get", card, new PyDict([])), "get", "e", 0), $cm($cm(CARDS, "get", card, new PyDict([])), "get", "p", 0)]);
    if (($in("Defy", o.hand) && (ce <= 4) && (cp <= 1) && this.can_pay(o, 1, 1, "Defy"))) {
      if ($T(this.cast(o, "Defy", 1, 1))) {
        if (this.v) this.say(`  ${$str(o.name)} Defies ${$str(card)}`);
        return true;
      }
    }
    if (($in("Not So Fast", o.hand) && (target != null) && this.can_pay(o, 2, 1, "Not So Fast"))) {
      if ($T(this.cast(o, "Not So Fast", 2, 1))) {
        if (this.v) this.say(`  ${$str(o.name)} says Not So Fast to ${$str(card)}`);
        return true;
      }
    }
    if (($in("Abandon", o.hand) && this.can_pay(o, 2, 0, "Abandon") && ($cm($cm(CARDS, "get", card, new PyDict([])), "get", "e", 0) >= 2))) {
      if ($T(this.cast(o, "Abandon", 2, 0))) {
        if (this.v) this.say(`  ${$str(o.name)} Abandons ${$str(card)}`);
        return true;
      }
    }
    if (($in("Wind Wall", o.hand) && this.can_pay(o, 3, 2, "Wind Wall") && ($cm($cm(CARDS, "get", card, new PyDict([])), "get", "e", 0) >= 2))) {
      if ($T(this.cast(o, "Wind Wall", 3, 2))) {
        if (this.v) this.say(`  ${$str(o.name)} Wind Walls ${$str(card)}`);
        return true;
      }
    }
    return false;
  }
  riposte(owner, card, target = null) {
    let o, u;
    o = $gi(this.P, owner);
    if ((!$in("Riposte", o.hand) || !$T(o.units) || !(this.can_pay(o, 2, 2, "Riposte")))) {
      return false;
    }
    u = (((target != null) && $in(target, o.units)) ? target : $max(o.units, $kw({"key": ((x) => x.might(this))})));
    if ($T(this.cast(o, "Riposte", 2, 2))) {
      { const $t9 = u; $t9.temp = $iadd($t9.temp, $cm($cm(CARDS, "get", card, new PyDict([])), "get", "e", 0)); }
      if (this.v) this.say(`  ${$str(o.name)} Ripostes ${$str(card)}`);
      return true;
    }
  }
  counter_any(owner, card) {
    let top_, r;
    top_ = ($bool(this.chain) && $eq($gi(this.chain, (-1)), card));
    if (!$T(top_)) {
      $cm(this.chain, "append", card);
      this.chain_hi = $max(this.chain_hi, $len(this.chain));
    }
    r = this.counter_any_(owner, card);
    if (!$T(top_)) {
      $cm(this.chain, "pop");
    }
    return r;
  }
  counter_any_(owner, card) {
    let o, ce, cp, c, e, pw, ok;
    o = $gi(this.P, owner);
    if ((o.ai < 3)) {
      return false;
    }
    [ce, cp] = $it([$cm($cm(CARDS, "get", card, new PyDict([])), "get", "e", 0), $cm($cm(CARDS, "get", card, new PyDict([])), "get", "p", 0)]);
    for ([c, e, pw, ok] of $it([["Defy", 1, 1, ((ce <= 4) && (cp <= 1))], ["Hush", 1, 2, (cp >= 2)], ["Abandon", 2, 0, true], ["Wind Wall", 3, 2, true], ["Hard Bargain", 2, 0, !(this.can_pay($gi(this.P, (1 - owner)), 2, 0))], ["Riposte", 2, 2, $AND($gi(RIP2, 0), () => $bool(o.units))], ["Crumbling Sands", 1, 1, this.other_spell_this_turn($gi(this.P, (1 - owner)), card)]])) {
      if (($T(ok) && $in(c, o.hand) && this.can_pay(o, e, pw, c))) {
        if ((c === "Riposte")) {
          if ($T(this.riposte(owner, card))) {
            return true;
          }
          continue;
        }
        if ($T(this.cast(o, c, e, pw))) {
          if (this.v) this.say(`  ${$str(o.name)} counters ${$str(card)} with ${$str(c)}`);
          return true;
        }
      }
    }
    return false;
  }
  wild_safe(u) {
    if ((u.loc === "base")) {
      return false;
    }
    return (() => { for (const x of $it($gi(this.P, u.owner).units)) { if (((x.name === "Alpha Wildclaw") && $eq(x.loc, u.loc) && (x !== u) && (x.might(this) > u.might(this)))) return true; } return false; })();
  }
  can_gank(u) {
    if ($T(u.gank())) {
      return true;
    }
    if (!$T($gi(FEAT16, "cards"))) {
      return false;
    }
    if (($in(u.name, ["Brutal Hunter", "Renekton, Brute"]) && $T(u.pw))) {
      return true;
    }
    if (((u.name === "Kayle, Justified") && (u.emp >= 6))) {
      return true;
    }
    if (((u.name === "Master Yi, Tempered") && ($ga($gi(this.P, u.owner), "xp", 0) >= 6))) {
      return true;
    }
    if (((u.loc !== "base") && $in("Portable Portal", $gi($gi($gi(this.bf, u.loc), "gear"), u.owner)))) {
      return true;
    }
    return false;
  }
  deflect_n(u) {
    let n;
    n = 0;
    if (((u.name === "Kayle, Justified") && (u.emp >= 6))) {
      n = (n + 3);
    }
    if (((u.name === "Solari Sunhawk") && $T(u.pw))) {
      n = (n + 2);
    }
    return $add(n, ($T(this.deflected(u)) ? 1 : 0));
  }
  deflected(u) {
    let o;
    o = $gi(this.P, u.owner);
    if (($T(u.token) && (u.name === "Bird"))) {
      return true;
    }
    if (($T($gi(FEAT16, "cards")) && (($in(u.name, ["Serene Ascetic", "Renekton, Brute"]) && $T(u.pw)) || ((u.name === "Master Yi, Tempered") && ($ga(o, "xp", 0) >= 6)) || ((u.name === "Kayle, Justified") && (u.emp >= 6)) || (($cm($cm(CARDS, "get", u.name, new PyDict([])), "get", "t") === "Gear") && (() => { for (const x of $it(o.units)) { if ((x.name === "Watchful Curator")) return true; } return false; })())))) {
      return true;
    }
    return $OR(u.kw("deflect"), () => $OR($in("Hexdrinker", u.eq), () => $OR($in("Petricite Monument", o.base_gear), () => ((u.name === "Fiora, Victorious") && (u.might() >= 5)))));
  }
  reactive_cards(p) {
    let ex, out;
    ex = ($T($ga(p, "hab_keepup", $cm(HAB, "get", "keepup", false))) ? ["Ride the Wind"] : ["Punch First", "Guttural Roar", "Hold 'Em", "Ride the Wind"]);
    out = (() => { const $r = []; for (const c of $it(p.hand)) { if (($in(c, REACT_VAL) && !$in(c, ex))) { $r.push(c); } } return $r; })();
    out = $iadd(out, (() => { const $r = []; for (const c of $it(p.hand)) { if (($in(c, AMBUSH) || $in(c, PROTECT))) { $r.push(c); } } return $r; })());
    return out;
  }
  reserve(p) {
    let foe, r, best;
    if (!$T($gi(PLAYER_AI, 0))) {
      return [0, 0];
    }
    foe = $gi(this.P, (1 - $cm(this.P, "index", p)));
    if (!$T(foe.units)) {
      return [0, 0];
    }
    r = this.reactive_cards(p);
    if (!$T(r)) {
      return [0, 0];
    }
    best = $max(r, $kw({"key": ((c) => [$cm(REACT_VAL, "get", c, $cm(PROTECT, "get", c, 3)), (-$gi($gi(CARDS, c), "e"))])}));
    return [$gi($gi(CARDS, best), "e"), $gi($gi(CARDS, best), "p")];
  }
  react_threat(i, bi) {
    let o, unseen, n, h, best, c, k, ph, v;
    if (!$T($gi(PLAYER_AI, 0))) {
      return ((($gi(this.P, (1 - i)).E >= 2) && ($len($gi(this.P, (1 - i)).hand) >= 2)) ? 2 : 0);
    }
    o = $gi(this.P, (1 - i));
    unseen = $add(o.deck, o.hand);
    n = $len(unseen);
    h = $len(o.hand);
    if (($eq(h, 0) || $eq(n, 0))) {
      return 0;
    }
    best = 0;
    for (c of $it($set(unseen))) {
      if (($in(c, REACT_VAL) || $in(c, AMBUSH))) {
        if (($in(c, ["Punch First", "Guttural Roar", "Hold 'Em", "Ride the Wind"]) && !$in(c, SHOWDOWN_PUMP))) {
          continue;
        }
        if (!(this.can_pay(o, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
          continue;
        }
        k = $cm(unseen, "count", c);
        ph = (($sub(n, k) >= h) ? (1 - ($comb($sub(n, k), h) / $comb(n, h))) : 1.0);
        v = $cm(REACT_VAL, "get", c, $cm($gi(CARDS, c), "get", "m", 3));
        best = $max(best, $mul(v, ph));
      }
    }
    if ((($gi(this.P, i).ai >= 4) && $T($gi(READ, 0)) && $T(o.shown_empty))) {
      best = $mul(best, $max(0.45, (0.8 ** o.shown_empty)));
    }
    best = (best + (2 * (() => { let $s = 0; for (const hh of $it(o.hidden)) { if ($eq($gi(hh, 1), bi)) { $s += $num(1); } } return $s; })()));
    return $int($round(best));
  }
  units_at(i, loc) {
    return (() => { const $r = []; for (const u of $it($gi(this.P, i).units)) { if ($eq(u.loc, loc)) { $r.push(u); } } return $r; })();
  }
  sync(p) {
    let tot, col;
    tot = $sum($cm(p.rc, "values"));
    while (((tot < p.runes) && $T(p.rdeck))) {
      col = $cm(p.rdeck, "pop", 0);
      $si(p.rc, col, ($cm(p.rc, "get", col, 0) + 1));
      tot = (tot + 1);
    }
    while ((tot > p.runes)) {
      col = $max(p.rc, $kw({"key": ((k) => $gi(p.rc, k))}));
      { const $t10 = p.rc, $t11 = col; $si($t10, $t11, ($gi($t10, $t11) - 1)); }
      $cm(p.rdeck, "append", col);
      tot = (tot - 1);
    }
  }
  cdoms(p, c) {
    let d;
    if (((c == null) || !$T($gi(COLOR, 0)))) {
      return p.doms;
    }
    d = (() => { const $r = []; for (const x of $it($cm(DOMAINS, "get", c, []))) { if ($in(x, p.doms)) { $r.push(x); } } return $r; })();
    return $OR(d, () => p.doms);
  }
  colored_avail(p, c) {
    let wild;
    this.sync(p);
    wild = $max(0, (p.P - $sum($cm(p.rc, "values"))));
    return $min(p.P, ((() => { let $s = 0; for (const d of $it(this.cdoms(p, c))) { $s += $num($cm(p.rc, "get", d, 0)); } return $s; })() + wild));
  }
  pay(p, e, pw, c = null) {
    let wild, doms, _, cand, d, col;
    if (((c != null) && ($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Spell"))) {
      if (!$eq($ga(p, "spl_tn", null), this.turn_no)) {
        p.spl_tn = this.turn_no;
        p.spl = [];
      }
      $cm(p.spl, "append", c);
    }
    { const $t12 = p; $t12.E = $sub($t12.E, e); }
    if ((pw > 0)) {
      this.sync(p);
      wild = $max(0, (p.P - $sum($cm(p.rc, "values"))));
      doms = this.cdoms(p, c);
      for (_ of $it($range(pw))) {
        cand = (() => { const $r = []; for (const d of $it(doms)) { if (($cm(p.rc, "get", d, 0) > 0)) { $r.push(d); } } return $r; })();
        if (((wild > 0) && (!$T(cand) || $T($gi(AI36, 0))))) {
          wild = (wild - 1);
          if (($T($gi(RULES34, 0)) && (p.gold > 0))) {
            { const $t13 = p; $t13.gold = ($t13.gold - 1); }
          }
          continue;
        }
        if ($T(cand)) {
          d = $max(cand, $kw({"key": ((k) => $gi(p.rc, k))}));
          { const $t14 = p.rc, $t15 = d; $si($t14, $t15, ($gi($t14, $t15) - 1)); }
          $cm(p.rdeck, "append", d);
          { const $t16 = p; $t16.runes = ($t16.runes - 1); }
        } else if ((wild > 0)) {
          wild = (wild - 1);
          if (($T($gi(RULES34, 0)) && (p.gold > 0))) {
            { const $t17 = p; $t17.gold = ($t17.gold - 1); }
          }
        } else {
          col = (($T(p.rc) && $T($sum($cm(p.rc, "values")))) ? $max(p.rc, $kw({"key": ((k) => $gi(p.rc, k))})) : null);
          if ($T(col)) {
            { const $t18 = p.rc, $t19 = col; $si($t18, $t19, ($gi($t18, $t19) - 1)); }
            $cm(p.rdeck, "append", col);
            { const $t20 = p; $t20.runes = ($t20.runes - 1); }
          }
        }
      }
      { const $t21 = p; $t21.P = $sub($t21.P, pw); }
    }
    if ((p.runes < 0)) {
      p.runes = 0;
    }
  }
  gain_gold(p) {
    { const $t22 = p; $t22.gold = ($t22.gold + 1); }
    if ($T($gi(RULES34, 0))) {
      { const $t23 = p; $t23.P = ($t23.P + 1); }
    }
  }
  ecost(p, c) {
    let e;
    e = $gi($gi(CARDS, c), "e");
    if (($T($gi(PB, 0)) && (c === "Sky Splitter") && $T(p.units))) {
      e = $max(0, $sub(e, $max((() => { const $r = []; for (const u of $it(p.units)) { $r.push(u.might(this)); } return $r; })())));
    }
    return e;
  }
  pe(p, c) {
    let e;
    e = $gi($gi(CARDS, c), "e");
    if (($T($gi(AUDIT, 0)) && (c === "Hold 'Em") && $eq($ga(p, "bfplay_tn", (-1)), this.turn_no))) {
      e = $max(0, (e - 2));
    }
    return e;
  }
  show_off(p) {
    let has;
    has = $OR((() => { for (const c of $it(p.hand)) { if (($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Gear")) return true; } return false; })(), () => $OR(p.base_gear, () => $OR(p.loose_eq, () => $OR((() => { for (const u of $it(p.units)) { if ($T(u.eq)) return true; } return false; })(), () => (() => { for (const b of $it(this.bf)) { if ($T($gi($gi(b, "gear"), $cm(this.P, "index", p)))) return true; } return false; })()))));
    if ($T(has)) {
      p.E = $min(p.runes, (p.E + 2));
    }
  }
  anvil_banish(p) {
    let c;
    if (!$T(p.deck)) {
      return;
    }
    c = $cm(p.deck, "pop");
    $cm(p.hand, "append", c);
    if (($T($gi(AUDIT, 0)) && !$T($gi(ANVIL_OLD, 0)))) {
      p.anvil_tmp = $add($ga(p, "anvil_tmp", []), [c]);
    }
    this.zed_banish(p);
  }
  anvil_expire(p) {
    let c;
    for (c of $it($ga(p, "anvil_tmp", []))) {
      if ($in(c, p.hand)) {
        $cm(p.hand, "remove", c);
      }
    }
    p.anvil_tmp = [];
  }
  gear_left(p, g) {
    if (($T($gi(AUDIT, 0)) && (g === "Runeblade Anvil"))) {
      this.anvil_banish(p);
    }
  }
  can_pay(p, e, pw, c = null) {
    if (((p.E < e) || (p.P < pw))) {
      return false;
    }
    if (((pw <= 0) || !$T($gi(COLOR, 0)))) {
      return true;
    }
    return (this.colored_avail(p, c) >= pw);
  }
  kill(u, g_reason = "") {
    let p, loc, o_, e, n, dbl, _, ef, t_, foes, ok_, cand, c_, c;
    p = $gi(this.P, u.owner);
    if (!$in(u, p.units)) {
      return;
    }
    if ($T(u.retreat)) {
      u.retreat = false;
      u._loc = "base";
      u.exhausted = true;
      u.dmg = 0;
      return;
    }
    if ($in("Guardian Angel", u.eq)) {
      $cm(u.eq, "remove", "Guardian Angel");
      $cm(p.trash, "append", "Guardian Angel");
      u._loc = "base";
      u.exhausted = true;
      u.dmg = 0;
      if (this.v) this.say(`  ${$str(p.name)}'s Guardian Angel saves ${$str(u.name)}`);
      return;
    }
    if ($in("Zhonya's Hourglass", p.base_gear)) {
      $cm(p.base_gear, "remove", "Zhonya's Hourglass");
      $cm(p.trash, "append", "Zhonya's Hourglass");
      u._loc = "base";
      u.exhausted = true;
      u.dmg = 0;
      if (this.v) this.say(`  ${$str(p.name)}'s Zhonya's Hourglass saves ${$str(u.name)}`);
      return;
    }
    if (($T($gi(PB2, 0)) && (p.leg === "sett") && $T(u.buffed) && !$T($ga(p, "settex", false)) && !$T(u.token) && ((u.base >= 3) || $T(champion_like(u.name))) && this.can_pay(p, 0, 1))) {
      this.pay(p, 0, 1);
      p.settex = true;
      u.buffed = false;
      { const $t24 = u; $t24.base = ($t24.base - 1); }
      u._loc = "base";
      u.exhausted = true;
      u.dmg = 0;
      if (this.v) this.say(`  ${$str(p.name)}'s legend saves ${$str(u.name)} (buff spent, recalled exhausted)`);
      return;
    }
    loc = u.loc;
    if (($in("Sacrifice", p.hand) && !$T(u.token) && !$in(g_reason, ["combat", "(Temporary)"]) && (u.might(this) >= 5) && this.can_pay(p, 1, 0, "Sacrifice"))) {
      if ($T(this.cast(p, "Sacrifice", 1, 0))) {
        this.draw(p, 2);
        { const $t25 = p; $t25.pending = ($t25.pending + 1); }
        if (this.v) this.say(`  ${$str(p.name)} Sacrifices ${$str(u.name)} in response`);
      }
    }
    $cm(p.units, "remove", u);
    p.died_tn = this.turn_no;
    if ($T($gi(DIEWATCH, 0))) {
      this.friendly_died(u.owner, u);
    }
    o_ = $gi(this.P, (1 - u.owner));
    if ((!$eq($ga(o_, "pyke_tn", (-1)), this.turn_no) && (() => { for (const x of $it(o_.units)) { if (((x.name === "Pyke, Returned") && (x.loc !== "base") && !$in(x, this.doomed))) return true; } return false; })())) {
      o_.pyke_tn = this.turn_no;
      this.gain_gold(o_);
    }
    if (!$T(u.token)) {
      $cm(p.trash, "append", u.name);
    }
    for (e of $it(u.eq)) {
      $cm(p.loose_eq, "append", e);
      if ((e === "Sacred Shears")) {
        this.draw(p);
      }
    }
    if ($T($ga(u, "stole", null))) {
      this.return_stolen(u);
    }
    n = u.name;
    dbl = (((loc !== "base") && $in("Detonation Amplifier", $gi($gi($gi(this.bf, loc), "gear"), u.owner))) ? 2 : 1);
    if ((() => { for (const x of $it(p.units)) { if ((x.name === "Karthus, Eternal")) return true; } return false; })()) {
      dbl = (dbl + 1);
    }
    for (_ of $it($range(dbl))) {
      for (ef of $it($cm(GEN, "get", n, []))) {
        if (($gi(ef, 0) === "dk_draw")) {
          this.draw(p, $gi(ef, 1));
        } else if (($gi(ef, 0) === "dk_chan")) {
          { const $t26 = p; $t26.pending = $iadd($t26.pending, $gi(ef, 1)); }
        } else if (($gi(ef, 0) === "dk_gold")) {
          this.gain_gold(p);
        } else if (($gi(ef, 0) === "dk_tok")) {
          for (_ of $it($range($gi(ef, 1)))) {
            t_ = this.token(u.owner, "base");
            t_.base = $gi(ef, 2);
          }
        } else if (($gi(ef, 0) === "dk_dmg")) {
          foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - u.owner)).units)) { if (!$in(x, this.doomed)) { $r.push(x); } } return $r; })();
          if ($T(foes)) {
            this.deal($max(foes, $kw({"key": ((x) => x.might(this))})), $gi(ef, 1), n);
          }
        }
      }
      if (((n === "Unsung Hero") && (u.might(this) >= 5))) {
        this.draw(p, 2);
      }
      if ((n === "Machine Evangel")) {
        for (_ of $it($range(3))) {
          this.token(u.owner, "base");
        }
      }
      if ((n === "Hunting Dog")) {
        this.token(u.owner, "base", "Bird");
      }
      if ((n === "Carrion Dredger")) {
        this.token(u.owner, "base", "Bird");
      }
      if (((n === "Lonely Poro") && (loc !== "base") && !$T((() => { const $r = []; for (const x of $it($add(p.units, (() => { const $r = []; for (const d_ of $it(this.doomed)) { if (($eq(d_.owner, u.owner) && (d_ !== u) && !$in(d_, p.units))) { $r.push(d_); } } return $r; })()))) { if ($eq(x.loc, loc)) { $r.push(x); } } return $r; })()))) {
        this.draw(p);
      }
      if ((n === "Watchful Sentry")) {
        this.draw(p);
      }
      if ($in(n, ["Black Rose Dignitary", "Soaring Scout"])) {
        { const $t27 = p; $t27.pending = ($t27.pending + 1); }
      }
      if ((n === "Honest Broker")) {
        this.gain_gold(p);
      }
      if ((n === "LeBlanc, Fragmented")) {
        this.draw(p);
      }
      if ((n === "Scuttle Crab")) {
        p.xp = ($ga(p, "xp", 0) + 1);
      }
      if ((n === "Ruined Rex")) {
        t_ = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - u.owner)).units)) { if ((!$in(x.name, UNTARGETABLE) && !$T(x.protect) && !$in(x, this.doomed))) { $r.push(x); } } return $r; })();
        if ($T(t_)) {
          ok_ = (() => { const $r = []; for (const x of $it(t_)) { if (((x.might(this) - x.dmg) <= 4)) { $r.push(x); } } return $r; })();
          this.deal($max($OR(ok_, () => t_), $kw({"key": ((x) => x.might(this))})), 4, "Ruined Rex");
        }
      }
      if ((n === "Glasc Mixologist")) {
        cand = (() => { const $r = []; for (const c of $it(p.trash)) { if ((($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Unit") && ($gi($gi(CARDS, c), "e") <= 3) && ($gi($gi(CARDS, c), "p") <= 1) && !$eq(c, n))) { $r.push(c); } } return $r; })();
        if ($T(cand)) {
          c_ = $max(cand, $kw({"key": ((c) => $cm($gi(CARDS, c), "get", "m", 0))}));
          $cm(p.trash, "remove", c_);
          this.place_unit(u.owner, c_, "base");
        }
      }
      if (((n === "Noxian Emissary") && $T(u.pw))) {
        for (_ of $it($range(2))) {
          this.token(u.owner, "base");
        }
      }
      if ((n === "Ferrous Forerunner")) {
        for (_ of $it($range(2))) {
          this.token(u.owner, "base", "Mech").base = 3;
        }
        if (($T($gi(PB, 0)) && (() => { for (const x of $it(p.units)) { if ((x.name === "Forecaster")) return true; } return false; })())) {
          for (_ of $it($range(2))) {
            this.vision(p);
          }
        }
      }
      if ((n === "Rift Herald")) {
        cand = (() => { const $r = []; for (const c of $it(p.hand)) { if ((($gi($gi(CARDS, c), "t") === "Unit") && (!$T($gi(AUDIT, 0)) || this.can_pay(p, 0, $gi($gi(CARDS, c), "p"), c)))) { $r.push(c); } } return $r; })();
        if ($T(cand)) {
          c = $max(cand, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
          $cm(p.hand, "remove", c);
          if (($T($gi(AUDIT, 0)) && $T($gi($gi(CARDS, c), "p")))) {
            this.pay(p, 0, $gi($gi(CARDS, c), "p"), c);
          }
          this.place_unit(u.owner, c, "base");
        }
      }
    }
    if (((loc !== "base") && ($gi($gi(this.bf, loc), "name") === "Black Rose Sanctum") && !$T(u.token))) {
      this.token(u.owner, "base");
    }
    if (this.v) this.say(`  ${$str(p.name)}'s ${$str(n)} dies ${$str(g_reason)}`);
  }
  from_hidden(p, c = null, bi = null) {
    let x;
    if ($T($gi(META25, 0))) {
      for (x of $it(p.units)) {
        if ((x.name === "Ember Monk")) {
          { const $t28 = x; $t28.temp = ($t28.temp + 2); }
        }
      }
    }
    if (($T($gi(PB, 0)) && (c === "Tornado Warrior") && (bi != null))) {
      return this.tornado(p, bi);
    }
    return 0;
  }
  tornado(p, bi) {
    let i, best, bg, u, g, k;
    i = $cm(this.P, "index", p);
    best = null;
    bg = 0;
    for (u of $it(this.units_at(i, bi))) {
      g = (((u.name === "Steel Paws") && !$T(u.pw)) ? 7 : (((u.name === "Legion Marauder") && $eq(u.emp, 0) && !$T(u.pw)) ? 1 : 0));
      if ((g > bg)) {
        best = u;
        bg = g;
      }
    }
    if ((best == null)) {
      return 0;
    }
    if ((best.name === "Steel Paws")) {
      best.pw = true;
      k = "pw";
    } else {
      best.emp = 1;
      k = "emp";
    }
    if (!($hasattr(this, "tw_undo"))) {
      this.tw_undo = [];
    }
    $cm(this.tw_undo, "append", [best, k]);
    if ((p.leg === "ambessa")) {
      p.ambE = true;
    }
    if (this.v) this.say(`  ${$str(p.name)}'s Tornado Warrior empowers ${$str(best.name)} (+${$str(bg)} this turn)`);
    return bg;
  }
  combat_triggers(i, bi, attackers, defenders) {
    let p, items, side, us, mine, u, att, _, kind, val, me, foe, here, batch, m, e, small, top3, un, g_;
    p = $gi(this.P, i);
    items = [];
    for ([side, us] of $it([[i, attackers], [(1 - i), defenders]])) {
      mine = [];
      for (u of $it(us)) {
        att = $eq(side, i);
        if ((u.name === "Graves, Blasting Through")) {
          $cm(mine, "append", ["graves", side, u, u.might(this)]);
        }
        if (($T(att) && (u.name === "Renekton, Rage Fueled") && (p.runes <= 4))) {
          $cm(mine, "append", ["rage", side, u, 2]);
        }
        if (($T(att) && (u.name === "Ambessa, Respected and Feared") && $T(($T($gi(FEAT16, "cards")) ? u.pw : u.emp)))) {
          $cm(mine, "append", ["ambessa", side, u, u.might(this)]);
        }
        if (($T(att) && $T($gi(FEAT16, "rules2")) && (u.name === "Rift Herald") && $T(p.deck) && !$T($gi(MOVES, 0)))) {
          $cm(mine, "append", ["herald", side, u, 0]);
        }
        if (($T($gi(META25, 0)) && (u.name === "Kha'Zix, Mutating Horror"))) {
          $cm(mine, "append", ["khazix", side, u, 0]);
        }
        for (_ of $it($range($cm(u.eq, "count", "Forgefire Cape")))) {
          $cm(mine, "append", ["cape", side, u, 2]);
        }
      }
      $cm(mine, "sort", $kw({"key": ((t) => $in($gi(t, 0), ["graves", "rage", "cape"]))}));
      items = $iadd(items, mine);
    }
    this.chain_hi = $max(this.chain_hi, $len(items));
    this.trig_log = (!($hasattr(this, "trig_log")) ? [] : this.trig_log);
    while ($T(items)) {
      [kind, side, u, val] = $it($cm(items, "pop"));
      $cm(this.trig_log, "append", [kind, side]);
      me = $gi(this.P, side);
      foe = $gi(this.P, (1 - side));
      here = (() => { const $r = []; for (const e of $it(foe.units)) { if ($eq(e.loc, bi)) { $r.push(e); } } return $r; })();
      batch = [];
      if ((kind === "graves")) {
        m = ($in(u, me.units) ? u.might(this) : val);
        for (e of $it(here)) {
          this.deal(e, m, "Graves", batch);
        }
      } else if ((kind === "rage")) {
        for (e of $it(here)) {
          this.deal(e, val, "Rage Fueled", batch);
        }
      } else if ((kind === "cape")) {
        for (e of $it(here)) {
          this.deal(e, val, "Forgefire Cape", batch);
        }
      } else if ((kind === "ambessa")) {
        m = ($in(u, me.units) ? u.might(this) : val);
        small = (() => { const $r = []; for (const e of $it(here)) { if (((e.might(this) < m) && !($T($gi(AUDIT, 0)) && ($in(e.name, UNTARGETABLE) || $T(e.protect))))) { $r.push(e); } } return $r; })();
        if ($T(small)) {
          $cm(batch, "append", $max(small, $kw({"key": ((e) => e.might(this))})));
        }
      } else if ((kind === "herald")) {
        top3 = $sl(me.deck, (-3), null);
        $dsl(me.deck, (-3), null);
        un = (() => { const $r = []; for (const x of $it(top3)) { if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit")) { $r.push(x); } } return $r; })();
        if ($T(un)) {
          g_ = $max(un, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
          $cm(top3, "remove", g_);
          $cm(me.hand, "append", g_);
        }
        $ssl(me.deck, 0, 0, top3);
      } else if ((kind === "khazix")) {
        if (($in(u, me.units) && ($len(here) === 1))) {
          { const $t29 = u; $t29.temp = ($t29.temp + 2); }
          me.xp = ($ga(me, "xp", 0) + 2);
        }
      }
      if ($T(batch)) {
        this.resolve_deaths(batch, `(${$str(kind)})`);
      }
    }
  }
  friendly_died(i, dead) {
    let p, watch, x, cand, altars, used, d_;
    p = $gi(this.P, i);
    if (!$T($ga(this, "in_batch", false))) {
      this.death_batch = ($ga(this, "death_batch", 0) + 1);
    }
    watch = (() => { const $r = []; for (const x of $it(p.units)) { if (!$in(x, this.doomed)) { $r.push(x); } } return $r; })();
    for (x of $it(watch)) {
      if ((x.name === "Spectral Centaur")) {
        { const $t30 = x; $t30.temp = ($t30.temp + 2); }
      } else if ((x.name === "Vicious Snapjaws")) {
        p.xp = ($ga(p, "xp", 0) + 1);
      } else if (((x.name === "Demacian Illuminators") && !$eq($ga(x, "ill_batch", (-1)), this.death_batch))) {
        x.ill_batch = this.death_batch;
        cand = (() => { const $r = []; for (const y of $it(p.units)) { if ((!$in(y, this.doomed) && !$T(y.buffed))) { $r.push(y); } } return $r; })();
        if ($T(cand)) {
          this.buff($max(cand, $kw({"key": ((y) => [champion_like(y.name), y.might(this)])})));
        }
      }
    }
    altars = ($cm(p.base_gear, "count", "Altar of Memories") + (() => { let $s = 0; for (const b of $it(this.bf)) { $s += $num($cm($gi($gi(b, "gear"), i), "count", "Altar of Memories")); } return $s; })());
    if (($T(altars) && $eq($gi($ga(p, "altar_used", [(-1), 0]), 0), this.turn_no))) {
      used = $gi(p.altar_used, 1);
    } else {
      used = 0;
    }
    if (((altars > used) && $T(p.deck))) {
      p.altar_used = [this.turn_no, (used + 1)];
      this.draw(p);
      if ($T(p.hand)) {
        d_ = $max(p.hand, $kw({"key": ((c) => $sub($gi($gi(CARDS, c), "e"), (($in(c, REACT_VAL) || $in(c, REMOVAL)) ? 3 : 0)))}));
        $cm(p.hand, "remove", d_);
        $cm(p.deck, "insert", 0, d_);
      }
      if (this.v) this.say(`  ${$str(p.name)}'s Altar of Memories draws after ${$str(dead.name)} dies`);
    }
  }
  last_rites(i) {
    let p, us, c;
    p = $gi(this.P, i);
    us = (() => { const $r = []; for (const c of $it(p.trash)) { if ((($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Unit") && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) { $r.push(c); } } return $r; })();
    if (!$T(us)) {
      return;
    }
    c = $max(us, $kw({"key": ((x) => $add($gi($gi(CARDS, x), "e"), $mul(2, $gi($gi(CARDS, x), "p"))))}));
    $cm(p.trash, "remove", c);
    this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
    this.place_unit(i, c, "base");
    if (this.v) this.say(`  ${$str(p.name)}'s Last Rites plays ${$str(c)} from the trash`);
  }
  return_stolen(u) {
    let p, o, g_, done, x, st;
    p = $gi(this.P, u.owner);
    o = $gi(this.P, (1 - u.owner));
    for (g_ of $it($ga(u, "stole", []))) {
      done = false;
      for (x of $it(p.units)) {
        if ($in(g_, x.eq)) {
          $cm(x.eq, "remove", g_);
          done = true;
          break;
        }
      }
      if ((!$T(done) && $in(g_, p.loose_eq))) {
        $cm(p.loose_eq, "remove", g_);
        done = true;
      }
      if ((!$T(done) && $in(g_, p.base_gear))) {
        $cm(p.base_gear, "remove", g_);
        done = true;
      }
      if ($T(done)) {
        $cm(($in("eq", $cm(CARDS, "get", g_, new PyDict([]))) ? o.loose_eq : o.base_gear), "append", g_);
        st = $ga(this, "stolen", []);
        if ($in([u.owner, (1 - u.owner), g_], st)) {
          $cm(st, "remove", [u.owner, (1 - u.owner), g_]);
        }
      }
    }
    u.stole = [];
  }
  bounce(u) {
    let p, e;
    p = $gi(this.P, u.owner);
    if (!$in(u, p.units)) {
      return;
    }
    $cm(p.units, "remove", u);
    for (e of $it(u.eq)) {
      $cm(p.loose_eq, "append", e);
    }
    if ($T($ga(u, "stole", null))) {
      this.return_stolen(u);
    }
    if (!$T(u.token)) {
      $cm(p.hand, "append", u.name);
    }
    if (this.v) this.say(`  ${$str(p.name)}'s ${$str(u.name)} returned to hand`);
  }
  token(i, loc, name_ = "Recruit", _dbl = true) {
    let p, u;
    p = $gi(this.P, i);
    if (($T(_dbl) && !$eq($ga(p, "zil", (-1)), this.turn_no) && (() => { for (const x of $it(p.units)) { if (((x.name === "Zilean, Time Mage") && (x.loc !== "base"))) return true; } return false; })())) {
      p.zil = this.turn_no;
      this.token(i, loc, name_, false);
    }
    u = new Unit(name_, i, this.turn_no, true, 1);
    u._loc = loc;
    if ((() => { for (const x of $it($gi(this.P, i).units)) { if ((x.name === "Renata Glasc, Industrialist")) return true; } return false; })()) {
      u.exhausted = false;
    }
    $cm($gi(this.P, i).units, "append", u);
    return u;
  }
  wm_attach(i, u, free = 1) {
    let p, cand, best, q;
    p = $gi(this.P, i);
    cand = $sl(p.loose_eq, null, null);
    if (!$T(cand)) {
      return;
    }
    best = $max(cand, $kw({"key": ((e) => $gi($gi($gi(CARDS, e), "eq"), "bonus"))}));
    q = $gi($gi(CARDS, best), "eq");
    if (this.can_pay(p, $gi(q, "e"), $max(0, $sub($gi(q, "p"), free)))) {
      this.pay(p, $gi(q, "e"), $max(0, $sub($gi(q, "p"), free)));
      $cm(p.loose_eq, "remove", best);
      $cm(u.eq, "append", best);
      u.brut_tn = this.turn_no;
    }
  }
  ornn_look(p) {
    let top_, gs, got, g_;
    top_ = $sl(p.deck, (-4), null);
    $dsl(p.deck, (-4), null);
    gs = (() => { const $r = []; for (const x of $it(top_)) { if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Gear")) { $r.push(x); } } return $r; })();
    got = false;
    if ($T(gs)) {
      g_ = $max(gs, $kw({"key": ((x) => [($in("eq", $gi(CARDS, x)) ? $gi($gi($gi(CARDS, x), "eq"), "bonus") : 0), $gi($gi(CARDS, x), "e")])}));
      $cm(top_, "remove", g_);
      $cm(p.hand, "append", g_);
      got = true;
    }
    $ssl(p.deck, 0, 0, top_);
    return got;
  }
  sand(i, loc = "base") {
    let t_;
    t_ = this.token(i, loc, "Sand Soldier");
    t_.base = 2;
    if (($gi(this.P, i).leg === "azir")) {
      this.wm_attach(i, t_);
    }
    return t_;
  }
  place_unit(i, name_, loc) {
    let u;
    u = new Unit(name_, i, this.turn_no);
    u._loc = loc;
    if ((($gi(this.P, i).leg === "rengar") && $T($gi(this.P, i).units))) {
      { const $t31 = $max($gi(this.P, i).units, $kw({"key": ((x) => x.might(this))})); $t31.temp = ($t31.temp + 1); }
    }
    if ((loc !== "base")) {
      $gi(this.P, i).bfplay_tn = this.turn_no;
    }
    if (($T($gi(PB2, 0)) && (loc !== "base") && ($gi($gi(this.bf, loc), "name") === "Valley of Idols") && ($gi(this.P, i).E >= 1) && ($cm($gi(CARDS, name_), "get", "m", 0) >= 2))) {
      { const $t32 = $gi(this.P, i); $t32.E = ($t32.E - 1); }
      u.buffed = true;
      { const $t33 = u; $t33.base = ($t33.base + 1); }
    }
    u.exhausted = !$T($gi($gi(CARDS, name_), "ready"));
    if ((name_ === "Lingering Animus")) {
      u.exhausted = !$eq($ga($gi(this.P, i), "died_tn", (-1)), this.turn_no);
    }
    $cm($gi(this.P, i).units, "append", u);
    return u;
  }
  vision(p) {
    let top_;
    if (!$T(p.deck)) {
      return;
    }
    top_ = $gi(p.deck, (-1));
    if ((($cm($cm(CARDS, "get", top_, new PyDict([])), "get", "e", 0) > (p.runes + 3)) || (($cm($cm(CARDS, "get", top_, new PyDict([])), "get", "t") === "Unit") && ($len((() => { const $r = []; for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "t") === "Unit")) { $r.push(c); } } return $r; })()) >= 3)))) {
      $cm(p.deck, "insert", 0, $cm(p.deck, "pop"));
    }
  }
  on_exhaust(u) {
    let p, r, top_;
    p = $gi(this.P, u.owner);
    if (!$in(u, p.units)) {
      return;
    }
    if ($T($gi(RULES34, 0))) {
      for (r of $it(p.units)) {
        if (((r.name === "Riven, Deserter") && (r !== u))) {
          { const $t34 = r; $t34.temp = ($t34.temp + 1); }
        }
      }
    }
    if ((u.name === "Reckless Innovator")) {
      if (((p.runes >= 6) && this.can_pay(p, 0, 1, "Reckless Innovator") && ($len(p.hand) <= 3))) {
        this.pay(p, 0, 1, "Reckless Innovator");
        this.draw(p);
      } else {
        this.gain_gold(p);
      }
    } else if (((u.name === "Strigian Oracle") && $T(p.deck))) {
      top_ = $gi(p.deck, (-1));
      if (($cm($cm(CARDS, "get", top_, new PyDict([])), "get", "e", 0) > (p.runes + 3))) {
        $cm(p.deck, "insert", 0, $cm(p.deck, "pop"));
      }
    }
  }
  on_move(u, frm, to) {
    let i, p, o, n, top3, un, g_, v, locs, cand, ok, t, d, foes;
    if ($T(this._in_move)) {
      return;
    }
    this._in_move = true;
    try {
      i = u.owner;
      p = $gi(this.P, i);
      o = $gi(this.P, (1 - i));
      u.moved_tn = this.turn_no;
      if (!$in(u, p.units)) {
        return;
      }
      n = u.name;
      if ($in("Eye of the Herald", u.eq)) {
        this.token(i, to);
      }
      if (((n === "Rift Herald") && (to !== "base") && $T(p.deck))) {
        top3 = $sl(p.deck, (-3), null);
        $dsl(p.deck, (-3), null);
        un = (() => { const $r = []; for (const x of $it(top3)) { if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit")) { $r.push(x); } } return $r; })();
        if ($T(un)) {
          g_ = $max(un, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
          $cm(top3, "remove", g_);
          $cm(p.hand, "append", g_);
        }
        $ssl(p.deck, 0, 0, top3);
      } else if ($in(n, ["Akali, Deadly Weapon", "Armored Tusker"])) {
        v = ($cm(n, "startswith", "Akali") ? ($T(u.pw) ? 2 : 1) : u.shield(this));
        locs = ($cm(n, "startswith", "Akali") ? (() => { const $r = []; for (const x of $it([to, frm])) { if ((x !== "base")) { $r.push(x); } } return $r; })() : [0, 1]);
        cand = (() => { const $r = []; for (const e of $it(o.units)) { if (($in(e.loc, locs) && !$T(e.protect) && !$in(e.name, UNTARGETABLE))) { $r.push(e); } } return $r; })();
        if (($T(cand) && (v > 0))) {
          ok = (() => { const $r = []; for (const e of $it(cand)) { if (((e.might(this) - e.dmg) <= v)) { $r.push(e); } } return $r; })();
          t = ($T(ok) ? $max(ok, $kw({"key": ((e) => [e.might(this), !$T(e.token)])})) : $max(cand, $kw({"key": ((e) => e.might(this))})));
          this.deal(t, v, n);
        }
      } else if (((n === "Traveling Merchant") && $T(p.hand))) {
        d = $max(p.hand, $kw({"key": ((c) => $sub($gi($gi(CARDS, c), "e"), (($in(c, REACT_VAL) || $in(c, REMOVAL)) ? 3 : 0)))}));
        $cm(p.hand, "remove", d);
        $cm(p.trash, "append", d);
        this.draw(p);
      } else if ((n === "Stellacorn Herder")) {
        this.draw(p);
      } else if (((n === "Akali, Silent") && (to !== "base"))) {
        { const $t35 = u; $t35.temp = ($t35.temp + 2); }
      } else if (((n === "Shadow Order Disciple") && (to !== "base") && ($len(p.deck) > 8))) {
        this.burn(p, 1);
        { const $t36 = u; $t36.temp = ($t36.temp + 1); }
      } else if (((n === "The Ball") && (to !== "base"))) {
        foes = this.units_at((1 - i), to);
        if ($T(foes)) {
          for (t of $it($list(foes))) {
            this.deal(t, 2, "The Ball");
          }
        } else {
          this.draw(p);
        }
      }
    } finally {
      this._in_move = false;
    }
  }
  deal(u, n, src = "", batch = null) {
    let w, lethal_;
    if ($T(u.protect)) {
      return;
    }
    if (($T($gi(AUDIT, 0)) && (u.name === "Esteemed Hierophant") && ($gi(this.P, u.owner).runes >= 7))) {
      return;
    }
    if (((u.name === "Ambessa, The Wolf") && $T(u.pw))) {
      return;
    }
    if ($T(u.ward)) {
      w = $min(u.ward, n);
      { const $t37 = u; $t37.ward = $sub($t37.ward, w); }
      n = $sub(n, w);
    }
    if (($T($gi(RULES34, 0)) && (n <= 0))) {
      return;
    }
    { const $t38 = u; $t38.dmg = $iadd($t38.dmg, n); }
    lethal_ = ((((() => { for (const x of $it($gi(this.P, (1 - u.owner)).units)) { if ((x.name === "Elder Dragon")) return true; } return false; })() || $eq($ga(this, "decree_tn", (-1)), this.turn_no)) && (n > 0)) || ((u.dmg >= u.might(this)) && ((u.dmg > 0) || !$T($gi(RULES34, 0)))));
    if ($T(lethal_)) {
      if ((batch != null)) {
        if (!$in(u, batch)) {
          $cm(batch, "append", u);
        }
      } else {
        this.kill(u, `(${$str(src)})`);
      }
    }
  }
  bomb_strike(i, bi, us, them) {
    let p, nb, dmg, mult, live;
    p = $gi(this.P, i);
    nb = $gi($gi($gi(this.bf, bi), "bombs"), i);
    if (((nb <= 0) || !$in("Hexplosive Minefield", p.hand) || !(this.can_pay(p, 2, 1, "Hexplosive Minefield")))) {
      return;
    }
    dmg = (2 + ((() => { for (const u of $it(p.units)) { if ((u.name === "Ziggs, Short-Fused")) return true; } return false; })() ? 1 : 0));
    mult = ($in("Detonation Amplifier", $gi($gi($gi(this.bf, bi), "gear"), i)) ? 2 : 1);
    live = (() => { const $r = []; for (const e of $it(them)) { if (($in(e, $gi(this.P, (1 - i)).units) && !$T(e.protect))) { $r.push(e); } } return $r; })();
    if (!$T(live)) {
      return;
    }
    if (!((() => { for (const e of $it(live)) { if (((e.might(this) - e.dmg) <= $mul($mul(dmg, nb), mult))) return true; } return false; })())) {
      return;
    }
    if ($T(this.cast(p, "Hexplosive Minefield", 2, 1))) {
      $cm(p.plays, "append", [p.tn, "Hexplosive Minefield"]);
      if (this.v) this.say(`  ${$str(p.name)} blows up ${$str(nb)} Bomb(s) mid-fight with Hexplosive Minefield`);
      this.bomb_pop(i, bi, 99);
      p.mine_back = $add($ga(p, "mine_back", 0), nb);
    }
  }
  bomb_pop(i, bfi, n = 1) {
    let b, k, p, dmg, mult, _, live, ok, t, e;
    b = $gi(this.bf, bfi);
    if (($gi($gi(b, "bombs"), i) <= 0)) {
      return false;
    }
    if ($T($gi(FEAT16, "cards"))) {
      k = $gi($gi(b, "bombs"), i);
      $si($gi(b, "bombs"), i, 0);
    } else {
      k = $min(n, $gi($gi(b, "bombs"), i));
      { const $t39 = $gi(b, "bombs"), $t40 = i; $si($t39, $t40, $sub($gi($t39, $t40), k)); }
    }
    p = $gi(this.P, i);
    p.died_tn = this.turn_no;
    dmg = (2 + ((() => { for (const u of $it(p.units)) { if ((u.name === "Ziggs, Short-Fused")) return true; } return false; })() ? 1 : 0));
    p.bombs_popped = $add($ga(p, "bombs_popped", 0), k);
    if (($T($gi(FEAT16, "cards")) && ($gi(b, "name") === "Void Gate"))) {
      dmg = (dmg + 1);
    }
    mult = ($in("Detonation Amplifier", $gi($gi(b, "gear"), i)) ? 2 : 1);
    if ((() => { for (const x of $it(p.units)) { if ((x.name === "Karthus, Eternal")) return true; } return false; })()) {
      mult = (mult + 1);
    }
    for (_ of $it($range($mul(k, mult)))) {
      if ($T($gi(FEAT16, "cards"))) {
        live = (() => { const $r = []; for (const e of $it(this.units_at((1 - i), bfi))) { if (!$T(e.protect)) { $r.push(e); } } return $r; })();
        if (!$T(live)) {
          break;
        }
        ok = (() => { const $r = []; for (const e of $it(live)) { if (((e.might(this) - e.dmg) <= dmg)) { $r.push(e); } } return $r; })();
        t = ($T(ok) ? $max(ok, $kw({"key": ((e) => [(e.might(this) + $mul(3, champion_like(e.name))), !$T(e.token)])})) : $min(live, $kw({"key": ((e) => (e.might(this) - e.dmg))})));
        this.deal(t, dmg, "Bomb");
      } else {
        for (e of $it($list(this.units_at((1 - i), bfi)))) {
          this.deal(e, dmg, "Bomb");
        }
      }
    }
    return true;
  }
  removal_target(i, card, loc = null) {
    let kind, val, foes, p, killable, ks, tval, t;
    [kind, val] = $it($gi(REMOVAL, card));
    if ((kind === "dmg_base")) {
      kind = "dmg";
    }
    foes = (() => { const $r = []; for (const u of $it($gi(this.P, (1 - i)).units)) { if (((u.loc !== "base") && !$T(u.protect) && ((loc == null) || $eq(u.loc, loc)))) { $r.push(u); } } return $r; })();
    if ((card === "Rocket Barrage")) {
      foes = (() => { const $r = []; for (const u of $it($gi(this.P, (1 - i)).units)) { if (((u.loc === "base") && !$T(u.protect))) { $r.push(u); } } return $r; })();
    } else if ($in(card, ["Ruthless Strike", "Consuming Curse", "Shock Blast", "Lost to the Sands", "Wind and Ghosts", "Hidden Blade", "Improvised Projectile", "Scorched Earth", "Hextech Ray", "Bellows Breath", "Rebuke", "Gust"])) {
    } else {
      foes = (() => { const $r = []; for (const u of $it($gi(this.P, (1 - i)).units)) { if (!$T(u.protect)) { $r.push(u); } } return $r; })();
    }
    foes = (() => { const $r = []; for (const u of $it(foes)) { if ((!$in(u.name, UNTARGETABLE) && !$T(this.wild_safe(u)))) { $r.push(u); } } return $r; })();
    if (($T($gi(AUDIT, 0)) && $in(kind, DMG_KINDS))) {
      foes = (() => { const $r = []; for (const u of $it(foes)) { if (!((u.name === "Ambessa, The Wolf") && $T(u.pw))) { $r.push(u); } } return $r; })();
    }
    if (($in(kind, DMG_KINDS) && $eq($gi(this.P, (1 - i)).spirit, this.turn_no))) {
      return [null, 0];
    }
    if (!$T(foes)) {
      return [null, 0];
    }
    p = $gi(this.P, i);
    killable = (u) => {
      let m, mm, mine, v, g, best, bonus, b, bi, here;
      m = (u.might(this) - u.dmg);
      if ((kind === "kill_le")) {
        mm = (u.might(this) - (((card === "Lacerate") && $T($gi(FEAT16, "cards"))) ? u.emp : 0));
        return ((mm <= val) || ((card === "Wind and Ghosts") && (u.loc !== "base") && !$T(u.token)));
      }
      if (((kind === "kill_any") || (kind === "banish_any"))) {
        return true;
      }
      if ((kind === "kill_less")) {
        mine = $max($OR((() => { const $r = []; for (const x of $it(p.units)) { $r.push(x.might(this)); } return $r; })(), () => [0]));
        return (u.might(this) < mine);
      }
      if ((kind === "dmg")) {
        v = $add(val, ((card === "Consuming Curse") ? (() => { let $s = 0; for (const c of $it(p.trash)) { if ($eq(c, card)) { $s += $num(1); } } return $s; })() : 0));
        if (((card === "Ruthless Strike") && ($len(p.hand) > 2))) {
          v = 5;
        }
        return (v >= m);
      }
      if ((kind === "dmg2")) {
        return (val >= m);
      }
      if ((kind === "split")) {
        return (5 >= m);
      }
      if ((kind === "gear_dmg")) {
        g = $max($OR((() => { const $r = []; for (const x of $it(this.all_gear(i))) { $r.push($gi($gi(CARDS, x), "e")); } return $r; })(), () => [0]));
        return (g >= m);
      }
      if (((kind === "mine_dmg") || (kind === "equip_dmg") || (kind === "shield_dmg"))) {
        if ((kind === "equip_dmg")) {
          mine = (() => { const $r = []; for (const x of $it(p.units)) { if ($T(x.eq)) { $r.push(x); } } return $r; })();
        } else if ((kind === "shield_dmg")) {
          mine = (() => { const $r = []; for (const x of $it(p.units)) { if (!$T(x.token)) { $r.push(x); } } return $r; })();
        } else {
          mine = p.units;
        }
        if (!$T(mine)) {
          return false;
        }
        best = $max(mine, $kw({"key": ((x) => ((kind === "shield_dmg") ? x.shield(this) : x.might(this)))}));
        v = ((kind !== "shield_dmg") ? best.might(this) : (best.shield(this) + 2));
        return (v >= m);
      }
      if ((kind === "dmg_tokens")) {
        return (2 >= m);
      }
      if ((kind === "aoe")) {
        return (2 >= m);
      }
      if ((kind === "kill_chaos")) {
        return $in(u.name, CHAOS);
      }
      if ((kind === "fight")) {
        mine = (() => { const $r = []; for (const x of $it(p.units)) { if (((x.loc !== "base") || true)) { $r.push(x); } } return $r; })();
        if (!$T(mine)) {
          return false;
        }
        if ($T($ga(p, "ai29", $gi(AI29, 0)))) {
          bonus = (this.can_pay(p, $gi($gi(CARDS, card), "e"), ($gi($gi(CARDS, card), "p") + 1), card) ? 2 : 0);
          return (() => { for (const x of $it(mine)) { if ((((x.might(this) + bonus) >= m) && (($sub((x.might(this) + bonus), x.dmg) > u.might(this)) || (($cm($cm(CARDS, "get", x.name, new PyDict([])), "get", "e", 0) + 2) < $cm($cm(CARDS, "get", u.name, new PyDict([])), "get", "e", 0))))) return true; } return false; })();
        }
        b = ($max(mine, $kw({"key": ((x) => x.might(this))})).might(this) + 2);
        return (b >= m);
      }
      if ((kind === "pull")) {
        if (((u.loc !== "base") && !($T($gi(FEAT16, "cards")) && $eq($gi($gi(this.bf, u.loc), "ctrl"), (1 - i)) && ($len(this.units_at((1 - i), u.loc)) === 1)))) {
          return false;
        }
        for (bi of $it($range(2))) {
          here = this.units_at(i, bi);
          if ((($len(here) >= 1) && ((() => { let $s = 0; for (const x of $it(here)) { $s += $num((x.might(this) + 1)); } return $s; })() > (u.might(this) + u.shield(this))) && $eq($gi($gi(this.bf, bi), "ctrl"), i))) {
            return true;
          }
        }
        return false;
      }
      if ((kind === "bf3")) {
        return ((u.loc !== "base") && ((() => { let $s = 0; for (const x of $it($gi(this.P, (1 - i)).units)) { if (($eq(x.loc, u.loc) && ((x.might(this) - x.dmg) <= 3))) { $s += $num(1); } } return $s; })() >= 2));
      }
      if ((kind === "none")) {
        return false;
      }
      if ((kind === "rain")) {
        return (m <= 6);
      }
      if ((kind === "bounce")) {
        return $AND((u.might(this) <= val), () => $AND(!$T(u.token), () => $AND($OR((u.might(this) >= 3), () => $OR(u.eq, () => champion_like(u.name))), () => !($T($gi(AI36, 0)) && (card === "Star-Crossed") && ($cm($cm(CARDS, "get", u.name, new PyDict([])), "get", "e", 0) < 4)))));
      }
      if ((kind === "reset")) {
        return ($bool(u.eq) || (u.emp >= 2));
      }
      return false;
    };
    ks = (() => { const $r = []; for (const u of $it(foes)) { if ($T(killable(u))) { $r.push(u); } } return $r; })();
    if ((card === "Dockside Lock-Up")) {
      ks = (() => { const $r = []; for (const u of $it(ks)) { if (((u.loc !== "base") && !$T(u.token))) { $r.push(u); } } return $r; })();
    }
    if (!$T(ks)) {
      return [null, 0];
    }
    tval = (u) => {
      let v;
      v = (u.might(this) + $mul(2, (u.loc !== "base")));
      if (($gi(this.P, i).ai >= 2)) {
        v = $iadd(v, $add(($mul(2, champion_like(u.name)) + (() => { let $s = 0; for (const e of $it(u.eq)) { $s += $num($gi($gi($gi(CARDS, e), "eq"), "bonus")); } return $s; })()), u.emp));
      }
      return [v, !$T(u.token)];
    };
    t = $max(ks, $kw({"key": tval}));
    if (($T($ga(p, "la_tgt", 0)) && ($len(ks) > 1))) {
      t = $gi($sorted(ks, $kw({"key": tval})), (-2));
    }
    if ((kind === "reset")) {
      return [t, ((() => { let $s = 0; for (const e of $it(t.eq)) { $s += $num($gi($gi($gi(CARDS, e), "eq"), "bonus")); } return $s; })() + t.emp)];
    }
    return [t, t.might(this)];
  }
  all_gear(i) {
    let g, b;
    g = $list($gi(this.P, i).base_gear);
    for (b of $it(this.bf)) {
      g = $iadd(g, $gi($gi(b, "gear"), i));
    }
    if ($T($gi(ORI, 0))) {
      g = $iadd(g, (() => { const $r = []; for (const u of $it($gi(this.P, i).units)) { if ($T($ga(u, "anim", false))) { $r.push(u.name); } } return $r; })());
    }
    return g;
  }
  cast_removal(i, card, target) {
    let r;
    $cm(this.chain, "append", card);
    this.chain_hi = $max(this.chain_hi, $len(this.chain));
    r = this.cast_removal_(i, card, target);
    $cm(this.chain, "pop");
    if ($T($gi(PB2, 0))) {
      if (((target != null) && $eq(target.owner, (1 - i)))) {
        this.ezreal_check(i);
      }
      if ((card === "Wages of Pain")) {
        this.gain_gold($gi(this.P, i));
      }
      if (((card === "Deadly Flourish") && (target != null) && !$in(target, $gi(this.P, target.owner).units))) {
        this.gain_gold($gi(this.P, i));
      }
    }
    return r;
  }
  cast_removal_(i, card, target) {
    let p, foe, kind, val, ef, dies_, tr_, d, dn, mine, bonus, m_, ok, a, b, bi, here, x, dead_, alive, v, others, ok_, best, e, loc, left, t, m;
    p = $gi(this.P, i);
    foe = $gi(this.P, (1 - i));
    [kind, val] = $it($gi(REMOVAL, card));
    for (ef of $it($cm(GEN, "get", card, []))) {
      if (($gi(ef, 0) === "draw")) {
        this.draw(p, $gi(ef, 1));
      }
    }
    if (((card !== "Dockside Lock-Up") && $in("Riposte", foe.hand) && this.can_pay(foe, 2, 2, "Riposte") && (target.might(this) >= 3))) {
      if ($T(this.cast(foe, "Riposte", 2, 2))) {
        { const $t41 = target; $t41.temp = $iadd($t41.temp, $gi($gi(CARDS, card), "e")); }
        if (this.v) this.say(`  ${$str(foe.name)} Ripostes ${$str(card)}`);
        return;
      }
    }
    if ($T(this.answer_spell((1 - i), i, card, kind, target))) {
      return;
    }
    if (($in("Hard Bargain", foe.hand) && this.can_pay(foe, 2, 0, "Hard Bargain") && !(this.can_pay(p, 2, 0, "Hard Bargain")) && (target.might(this) >= 3))) {
      if ($T(this.cast(foe, "Hard Bargain", 2, 0))) {
        if (this.v) this.say(`  ${$str(foe.name)} counters ${$str(card)} with Hard Bargain`);
        return;
      }
    }
    dies_ = (!$T($gi(AUDIT, 0)) || (($in(kind, DMG_KINDS) || $in(kind, ["kill_any", "kill_less", "fight", "pull", "bf3"]) || ((kind === "kill_le") && (target.might(this) <= val))) && !($T($gi(FEAT16, "cards")) && $in(card, BANISH))));
    if (($T($gi(SMART, 0)) && (target.might(this) >= 3))) {
      for (tr_ of $it(($T($gi(AI36, 0)) ? ["Tactical Retreat", "Flash"] : ["Tactical Retreat"]))) {
        if (($T(dies_) && (target.loc !== "base") && $in(tr_, foe.hand) && this.can_pay(foe, 2, 0, tr_))) {
          if ($T(this.cast(foe, tr_, 2, 0))) {
            target._loc = "base";
            target.exhausted = true;
            if (this.v) this.say(`  ${$str(foe.name)} saves ${$str(target.name)} with ${$str(tr_)}`);
            return;
          }
        }
      }
      if (($in(kind, ["dmg", "dmg2", "split", "gear_dmg", "mine_dmg", "equip_dmg", "shield_dmg"]) && $in("Ki Barrier", foe.hand) && this.can_pay(foe, 2, 1, "Ki Barrier"))) {
        if ($T(this.cast(foe, "Ki Barrier", 2, 1))) {
          { const $t42 = target; $t42.ward = ($t42.ward + 7); }
          if (this.v) this.say(`  ${$str(foe.name)} shields ${$str(target.name)} with Ki Barrier`);
        }
      }
    }
    if (((target.name === "Ekko, Revolutionary") && $T(foe.hand) && this.can_pay(foe, 1, 1, "Ekko, Revolutionary"))) {
      this.pay(foe, 1, 1, "Ekko, Revolutionary");
      d = $min(foe.hand, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
      $cm(foe.hand, "remove", d);
      $cm(foe.trash, "append", d);
      target._loc = "base";
      target.dmg = 0;
      if (this.v) this.say(`  ${$str(foe.name)}'s Ekko dodges ${$str(card)}`);
      return;
    }
    dn = ($T($gi(FEAT16, "cards")) ? this.deflect_n(target) : ($T(this.deflected(target)) ? 1 : 0));
    if ($T(dn)) {
      if (!(this.can_pay(p, 0, dn))) {
        return;
      }
      this.pay(p, 0, dn);
    }
    if (this.v) this.say(`  ${$str(p.name)} casts ${$str(card)} on ${$str(foe.name)}'s ${$str(target.name)}`);
    if (($T($gi(FEAT16, "cards")) && (card === "Burn Away"))) {
      this.burn(p, 2);
    }
    if (($T($gi(FEAT16, "cards")) && (card === "Lacerate") && ($T(target.pw) || $T(target.emp)))) {
      target.pw = false;
      target.emp = 0;
      if ((target.might(this) > 3)) {
        return;
      }
    }
    if ((card === "Hidden Blade")) {
      this.kill(target, card);
      this.draw(foe, 2);
    } else if (($T($gi(FEAT16, "cards")) && $in(card, BANISH) && $in(kind, ["kill_le", "banish_any"]) && !(((kind === "kill_le") && (target.might(this) > val))))) {
      this.banish(target, `(${$str(card)})`);
    } else if (((kind === "kill_le") && (target.might(this) > val))) {
      if (((card === "Wind and Ghosts") || !$T($gi(CHAIN, 0)))) {
        this.bounce(target);
      }
    } else if ($in(kind, ["kill_le", "kill_any", "kill_less", "banish_any"])) {
      this.kill(target, card);
    } else if ((kind === "fight")) {
      mine = ($T(p.units) ? $max(p.units, $kw({"key": ((x) => x.might(this))})) : null);
      if (($T($ga(p, "ai29", $gi(AI29, 0))) && $T(p.units))) {
        bonus = (((card !== "Challenge") && this.can_pay(p, 0, 1, card)) ? 2 : 0);
        m_ = target.might(this);
        ok = (() => { const $r = []; for (const x of $it(p.units)) { if ((((x.might(this) + bonus) >= m_) && ($sub((x.might(this) + bonus), x.dmg) > m_))) { $r.push(x); } } return $r; })();
        mine = ($T(ok) ? $min(ok, $kw({"key": ((x) => x.might(this))})) : $min($OR((() => { const $r = []; for (const x of $it(p.units)) { if (((x.might(this) + bonus) >= m_)) { $r.push(x); } } return $r; })(), () => p.units), $kw({"key": ((x) => $cm($cm(CARDS, "get", x.name, new PyDict([])), "get", "e", 0))})));
        if (($T(bonus) && ((mine.might(this) - mine.dmg) <= m_))) {
          this.pay(p, 0, 1, card);
          { const $t43 = mine; $t43.temp = ($t43.temp + 2); }
        } else if (($T(bonus) && (mine.might(this) < m_))) {
          this.pay(p, 0, 1, card);
          { const $t44 = mine; $t44.temp = ($t44.temp + 2); }
        }
        [a, b] = $it([mine.might(this), target.might(this)]);
        this.deal(target, a, card);
        this.deal(mine, b, card);
        mine = null;
      }
      if ((mine != null)) {
        if (this.can_pay(p, 0, 1, card)) {
          this.pay(p, 0, 1, card);
          { const $t45 = mine; $t45.temp = ($t45.temp + 2); }
        }
        [a, b] = $it([mine.might(this), target.might(this)]);
        this.deal(target, a, card);
        this.deal(mine, b, card);
      }
    } else if ((kind === "pull")) {
      for (bi of $it($range(2))) {
        here = this.units_at(i, bi);
        if (($T(here) && !$eq(bi, target.loc) && $eq($gi($gi(this.bf, bi), "ctrl"), i) && ((() => { let $s = 0; for (const x of $it(here)) { $s += $num((x.might(this) + 1)); } return $s; })() > (target.might(this) + target.shield(this))))) {
          target.loc = bi;
          if (($len(here) === 2)) {
            for (x of $it(here)) {
              { const $t46 = x; $t46.temp = ($t46.temp + 1); }
            }
          }
          if ($T($gi(RULES34, 0))) {
            here = this.units_at(i, bi);
            dead_ = [];
            this.assign(this.def_total(here, [target], true), [target], false, here, dead_);
            this.assign(this.att_total([target], here, (1 - i), true), here, true, [target], dead_);
            this.resolve_deaths(dead_, "combat");
            alive = (() => { const $r = []; for (const x of $it(here)) { if ($in(x, p.units)) { $r.push(x); } } return $r; })();
            if (($in(target, foe.units) && $T(alive))) {
              target._loc = "base";
            } else if (($in(target, foe.units) && !$T(alive))) {
              $si($gi(this.bf, bi), "ctrl", (1 - i));
              this.conquer_score((1 - i), bi);
            }
            this.heal_all();
            break;
          }
          this.assign((() => { let $s = 0; for (const x of $it(here)) { $s += $num(x.might(this)); } return $s; })(), [target], true);
          if ($in(target, foe.units)) {
            target.loc = "base";
          }
          this.assign(($in(target, foe.units) ? target.might(this) : 0), here, false);
          break;
        }
      }
    } else if ((kind === "dmg_base")) {
      this.deal(target, val, card);
    } else if ((kind === "dmg")) {
      v = $add(val, ((card === "Consuming Curse") ? (() => { let $s = 0; for (const c of $it(p.trash)) { if ($eq(c, card)) { $s += $num(1); } } return $s; })() : 0));
      if (((card === "Ruthless Strike") && ($len(p.hand) > 2))) {
        v = 5;
        d = $min(p.hand, $kw({"key": ((c) => $gi($gi(CARDS, c), "e"))}));
        $cm(p.hand, "remove", d);
        $cm(p.trash, "append", d);
      }
      this.deal(target, v, card);
    } else if ((kind === "dmg2")) {
      this.deal(target, val, card);
      others = (() => { const $r = []; for (const u of $it(foe.units)) { if (((u !== target) && $in(u, foe.units) && !$T(u.protect) && !$in(u.name, UNTARGETABLE))) { $r.push(u); } } return $r; })();
      if ($T(others)) {
        ok_ = (() => { const $r = []; for (const u of $it(others)) { if (((u.might(this) - u.dmg) <= val)) { $r.push(u); } } return $r; })();
        this.deal($max($OR(ok_, () => others), $kw({"key": ((u) => u.might(this))})), val, card);
      }
    } else if ((kind === "split")) {
      this.deal(target, 5, card);
    } else if ((kind === "gear_dmg")) {
      this.deal(target, $max($OR((() => { const $r = []; for (const x of $it(this.all_gear(i))) { $r.push($gi($gi(CARDS, x), "e")); } return $r; })(), () => [0])), card);
    } else if ($in(kind, ["mine_dmg", "equip_dmg", "shield_dmg"])) {
      if ((kind === "equip_dmg")) {
        mine = (() => { const $r = []; for (const x of $it(p.units)) { if ($T(x.eq)) { $r.push(x); } } return $r; })();
      } else if ((kind === "shield_dmg")) {
        mine = (() => { const $r = []; for (const x of $it(p.units)) { if (!$T(x.token)) { $r.push(x); } } return $r; })();
      } else {
        mine = p.units;
      }
      best = $max(mine, $kw({"key": ((x) => ((kind === "shield_dmg") ? x.shield(this) : x.might(this)))}));
      v = ((kind !== "shield_dmg") ? best.might(this) : (best.shield(this) + 2));
      if ((kind === "shield_dmg")) {
        { const $t47 = best; $t47.shield_b = ($t47.shield_b + 2); }
      }
      this.deal(target, v, card);
      if (((kind === "equip_dmg") && $T(best.eq))) {
        $cm(p.loose_eq, "append", $cm(best.eq, "pop"));
      }
    } else if ((kind === "dmg_tokens")) {
      this.deal(target, 2, card);
      this.token(i, "base");
      this.token(i, "base");
    } else if ((kind === "kill_chaos")) {
      this.kill(target, card);
    } else if ((kind === "bf3")) {
      for (e of $it((() => { const $r = []; for (const x of $it(foe.units)) { if ($eq(x.loc, target.loc)) { $r.push(x); } } return $r; })())) {
        this.deal(e, 3, card);
      }
    } else if ((kind === "aoe")) {
      v = (this.can_pay(p, 1, 0) ? 2 : 1);
      if ($eq(v, 2)) {
        this.pay(p, 1, 0);
      }
      loc = target.loc;
      for (e of $it($sl($sorted((() => { const $r = []; for (const x of $it(foe.units)) { if ($eq(x.loc, loc)) { $r.push(x); } } return $r; })(), $kw({"key": ((x) => x.might(this))})), null, 3))) {
        this.deal(e, v, card);
      }
    } else if ((kind === "rain")) {
      left = 6;
      while (((left > 0) && $T(foe.units))) {
        t = $min(foe.units, $kw({"key": ((x) => [(x.might(this) - x.dmg), x.token])}));
        if (((t.might(this) - t.dmg) > $mul(2, left))) {
          t = $max(foe.units, $kw({"key": ((x) => x.might(this))}));
        }
        this.deal(t, 2, card);
        left = (left - 1);
      }
    } else if ((kind === "bounce")) {
      this.bounce(target);
      if ((card === "Star-Crossed")) {
        mine = (() => { const $r = []; for (const x of $it(p.units)) { if (!$T(x.token)) { $r.push(x); } } return $r; })();
        if ($T(mine)) {
          m = $min(mine, $kw({"key": ((x) => $gi($gi(CARDS, x.name), "e"))}));
          this.bounce(m);
        }
      }
    } else if ((kind === "reset")) {
      for (e of $it(target.eq)) {
        $cm(foe.loose_eq, "append", e);
      }
      target.eq = [];
      target.emp = 0;
      target.dmg = 0;
      target.temp = 0;
    }
  }
  take_turn(i) {
    let p, foe, u, _, t_, bi, b, mine, u_, o_, g, cand, ef, tb, nm, own, first, eggs, small, v, top_, hit, vm, h_, n_, rest, keep_, d_, ctrl_names, empty_names, gears, gval, cur, x, gl, drew, h, c, th, others, mine_m, foes, t, openb, rdy, stash_, dead, ex_, idle, mighty, ready, rev, b_i;
    { const $t48 = this; $t48.turn_no = ($t48.turn_no + 1); }
    this.tp = i;
    p = $gi(this.P, i);
    foe = $gi(this.P, (1 - i));
    if (($T($gi(AI36, 0)) && $in("Gutter Palace", p.base_gear) && ($len(p.hand) === 4) && ((() => { let $s = 0; for (const u of $it(p.units)) { if ((u.loc !== "base")) { $s += $num(1); } } return $s; })() === 4))) {
      p.points = $max(p.points, 99);
      if (this.v) this.say(`  ${$str(p.name)} wins with Gutter Palace (4 cards in hand, 4 units at battlefields)`);
      return;
    }
    for (u of $it((() => { const $r = []; for (const x of $it(p.units)) { if ($T($ga(x, "temporary", false))) { $r.push(x); } } return $r; })())) {
      this.kill(u, "(Temporary)");
    }
    for (_ of $it($range($ga(p, "fountain", 0)))) {
      if ($in("Sprite Fountain", p.base_gear)) {
        $cm(p.base_gear, "remove", "Sprite Fountain");
        $cm(p.trash, "append", "Sprite Fountain");
      }
      t_ = this.token(i, "base", "Sprite");
      t_.base = 3;
      t_.temporary = true;
      t_.exhausted = false;
    }
    p.fountain = 0;
    p.mighty_leg_used = false;
    p.vexdrew = false;
    p.jleg = false;
    { const $t49 = p; $t49.tn = ($t49.tn + 1); }
    p.scored_bf = $set();
    p.ksleg = null;
    p.shenleg = false;
    p.zedleg = false;
    p.ambleg = false;
    p.azleg = false;
    p.akleg = false;
    p.settex = false;
    p.ezleg = false;
    p.rkleg = false;
    if (($T($gi(AZ, 0)) && (p.leg === "ornn") && ($T(p.loose_eq) || (() => { for (const c of $it(p.hand)) { if (($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Gear")) return true; } return false; })()))) {
      this.gain_gold(p);
    }
    for (u of $it(p.units)) {
      u.jmove = false;
    }
    for (u of $it(p.units)) {
      u.exhausted = false;
      u.temp = 0;
      u.dmg = 0;
      u.shield_b = 0;
      u.tank_b = false;
      u.protect = false;
      u.ward = 0;
      u.stun = false;
    }
    if (($in("Petricite Monument", p.base_gear) && (p.petri < this.turn_no))) {
      $cm(p.base_gear, "remove", "Petricite Monument");
      $cm(p.trash, "append", "Petricite Monument");
    }
    this.ctrl_cleanup();
    for ([bi, b] of $it($enumerate(this.bf))) {
      mine = this.units_at(i, bi);
      if (($eq($gi(b, "ctrl"), i) && $T(mine))) {
        this.score(i, 1, "hold");
        $cm(p.scored_bf, "add", bi);
        $cm($cm(this.scored, "setdefault", [this.turn_no, i], $set()), "add", bi);
        if ($T($gi(AZ, 0))) {
          for (u_ of $it(mine)) {
            if ((u_.name === "Ornn, Blacksmith")) {
              this.ornn_look(p);
            }
          }
        }
        if ($T($gi(FEAT16, "cards"))) {
          p.xp = ($ga(p, "xp", 0) + (() => { let $s = 0; for (const u of $it(mine)) { $s += $num(((u.name === "Master Yi, Tempered") ? 2 : ($in("Hunter's Machete", u.eq) ? 1 : 0))); } return $s; })());
        }
        if (($T($gi(FEAT16, "rules2")) && ($gi($gi(b, "bombs"), (1 - i)) > 0))) {
          this.bomb_pop((1 - i), bi, 1);
        }
        if (($T($gi(FEAT16, "cards")) && $T($gi($gi(b, "gear"), (1 - i))))) {
          o_ = $gi(this.P, (1 - i));
          for (g of $it($gi($gi(b, "gear"), (1 - i)))) {
            if ((g !== "Dockside Lock-Up")) {
              $cm(o_.trash, "append", g);
            }
          }
          $si($gi(b, "gear"), (1 - i), []);
        }
        if (($gi(b, "name") === "Cosmic Vista")) {
          this.sync(p);
          if (!$T(p.rdeck)) {
            this.score(i, 1, "Cosmic Vista");
          }
        }
        if (($T($gi(PB, 0)) && ($gi(b, "name") === "Navori Fighting Pit"))) {
          cand = (() => { const $r = []; for (const u of $it(mine)) { if (!$T(u.buffed)) { $r.push(u); } } return $r; })();
          if ($T(cand)) {
            this.buff($max(cand, $kw({"key": ((x) => [!$T(x.token), x.might(this)])})));
          }
        }
        if (($gi(b, "name") === "Shadow Temple")) {
          if ($T($gi(AUDIT, 0))) {
            this.burn(p, 3);
          } else {
            for (_ of $it($range(3))) {
              if (($len(p.deck) > 5)) {
                $cm(p.trash, "append", $cm(p.deck, "pop", 0));
              }
            }
          }
        }
        while ($in("Demacian Standard", $gi($gi(b, "gear"), i))) {
          $cm($gi($gi(b, "gear"), i), "remove", "Demacian Standard");
          $cm(p.hand, "append", "Demacian Standard");
        }
        while ($in("The Good Stuff", $gi($gi(b, "gear"), i))) {
          $cm($gi($gi(b, "gear"), i), "remove", "The Good Stuff");
          $cm(p.hand, "append", "The Good Stuff");
          if (this.v) this.say(`  ${$str(p.name)} holds ${$str($gi(b, "name"))}: The Good Stuff returns to hand`);
        }
        for (u of $it(mine)) {
          if ($in("Last Rites", u.eq)) {
            this.last_rites(i);
          }
          if ((u.name === "Blitzcrank, Impassive")) {
            this.bounce(u);
          }
          for (ef of $it($cm(GEN, "get", u.name, []))) {
            if (($gi(ef, 0) === "hold_draw")) {
              this.draw(p, $gi(ef, 1));
            } else if (($gi(ef, 0) === "hold_score")) {
              this.score(i, $gi(ef, 1), u.name);
            }
          }
        }
        if (((p.leg === "vex") && !$T($ga(p, "vexdrew", false)))) {
          this.draw(p);
          p.vexdrew = true;
        }
        for (u of $it(mine)) {
          if ((u.name === "Explosimian")) {
            tb = (() => { for (const b2 of $it($range(2))) { if ($T(this.units_at((1 - i), b2))) { return b2; } } return bi; })();
            { const $t50 = $gi($gi(this.bf, tb), "bombs"), $t51 = i; $si($t50, $t51, ($gi($t50, $t51) + 3)); }
          }
        }
        if ((($len(mine) === 2) && (() => { for (const u of $it(mine)) { if ((u.name === "Shen, Leader of the Kinkou Order")) return true; } return false; })())) {
          this.score(i, 1, "Shen");
        }
        if ((($len(mine) === 2) && (() => { for (const u of $it(mine)) { if ((u.name === "Shen, Scourge of Shadows")) return true; } return false; })())) {
          this.draw(p);
        }
        for (u of $it(mine)) {
          if ($in("Trinity Force", u.eq)) {
            this.score(i, 1, "Trinity");
          }
          if ((u.name === "K'Sante, Courageous")) {
            { const $t52 = p; $t52.pending = ($t52.pending + 1); }
          }
        }
        if (((() => { for (const h of $it(p.hidden)) { if ($eq($gi(h, 1), bi)) return true; } return false; })() && (() => { for (const u of $it(mine)) { if ((u.name === "Evelynn, In Control")) return true; } return false; })())) {
          this.score(i, 1, "Evelynn");
        }
        if (($in("Dockside Lock-Up", $gi($gi(b, "gear"), i)) && $T($cm(b, "get", "banished")))) {
          [nm, own] = $it($gi(b, "banished"));
          $cm($gi($gi(b, "gear"), i), "remove", "Dockside Lock-Up");
          $si(b, "banished", null);
          if (($in(nm, CARDS) && ($gi($gi(CARDS, nm), "t") === "Unit"))) {
            this.place_unit(i, nm, "base");
          }
        }
      } else if (($eq($gi(b, "ctrl"), i) && !$T(mine))) {
      }
      if ((p.points >= 8)) {
        return;
      }
    }
    first = $eq(this.turn_no, 2);
    p.runes = $min(12, $add($add(p.runes, ($T(first) ? 3 : 2)), p.pending));
    p.pending = 0;
    this.draw(p);
    p.E = p.runes;
    p.P = $add($add(p.runes, p.gold), p.seal);
    if (!$T($gi(RULES34, 0))) {
      p.gold = 0;
    }
    if ((() => { for (const u of $it(p.units)) { if ((u.name === "Seraphic Wyvern")) return true; } return false; })()) {
      p.runes = $min(12, (p.runes + 1));
    }
    if ((p.leg === "kaisa")) {
      { const $t53 = p; $t53.P = ($t53.P + 1); }
      p.spellP = 1;
    }
    eggs = $cm(p.base_gear, "count", "Platewyrm Egg");
    if ($T(eggs)) {
      { const $t54 = p; $t54.E = $iadd($t54.E, $mul(eggs, ((p.leg === "jayce") ? 2 : 1))); }
    }
    if (($in("Garbage Grabber", p.base_gear) && ($len(p.trash) >= 3) && (p.E >= 2))) {
      for (_ of $it($range(3))) {
        $cm(p.deck, "insert", 0, $cm(p.trash, "pop", 0));
      }
      { const $t55 = p; $t55.E = ($t55.E - 1); }
      this.draw(p);
    }
    if (($in("Baited Hook", p.base_gear) && this.can_pay(p, 1, 1, "Baited Hook"))) {
      small = (() => { const $r = []; for (const x of $it(p.units)) { if (($T(x.token) || (x.might(this) <= 2))) { $r.push(x); } } return $r; })();
      if (($T(small) && $T(p.deck))) {
        v = $min(small, $kw({"key": ((x) => x.might(this))}));
        top_ = $sl(p.deck, (-5), null);
        hit = (() => { const $r = []; for (const x of $it(top_)) { if ((($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit") && ($cm($gi(CARDS, x), "get", "m", 0) <= (v.might(this) + 1)) && ($cm($gi(CARDS, x), "get", "m", 0) > v.might(this)))) { $r.push(x); } } return $r; })();
        if ($T(hit)) {
          vm = v.might(this);
          this.pay(p, 1, 1, "Baited Hook");
          this.kill(v, "(Baited Hook)");
          top_ = $sl(p.deck, (-5), null);
          hit = (() => { const $r = []; for (const x of $it(top_)) { if ((($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit") && ((vm < $cm($gi(CARDS, x), "get", "m", 0)) && ($cm($gi(CARDS, x), "get", "m", 0) <= (vm + 1))))) { $r.push(x); } } return $r; })();
          if ($T(hit)) {
            h_ = $max(hit, $kw({"key": ((x) => $cm($gi(CARDS, x), "get", "m", 0))}));
            $cm(p.deck, "remove", h_);
            this.place_unit(i, h_, "base");
          }
          n_ = $min(($T(hit) ? 4 : 5), $len(p.deck));
          rest = $sl(p.deck, ($len(p.deck) - n_), null);
          $dsl(p.deck, ($len(p.deck) - n_), null);
          $ssl(p.deck, 0, 0, rest);
        }
      }
    }
    if ($T($gi(AI36, 0))) {
      if (($in("Gutter Palace", p.base_gear) && ($len(p.hand) >= 5))) {
        keep_ = ((c) => [$OR((c === "Elder Dragon"), () => champion_like(c)), $add($gi($gi(CARDS, c), "e"), $mul(2, $gi($gi(CARDS, c), "p")))]);
        d_ = $min(p.hand, $kw({"key": keep_}));
        $cm(p.hand, "remove", d_);
        $cm(p.trash, "append", d_);
        this.token(i, "base", "Bird");
      }
    } else if (($in("Gutter Palace", p.base_gear) && ($len(p.hand) >= 4))) {
      d_ = $max(p.hand, $kw({"key": ((c) => $gi($gi(CARDS, c), "e"))}));
      $cm(p.hand, "remove", d_);
      $cm(p.trash, "append", d_);
      this.token(i, "base", "Bird");
    }
    for (u of $it(p.units)) {
      if (((u.name === "Dragonsoul Sage") && (u.loc === "base"))) {
        { const $t56 = p; $t56.E = ($t56.E + 1); }
        u.exhausted = true;
      }
    }
    if (((() => { for (const u of $it(p.units)) { if (((u.name === "Astral Heron") && (u.loc !== "base"))) return true; } return false; })() && ($len(p.hand) >= 2))) {
      { const $t57 = p; $t57.E = ($t57.E + 2); }
      if ($T($gi(PB2, 0))) {
        { const $t58 = p; $t58.P = ($t58.P + 2); }
      }
    }
    ctrl_names = (() => { const $r = []; for (const b of $it($range(2))) { if (($eq($gi($gi(this.bf, b), "ctrl"), i) && $T(this.units_at(i, b)))) { $r.push($gi($gi(this.bf, b), "name")); } } return $r; })();
    empty_names = (() => { const $r = []; for (const b of $it($range(2))) { if ((!$T(this.units_at(0, b)) && !$T(this.units_at(1, b)))) { $r.push($gi($gi(this.bf, b), "name")); } } return $r; })();
    if (($in("Hunters' Circle", ctrl_names) && (() => { for (const c of $it(p.hand)) { if ((($gi($gi(CARDS, c), "t") === "Unit") || $in("D", $gi($gi(CARDS, c), "f")))) return true; } return false; })())) {
      { const $t59 = p; $t59.E = ($t59.E + 1); }
    } else if (($in("Hunters' Circle", empty_names) && (() => { for (const c of $it(p.hand)) { if ($in("D", $gi($gi(CARDS, c), "f"))) return true; } return false; })())) {
      { const $t60 = p; $t60.E = ($t60.E + 1); }
    }
    if (($in("Ornn's Forge", ctrl_names) && (() => { for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "t") === "Gear")) return true; } return false; })())) {
      { const $t61 = p; $t61.E = ($t61.E + 1); }
    }
    if (($in("Piltovan Forge", ctrl_names) && ($T(p.loose_eq) || (() => { for (const c of $it(p.hand)) { if ($T($cm($gi(CARDS, c), "get", "eq"))) return true; } return false; })()))) {
      { const $t62 = p; $t62.E = ($t62.E + 1); }
    }
    if (($in("Rakelstake", ctrl_names) && $T(p.deck) && ($gi($gi(CARDS, $gi(p.deck, 0)), "e") > (p.runes + 2)))) {
      $cm(p.deck, "append", $cm(p.deck, "pop", 0));
    }
    if (!$T($gi(AI36, 0))) {
      p.kemp = false;
    }
    if (((p.leg === "orianna") && (p.E >= 1))) {
      if ($T($gi(ORI, 0))) {
        gears = (() => { const $r = []; for (const g of $it(p.base_gear)) { if ((($gi($gi(CARDS, g), "e") >= 2) && !$T($cm($gi(CARDS, g), "get", "eq")))) { $r.push([g, "base"]); } } return $r; })();
        gears = $iadd(gears, (() => { const $r = []; for (const b_ of $it($range(2))) { for (const g of $it($gi($gi($gi(this.bf, b_), "gear"), i))) { if ((($cm($cm(CARDS, "get", g, new PyDict([])), "get", "e", 0) >= 2) && !$T($cm($gi(CARDS, g), "get", "eq")) && (!$T(this.units_at((1 - i), b_)) || ($gi($gi(CARDS, g), "e") >= $add((this.strength_def(this.units_at((1 - i), b_)) + 1), ($T($gi(SMART, 0)) ? this.react_threat(i, b_) : 0)))))) { $r.push([g, b_]); } } } return $r; })());
        gval = ((g) => $add($gi($gi(CARDS, g), "e"), ((g === "The Ball") ? 4 : 0)));
      } else {
        gears = (() => { const $r = []; for (const g of $it(p.base_gear)) { if (($gi($gi(CARDS, g), "e") >= 2)) { $r.push([g, "base"]); } } return $r; })();
        gval = ((g) => $gi($gi(CARDS, g), "e"));
      }
      cur = ($T($gi(AUDIT, 0)) ? (() => { const $r = []; for (const x of $it(p.units)) { if ($T($ga(x, "anim", false))) { $r.push(x); } } return $r; })() : []);
      if (($T(cur) && $T(gears) && (gval($gi($max(gears, $kw({"key": ((x) => gval($gi(x, 0)))})), 0)) <= $max((() => { const $r = []; for (const x of $it(cur)) { $r.push(gval(x.name)); } return $r; })())))) {
        gears = [];
      }
      if ($T(gears)) {
        for (x of $it(cur)) {
          $cm(p.units, "remove", x);
          if (((x.loc === "base") || ($T($gi(ORI, 0)) && !$in("D", $cm($gi(CARDS, x.name), "get", "f", ""))))) {
            $cm(p.base_gear, "append", x.name);
          } else {
            $cm($gi($gi($gi(this.bf, x.loc), "gear"), i), "append", x.name);
          }
        }
        [g, gl] = $it($max(gears, $kw({"key": ((x) => gval($gi(x, 0)))})));
        if ((gl === "base")) {
          $cm(p.base_gear, "remove", g);
        } else {
          $cm($gi($gi($gi(this.bf, gl), "gear"), i), "remove", g);
        }
        { const $t63 = p; $t63.E = ($t63.E - 1); }
        u = new Unit(g, i, this.turn_no, undefined, $gi($gi(CARDS, g), "e"));
        u.exhausted = false;
        u.token = !$T($gi(ORI, 0));
        u.anim = true;
        if (($T($gi(ORI, 0)) && (gl !== "base"))) {
          u._loc = gl;
        }
        $cm(p.units, "append", u);
        if (this.v) this.say($add(`  ${$str(p.name)} animates ${$str(g)}`, ((gl !== "base") ? ` at ${$str($gi($gi(this.bf, gl), "name"))}` : "")));
        if (($T($gi(ORI, 0)) && (gl !== "base") && !$eq($gi($gi(this.bf, gl), "ctrl"), i))) {
          this.contest_here(i, u, gl);
        }
      }
    }
    drew = false;
    for (h of $it($list(p.hidden))) {
      if (!$in(h, p.hidden)) {
        continue;
      }
      [c, bi, th] = $it(h);
      if ((th >= this.turn_no)) {
        continue;
      }
      if (($T($gi(SMART, 0)) && $in(c, ["Hidden Blade", "Switcheroo", "Block", "Back Off"]) && !(((c === "Hidden Blade") && ($gi(this.removal_target(i, "Hidden Blade", ($T($gi(RULES34, 0)) ? bi : null)), 1) >= 5))))) {
        continue;
      }
      $cm(p.hidden, "remove", h);
      p.kemp = true;
      this.from_hidden(p, c, bi);
      if (this.v) this.say(`  ${$str(p.name)} flips ${$str(c)}`);
      if ($T($gi(PB2, 0))) {
        this.ev_flip(p);
      } else if (((p.leg === "evelynn") && !$T(drew))) {
        this.draw(p);
        drew = true;
      }
      if ((() => { for (const u of $it(p.units)) { if ((u.name === "Black Market Broker")) return true; } return false; })()) {
        this.gain_gold(p);
      }
      if ((c === "The Waters' Wage")) {
        { const $t64 = p; $t64.P = ($t64.P + 3); }
      } else if ((c === "Elnuk Herd")) {
        others = (() => { const $r = []; for (const x of $it(p.units)) { $r.push(x); } return $r; })();
        if ($T(others)) {
          { const $t65 = $max(others, $kw({"key": ((x) => x.might(this))})); $t65.temp = ($t65.temp + 3); }
        }
        $cm(p.deck, "insert", 0, c);
      } else if (($gi($gi(CARDS, c), "t") === "Unit")) {
        u = this.place_unit(i, c, ($eq($gi($gi(this.bf, bi), "ctrl"), i) ? bi : "base"));
        if ((c === "Gutter Guardian")) {
          { const $t66 = p; $t66.P = ($t66.P + 1); }
        }
        if ((c === "Teemo, Scout")) {
          { const $t67 = u; $t67.temp = ($t67.temp + 3); }
        }
        if (((c === "Evelynn, Entrancing") && (u.loc !== "base") && !$T(this.units_at((1 - i), u.loc)))) {
          mine_m = (() => { let $s = 0; for (const x of $it(this.units_at(i, u.loc))) { $s += $num(x.might(this)); } return $s; })();
          foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((!$eq(x.loc, u.loc) && ((x.might(this) + x.kw("assault")) < mine_m))) { $r.push(x); } } return $r; })();
          if ($T(foes)) {
            t = $max(foes, $kw({"key": ((x) => [(x.might(this) + $mul(3, champion_like(x.name))), !$T(x.token)])}));
            t._loc = u.loc;
            if (this.v) this.say(`  ${$str(p.name)}'s Evelynn, Entrancing pulls ${$str(t.name)} to ${$str($gi($gi(this.bf, u.loc), "name"))}`);
            this.combat((1 - i), u.loc, [t]);
          }
        }
      } else if ((c === "Edge of Night")) {
        $cm(p.loose_eq, "append", c);
      } else if ((c === "Demon Shade")) {
        openb = (() => { const $r = []; for (const b of $it($range(2))) { if ((!$eq($gi($gi(this.bf, b), "ctrl"), i) && !$T(this.units_at((1 - i), b)) && !$T(this.units_at(i, b)))) { $r.push(b); } } return $r; })();
        cand = (() => { const $r = []; for (const u of $it(p.units)) { if ((u.loc === "base")) { $r.push(u); } } return $r; })();
        if (($T(openb) && $T(cand))) {
          u = $max(cand, $kw({"key": ((x) => x.might(this))}));
          u.loc = $gi(openb, 0);
        }
        $cm(p.trash, "append", c);
      } else if ((c === "Hidden Blade")) {
        [t, _] = $it(this.removal_target(i, "Hidden Blade", ($T($gi(RULES34, 0)) ? bi : null)));
        if ($T(t)) {
          this.cast_removal(i, "Hidden Blade", t);
        } else {
          $cm(p.hidden, "append", h);
          continue;
        }
      } else {
        $cm(p.trash, "append", c);
      }
      for (u of $it(p.units)) {
        if ((u.name === "Evelynn, Consuming")) {
          u.exhausted = false;
          { const $t68 = u; $t68.temp = ($t68.temp + 1); }
        }
      }
    }
    if (($T($gi(AUDIT, 0)) && $T($gi(ANVIL_AI, 0)) && $in("Runeblade Anvil", p.hand) && $T(p.deck) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 3))) {
      $cm(p.hand, "remove", "Runeblade Anvil");
      this.pay(p, 1, 0, "Runeblade Anvil");
      $cm(p.base_gear, "append", "Runeblade Anvil");
      $cm(p.plays, "append", [p.tn, "Runeblade Anvil"]);
      if (this.v) this.say(`  ${$str(p.name)} plays Runeblade Anvil first`);
      this.anvil_banish(p);
    }
    if (($T($gi(AUDIT, 0)) && $in("Runeblade Anvil", p.base_gear) && $T(p.deck) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 6) && this.can_pay(p, 2, 1, "Runeblade Anvil"))) {
      this.pay(p, 2, 1, "Runeblade Anvil");
      $cm(p.base_gear, "remove", "Runeblade Anvil");
      $cm(p.trash, "append", "Runeblade Anvil");
      if (this.v) this.say(`  ${$str(p.name)} breaks Runeblade Anvil`);
      this.anvil_banish(p);
    }
    if ($T($ga(p, "ai20_draw", $gi(AI20, "draw")))) {
      if (($T($gi(SMART, 0)) && $in("Resplendent Rostrum", p.base_gear))) {
        p.rost_tn = this.turn_no;
        this.draw(p);
        { const $t69 = p; $t69.pending = ($t69.pending + 1); }
        rdy = (() => { const $r = []; for (const x of $it(p.units)) { if ((!$T(x.exhausted) && (x.might(this) > 0))) { $r.push(x); } } return $r; })();
        if ($T(rdy)) {
          { const $t70 = $max(rdy, $kw({"key": ((x) => x.might(this))})); $t70.temp = ($t70.temp + 3); }
        }
      }
      if (($T($ga(p, "ai20_scope", false)) && $in("Scrutinizing Scope", p.base_gear) && (p.E >= 1))) {
        p.scope_tn = this.turn_no;
        { const $t71 = p; $t71.E = ($t71.E - 1); }
        if ((this.rng.random() < 0.55)) {
          this.draw(p);
        }
      }
    }
    stash_ = [];
    if (($T($ga(p, "la_nospells", false)) || $T($ga(p, "la_skip", null)))) {
      stash_ = (() => { const $r = []; for (const c of $it(p.hand)) { if ((($T($ga(p, "la_nospells", false)) && ($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Spell")) || $eq(c, $ga(p, "la_skip", null)))) { $r.push(c); } } return $r; })();
      for (c of $it(stash_)) {
        $cm(p.hand, "remove", c);
      }
    }
    this.main_plays(i);
    if ($T(stash_)) {
      $cm(p.hand, "extend", stash_);
    }
    for (u of $it(p.units)) {
      if (((u.name === "Punching Poro") && !$T(u.emp) && ($len(p.hand) >= 3))) {
        dead = (() => { const $r = []; for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "e") > (p.runes + 3))) { $r.push(c); } } return $r; })();
        if ($T(dead)) {
          d_ = $max(dead, $kw({"key": ((c) => $gi($gi(CARDS, c), "e"))}));
          $cm(p.hand, "remove", d_);
          $cm(p.trash, "append", d_);
          u.emp = 1;
        }
      }
    }
    if (((p.points >= 8) || (foe.points >= 8))) {
      return;
    }
    if ($T($gi(FEAT16, "legends"))) {
      this.legend_main(i);
    }
    this.ctrl_cleanup();
    this.attack_phase(i);
    if (((p.leg === "irelia") && (p.P >= 1) && !(((p.points >= 8) || (foe.points >= 8))))) {
      ex_ = (() => { const $r = []; for (const u of $it(p.units)) { if (($T(u.exhausted) && (u.loc === "base") && (u.might(this) >= 2))) { $r.push(u); } } return $r; })();
      if ($T(ex_)) {
        u_ = $max(ex_, $kw({"key": ((x) => x.might(this))}));
        { const $t72 = p; $t72.P = ($t72.P - 1); }
        p.runes = $max(0, (p.runes - 1));
        u_.exhausted = false;
        { const $t73 = u_; $t73.temp = ($t73.temp + 1); }
        this.ctrl_cleanup();
        this.attack_phase(i);
      }
    }
    if (($T($gi(PB, 0)) && !(((p.points >= 8) || (foe.points >= 8))))) {
      this.charm_deny(i);
      this.satchel_value(i);
    }
    if ($T($gi(FEAT16, "rules2"))) {
      while (($in("Life from Stone", p.hand) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 1))) {
        idle = (() => { const $r = []; for (const u of $it(p.units)) { if (!$T(u.exhausted)) { $r.push(u); } } return $r; })();
        if (!$T(idle)) {
          break;
        }
        $min(idle, $kw({"key": ((x) => x.might(this))})).exhausted = true;
        $cm(p.hand, "remove", "Life from Stone");
        { const $t74 = p; $t74.E = ($t74.E - 1); }
        $cm(p.trash, "append", "Life from Stone");
        this.draw(p);
        { const $t75 = p; $t75.pending = ($t75.pending + 1); }
      }
    }
    if ($T($gi(AUDIT, 0))) {
      this.anvil_expire(p);
    }
    if ($T($gi(FEAT16, "cards"))) {
      this.heal_all();
    }
    if ($T($gi(FEAT16, "rules2"))) {
      this.end_turn_cleanup();
    }
    if (((p.ai >= 2) || true)) {
      mighty = (() => { const $r = []; for (const u of $it(p.units)) { if ((u.might(this) >= 5)) { $r.push(u); } } return $r; })();
      for (g of $it(p.base_gear)) {
        if ((g === "Invigorating Bloom")) {
          ready = (() => { const $r = []; for (const u of $it(mighty)) { if (!$T(u.exhausted)) { $r.push(u); } } return $r; })();
          if ($T(ready)) {
            $gi(ready, 0).exhausted = true;
            this.draw(p);
          }
        }
        if (((g === "Scrutinizing Scope") && (p.E >= 1) && !$eq($ga(p, "scope_tn", (-1)), this.turn_no))) {
          { const $t76 = p; $t76.E = ($t76.E - 1); }
          if ((this.rng.random() < 0.55)) {
            this.draw(p);
          }
        }
      }
      if (($in("Meditation", p.hand) && (p.E >= (2 + $gi(this.reserve(p), 0))))) {
        if ($T(this.cast(p, "Meditation", 2, 0))) {
          idle = (() => { const $r = []; for (const u of $it(p.units)) { if (((u.loc === "base") && !$T(u.exhausted))) { $r.push(u); } } return $r; })();
          if ($T(idle)) {
            $gi(idle, 0).exhausted = true;
            this.draw(p, 2);
          } else {
            this.draw(p);
          }
        }
      }
      if (($in("Show of Strength", p.hand) && ($len(mighty) >= 2) && this.can_pay(p, 2, 1, "Show of Strength"))) {
        if ($T(this.cast(p, "Show of Strength", 2, 1))) {
          this.draw(p, $len(mighty));
        }
      }
    }
    if (($in("Dazzling Aurora", p.base_gear) && $T(p.deck))) {
      rev = [];
      while ($T(p.deck)) {
        x = $cm(p.deck, "pop");
        if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit")) {
          this.place_unit(i, x, "base");
          break;
        }
        $cm(rev, "append", x);
      }
      $ssl(p.deck, 0, 0, rev);
    }
    for (u of $it(p.units)) {
      if ((u.name === "Coalesced Energy")) {
        p.runes = 4;
      }
    }
    for ([b_i, b] of $it($enumerate(this.bf))) {
      if (($in("Resource Extractor", $gi($gi(b, "gear"), i)) && $eq($gi(b, "ctrl"), i))) {
        this.gain_gold(p);
      }
    }
    for (b of $it(this.bf)) {
    }
  }
  legend_main(i) {
    let p, w, bi, o, foes, mine_m, win, t, res, tgt, z, _, rv, fod, f_, ex, u, dead, dc;
    p = $gi(this.P, i);
    if ($T($gi(AZ, 0))) {
      for (w of $it((() => { const $r = []; for (const x of $it(p.units)) { if (((x.name === "Angler Wyrm") && (x.loc !== "base") && !$T(x.exhausted))) { $r.push(x); } } return $r; })())) {
        bi = w.loc;
        o = $gi(this.P, (1 - i));
        if ($T(this.units_at((1 - i), bi))) {
          continue;
        }
        foes = (() => { const $r = []; for (const x of $it(o.units)) { if (!$eq(x.loc, bi)) { $r.push(x); } } return $r; })();
        if (!$T(foes)) {
          continue;
        }
        mine_m = (() => { let $s = 0; for (const x of $it(this.units_at(i, bi))) { $s += $num(x.might(this)); } return $s; })();
        win = (() => { const $r = []; for (const x of $it(foes)) { if ((((x.might(this) + x.kw("assault")) > mine_m) && !$T(x.stun))) { $r.push(x); } } return $r; })();
        t = ($T(win) ? $max(win, $kw({"key": ((x) => x.might(this))})) : $min(foes, $kw({"key": ((x) => [(x.might(this) + $mul(3, champion_like(x.name))), !$T(x.token)])})));
        if ($T(win)) {
          continue;
        }
        w.exhausted = true;
        t._loc = bi;
        if (this.v) this.say(`  ${$str(p.name)}'s Angler Wyrm makes ${$str(o.name)} move ${$str(t.name)} to ${$str($gi($gi(this.bf, bi), "name"))}`);
        res = this.combat((1 - i), bi, [t]);
        if (((res === "conquer") && $T(this.units_at((1 - i), bi)))) {
          $si($gi(this.bf, bi), "ctrl", (1 - i));
          this.conquer_score((1 - i), bi);
        }
      }
    }
    if (($T($gi(AZ, 0)) && (p.leg === "azir") && !$T(p.azleg) && $eq($ga(p, "eq_tn", (-1)), this.turn_no) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 1))) {
      { const $t77 = p; $t77.E = ($t77.E - 1); }
      p.azleg = true;
      this.sand(i);
      if (this.v) this.say(`  ${$str(p.name)}'s legend makes a Sand Soldier`);
    }
    if (($T($gi(AZ, 0)) && (p.leg === "akali") && !$T($ga(p, "akemp", false)) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 3) && this.can_pay(p, 3, 1))) {
      this.pay(p, 3, 1);
      p.akemp = true;
      if (this.v) this.say(`  ${$str(p.name)} empowers Akali's legend`);
    }
    if ($T($gi(FEAT16, "rules2"))) {
      tgt = $sorted((() => { const $r = []; for (const b_ of $it($range(2))) { if ($T(this.units_at((1 - i), b_))) { $r.push(b_); } } return $r; })(), $kw({"key": ((b_) => (-$len(this.units_at((1 - i), b_))))}));
      for (z of $it((() => { const $r = []; for (const x of $it(p.units)) { if ((x.name === "Ziggs, Explosive")) { $r.push(x); } } return $r; })())) {
        for (_ of $it($range(2))) {
          if (($T(z.exhausted) || !$T(tgt) || ($sub(p.E, $gi(this.reserve(p), 0)) < 1))) {
            break;
          }
          this.pay(p, 1, 0);
          z.exhausted = true;
          { const $t78 = $gi($gi(this.bf, $gi(tgt, 0)), "bombs"), $t79 = i; $si($t78, $t79, ($gi($t78, $t79) + 1)); }
          if (this.v) this.say(`  ${$str(p.name)}'s Ziggs, Explosive plays a Bomb`);
          rv = (() => { const $r = []; for (const x of $it(p.units)) { if ((x.name === "Riven, Deserter")) { $r.push(x); } } return $r; })();
          if (($T(rv) && !$eq($ga(p, "riven_tn", (-1)), this.turn_no))) {
            fod = (() => { const $r = []; for (const x of $it(p.units)) { if ((!$T(x.exhausted) && (x !== z) && (x.loc === "base") && ((x.name === "Reckless Innovator") || (x.might(this) <= 2)))) { $r.push(x); } } return $r; })();
            if (($T(fod) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 1))) {
              f_ = $max(fod, $kw({"key": ((x) => (x.name === "Reckless Innovator"))}));
              f_.exhausted = true;
              p.riven_tn = this.turn_no;
              if (((f_.name === "Reckless Innovator") && !$T($gi(MOVES, 0)))) {
                this.gain_gold(p);
              }
              z.exhausted = false;
              if (this.v) this.say(`  ${$str(p.name)}'s Riven exhausts ${$str(f_.name)} to ready Ziggs`);
            }
          }
        }
      }
    }
    if (((p.leg === "ambessa") && $T($ga(p, "ambE", false)) && !$T(p.ambleg) && this.can_pay(p, 0, 1))) {
      ex = (() => { const $r = []; for (const u of $it(p.units)) { if (($T(u.exhausted) && (u.loc === "base") && (u.might(this) >= 3))) { $r.push(u); } } return $r; })();
      if ($T(ex)) {
        u = $max(ex, $kw({"key": ((x) => x.might(this))}));
        this.pay(p, 0, 1);
        u.exhausted = false;
        p.ambE = false;
        p.ambleg = true;
        if (this.v) this.say(`  ${$str(p.name)}'s legend readies ${$str(u.name)}`);
      }
    }
    if (((p.leg === "zed") && $in("Death Mark", p.trash) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 1) && this.can_pay(p, 1, 2, "Death Mark") && ($sub(p.P, $gi(this.reserve(p), 1)) >= 2) && (() => { for (const u of $it(p.units)) { if ((u.name === "Zed, Without a Sound")) return true; } return false; })())) {
      $cm(p.trash, "remove", "Death Mark");
      this.pay(p, 1, 2, "Death Mark");
      this.zed_banish(p);
      this.token(i, "base", "Shadow Clone").base = 0;
      this.burn(p, 3);
      p.kemp = true;
    }
    if (((p.leg === "zed") && $T($ga(p, "zemp", false)) && !$T(p.zedleg) && $T(p.hand))) {
      dead = $OR((() => { const $r = []; for (const c of $it(p.hand)) { if ($in(c, FLOW)) { $r.push(c); } } return $r; })(), () => (() => { const $r = []; for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "e") > (p.runes + 2))) { $r.push(c); } } return $r; })());
      if ($T(dead)) {
        dc = $max(dead, $kw({"key": ((c) => [$in(c, FLOW), $gi($gi(CARDS, c), "e")])}));
        $cm(p.hand, "remove", dc);
        $cm(p.trash, "append", dc);
        this.draw(p);
        p.zemp = false;
        p.zedleg = true;
        if (this.v) this.say(`  ${$str(p.name)}'s legend loots away ${$str(dc)}`);
      }
    }
  }
  slip(p) {
    if (((p.err > 0) && (this.rng.random() < p.err))) {
      { const $t80 = p; $t80.mistakes = ($t80.mistakes + 1); }
      return true;
    }
    return false;
  }
  buff(u) {
    if (((u != null) && !$T(u.buffed))) {
      u.buffed = true;
      { const $t81 = u; $t81.base = ($t81.base + 1); }
    }
  }
  jarvan_move(i, bi, defending = false) {
    let p, cand, u;
    $gi(this.P, i).jmoved = true;
    p = $gi(this.P, i);
    if (((p.leg !== "jarvan") || $T(p.jleg) || !(this.can_pay(p, 0, 1)))) {
      return null;
    }
    cand = (() => { const $r = []; for (const u of $it(p.units)) { if ((u.loc === "base")) { $r.push(u); } } return $r; })();
    if (!$T(cand)) {
      return null;
    }
    u = $max(cand, $kw({"key": ((x) => (!$T(defending) ? [x.exhausted, x.might(this)] : x.might(this)))}));
    this.pay(p, 0, 1);
    p.jleg = true;
    u.loc = bi;
    if (!$T(defending)) {
      u.jmove = true;
    }
    if (this.v) this.say(`  ${$str(p.name)}'s Jarvan legend moves ${$str(u.name)} to ${$str($gi($gi(this.bf, bi), "name"))}`);
    return u;
  }
  deploy_target(i, c) {
    let p, foe, empty, cont, ready, b, bi;
    p = $gi(this.P, i);
    foe = (1 - i);
    if (((p.leg === "jarvan") && !$T(p.jleg) && this.can_pay(p, 0, 1) && (() => { for (const u of $it(p.units)) { if ((u.loc === "base")) return true; } return false; })())) {
      empty = (() => { const $r = []; for (const b of $it($range(2))) { if ((!$eq($gi($gi(this.bf, b), "ctrl"), i) && !$T(this.units_at(foe, b)) && !$T(this.units_at(i, b)))) { $r.push(b); } } return $r; })();
      if ($T(empty)) {
        return [$gi(empty, 0), true];
      }
      if ((c === "Demacian Standard")) {
        cont = (() => { const $r = []; for (const b of $it($range(2))) { if ($T(this.units_at(foe, b))) { $r.push(b); } } return $r; })();
        if ($T(cont)) {
          ready = (() => { const $r = []; for (const u of $it(p.units)) { if (((u.loc === "base") && !$T(u.exhausted))) { $r.push(u); } } return $r; })();
          b = $min(cont, $kw({"key": ((x) => (() => { let $s = 0; for (const u of $it(this.units_at(foe, x))) { $s += $num(u.might(this)); } return $s; })())}));
          if (($T(ready) || ($max((() => { const $r = []; for (const u of $it(p.units)) { if ((u.loc === "base")) { $r.push(u.might(this)); } } return $r; })(), $kw({"default": 0})) > (() => { let $s = 0; for (const u of $it(this.units_at(foe, b))) { $s += $num(u.might(this)); } return $s; })()))) {
            return [b, true];
          }
        }
      }
    }
    bi = (() => { for (const b of $it($range(2))) { if ($eq($gi($gi(this.bf, b), "ctrl"), i)) { return b; } } return null; })();
    if ((bi == null)) {
      bi = (() => { for (const b of $it($range(2))) { if ($T(this.units_at(i, b))) { return b; } } return 0; })();
    }
    return [bi, false];
  }
  contest_here(i, u, bi) {
    let p, res;
    p = $gi(this.P, i);
    res = this.combat(i, bi, [u]);
    if (((res === "conquer") && $T(this.units_at(i, bi)) && !$eq($gi($gi(this.bf, bi), "ctrl"), i))) {
      $si($gi(this.bf, bi), "ctrl", i);
      if (!($hasattr(p, "scored_bf"))) {
        p.scored_bf = $set();
      }
      if ($T(this.conquer_score(i, bi))) {
        $cm(p.scored_bf, "add", bi);
      }
    }
  }
  conquer_score(i, bi) {
    let p, sc;
    p = $gi(this.P, i);
    sc = $cm(this.scored, "setdefault", [this.turn_no, i], $set());
    if ($in(bi, sc)) {
      return false;
    }
    $cm(sc, "add", bi);
    if (((p.points >= (this.victory - 1)) && !((() => { for (const b2 of $it($range($len(this.bf)))) { if (!$in(b2, sc)) return false; } return true; })()))) {
      this.draw(p);
      if (this.v) this.say(`  ${$str(p.name)} conquers ${$str($gi($gi(this.bf, bi), "name"))} (final point needs every battlefield) -> draws`);
    } else {
      this.score(i, 1, `conquer ${$str($gi($gi(this.bf, bi), "name"))}`);
    }
    this.on_conquer(i, bi);
    return true;
  }
  score(i, n, why) {
    let p;
    p = $gi(this.P, i);
    { const $t82 = p; $t82.points = $iadd($t82.points, n); }
    if (this.v) this.say(`  ${$str(p.name)} scores ${$str(n)} (${$str(why)}) -> ${$str(p.points)}`);
  }
  main_plays(i) {
    let p, foe, _, best, srcs, c, src, e, pw, t, val, score, thr, e0, p0, cg, u, g, kind_, u_, g_, pe, pec, pumps, mine, foes_, ok, v, _loop, pool, opts, k, cd, pp_, hv_, ctrl, slots, extraE, rE, rP, hold_std, rdy_, b_, f_, sp_, r_, bc_, rv_, exposed_, fc_, rc_, vf_, vr_, choice, full, bE, bc, bv, believable, exposed, items, drew, kind, cap, free_, dest_, rg, eqc, real, q, sc, before, rb, da, alt, freeE, cand, o, nu, rdy, tgt, openb, mv, x, tb, b, nb_, bi;
    p = $gi(this.P, i);
    foe = $gi(this.P, (1 - i));
    this.flurry(i);
    for (_ of $it($range(3))) {
      best = null;
      srcs = (() => { const $r = []; for (const c of $it($set(p.hand))) { if (($in(c, REMOVAL) && (c !== "Dockside Lock-Up"))) { $r.push([c, "hand", this.ecost(p, c), $gi($gi(CARDS, c), "p")]); } } return $r; })();
      if ($T($gi(SMART, 0))) {
        srcs = $iadd(srcs, (() => { const $r = []; for (const c of $it($set(p.trash))) { if (($in(c, FLOW) && $in(c, REMOVAL))) { $r.push([c, "flow", $gi($gi(FLOW, c), 0), $gi($gi(FLOW, c), 1)]); } } return $r; })());
      }
      for ([c, src, e, pw] of $it(srcs)) {
        if (!(this.can_pay(p, e, pw, c))) {
          continue;
        }
        [t, val] = $it(this.removal_target(i, c));
        if ((t == null)) {
          continue;
        }
        if (($T($gi(PLAYER_AI, 0)) && $in(c, SAVE_FOR_REACT) && !(((t.loc !== "base") && $eq($gi($gi(this.bf, t.loc), "ctrl"), (1 - i)))))) {
          continue;
        }
        if (($T($ga(p, "ai29b", $gi(AI29B, 0))) && $in(c, COMBAT_OK) && (c !== "Ntofo Strikes") && (src === "hand") && !$T(champion_like(t.name)) && !(((t.loc !== "base") && $eq($gi($gi(this.bf, t.loc), "ctrl"), (1 - i)))) && ($len(p.hand) <= 5))) {
          continue;
        }
        score = val;
        if (($T($gi(SMART, 0)) && (t.loc !== "base") && $eq($gi($gi(this.bf, t.loc), "ctrl"), (1 - i)))) {
          score = $iadd(score, (($len(this.units_at((1 - i), t.loc)) === 1) ? $ga(p, "deny_w", 3) : 1));
        }
        thr = ($T($gi(SMART, 0)) ? 2 : 3);
        if (((p.ai >= 2) && $in($gi($gi(REMOVAL, c), 0), ["kill_any", "banish_any", "kill_less", "dmg2", "fight"]) && (val < 4) && !$T(champion_like(t.name)) && !(((t.loc !== "base") && $eq($gi($gi(this.bf, t.loc), "ctrl"), (1 - i)))))) {
          continue;
        }
        if (((src === "flow") && $T($ga(p, "vflow", $gi(VFLOW, 0))) && (score < ($add(e, pw) - 1)) && !$T(champion_like(t.name)))) {
          continue;
        }
        if (($T($ga(p, "ai29", $gi(AI29, 0))) && (src === "hand") && (score < $add(e, pw)) && !$T(champion_like(t.name)) && ($len(p.hand) <= (4 + (e >= 3))))) {
          continue;
        }
        if ((((val >= thr) || (score >= 5)) && ((best == null) || (score > $gi(best, 2))))) {
          best = [c, t, score, src, e, pw];
        }
      }
      if (!$T(best)) {
        break;
      }
      [c, t, val, src, e, pw] = $it(best);
      if ((src === "hand")) {
        $cm(p.hand, "remove", c);
        $cm(p.trash, "append", c);
      } else {
        $cm(p.trash, "remove", c);
        this.zed_banish(p);
      }
      this.pay(p, e, pw, c);
      $cm(p.plays, "append", [p.tn, c]);
      this.cast_removal(i, c, t);
    }
    if ($T($gi(PB, 0))) {
      this.alpha_strike(i);
    }
    if ($T($gi(PB2, 0))) {
      this.cull_weak(i);
      this.showstopper(i);
      this.offer_gear(i);
    }
    if ($in("Decree of Unity", p.hand)) {
      [e0, p0] = $it([$gi($gi(CARDS, "Decree of Unity"), "e"), $gi($gi(CARDS, "Decree of Unity"), "p")]);
      foe = $gi(this.P, (1 - i));
      cg = null;
      for (u of $it(foe.units)) {
        for (g of $it(u.eq)) {
          if ($in("Chaos", $cm(DOMAINS, "get", g, []))) {
            cg = ["eq", u, g];
          }
        }
      }
      if ((cg == null)) {
        for (g of $it(foe.base_gear)) {
          if ($in("Chaos", $cm(DOMAINS, "get", g, []))) {
            cg = ["base", null, g];
          }
        }
      }
      if (($T(cg) && this.can_pay(p, e0, p0, "Decree of Unity") && !((() => { for (const u of $it(foe.units)) { if ($in(u.name, CHAOS)) return true; } return false; })()))) {
        $cm(p.hand, "remove", "Decree of Unity");
        $cm(p.trash, "append", "Decree of Unity");
        this.pay(p, e0, p0, "Decree of Unity");
        $cm(p.plays, "append", [p.tn, "Decree of Unity"]);
        [kind_, u_, g_] = $it(cg);
        if ((kind_ === "eq")) {
          $cm(u_.eq, "remove", g_);
        } else {
          $cm(foe.base_gear, "remove", g_);
        }
        $cm(foe.trash, "append", g_);
        if (this.v) this.say(`  ${$str(p.name)} kills ${$str(g_)} with Decree of Unity`);
        this.gear_left(foe, g_);
      }
    }
    if (($T($gi(SMART, 0)) && $T($gi(FEAT16, "cards")) && (p.ai >= 3) && $T(p.units) && ($ga(p, "v1b", $gi(V1B, 0)) !== "off"))) {
      pe = ($in("Public Execution", p.hand) ? "hand" : ($in("Public Execution", p.trash) ? "flow" : null));
      if ((($ga(p, "v1b", $gi(V1B, 0)) === "champ") && (pe === "flow"))) {
        pe = null;
      }
      pec = ((pe === "hand") ? [2, 1] : [5, 2]);
      pumps = (() => { const $r = []; for (const c of $it($set(p.hand))) { if (($in(c, ["Punch First", "Guttural Roar", "Hold 'Em", "Onslaught"]) && $isinstance($gi(PUMP, c), $int))) { $r.push([c, $gi(PUMP, c)]); } } return $r; })();
      if (($T(pe) && $T(pumps))) {
        mine = $max(p.units, $kw({"key": ((x) => x.might(this))}));
        foes_ = (() => { const $r = []; for (const u of $it(foe.units)) { if ((!$T(u.protect) && !$in(u.name, UNTARGETABLE) && (u.might(this) >= mine.might(this)) && ((u.might(this) >= 5) || $T(champion_like(u.name))) && (($ga(p, "v1b", $gi(V1B, 0)) !== "champ") || $T(champion_like(u.name))))) { $r.push(u); } } return $r; })();
        for (t of $it($sorted(foes_, $kw({"key": ((x) => (-x.might(this)))})))) {
          ok = (() => { const $r = []; for (const [c, v] of $it(pumps)) { if ((((mine.might(this) + v) > t.might(this)) && this.can_pay(p, $add($gi($gi(CARDS, c), "e"), $gi(pec, 0)), $add($gi($gi(CARDS, c), "p"), $gi(pec, 1)), c))) { $r.push([c, v]); } } return $r; })();
          if (!$T(ok)) {
            continue;
          }
          [c, v] = $it($min(ok, $kw({"key": ((x) => $add($gi($gi(CARDS, $gi(x, 0)), "e"), $gi($gi(CARDS, $gi(x, 0)), "p")))})));
          if ($T(this.slip(p))) {
            break;
          }
          $cm(p.hand, "remove", c);
          this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
          $cm(p.trash, "append", c);
          $cm(p.plays, "append", [p.tn, c]);
          if ($T(this.counter_any((1 - i), c))) {
            break;
          }
          { const $t83 = mine; $t83.temp = $iadd($t83.temp, v); }
          if (this.v) this.say(`  ${$str(p.name)} pumps ${$str(mine.name)} with ${$str(c)} to set up Public Execution`);
          if ((pe === "hand")) {
            $cm(p.hand, "remove", "Public Execution");
            $cm(p.trash, "append", "Public Execution");
          } else {
            $cm(p.trash, "remove", "Public Execution");
            this.zed_banish(p);
          }
          this.pay(p, $gi(pec, 0), $gi(pec, 1), "Public Execution");
          $cm(p.plays, "append", [p.tn, "Public Execution"]);
          this.cast_removal(i, "Public Execution", t);
          break;
        }
      }
    }
    for (_loop of $it($range(3))) {
      pool = $add(p.hand, p.champ);
      opts = [];
      for ([k, c] of $it($enumerate(pool))) {
        cd = $gi(CARDS, c);
        if (($in($gi(cd, "t"), ["Unit", "Gear"]) || ($in(c, SETUP) && !($T($gi(SATCHEL, 0)) && (c === "Satchel Charge"))))) {
          if ($in(c, ["Dockside Lock-Up"])) {
            continue;
          }
          if (((c === "Life from Stone") && (!$T(p.units) || $T($gi(FEAT16, "rules2")) || $T($ga(p, "ai30", $gi(AI30, 0)))))) {
            continue;
          }
          if (($T($gi(AZ, 0)) && (c === "Arise!") && (((() => { let $s = 0; for (const x of $it(p.units)) { $s += $num($len(x.eq)); } return $s; })() + $len(p.loose_eq)) < 2))) {
            continue;
          }
          e = $gi(cd, "e");
          if ((($gi(cd, "t") === "Gear") && (() => { for (const u of $it(p.units)) { if (((u.name === "Orianna, Mechanical Marvel") && (u.loc !== "base"))) return true; } return false; })() && (!$T($gi(AUDIT, 0)) || !$eq($ga(p, "omm_tn", (-1)), this.turn_no)))) {
            e = $max(0, (e - 1));
          }
          if (((c === "Skystrike Squadron") && (() => { for (const b_ of $it(this.bf)) { for (const x of $it($gi($gi(b_, "gear"), i))) { if ($in(x, ["Demacian Standard", "Pillaged Armory", "Concert Poster"])) return true; } } return false; })())) {
            e = $max(0, (e - 2));
          }
          pp_ = $gi(cd, "p");
          if (($T($gi(FEAT16, "rules2")) && (c === "Noxus Hopeful") && (() => { for (const [t_, _] of $it(p.plays)) { if ($eq(t_, p.tn)) return true; } return false; })())) {
            e = $max(0, (e - 2));
          }
          if (($T($gi(PB, 0)) && (c === "Find Your Center") && (foe.points >= (this.victory - 3)))) {
            e = $max(0, (e - 2));
          }
          if ((c === "Rhasa the Sunderer")) {
            e = $max(0, (e - $len(p.trash)));
          }
          if (((c === "Keeper of Law") && (() => { for (const b_ of $it($range(2))) { if ($eq($gi($gi(this.bf, b_), "ctrl"), i)) { if (($len(this.units_at(i, b_)) === 2)) return true; } } return false; })())) {
            e = $max(0, (e - 2));
            pp_ = $max(0, (pp_ - 1));
          }
          if (($T($gi(COLOR, 0)) && (pp_ > 0) && (this.colored_avail(p, c) < pp_))) {
            continue;
          }
          $cm(opts, "append", [k, "play", e, pp_, $add($add($gi(cd, "e"), $gi(cd, "p")), (($gi(cd, "t") === "Unit") ? 2 : 0))]);
        }
        if ((($in(p.leg, ["evelynn", "kennen", "vex"]) || $T($gi(FEAT16, "cards"))) && $in("H", $gi(cd, "f")) && !$in(c, p.champ) && ($in(p.leg, ["evelynn", "vex"]) || ($gi(cd, "t") === "Unit") || ($T($gi(FEAT16, "cards")) && $in(c, ["Switcheroo", "Hidden Blade", "Back Off", "The Waters' Wage", "Demon Shade"]))))) {
          hv_ = (($T($gi(TIDE2, 0)) && (c === "Tideturner") && ((() => { for (const x of $it(p.units)) { if ($cm(x.name, "startswith", "Akali, Deadly")) return true; } return false; })() || $in("Akali, Deadly Weapon", p.hand))) ? 4 : (($T($gi(PB, 0)) && (c === "Tornado Warrior") && (() => { for (const x of $it(p.units)) { if (((x.name === "Steel Paws") && !$T(x.pw) && (x.loc !== "base"))) return true; } return false; })()) ? 6 : 1));
          if (($T($gi(PB2, 0)) && !$T($ga(p, "hide_old", false)) && $eq(hv_, 1))) {
            hv_ = $add($add($max(1, $mul(0.6, $gi(cd, "e"))), ((p.leg === "evelynn") ? 1.5 : 0)), ((() => { for (const b_ of $it($range(2))) { if ((($gi($gi(this.bf, b_), "name") === "Bandle Scouts' Academy") && $eq($gi($gi(this.bf, b_), "ctrl"), i))) return true; } return false; })() ? 1 : 0));
          }
          $cm(opts, "append", [k, "hide", 0, 1, hv_]);
        }
      }
      ctrl = (() => { const $r = []; for (const [bi, b] of $it($enumerate(this.bf))) { if ($eq($gi(b, "ctrl"), i)) { $r.push(bi); } } return $r; })();
      slots = (($len(ctrl) + ((() => { for (const b of $it(ctrl)) { if (($gi($gi(this.bf, b), "name") === "Bandle Tree")) return true; } return false; })() ? 1 : 0)) - $len(p.hidden));
      slots = (slots + (() => { let $s = 0; for (const b of $it(ctrl)) { $s += $num($cm($gi($gi($gi(this.bf, b), "gear"), i), "count", "Bushwhack Trap")); } return $s; })());
      extraE = (((p.leg === "renekton") && (p.P >= 2) && (p.runes >= 6)) ? 2 : 0);
      [rE, rP] = $it(this.reserve(p));
      if ($T($ga(p, "nores", false))) {
        [rE, rP] = $it([0, 0]);
      }
      rP = $iadd(rP, ((p.leg === "kaisa") ? p.spellP : 0));
      hold_std = $AND((p.ai >= 5), () => $AND($cm(FEAT, "get", "jstd", true), () => $AND((p.leg === "jarvan"), () => $AND(!$T(p.jleg), () => $AND($in("Demacian Standard", p.hand), () => $AND((() => { for (const u of $it(p.units)) { if ((u.name === "Jarvan IV, Martial Paragon")) return true; } return false; })(), () => (() => { for (const b of $it($range(2))) { if (($T(this.units_at((1 - i), b)) && $T(this.units_at(i, b)))) return true; } return false; })()))))));
      if (($T($gi(FUZZFIX, 0)) && !$T(hold_std) && (p.ai >= 3) && ($in("Onslaught", p.hand) || $in("Onslaught", p.trash)))) {
        rdy_ = (() => { const $r = []; for (const u of $it(p.units)) { if ((!$T(u.exhausted) && (u.might(this) > 0))) { $r.push(u); } } return $r; })();
        for (b_ of $it($range(2))) {
          f_ = this.units_at((1 - i), b_);
          if (($T(f_) && $T(rdy_) && ((this.strength_att(rdy_) <= this.strength_def(f_)) && (this.strength_def(f_) < (this.strength_att(rdy_) + 6))))) {
            rE = $max(rE, 4);
            break;
          }
        }
      }
      if ($T(hold_std)) {
        rE = $max(rE, 2);
        rP = $max(rP, 2);
        opts = (() => { const $r = []; for (const o_ of $it(opts)) { if (($gi(pool, $gi(o_, 0)) !== "Demacian Standard")) { $r.push(o_); } } return $r; })();
      }
      if (($T($ga(p, "res2", $gi(RES2, 0))) && (p.ai >= 4) && !$T(hold_std) && ($T(rE) || $T(rP)) && $eq(_loop, 0) && $T(this.reactive_cards(p)))) {
        sp_ = ((p.leg === "kaisa") ? p.spellP : 0);
        r_ = this.reactive_cards(p);
        bc_ = $max(r_, $kw({"key": ((c) => [$cm(REACT_VAL, "get", c, $cm(PROTECT, "get", c, 3)), (-$gi($gi(CARDS, c), "e"))])}));
        rv_ = $cm(REACT_VAL, "get", bc_, $cm(PROTECT, "get", bc_, 3));
        exposed_ = ((() => { for (const u of $it(p.units)) { if ((u.loc !== "base")) return true; } return false; })() || (() => { for (const b of $it(this.bf)) { if ($eq($gi(b, "ctrl"), i)) return true; } return false; })());
        fc_ = this.knap(opts, $max(0, $add(p.E, extraE)), $max(0, $sub(p.P, sp_)), $max(0, slots));
        rc_ = this.knap(opts, $max(0, $sub($add(p.E, extraE), rE)), $max(0, $sub(p.P, rP)), $max(0, slots));
        vf_ = (() => { let $s = 0; for (const o_ of $it(opts)) { if ($in([$gi(o_, 0), $gi(o_, 1)], (() => { const $r = []; for (const [k, kd] of $it(fc_)) { $r.push([k, kd]); } return $r; })())) { $s += $num($gi(o_, 4)); } } return $s; })();
        vr_ = (() => { let $s = 0; for (const o_ of $it(opts)) { if ($in([$gi(o_, 0), $gi(o_, 1)], (() => { const $r = []; for (const [k, kd] of $it(rc_)) { $r.push([k, kd]); } return $r; })())) { $s += $num($gi(o_, 4)); } } return $s; })();
        if ((!$T(exposed_) || ($sub(vf_, vr_) > $mul($ga(p, "res_k", $gi(RES_K, 0)), rv_)))) {
          [rE, rP] = $it([0, sp_]);
        }
      }
      choice = this.knap(opts, $max(0, $sub($add(p.E, extraE), rE)), $max(0, $sub(p.P, rP)), $max(0, slots));
      if (((p.ai >= 4) && $T($gi(BLUFF, 0)) && $eq(rE, 0) && $T(foe.units) && ($len(p.hand) >= 2) && $eq(_loop, 0))) {
        full = (() => { let $s = 0; for (const o_ of $it(opts)) { if ($in([$gi(o_, 0), $gi(o_, 1)], (() => { const $r = []; for (const [k, kd] of $it(choice)) { $r.push([k, kd]); } return $r; })())) { $s += $num($gi(o_, 4)); } } return $s; })();
        bE = ((p.E >= 4) ? 2 : 1);
        bc = this.knap(opts, $max(0, $sub($add(p.E, extraE), bE)), $max(0, $sub(p.P, rP)), $max(0, slots));
        bv = (() => { let $s = 0; for (const o_ of $it(opts)) { if ($in([$gi(o_, 0), $gi(o_, 1)], (() => { const $r = []; for (const [k, kd] of $it(bc)) { $r.push([k, kd]); } return $r; })())) { $s += $num($gi(o_, 4)); } } return $s; })();
        believable = (() => { for (const c of $it(p.deck)) { if ((($in(c, REACT_VAL) || $in(c, AMBUSH) || $in(c, PROTECT)) && ($gi($gi(CARDS, c), "e") <= bE))) return true; } return false; })();
        exposed = ((() => { for (const b of $it($range(2))) { if (($eq($gi($gi(this.bf, b), "ctrl"), i) && $T(this.units_at(i, b)))) return true; } return false; })() && (() => { for (const u of $it(foe.units)) { if ((u.loc === "base")) return true; } return false; })());
        if (($T(believable) && $T(exposed) && ($sub(full, bv) <= $gi(BLUFF_COST, 0)) && (this.rng.random() < 0.7))) {
          choice = bc;
          { const $t84 = p; $t84.bluffs = ($t84.bluffs + 1); }
        }
      }
      if (!$T(choice)) {
        break;
      }
      if ((($len(choice) > 1) && $T(this.slip(p)))) {
        choice = $sl(choice, null, (-1));
      }
      items = $sorted((() => { const $r = []; for (const [k, kind] of $it(choice)) { $r.push([$gi(pool, k), kind]); } return $r; })(), $kw({"key": ((x) => [($gi($gi(CARDS, $gi(x, 0)), "t") !== "Unit"), $gi($gi(CARDS, $gi(x, 0)), "e")])}));
      drew = false;
      for ([c, kind] of $it(items)) {
        if ((!$in(c, p.hand) && !$in(c, p.champ))) {
          continue;
        }
        if ((kind === "hide")) {
          if (((p.P < 1) || !$T(ctrl))) {
            continue;
          }
          if ($T($gi(RULES33, 0))) {
            cap = ((b_) => ((($gi($gi(this.bf, b_), "name") === "Bandle Tree") || $in("Bushwhack Trap", $gi($gi($gi(this.bf, b_), "gear"), i))) ? 2 : 1));
            free_ = (() => { const $r = []; for (const b_ of $it(ctrl)) { if (($len((() => { const $r = []; for (const h of $it(p.hidden)) { if ($eq($gi(h, 1), b_)) { $r.push(h); } } return $r; })()) < cap(b_))) { $r.push(b_); } } return $r; })();
            if (!$T(free_)) {
              continue;
            }
            dest_ = $gi(free_, 0);
            if (($T($gi(PB, 0)) && (c === "Tornado Warrior"))) {
              dest_ = $max(free_, $kw({"key": ((b_) => (() => { for (const x of $it(this.units_at(i, b_))) { if (((x.name === "Steel Paws") && !$T(x.pw))) return true; } return false; })())}));
            }
          } else {
            dest_ = ((($len((() => { const $r = []; for (const h of $it(p.hidden)) { if ($eq($gi(h, 1), $gi(ctrl, 0))) { $r.push(h); } } return $r; })()) === 0) || ($len(ctrl) === 1)) ? $gi(ctrl, 0) : $gi(ctrl, (-1)));
          }
          { const $t85 = p; $t85.P = ($t85.P - 1); }
          { const $t86 = p; $t86.runes = ($t86.runes - 1); }
          $cm(p.hand, "remove", c);
          $cm(p.plays, "append", [p.tn, $add("hide ", c)]);
          $cm(p.hidden, "append", [c, dest_, this.turn_no]);
          if (($gi($gi(this.bf, $gi(ctrl, 0)), "name") === "Bandle Scouts' Academy")) {
            this.gain_gold(p);
          }
          continue;
        }
        cd = $gi(CARDS, c);
        [e, pw] = $it([$gi(cd, "e"), $gi(cd, "p")]);
        if (($T($gi(FEAT16, "rules2")) && (c === "Noxus Hopeful") && (() => { for (const [t_, _] of $it(p.plays)) { if ($eq(t_, p.tn)) return true; } return false; })())) {
          e = $max(0, (e - 2));
        }
        if ((c === "Rhasa the Sunderer")) {
          e = $max(0, (e - $len(p.trash)));
        }
        if (((c === "Keeper of Law") && (() => { for (const b_ of $it($range(2))) { if ($eq($gi($gi(this.bf, b_), "ctrl"), i)) { if (($len(this.units_at(i, b_)) === 2)) return true; } } return false; })())) {
          e = $max(0, (e - 2));
          pw = $max(0, (pw - 1));
        }
        if ((($gi(cd, "t") === "Gear") && (() => { for (const u of $it(p.units)) { if (((u.name === "Orianna, Mechanical Marvel") && (u.loc !== "base"))) return true; } return false; })() && (!$T($gi(AUDIT, 0)) || !$eq($ga(p, "omm_tn", (-1)), this.turn_no)))) {
          e = $max(0, (e - 1));
          if ($T($gi(AUDIT, 0))) {
            pw = $max(0, (pw - 1));
            p.omm_tn = this.turn_no;
          }
        }
        if ((c === "Skystrike Squadron")) {
          rg = (() => { for (const b_ of $it(this.bf)) { for (const x of $it(["Demacian Standard", "Pillaged Armory", "Concert Poster"])) { if ($in(x, $gi($gi(b_, "gear"), i))) { return [b_, x]; } } } return null; })();
          if (($T(rg) && (p.E < e))) {
            $cm($gi($gi($gi(rg, 0), "gear"), i), "remove", $gi(rg, 1));
            $cm(p.hand, "append", $gi(rg, 1));
            e = (e - 2);
          }
        }
        if (((e > p.E) && (p.leg === "renekton") && ($gi(cd, "t") === "Unit") && ($sub(p.P, pw) >= 2) && (p.runes >= 6) && (e <= (p.E + 2)))) {
          { const $t87 = p; $t87.P = ($t87.P - 2); }
          { const $t88 = p; $t88.runes = ($t88.runes - 2); }
          { const $t89 = p; $t89.E = ($t89.E + 2); }
        }
        if (!(this.can_pay(p, e, pw, c))) {
          continue;
        }
        this.pay(p, e, pw, c);
        if ($in(c, p.champ)) {
          $cm(p.champ, "remove", c);
          p.kemp = true;
        } else {
          $cm(p.hand, "remove", c);
        }
        drew = $bor(drew, this.resolve(i, c));
      }
      if (!$T(drew)) {
        break;
      }
    }
    for (eqc of $it($sorted($list(p.loose_eq), $kw({"key": ((x) => (-$gi($gi($gi(CARDS, x), "eq"), "bonus")))})))) {
      real = (() => { const $r = []; for (const u of $it(p.units)) { if ((!$T(u.token) || ($T($gi(AZ, 0)) && (u.name === "Sand Soldier")))) { $r.push(u); } } return $r; })();
      q = $gi($gi(CARDS, eqc), "eq");
      if (($T($gi(AZ, 0)) && (p.leg === "azir") && (p.runes < 6) && ($gi(q, "p") > 0))) {
        continue;
      }
      if ((!$T(real) || !(this.can_pay(p, $gi(q, "e"), $gi(q, "p"))))) {
        continue;
      }
      sc = (u) => {
        let b;
        if ((eqc === "Nazuman Ntofo")) {
          return [u.shield(this), 0];
        }
        b = u.might(this);
        return [((b < 5) && (5 <= $add(b, $gi(q, "bonus")))), b];
      };
      u = $max(real, $kw({"key": sc}));
      before = u.might(this);
      this.pay(p, $gi(q, "e"), $gi(q, "p"));
      $cm(u.eq, "append", eqc);
      $cm(p.loose_eq, "remove", eqc);
      u.brut_tn = this.turn_no;
      this.mighty_check(i, u, before);
    }
    if ($T($gi(PB2, 0))) {
      while (($in("Treasure Trove", p.base_gear) && this.can_pay(p, 0, 1, "Treasure Trove") && ($sub(p.E, $gi(this.reserve(p), 0)) >= 0) && ($len(p.hand) <= 4))) {
        $cm(p.base_gear, "remove", "Treasure Trove");
        $cm(p.trash, "append", "Treasure Trove");
        this.pay(p, 0, 1, "Treasure Trove");
        this.draw(p);
        { const $t90 = p; $t90.pending = ($t90.pending + 1); }
      }
      if (($in("Pack of Wonders", p.base_gear) && !$eq($ga(p, "pack_tn", (-1)), this.turn_no))) {
        rb = (() => { const $r = []; for (const u of $it(p.units)) { if (($in(u.name, ["Bewitching Spirit", "Fizz, Trickster"]) && (u.loc === "base") && $T(u.exhausted))) { $r.push(u); } } return $r; })();
        if (($T(rb) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 1))) {
          p.pack_tn = this.turn_no;
          u_ = $gi(rb, 0);
          $cm(p.units, "remove", u_);
          $cm(p.hand, "append", u_.name);
        }
      }
    }
    for (u of $it(p.units)) {
      da = (($T($gi(AUDIT, 0)) && (u.loc !== "base") && ($gi($gi(this.bf, u.loc), "name") === "Risen Altar")) ? 1 : 0);
      if ((u.name === "Kayle, Justified")) {
        alt = (() => { for (const b of $it($range(2))) { if (($gi($gi(this.bf, b), "name") === "Risen Altar")) return true; } return false; })();
        while (((u.emp < 6) && ($sub(p.E, $gi(this.reserve(p), 0)) >= (3 - da)))) {
          before = u.might(this);
          { const $t91 = p; $t91.E = ($t91.E - (3 - da)); }
          { const $t92 = u; $t92.emp = ($t92.emp + 2); }
          this.mighty_check(i, u, before);
          if ((p.leg === "ambessa")) {
            p.ambE = true;
          }
        }
      }
      freeE = $sub(p.E, $gi(this.reserve(p), 0));
      if (((u.name === "Noxian Emissary") && !$T(u.pw) && (freeE >= 1) && this.can_pay(p, 1, 1, u.name))) {
        this.pay(p, 1, 1, u.name);
        u.pw = true;
        if ((p.leg === "ambessa")) {
          p.ambE = true;
        }
      }
      if (($T($gi(AUDIT, 0)) && (u.name === "Shadow Fiend") && !$T(u.pw) && (freeE >= (2 - da)) && this.can_pay(p, (2 - da), 1, u.name))) {
        before = u.might(this);
        this.pay(p, (2 - da), 1, u.name);
        u.pw = true;
        this.mighty_check(i, u, before);
      } else if (($in(u.name, ["Brutal Hunter", "Serene Ascetic", "Shadow Fiend", "Mournful Witness"]) && !$T(u.pw) && (freeE >= (3 - da)) && !($T($gi(AUDIT, 0)) && (u.name === "Shadow Fiend")))) {
        before = u.might(this);
        { const $t93 = p; $t93.E = ($t93.E - (3 - da)); }
        u.pw = true;
        if ((p.leg === "ambessa")) {
          p.ambE = true;
        }
        if ((u.name === "Brutal Hunter")) {
          u.emp = 2;
        }
        this.mighty_check(i, u, before);
      } else if (($in(u.name, ["Ambessa, The Wolf", "Aurok General"]) && !$T(u.pw) && (freeE >= (3 - da)) && this.can_pay(p, (3 - da), 1, u.name))) {
        before = u.might(this);
        this.pay(p, (3 - da), 1, u.name);
        u.pw = true;
        if ((p.leg === "ambessa")) {
          p.ambE = true;
        }
        if ((u.name === "Ambessa, The Wolf")) {
          u.emp = 3;
        }
        this.mighty_check(i, u, before);
      }
      if (($T($gi(META25, 0)) && (u.name === "Steel Paws") && !$T(u.pw) && ($sub(p.E, $gi(this.reserve(p), 0)) >= (7 - da)))) {
        before = u.might(this);
        { const $t94 = p; $t94.E = ($t94.E - (7 - da)); }
        u.pw = true;
        if ((p.leg === "ambessa")) {
          p.ambE = true;
        }
        this.mighty_check(i, u, before);
      }
      if (((u.name === "Legion Marauder") && $eq(u.emp, 0) && (p.E >= (1 - da)))) {
        { const $t95 = p; $t95.E = ($t95.E - (1 - da)); }
        u.emp = 1;
        if ((p.leg === "ambessa")) {
          p.ambE = true;
        }
      }
      if (($T($gi(FEAT16, "rules2")) && (u.name === "Akali, Deadly Weapon") && !$T(u.pw) && ($sub(p.E, $gi(this.reserve(p), 0)) >= (2 - da)) && this.can_pay(p, (2 - da), 1, u.name))) {
        this.pay(p, (2 - da), 1, u.name);
        u.pw = true;
        { const $t96 = u; $t96.emp = ($t96.emp + 1); }
      }
      if (($T($gi(FEAT16, "cards")) && (u.name === "Ambessa, Respected and Feared") && !$T(u.pw) && ($sub(p.E, $gi(this.reserve(p), 0)) >= (1 - da)) && this.can_pay(p, (1 - da), 2, u.name))) {
        this.pay(p, (1 - da), 2, u.name);
        u.pw = true;
        if ((p.leg === "ambessa")) {
          p.ambE = true;
        }
      }
    }
    for (u of $it($list(p.units))) {
      if (((u.name === "Tail-Cloaked Matriarch") && $eq(u.emp, 0) && this.can_pay(p, 2, 1, u.name))) {
        cand = (() => { const $r = []; for (const c of $it(p.trash)) { if ((($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Unit") && ($gi($gi(CARDS, c), "e") <= 3) && ($gi($gi(CARDS, c), "p") <= 1))) { $r.push(c); } } return $r; })();
        if ($T(cand)) {
          c = $max(cand, $kw({"key": ((x) => $gi($gi(CARDS, x), "m"))}));
          this.pay(p, 2, 1, u.name);
          u.emp = 1;
          $cm(p.trash, "remove", c);
          this.place_unit(i, c, "base");
          p.kemp = true;
        }
      }
    }
    if (($in("Sabotage", p.hand) && this.can_pay(p, 1, 1, "Sabotage"))) {
      o = $gi(this.P, (1 - i));
      nu = (() => { const $r = []; for (const c of $it(o.hand)) { if (($gi($gi(CARDS, c), "t") !== "Unit")) { $r.push(c); } } return $r; })();
      best = ($T(nu) ? $max(nu, $kw({"key": ((c) => [($in(c, REMOVAL) || $in(c, PROTECT) || $in(c, REACT_VAL)), $gi($gi(CARDS, c), "e")])})) : null);
      if (((best != null) && $T($gi(AI36, 0)) && !((($in(best, REMOVAL) || $in(best, PROTECT) || $in(best, REACT_VAL)) && ($gi($gi(CARDS, best), "e") >= 2))))) {
        best = null;
      }
      if ((best != null)) {
        if ($T(this.cast(p, "Sabotage", 1, 1))) {
          $cm(o.hand, "remove", best);
          $cm(o.deck, "insert", 0, best);
          if (this.v) this.say(`  ${$str(p.name)} Sabotages ${$str(best)}`);
        }
      }
    }
    while (($in("Lightning Rush", p.trash) && this.can_pay(p, 2, 1, "Lightning Rush"))) {
      $cm(p.trash, "remove", "Lightning Rush");
      this.pay(p, 2, 1, "Lightning Rush");
      this.draw(p);
      p.kemp = true;
      for (_ of $it($range(2))) {
        if ($T(p.deck)) {
          $cm(p.trash, "append", $cm(p.deck, "pop"));
        }
      }
    }
    if (($in("Time Warp", p.hand) && this.can_pay(p, 10, 4, "Time Warp") && ($len((() => { const $r = []; for (const u of $it(p.units)) { if (!$T(u.exhausted)) { $r.push(u); } } return $r; })()) >= 2))) {
      if ($T(this.cast(p, "Time Warp", 10, 4, false))) {
        p.extra = true;
        if (this.v) this.say(`  ${$str(p.name)} casts Time Warp`);
      }
    }
    if (($T($gi(SMART, 0)) && $in("Resplendent Rostrum", p.base_gear) && !$eq($ga(p, "rost_tn", (-1)), this.turn_no))) {
      this.draw(p);
      { const $t97 = p; $t97.pending = ($t97.pending + 1); }
      if ($T($gi(FEAT16, "rules2"))) {
        rdy = (() => { const $r = []; for (const x of $it(p.units)) { if ((!$T(x.exhausted) && (x.might(this) > 0))) { $r.push(x); } } return $r; })();
        if ($T(rdy)) {
          { const $t98 = $max(rdy, $kw({"key": ((x) => x.might(this))})); $t98.temp = ($t98.temp + 3); }
        }
      }
    }
    if (((p.leg === "ziggs") && this.can_pay(p, 1, 1))) {
      tgt = (() => { const $r = []; for (const bi of $it($range(2))) { if ($T(this.units_at((1 - i), bi))) { $r.push(bi); } } return $r; })();
      if ($T(tgt)) {
        this.pay(p, 1, 1);
        { const $t99 = $gi($gi(this.bf, $gi(tgt, 0)), "bombs"), $t100 = i; $si($t99, $t100, ($gi($t99, $t100) + 1)); }
        if (this.v) this.say(`  ${$str(p.name)} places a Bomb`);
      }
    }
    if (($T($gi(SATCHEL, 0)) && $in("Satchel Charge", p.hand) && this.can_pay(p, 3, 1, "Satchel Charge"))) {
      openb = (() => { const $r = []; for (const b_ of $it($range(2))) { if ((!$eq($gi($gi(this.bf, b_), "ctrl"), i) && !$T(this.units_at((1 - i), b_)) && !$T(this.units_at(i, b_)))) { $r.push(b_); } } return $r; })();
      mv = (() => { const $r = []; for (const x of $it(p.units)) { if (((x.loc === "base") && $T(x.exhausted) && (x.might(this) > 0))) { $r.push(x); } } return $r; })();
      if (($T(openb) && $T(mv))) {
        x = $max(mv, $kw({"key": ((y) => y.might(this))}));
        if ($T(this.cast(p, "Satchel Charge", 3, 1))) {
          $cm(p.plays, "append", [p.tn, "Satchel Charge"]);
          if (true) {
            x.loc = $gi(openb, 0);
            if (this.v) this.say(`  ${$str(p.name)}'s Satchel Charge moves ${$str(x.name)} to ${$str($gi($gi(this.bf, $gi(openb, 0)), "name"))}`);
            tb = $gi($sorted($range(2), $kw({"key": ((b_) => [(-$len(this.units_at((1 - i), b_))), (-$gi($gi($gi(this.bf, b_), "bombs"), i))])})), 0);
            { const $t101 = $gi($gi(this.bf, tb), "bombs"), $t102 = i; $si($t101, $t102, ($gi($t101, $t102) + 1)); }
          }
        }
      }
    }
    for (c of $it($list(p.hand))) {
      if (($in(c, BOMB_KILLERS) && (() => { for (const b of $it($range(2))) { if (($T($gi($gi($gi(this.bf, b), "bombs"), i)) && $T(this.units_at((1 - i), b)))) return true; } return false; })() && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
        b = $gi((() => { const $r = []; for (const b of $it($range(2))) { if (($T($gi($gi($gi(this.bf, b), "bombs"), i)) && $T(this.units_at((1 - i), b)))) { $r.push(b); } } return $r; })(), 0);
        $cm(p.hand, "remove", c);
        this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
        $cm(p.trash, "append", c);
        if (this.v) this.say(`  ${$str(p.name)} pops Bombs with ${$str(c)}`);
        nb_ = $gi($gi($gi(this.bf, b), "bombs"), i);
        this.bomb_pop(i, b, ((c === "Hexplosive Minefield") ? 99 : 1));
        if ((c === "Detonate")) {
          this.draw(p, 2);
        }
        if ((c === "An Offer You Can't Refuse")) {
          this.gain_gold(p);
        }
        if ((c === "Hexplosive Minefield")) {
          { const $t103 = $gi($gi(this.bf, b), "bombs"), $t104 = i; $si($t103, $t104, $iadd($gi($t103, $t104), ($T($gi(FEAT16, "cards")) ? nb_ : 1))); }
        }
      }
    }
    if (($in("Dockside Lock-Up", p.hand) && this.can_pay(p, 6, 2, "Dockside Lock-Up"))) {
      [t, val] = $it(this.removal_target(i, "Dockside Lock-Up"));
      if (((t != null) && (val >= 5))) {
        $cm(p.hand, "remove", "Dockside Lock-Up");
        this.pay(p, 6, 2, "Dockside Lock-Up");
        bi = t.loc;
        $cm($gi($gi($gi(this.bf, bi), "gear"), i), "append", "Dockside Lock-Up");
        $si($gi(this.bf, bi), "banished", [t.name, (1 - i)]);
        if (this.v) this.say(`  ${$str(p.name)} Dockside banishes ${$str(t.name)}`);
        if ($T($gi(FEAT16, "cards"))) {
          this.banish(t, "(Dockside)");
        } else {
          this.kill(t, "Dockside");
        }
      }
    }
    for (bi of $it($range(2))) {
      if ((($gi($gi(this.bf, bi), "name") === "Black Market") && (p.P >= 2) && ((p.runes >= 7) || (!$T(p.hand) && (p.runes >= 4))))) {
        this.pay(p, 0, 2);
        this.draw(p);
      }
    }
  }
  knap(opts, E, P, slots) {
    let dp, k, kind, e, pw, v, new_, bit, key0, val, idx, used, ee, pp, hh, ne, np_, nh, key, best;
    dp = new PyDict([[0, [0, [], 0]]]);
    for ([k, kind, e, pw, v] of $it(opts)) {
      new_ = $dict(dp);
      bit = (1 << k);
      for ([key0, [val, idx, used]] of $it($cm(dp, "items"))) {
        if ($T((used & bit))) {
          continue;
        }
        ee = $floordiv(key0, 10000);
        pp = $mod($floordiv(key0, 100), 100);
        hh = $mod(key0, 100);
        [ne, np_, nh] = $it([$add(ee, e), $add(pp, pw), $add(hh, (kind === "hide"))]);
        if (((ne <= E) && (np_ <= P) && (nh <= slots))) {
          key = $add($add($mul(ne, 10000), $mul(np_, 100)), nh);
          if ((!$in(key, new_) || ($add(val, v) > $gi($gi(new_, key), 0)))) {
            $si(new_, key, [$add(val, v), $add(idx, [[k, kind]]), $bor(used, bit)]);
          }
        }
      }
      dp = new_;
    }
    best = $max($cm(dp, "items"), $kw({"key": ((kv) => [$gi($gi(kv, 1), 0), (-$mod($floordiv($gi(kv, 0), 100), 100))])}));
    return $list($gi($gi(best, 1), 1));
  }
  mighty_check(i, u, before) {
    let p;
    p = $gi(this.P, i);
    if (((before < 5) && (5 <= u.might(this)))) {
      if (((p.leg === "fiora") && !$T(p.mighty_leg_used))) {
        p.mighty_leg_used = true;
        { const $t105 = p; $t105.pending = ($t105.pending + 1); }
      }
      if (((() => { for (const x of $it(p.units)) { if ((x.name === "Fiora, Worthy")) return true; } return false; })() && this.can_pay(p, 0, 1, "Fiora, Worthy"))) {
        this.pay(p, 0, 1, "Fiora, Worthy");
        u.exhausted = false;
      }
    }
  }
  resolve(i, c) {
    let p, cd, drew, u, ak, a_, old_, tgt, use, free, beat, x, o_, dc, ef, foes, _, t_, others, tg, b0, ex, o, eqd, e, g_, occ, b, top4, ok, g, t, d, bb, al, sp, val, gs, wh, b_, dead, d_, bn, rdy, en, ex_, loc_, e_, k_, pf_, bi, mv, here, og, pool_, src_, q_i, q, top_, un, pick, nu, n_, new_, openb;
    p = $gi(this.P, i);
    cd = $gi(CARDS, c);
    drew = false;
    $cm(p.plays, "append", [p.tn, c]);
    if (($T($gi(RIP2, 0)) && ($gi(cd, "t") === "Spell") && ($add($gi(cd, "e"), $gi(cd, "p")) >= 3) && $T(this.riposte((1 - i), c)))) {
      $cm(p.trash, "append", c);
      return false;
    }
    if (($T($gi(RESP, 0)) && ($gi(cd, "t") === "Spell") && ($add($gi(cd, "e"), $mul(2, $gi(cd, "p"))) >= 3) && $T(this.counter_any((1 - i), c)))) {
      $cm(p.trash, "append", c);
      return false;
    }
    if (($gi(cd, "t") === "Unit")) {
      u = this.place_unit(i, c, "base");
      if (($T($gi(TIDE2, 0)) && (c === "Tideturner"))) {
        ak = (() => { const $r = []; for (const x of $it(p.units)) { if (((x.name === "Akali, Deadly Weapon") && (x.loc !== "base") && (() => { for (const e of $it($gi(this.P, (1 - i)).units)) { if (($eq(e.loc, x.loc) && !$T(e.protect) && !$in(e.name, UNTARGETABLE))) return true; } return false; })())) { $r.push(x); } } return $r; })();
        if ($T(ak)) {
          a_ = $gi(ak, 0);
          old_ = a_.loc;
          a_.loc = "base";
          u.loc = old_;
          if (this.v) this.say(`  ${$str(p.name)}'s Tideturner swaps with Akali`);
        }
      }
      if (((p.ai >= 2) && $in("Last Caress", p.hand) && this.can_pay(p, 2, 0, "Last Caress") && (u.might(this) >= 3))) {
        tgt = (() => { const $r = []; for (const b of $it($range(2))) { if ((!$T(this.units_at((1 - i), b)) && !$eq($gi($gi(this.bf, b), "ctrl"), i))) { $r.push(b); } } return $r; })();
        tgt = $OR(tgt, () => (() => { const $r = []; for (const b of $it($range(2))) { if ($eq($gi($gi(this.bf, b), "ctrl"), i)) { $r.push(b); } } return $r; })());
        if ($T(tgt)) {
          if ($T(this.cast(p, "Last Caress", 2, 0))) {
            u._loc = $gi(tgt, 0);
            if ($T($gi(FEAT16, "cards"))) {
              this.buff(u);
            } else {
              { const $t106 = u; $t106.emp = ($t106.emp + 1); }
            }
            if (this.v) this.say(`  ${$str(p.name)} Last Caress puts ${$str(c)} at ${$str($gi($gi(this.bf, $gi(tgt, 0)), "name"))}`);
          }
        }
      }
      if (($T($gi(cd, "accel")) && this.can_pay(p, 1, 1, c))) {
        use = true;
        if ((p.ai >= 5)) {
          free = (() => { for (const b of $it($range(2))) { if ((!$eq($gi($gi(this.bf, b), "ctrl"), i) && !$T(this.units_at((1 - i), b)))) return true; } return false; })();
          beat = (() => { for (const b of $it($range(2))) { if (($T(this.units_at((1 - i), b)) && ((u.might(this) + u.kw("assault")) > (() => { let $s = 0; for (const x of $it(this.units_at((1 - i), b))) { $s += $num((x.might(this) + x.shield(this))); } return $s; })()))) return true; } return false; })();
          use = $OR(free, () => $OR(beat, () => ($gi(this.P, (1 - i)).points >= 6)));
        }
        if ($T(use)) {
          this.pay(p, 1, 1, c);
          u.exhausted = false;
        }
      }
      if ($in(c, ["Seraphine, Not Alone"])) {
        this.token(i, "base");
      }
      if ((c === "Vanguard Captain")) {
        this.token(i, "base");
        this.token(i, "base");
      }
      if ($in(c, ["Mel, Newly Awakened"])) {
        this.draw(p);
        drew = true;
      }
      if ((c === "Lecturing Yordle")) {
        this.draw(p);
        drew = true;
      }
      if (($T($gi(PB2, 0)) && (c === "Undertitan"))) {
        for (x of $it(p.units)) {
          if ((x !== u)) {
            { const $t107 = x; $t107.temp = ($t107.temp + 2); }
          }
        }
      }
      if (($T($gi(PB2, 0)) && (c === "Bewitching Spirit") && $T($gi(this.P, (1 - i)).hand))) {
        o_ = $gi(this.P, (1 - i));
        dc = $min(o_.hand, $kw({"key": ((x) => $add($add($gi($gi(CARDS, x), "e"), $gi($gi(CARDS, x), "p")), (($in(x, REMOVAL) || $in(x, PROTECT)) ? 2 : 0)))}));
        $cm(o_.hand, "remove", dc);
        $cm(o_.trash, "append", dc);
      }
      for (ef of $it($cm(GEN, "get", c, []))) {
        if (($gi(ef, 0) === "draw")) {
          this.draw(p, $gi(ef, 1));
          drew = true;
        } else if (($gi(ef, 0) === "dmg")) {
          foes = $OR((() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if (((x.might(this) - x.dmg) <= $gi(ef, 1))) { $r.push(x); } } return $r; })(), () => $gi(this.P, (1 - i)).units);
          if ($T(foes)) {
            this.deal($max(foes, $kw({"key": ((x) => x.might(this))})), $gi(ef, 1), c);
          }
        } else if (($gi(ef, 0) === "kill_le")) {
          foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((x.might(this) <= $gi(ef, 1))) { $r.push(x); } } return $r; })();
          if ($T(foes)) {
            this.kill($max(foes, $kw({"key": ((x) => x.might(this))})), c);
          }
        } else if (($gi(ef, 0) === "tok")) {
          for (_ of $it($range($gi(ef, 1)))) {
            t_ = this.token(i, u.loc);
            t_.base = $gi(ef, 2);
          }
        } else if (($gi(ef, 0) === "buff")) {
          this.buff(u);
        } else if (($gi(ef, 0) === "gold")) {
          this.gain_gold(p);
        } else if (($gi(ef, 0) === "chan")) {
          { const $t108 = p; $t108.pending = $iadd($t108.pending, $gi(ef, 1)); }
        }
      }
      if ((c === "Scuttle Crab")) {
        this.draw(p);
        drew = true;
      }
      if (($T($gi(PB, 0)) && $in(c, MECHS) && (() => { for (const x of $it(p.units)) { if ((x.name === "Forecaster")) return true; } return false; })())) {
        this.vision(p);
      }
      if ((c === "Elnuk Herd")) {
        others = (() => { const $r = []; for (const x of $it(p.units)) { if ((x !== u)) { $r.push(x); } } return $r; })();
        if ($T(others)) {
          { const $t109 = $max(others, $kw({"key": ((x) => x.might(this))})); $t109.temp = ($t109.temp + 3); }
        }
      }
      if ((c === "Profiteer")) {
        tg = $OR((() => { const $r = []; for (const x of $it(p.units)) { if (((x.name === "Kayle, Justified") && (x.emp < 6))) { $r.push(x); } } return $r; })(), () => (() => { const $r = []; for (const x of $it(p.units)) { if (($in(x.name, ["Ambessa, The Wolf", "Brutal Hunter", "Aurok General"]) && !$T(x.pw))) { $r.push(x); } } return $r; })());
        if ($T(tg)) {
          x = $gi(tg, 0);
          b0 = x.might(this);
          if ((x.name === "Kayle, Justified")) {
            { const $t110 = x; $t110.emp = ($t110.emp + 2); }
          } else {
            x.pw = true;
            x.emp = $cm(new PyDict([["Ambessa, The Wolf", 3], ["Brutal Hunter", 2]]), "get", x.name, 0);
          }
          if ((p.leg === "ambessa")) {
            p.ambE = true;
          }
          this.mighty_check(i, x, b0);
        }
      }
      if ((c === "Ocean Drake")) {
        foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((!$T(x.token) && !($T($gi(AUDIT, 0)) && ($in(x.name, DRAGONS) || $in(x.name, UNTARGETABLE) || $T(x.protect))))) { $r.push(x); } } return $r; })();
        if ($T(foes)) {
          this.bounce($max(foes, $kw({"key": ((x) => x.might(this))})));
        }
      }
      if (((c === "Clockwork Keeper") && this.can_pay(p, 0, 1, c))) {
        this.pay(p, 0, 1, c);
        this.draw(p);
        drew = true;
      }
      if ((c === "First Mate")) {
        ex = (() => { const $r = []; for (const x of $it(p.units)) { if (($T(x.exhausted) && (x !== u))) { $r.push(x); } } return $r; })();
        if ($T(ex)) {
          $max(ex, $kw({"key": ((x) => x.might(this))})).exhausted = false;
        }
      }
      if ((c === "Sandshifter")) {
        foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if (((x.might(this) <= 3) && !$in(x.name, UNTARGETABLE) && !($T($gi(RULES34, 0)) && ($T(x.protect) || $T(this.wild_safe(x)))))) { $r.push(x); } } return $r; })();
        if ($T(foes)) {
          this.kill($max(foes, $kw({"key": ((x) => [(x.loc !== "base"), x.might(this)])})), "Sandshifter");
        }
      }
      if ((c === "Stalwart Goatherd")) {
        o = $gi(this.P, (1 - i));
        eqd = (() => { const $r = []; for (const x of $it(o.units)) { if ((() => { for (const e of $it(x.eq)) { if (($gi($gi(CARDS, e), "e") <= 4)) return true; } return false; })()) { $r.push(x); } } return $r; })();
        if ($T(eqd)) {
          x = $max(eqd, $kw({"key": ((y) => y.might(this))}));
          e = $max((() => { const $r = []; for (const e of $it(x.eq)) { if (($gi($gi(CARDS, e), "e") <= 4)) { $r.push(e); } } return $r; })(), $kw({"key": ((e) => $gi($gi($gi(CARDS, e), "eq"), "bonus"))}));
          $cm(x.eq, "remove", e);
          $cm(o.trash, "append", e);
        } else if ((o.seal > 0)) {
          { const $t111 = o; $t111.seal = ($t111.seal - 1); }
        } else if ($T(o.base_gear)) {
          g_ = $cm(o.base_gear, "pop");
          $cm(o.trash, "append", g_);
          this.gear_left(o, g_);
        }
      }
      if ((c === "The Empyrean")) {
        this.draw(p, 2);
        drew = true;
      }
      if ((c === "Kennen, Storm of Shuriken")) {
        for (_ of $it($range(2))) {
          if ($T(p.deck)) {
            $cm(p.trash, "append", $cm(p.deck, "pop"));
          }
        }
      }
      if ((c === "Thousand-Tailed Watcher")) {
        for (x of $it($gi(this.P, (1 - i)).units)) {
          { const $t112 = x; $t112.temp = $sub($t112.temp, $min(3, $max(0, (x.might(this) - 1)))); }
        }
      }
      if ((c === "Ezreal, Prodigy")) {
        this.draw(p, 2);
        $AND(p.hand, () => $cm(p.hand, "remove", $max(p.hand, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}))));
        drew = true;
      }
      if (((c === "Patched Porobot") && ($len(this.all_gear(i)) >= 3))) {
        this.draw(p);
        drew = true;
      }
      if (((c === "Sea Monkey") && (p.E >= 1))) {
        { const $t113 = p; $t113.E = ($t113.E - 1); }
        this.buff(u);
      }
      if ((c === "Buhru Captain")) {
        this.draw(p);
        drew = true;
      }
      if ((c === "Fae Dragon")) {
        for (x of $it($sl($sorted((() => { const $r = []; for (const x of $it(p.units)) { if (!$T(x.buffed)) { $r.push(x); } } return $r; })(), $kw({"key": ((x) => (-x.might(this)))})), null, 4))) {
          this.buff(x);
        }
      }
      if ((c === "Sett, Brawler")) {
        this.buff(u);
      }
      if (((c === "Masa, Crashing Thunder") && this.can_pay(p, 0, 1, c))) {
        foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((x.loc !== "base")) { $r.push(x); } } return $r; })();
        if ($T(foes)) {
          this.pay(p, 0, 1, c);
          $max(foes, $kw({"key": ((x) => x.might(this))})).stun = true;
        }
      }
      if ((c === "Dauntless Vanguard")) {
        occ = (() => { const $r = []; for (const b of $it($range(2))) { if ($T(this.units_at((1 - i), b))) { $r.push(b); } } return $r; })();
        if ($T(occ)) {
          b = $min(occ, $kw({"key": ((x) => (() => { let $s = 0; for (const y of $it(this.units_at((1 - i), x))) { $s += $num((y.might(this) + y.shield(this))); } return $s; })())}));
          if (((() => { let $s = 0; for (const y of $it(this.units_at((1 - i), b))) { $s += $num((y.might(this) + y.shield(this))); } return $s; })() < (u.might(this) + 2))) {
            u._loc = b;
            u.jmove = true;
            p.bfplay_tn = this.turn_no;
          }
        }
      }
      if ((c === "Trifarian Captain")) {
        top4 = $sl(p.deck, (-4), null);
        $dsl(p.deck, (-4), null);
        ok = (() => { const $r = []; for (const x of $it(top4)) { if (($in($gi($gi(CARDS, x), "t"), ["Unit", "Gear"]) && ($gi($gi(CARDS, x), "e") <= 3) && (($gi($gi(CARDS, x), "p") <= 1) || !$T($gi(FEAT16, "rules2"))))) { $r.push(x); } } return $r; })();
        if ($T(ok)) {
          g = $max(ok, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
          $cm(top4, "remove", g);
          $cm(p.hand, "append", g);
          drew = true;
        }
        if ($T($gi(FEAT16, "rules2"))) {
          $ssl(p.deck, 0, 0, top4);
        } else {
          $cm(p.deck, "extend", top4);
        }
      }
      if ((c === "Riptide Mage")) {
        foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((x.loc !== "base")) { $r.push(x); } } return $r; })();
        if ($T(foes)) {
          t = $max(foes, $kw({"key": ((x) => x.might(this))}));
          { const $t114 = t; $t114.temp = ($t114.temp - 3); }
          if (((t.might(this) <= 0) && !$T($gi(FEAT16, "rules2")))) {
            this.kill(t, "Riptide");
          }
        }
      }
      if (((c === "Mordekaiser, Dominating") && $T(p.hand))) {
        [t, _] = $it(this.removal_target(i, "Hidden Blade"));
        if ($T(t)) {
          d = $min(p.hand, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
          $cm(p.hand, "remove", d);
          $cm(p.trash, "append", d);
          this.kill(t, "Mordekaiser");
        }
      }
      if ($in(c, ["Amateur Demolitionist", "Ziggs, Short-Fused"])) {
        tgt = $OR((() => { const $r = []; for (const bi of $it($range(2))) { if ($T(this.units_at((1 - i), bi))) { $r.push(bi); } } return $r; })(), () => [0]);
        { const $t115 = $gi($gi(this.bf, $gi(tgt, 0)), "bombs"), $t116 = i; $si($t115, $t116, ($gi($t115, $t116) + 1)); }
      }
      if ((c === "Shimmering Swimmer")) {
        foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((x.loc !== "base")) { $r.push(x); } } return $r; })();
        bb = (() => { const $r = []; for (const b of $it($range(2))) { if ($T($gi($gi($gi(this.bf, b), "bombs"), i))) { $r.push(b); } } return $r; })();
        if (($T(foes) && $T(bb))) {
          this.bomb_pop(i, $gi(bb, 0), 1);
          foes = (() => { const $r = []; for (const x of $it(foes)) { if ($in(x, $gi(this.P, (1 - i)).units)) { $r.push(x); } } return $r; })();
          if ($T($gi(AUDIT, 0))) {
            al = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((!$in(x.name, UNTARGETABLE) && !$T(x.protect))) { $r.push(x); } } return $r; })();
            ok = (() => { const $r = []; for (const x of $it(al)) { if (((x.might(this) - x.dmg) <= 2)) { $r.push(x); } } return $r; })();
            t_ = ($T(ok) ? $max(ok, $kw({"key": ((x) => [(x.loc !== "base"), x.might(this), !$T(x.token)])})) : ($T(al) ? $max(al, $kw({"key": ((x) => x.might(this))})) : null));
            if ((t_ != null)) {
              this.deal(t_, 2, "Swimmer");
            }
          } else if ($T(foes)) {
            this.deal($max(foes, $kw({"key": ((x) => (x.might(this) <= 2))})), 2, "Swimmer");
          }
        }
      }
      if ((c === "Fizz, Trickster")) {
        for (sp of $it(["Ruthless Strike", "Wind and Ghosts", "Consuming Curse", "Lacerate", "Lost to the Sands", "Burn Away", "Hextech Ray", "Falling Star", "Rebuke", "Gust", "Star-Crossed", "Bellows Breath"])) {
          if ($in(sp, p.trash)) {
            [t, val] = $it(this.removal_target(i, sp));
            if ((t != null)) {
              if (!(this.can_pay(p, 0, $gi($gi(CARDS, sp), "p"), sp))) {
                continue;
              }
              this.pay(p, 0, $gi($gi(CARDS, sp), "p"), sp);
              p.kemp = true;
              $cm(p.trash, "remove", sp);
              if (this.v) this.say(`  ${$str(p.name)}'s Fizz recasts ${$str(sp)}`);
              this.cast_removal(i, sp, t);
              if ($T($gi(FEAT16, "cards"))) {
                $cm(p.deck, "insert", 0, sp);
              } else {
                $cm(p.trash, "append", sp);
              }
              break;
            }
          }
        }
      }
      if ((c === "Bilgewater Tracker")) {
        foes = $sorted((() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if (!($T($gi(AUDIT, 0)) && ($in(x.name, UNTARGETABLE) || $T(x.protect)))) { $r.push(x); } } return $r; })(), $kw({"key": ((x) => (x.might(this) - x.dmg))}));
        for (t of $it($sl(foes, null, 2))) {
          this.deal(t, 1, "Tracker");
        }
      }
      if (($T($gi(FEAT16, "rules2")) && (c === "Spirit of the Forge"))) {
        gs = (() => { const $r = []; for (const g_ of $it(p.base_gear)) { if ((!$in("eq", $gi(CARDS, g_)) && ($gi($gi(CARDS, g_), "e") >= 2))) { $r.push([g_, "base", null]); } } return $r; })();
        gs = $iadd(gs, (() => { const $r = []; for (const b_ of $it($range(2))) { for (const g_ of $it($gi($gi($gi(this.bf, b_), "gear"), i))) { if ($in(g_, ["The Ball", "Demacian Standard", "Pillaged Armory"])) { $r.push([g_, "bf", b_]); } } } return $r; })());
        if ($T(gs)) {
          [g_, wh, b_] = $it($max(gs, $kw({"key": ((x) => $add($gi($gi(CARDS, $gi(x, 0)), "e"), (($gi(x, 0) === "The Ball") ? 3 : 0)))})));
          if ((wh === "base")) {
            $cm(p.base_gear, "remove", g_);
          } else {
            $cm($gi($gi($gi(this.bf, b_), "gear"), i), "remove", g_);
          }
          $cm(p.hand, "append", g_);
          u.exhausted = false;
          { const $t117 = u; $t117.temp = $iadd($t117.temp, $gi($gi(CARDS, g_), "e")); }
          if (this.v) this.say(`  ${$str(p.name)}'s Spirit of the Forge returns ${$str(g_)} and readies (+${$str($gi($gi(CARDS, g_), "e"))})`);
        }
      }
      if (($T($gi(FEAT16, "rules2")) && (c === "Zed, From the Shadows") && $T(p.hand))) {
        dead = $OR((() => { const $r = []; for (const x of $it(p.hand)) { if ($in(x, FLOW)) { $r.push(x); } } return $r; })(), () => (() => { const $r = []; for (const x of $it(p.hand)) { if (($gi($gi(CARDS, x), "e") > (p.runes + 2))) { $r.push(x); } } return $r; })());
        if ($T(dead)) {
          d_ = $max(dead, $kw({"key": ((x) => [$in(x, FLOW), $gi($gi(CARDS, x), "e")])}));
          $cm(p.hand, "remove", d_);
          $cm(p.trash, "append", d_);
          this.token(i, "base", "Shadow Clone").base = 0;
          if (this.v) this.say(`  ${$str(p.name)}'s Zed discards ${$str(d_)} for a Shadow Clone`);
        }
      }
      if (($T($gi(FEAT16, "rules2")) && (c === "Gust Monk") && ($sub(p.E, $gi(this.reserve(p), 0)) >= 1) && $T(p.trash))) {
        bn = $OR((() => { const $r = []; for (const x of $it(p.trash)) { if ((!$in(x, FLOW) && ($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") !== "Unit"))) { $r.push(x); } } return $r; })(), () => $OR((() => { const $r = []; for (const x of $it(p.trash)) { if (!$in(x, FLOW)) { $r.push(x); } } return $r; })(), () => $list(p.trash)));
        { const $t118 = p; $t118.E = ($t118.E - 1); }
        $cm(p.trash, "remove", $gi(bn, 0));
        this.zed_banish(p);
        rdy = $OR((() => { const $r = []; for (const x of $it(p.units)) { if ((!$T(x.exhausted) && (x.might(this) > 0))) { $r.push(x); } } return $r; })(), () => (() => { const $r = []; for (const x of $it(p.units)) { if ((x !== u)) { $r.push(x); } } return $r; })());
        if ($T(rdy)) {
          $max(rdy, $kw({"key": ((x) => x.might(this))})).as2_tn = this.turn_no;
        }
      }
      if (($T($gi(FEAT16, "rules2")) && (c === "Bedeviling Stranger"))) {
        for (b_ of $it($range(2))) {
          if ((($len(this.units_at(0, b_)) + $len(this.units_at(1, b_))) >= 4)) {
            en = (() => { const $r = []; for (const x of $it(this.units_at((1 - i), b_))) { if ((!$T(x.token) && !$T(x.protect))) { $r.push(x); } } return $r; })();
            if ($T(en)) {
              this.bounce($max(en, $kw({"key": ((x) => x.might(this))})));
              break;
            }
          }
        }
      }
      if (((c === "Darius, Trifarian") && (() => { for (const [t_, _] of $it(p.plays)) { if ($eq(t_, p.tn)) return true; } return false; })())) {
        u.exhausted = false;
        { const $t119 = u; $t119.temp = ($t119.temp + 2); }
      }
      if ((c === "Jayce, Brilliant Inventor")) {
        ex_ = (() => { const $r = []; for (const x of $it(p.units)) { if (($T(x.exhausted) && (x !== u))) { $r.push(x); } } return $r; })();
        if ($T(ex_)) {
          $max(ex_, $kw({"key": ((x) => x.might(this))})).exhausted = false;
        }
      }
      if (((c === "Pyke, Dockside Butcher") && this.can_pay(p, 0, 1, c))) {
        this.pay(p, 0, 1, c);
        u.exhausted = false;
        { const $t120 = u; $t120.temp = ($t120.temp + 2); }
      }
      if (((c === "Kinkou Initiate") && ((() => { let $s = 0; for (const x of $it(p.units)) { if ((x !== u)) { $s += $num(x.might(this)); } } return $s; })() >= 5))) {
        this.draw(p);
        drew = true;
      }
      if ((c === "Harnessed Dragon")) {
        t_ = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((!$in(x.name, UNTARGETABLE) && !$T(x.protect) && !$T(this.wild_safe(x)))) { $r.push(x); } } return $r; })();
        if ($T(t_)) {
          this.kill($max(t_, $kw({"key": ((x) => [(x.might(this) + $mul(3, champion_like(x.name))), (x.loc !== "base")])})), "Harnessed Dragon");
        }
      }
      if ((c === "Elder Dragon")) {
        for (loc_ of $it(["base", 0, 1])) {
          t_ = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if (($eq(x.loc, loc_) && !$in(x.name, UNTARGETABLE) && !$T(x.protect) && !$T(this.wild_safe(x)))) { $r.push(x); } } return $r; })();
          if ($T(t_)) {
            this.deal($max(t_, $kw({"key": ((x) => x.might(this))})), 1, "Elder Dragon");
          }
        }
      }
      if (($in(c, ["Kennen, Keeper of Balance"]) && ($sub(p.E, $gi(this.reserve(p), 0)) >= 2))) {
        t_ = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if (((x.loc !== "base") && !$T(x.stun) && !$in(x.name, UNTARGETABLE) && !$T(x.protect))) { $r.push(x); } } return $r; })();
        if ($T(t_)) {
          { const $t121 = p; $t121.E = ($t121.E - 2); }
          $max(t_, $kw({"key": ((x) => x.might(this))})).stun = true;
        }
      }
      if (((c === "Poppy, Paragon") && ($gi(this.P, (1 - i)).points >= (this.victory - 3)))) {
        u.exhausted = false;
        p.xp = ($ga(p, "xp", 0) + 3);
      }
      if (((c === "Akshan, Mischievous") && this.can_pay(p, 0, 2, c))) {
        o_ = $gi(this.P, (1 - i));
        eqd = (() => { const $r = []; for (const x of $it(o_.units)) { if (($T(x.eq) && !$in(x.name, UNTARGETABLE))) { $r.push(x); } } return $r; })();
        if ($T(eqd)) {
          x = $max(eqd, $kw({"key": ((y) => $max((() => { const $r = []; for (const e of $it(y.eq)) { $r.push($gi($gi($gi(CARDS, e), "eq"), "bonus")); } return $r; })()))}));
          e_ = $max(x.eq, $kw({"key": ((e) => $gi($gi($gi(CARDS, e), "eq"), "bonus"))}));
          this.pay(p, 0, 2, c);
          $cm(x.eq, "remove", e_);
          $cm(p.loose_eq, "append", e_);
          if (this.v) this.say(`  ${$str(p.name)}'s Akshan takes ${$str(e_)}`);
          u.stole = $add($ga(u, "stole", []), [e_]);
          this.stolen = $add($ga(this, "stolen", []), [[i, (1 - i), e_]]);
        } else if ($T(o_.base_gear)) {
          this.pay(p, 0, 2, c);
          g_ = $cm(o_.base_gear, "pop");
          $cm(p.base_gear, "append", g_);
          this.gear_left(o_, g_);
          u.stole = $add($ga(u, "stole", []), [g_]);
          this.stolen = $add($ga(this, "stolen", []), [[i, (1 - i), g_]]);
        }
      }
      if (($T($gi(AZ, 0)) && (c === "Aspiring Engineer"))) {
        gs = (() => { const $r = []; for (const x of $it(p.trash)) { if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Gear")) { $r.push(x); } } return $r; })();
        if ($T(gs)) {
          g_ = $max(gs, $kw({"key": ((x) => [($in("eq", $gi(CARDS, x)) ? $cm($cm($gi(CARDS, x), "get", "eq", new PyDict([])), "get", "bonus", 0) : 0), $gi($gi(CARDS, x), "e")])}));
          $cm(p.trash, "remove", g_);
          $cm(p.hand, "append", g_);
          drew = true;
        }
      }
      if (($T($gi(AZ, 0)) && (c === "Ornn, Blacksmith"))) {
        drew = $bor(drew, this.ornn_look(p));
      }
      if (($T($gi(AZ, 0)) && (c === "Mischievous Marai"))) {
        t_ = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if (((x.loc !== "base") && !$in(x.name, UNTARGETABLE) && !$T(x.protect) && !$T(this.wild_safe(x)))) { $r.push(x); } } return $r; })();
        if ($T(t_)) {
          k_ = (() => { const $r = []; for (const x of $it(t_)) { if (((x.might(this) - x.dmg) <= 2)) { $r.push(x); } } return $r; })();
          tg = ($T(k_) ? $max(k_, $kw({"key": ((x) => [x.might(this), !$T(x.token)])})) : $max(t_, $kw({"key": ((x) => x.might(this))})));
          if (($T(this.units_at(i, tg.loc)) || $eq($gi($gi(this.bf, tg.loc), "ctrl"), i))) {
            u._loc = tg.loc;
            p.bfplay_tn = this.turn_no;
          }
          this.deal(tg, 2, "Marai");
        }
      }
      if ((c === "Pit Rookie")) {
        others = (() => { const $r = []; for (const x of $it(p.units)) { if (((x !== u) && (!$T(x.buffed) || !$T($gi(FEAT16, "cards"))))) { $r.push(x); } } return $r; })();
        if ($T(others)) {
          t_ = $max(others, $kw({"key": ((x) => x.might(this))}));
          if ($T($gi(FEAT16, "cards"))) {
            this.buff(t_);
          } else {
            { const $t122 = t_; $t122.emp = ($t122.emp + 1); }
          }
        }
      }
      if ($T($gi(cd, "wm"))) {
        this.wm_attach(i, u);
      }
      if (($T($gi(this.P, (1 - i)).units) && (() => { for (const x of $it($gi(this.P, (1 - i)).units)) { if (((x.name === "Vex, Apathetic") && (x.loc !== "base"))) return true; } return false; })())) {
        u.exhausted = true;
      }
    } else if (($gi(cd, "t") === "Gear")) {
      o_ = $gi(this.P, (1 - i));
      pf_ = ($T($gi(META25, 0)) ? (() => { const $r = []; for (const x of $it(o_.units)) { if ((x.name === "Ravenbloom Prefect")) { $r.push(x); } } return $r; })() : []);
      if (($T(pf_) && ($in("eq", cd) || ($add($gi(cd, "e"), $mul(2, $gi(cd, "p"))) >= 3) || $in("D", $gi(cd, "f"))) && !($cm(c, "startswith", "Seal of")))) {
        this.banish($gi(pf_, 0), "(Ravenbloom Prefect)");
        if (this.v) this.say(`  ${$str(o_.name)}'s Ravenbloom Prefect banishes ${$str(c)}`);
        return drew;
      }
      if ((c === "Shepherd's Heirloom")) {
        p.xp = ($ga(p, "xp", 0) + 1);
      }
      if ((c === "Sprite Fountain")) {
        t_ = this.token(i, "base", "Sprite");
        t_.base = 3;
        t_.temporary = true;
        t_.exhausted = false;
        p.fountain = ($ga(p, "fountain", 0) + 1);
      }
      if ($T($gi(AZ, 0))) {
        for (x of $it(p.units)) {
          if ((x.name === "Pit Crew")) {
            x.exhausted = false;
          }
        }
      }
      if ($in("eq", cd)) {
        $cm(p.loose_eq, "append", c);
        p.eq_tn = this.turn_no;
        if (($T($gi(AZ, 0)) && $in(c, QUICKDRAW) && $T(p.units))) {
          tgt = $max(p.units, $kw({"key": ((x) => [(x.loc !== "base"), (!$T(x.token) || (x.name === "Sand Soldier")), x.might(this)])}));
          $cm(p.loose_eq, "remove", c);
          b0 = tgt.might(this);
          $cm(tgt.eq, "append", c);
          tgt.brut_tn = this.turn_no;
          this.mighty_check(i, tgt, b0);
        }
      } else if (($cm(c, "startswith", "Seal of") || (c === "Honeyfruit"))) {
        { const $t123 = p; $t123.seal = ($t123.seal + 1); }
      } else if ($in("D", $gi(cd, "f"))) {
        [bi, mv] = $it(this.deploy_target(i, c));
        $cm($gi($gi($gi(this.bf, bi), "gear"), i), "append", c);
        p.bfplay_tn = this.turn_no;
        if ($T(mv)) {
          this.jarvan_move(i, bi);
        }
        if ((c === "Pillaged Armory")) {
          here = this.units_at(i, bi);
          this.buff($max($OR((() => { const $r = []; for (const u of $it($OR(here, () => p.units))) { if (!$T(u.buffed)) { $r.push(u); } } return $r; })(), () => [null]), $kw({"key": ((x) => ($T(x) ? x.might(this) : 0))})));
        }
        if (((c === "Concert Poster") && (p.E >= 1))) {
          { const $t124 = p; $t124.E = ($t124.E - 1); }
          this.token(i, "base");
        }
        if ((c === "The Ball")) {
          foes = this.units_at((1 - i), bi);
          if (($T(foes) && $T($gi(SMART, 0)))) {
            for (t of $it($list(foes))) {
              this.deal(t, 2, "The Ball");
            }
          } else {
            this.draw(p);
            drew = true;
          }
        }
        if ((c === "The Good Stuff")) {
          d_ = "nothing";
          if ($T(p.hand)) {
            d_ = $max(p.hand, $kw({"key": ((x) => [!$T(champion_like(x)), $sub($add($gi($gi(CARDS, x), "e"), $mul(2, $gi($gi(CARDS, x), "p"))), p.runes)])}));
            $cm(p.hand, "remove", d_);
            $cm(p.trash, "append", d_);
          }
          this.draw(p, 3);
          drew = true;
          if (this.v) this.say(`  ${$str(p.name)} plays The Good Stuff at ${$str($gi($gi(this.bf, bi), "name"))}: discards ${$str(d_)} and draws 3`);
        }
        if ((c === "Portable Portal")) {
          ex = (() => { const $r = []; for (const x of $it(this.units_at(i, bi))) { if ($T(x.exhausted)) { $r.push(x); } } return $r; })();
          if (($T(ex) && this.can_pay(p, 0, 1, c))) {
            this.pay(p, 0, 1, c);
            $gi(ex, 0).exhausted = false;
          }
        }
        if ((c === "Hunting Blind")) {
          foes = (() => { const $r = []; for (const x of $it($gi(this.P, (1 - i)).units)) { if ((x.loc === "base")) { $r.push(x); } } return $r; })();
          if (($T(foes) && $T(this.units_at(i, bi)))) {
            t = $min(foes, $kw({"key": ((x) => x.might(this))}));
            t.loc = bi;
          }
        }
      } else {
        $cm(p.base_gear, "append", c);
        if ((c === "Petricite Monument")) {
          p.petri = this.turn_no;
        }
        if (((c === "Invigorating Bloom") && $T(p.units))) {
          u = $max(p.units, $kw({"key": ((x) => x.might(this))}));
          b0 = u.might(this);
          { const $t125 = u; $t125.temp = ($t125.temp + 3); }
          this.mighty_check(i, u, b0);
        }
        if (((c === "Runeblade Anvil") && $T(p.deck))) {
          this.anvil_banish(p);
          drew = true;
        }
        if (($T($gi(AZ, 0)) && (c === "Poro Snax"))) {
          this.draw(p);
          drew = true;
        }
      }
    } else {
      $cm(p.trash, "append", c);
      for (ef of $it($cm(GEN, "get", c, []))) {
        if (($gi(ef, 0) === "draw")) {
          this.draw(p, $gi(ef, 1));
          drew = true;
        } else if (($gi(ef, 0) === "tok")) {
          for (_ of $it($range($gi(ef, 1)))) {
            t_ = this.token(i, "base");
            t_.base = $gi(ef, 2);
          }
        } else if (($gi(ef, 0) === "chan")) {
          { const $t126 = p; $t126.pending = $iadd($t126.pending, $gi(ef, 1)); }
        }
      }
      if ((c === "Life from Stone")) {
        this.draw(p);
        { const $t127 = p; $t127.pending = ($t127.pending + 1); }
        drew = true;
      }
      if ((c === "Lightning Rush")) {
        this.draw(p);
        drew = true;
        for (_ of $it($range(2))) {
          if ($T(p.deck)) {
            $cm(p.trash, "append", $cm(p.deck, "pop"));
          }
        }
      }
      if ((c === "Dredge Up")) {
        this.draw(p);
        drew = true;
      }
      if ((c === "Catalyst of Aeons")) {
        if (($add(p.runes, p.pending) >= 11)) {
          this.draw(p);
        } else {
          { const $t128 = p; $t128.pending = ($t128.pending + 2); }
        }
      }
      if ((c === "Mobilize")) {
        if (($add(p.runes, p.pending) >= 12)) {
          this.draw(p);
        } else {
          { const $t129 = p; $t129.pending = ($t129.pending + 1); }
        }
      }
      if ((c === "Clairvoyance")) {
        this.draw(p, 2);
      }
      if ((c === "Salvage")) {
        og = $gi(this.P, (1 - i));
        if ($T(og.base_gear)) {
          g_ = $cm(og.base_gear, "pop");
          $cm(og.trash, "append", g_);
          this.gear_left(og, g_);
        }
        this.draw(p);
      }
      if ((c === "Sprite Burst")) {
        for (_ of $it($range(2))) {
          t_ = this.token(i, "base", "Sprite");
          t_.base = 3;
          t_.temporary = true;
          t_.exhausted = false;
        }
      }
      if ((c === "Up from the Deep")) {
        for (_ of $it($range(2))) {
          this.token(i, "base", "Tentacle");
        }
      }
      if ((c === "Mirror Image")) {
        pool_ = (() => { const $r = []; for (const q of $it(this.P)) { for (const x of $it(q.units)) { if (!$T(x.token)) { $r.push(x); } } } return $r; })();
        if ($T(pool_)) {
          src_ = $max(pool_, $kw({"key": ((x) => $add(x.base, x.emp))}));
          t_ = this.token(i, "base", "Reflection");
          t_.base = src_.base;
          t_.temporary = true;
          t_.exhausted = false;
        }
      }
      if ((c === "Promising Future")) {
        for (q_i of $it([(1 - i), i])) {
          q = $gi(this.P, q_i);
          top_ = $sl(q.deck, (-5), null);
          un = (() => { const $r = []; for (const x of $it(top_)) { if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit")) { $r.push(x); } } return $r; })();
          if ($T(un)) {
            pick = $max(un, $kw({"key": ((x) => $cm($gi(CARDS, x), "get", "m", 0))}));
            $cm(q.deck, "remove", pick);
            this.place_unit(q_i, pick, "base");
          }
        }
      }
      if ((c === "Sabotage")) {
        o_ = $gi(this.P, (1 - i));
        nu = (() => { const $r = []; for (const x of $it(o_.hand)) { if (($gi($gi(CARDS, x), "t") !== "Unit")) { $r.push(x); } } return $r; })();
        if ($T(nu)) {
          x = $max(nu, $kw({"key": ((y) => $add($add($add($cm(REACT_VAL, "get", y, 0), $cm(PROTECT, "get", y, 0)), ($in(y, REMOVAL) ? 4 : 0)), $gi($gi(CARDS, y), "e")))}));
          $cm(o_.hand, "remove", x);
          $cm(o_.deck, "insert", 0, x);
          if (this.v) this.say(`  ${$str(p.name)}'s Sabotage recycles ${$str(x)}`);
        }
      }
      if ((c === "Encore")) {
        this.token(i, "base");
        this.token(i, "base");
      }
      if (($T($gi(AZ, 0)) && (c === "Arise!"))) {
        n_ = ((() => { let $s = 0; for (const x of $it(p.units)) { $s += $num($len(x.eq)); } return $s; })() + $len(p.loose_eq));
        new_ = (() => { const $r = []; for (const _ of $it($range(n_))) { $r.push(this.sand(i)); } return $r; })();
        for (t_ of $it($sl(new_, null, 2))) {
          t_.exhausted = false;
        }
      }
      if (($T($gi(AZ, 0)) && (c === "Guards!"))) {
        t_ = this.sand(i);
        if ((this.can_pay(p, 0, 1, c) && (p.runes >= 6))) {
          this.pay(p, 0, 1, c);
          t_.exhausted = false;
        }
      }
      if (($T($gi(AZ, 0)) && (c === "Desert's Call"))) {
        this.sand(i);
        if (($sub(p.E, $gi(this.reserve(p), 0)) >= 2)) {
          { const $t130 = p; $t130.E = ($t130.E - 2); }
          this.sand(i);
        }
      }
      if ((c === "Rousing Display")) {
        for (_ of $it($range(((() => { for (const x of $it(p.hand)) { if (($gi($gi(CARDS, x), "e") >= 7)) return true; } return false; })() ? 4 : 2)))) {
          this.token(i, "base");
        }
      }
      if ((c === "The Waters' Wage")) {
        this.gain_gold(p);
      }
      if ((c === "Command: Attack")) {
        gs = (() => { const $r = []; for (const x of $it($sl(p.deck, (-5), null))) { if (($gi($gi(CARDS, x), "t") === "Gear")) { $r.push(x); } } return $r; })();
        if ($T(gs)) {
          g = $max(gs, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
          $cm(p.deck, "remove", g);
          $cm(p.hand, "append", g);
          drew = true;
        }
      }
      if ((c === "Satchel Charge")) {
        if ($T($gi(FEAT16, "cards"))) {
          openb = (() => { const $r = []; for (const b_ of $it($range(2))) { if ((!$eq($gi($gi(this.bf, b_), "ctrl"), i) && !$T(this.units_at((1 - i), b_)) && !$T(this.units_at(i, b_)))) { $r.push(b_); } } return $r; })();
          mv = (() => { const $r = []; for (const x of $it(p.units)) { if (((x.loc === "base") && (x.might(this) > 0))) { $r.push(x); } } return $r; })();
          if (($T(openb) && $T(mv))) {
            x = $min(mv, $kw({"key": ((y) => [!$T(y.exhausted), y.might(this)])}));
            x.loc = $gi(openb, 0);
            if (this.v) this.say(`  ${$str(p.name)}'s Satchel Charge moves ${$str(x.name)} to ${$str($gi($gi(this.bf, $gi(openb, 0)), "name"))}`);
          }
        }
        tgt = $OR($sorted((() => { const $r = []; for (const bi of $it($range(2))) { if ($T(this.units_at((1 - i), bi))) { $r.push(bi); } } return $r; })(), $kw({"key": ((b_) => (-$len(this.units_at((1 - i), b_))))})), () => [0]);
        { const $t131 = $gi($gi(this.bf, $gi(tgt, 0)), "bombs"), $t132 = i; $si($t131, $t132, ($gi($t131, $t132) + 1)); }
      }
      if ((c === "Death Mark")) {
        this.token(i, "base", "Shadow Clone").base = 0;
        if ($T($gi(FEAT16, "cards"))) {
          this.burn(p, 3);
        }
      }
    }
    return drew;
  }
  strength_att(us) {
    let pk, extra;
    if ($T($gi(FEAT16, "legends"))) {
      if (!$T(us)) {
        return 0;
      }
      pk = $gi(this.P, $gi(us, 0).owner);
      extra = (((pk.leg === "ksante") && ($ga(pk, "ksleg", null) == null) && (pk.E >= 1)) ? $max((() => { const $r = []; for (const u of $it(us)) { $r.push(u.shield(this)); } return $r; })()) : 0);
      return ((() => { let $s = 0; for (const u of $it(us)) { $s += $num((u.might(this) + u.kw("assault"))); } return $s; })() + extra);
    }
    return (() => { let $s = 0; for (const u of $it(us)) { $s += $num($add((u.might(this) + u.kw("assault")), ((($gi(this.P, u.owner).leg === "ksante") && $T(u.shield(this)) && ($gi(this.P, u.owner).E >= 1)) ? u.shield(this) : 0))); } return $s; })();
  }
  strength_def(us) {
    return (() => { let $s = 0; for (const u of $it(us)) { $s += $num((u.might(this) + u.shield(this))); } return $s; })();
  }
  attack_phase(i) {
    let p, conquered, bi, b, foes, mine_here, has_tu, avail, n, u, forced, pump, opp, opp_react, choice, best_g, fixed, free_, r, comb, group, out, cost, denial, held, must, lead, tr_need, s_, must_now, key, d_, h0, thr0, res, p_now;
    p = $gi(this.P, i);
    conquered = [];
    for (bi of $it($sorted($range(2), $kw({"key": ((b) => $eq($gi($gi(this.bf, b), "ctrl"), i))})))) {
      b = $gi(this.bf, bi);
      foes = this.units_at((1 - i), bi);
      mine_here = this.units_at(i, bi);
      has_tu = $AND($gi(FEAT16, "rules2"), () => (() => { for (const c of $it(p.trash)) { if (($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Unit")) return true; } return false; })());
      avail = (() => { const $r = []; for (const u of $it(p.units)) { if ((!$T(u.exhausted) && (u.loc === "base") && ((u.might(this) > 0) || ($T(has_tu) && (u.name === "Shadow Clone"))))) { $r.push(u); } } return $r; })();
      avail = $iadd(avail, (() => { const $r = []; for (const u of $it(p.units)) { if ((!$T(u.exhausted) && !$in(u.loc, ["base", bi]) && $T(this.can_gank(u)) && ($len(this.units_at(i, u.loc)) > 1))) { $r.push(u); } } return $r; })());
      if (!$T(foes)) {
        if ($T($gi(AI36, 0))) {
          avail = $add(avail, (() => { const $r = []; for (const u of $it(p.units)) { if ((!$T(u.exhausted) && (u.loc === "base") && (u.might(this) <= 0) && !$in(u, avail) && !$T(u.token))) { $r.push(u); } } return $r; })());
        }
        if (!$eq($gi(b, "ctrl"), i)) {
          if ($T(mine_here)) {
            $cm(conquered, "append", bi);
            continue;
          }
          if ($T(avail)) {
            n = (((p.leg === "shen") && ($len(avail) >= 2)) ? 2 : 1);
            for (u of $it($sl($sorted(avail, $kw({"key": ((x) => x.might(this))})), null, n))) {
              u.loc = bi;
              u.exhausted = true;
            }
            $cm(conquered, "append", bi);
          }
        } else if ((!$T(mine_here) && $T(avail))) {
          u = $min(avail, $kw({"key": ((x) => x.might(this))}));
          u.loc = bi;
          u.exhausted = true;
        }
        continue;
      }
      forced = (() => { const $r = []; for (const u of $it(mine_here)) { if ($T(u.jmove)) { $r.push(u); } } return $r; })();
      avail = $add(forced, (() => { const $r = []; for (const u of $it(avail)) { if (!$in(u, forced)) { $r.push(u); } } return $r; })());
      $cm(avail, "sort", $kw({"key": ((x) => [!$T(x.jmove), (-x.might(this))])}));
      if (!$T(avail)) {
        continue;
      }
      if ($T($ga(p, "la_noatk", false))) {
        continue;
      }
      if ((($ga(p, "la_bf", null) != null) && !$eq(bi, p.la_bf))) {
        continue;
      }
      pump = $add(this.best_pump(p), (((p.leg === "kennen") && $T(p.kemp)) ? 2 : 0));
      opp = $gi(this.P, (1 - i));
      opp_react = ($T($gi(SMART, 0)) ? this.react_threat(i, bi) : 0);
      if ($T($ga(p, "la_react", 0))) {
        opp_react = $max(0, $add(opp_react, p.la_react));
      }
      if (($T($gi(PB2, 0)) && (opp_react > 0) && ($ga(p, "ans_cover", 0.5) > 0) && $T(this.fight_answer(i, foes)))) {
        opp_react = $int($mul(opp_react, (1 - $ga(p, "ans_cover", 0.5))));
      }
      if (($T($ga(p, "ai20_tempo", $gi(AI20, "tempo"))) && ($in((p.points + 1), [2, 6]) || (p.points >= 6) || (opp.points >= 6)))) {
        opp_react = $floordiv(opp_react, 2);
      }
      choice = null;
      if (((p.ai >= 5) && ($T($gi(FEAT, "atk")) || $T($ga(p, "ai20_atk", $gi(AI20, "atk")))) && ((1 < $len(avail)) && ($len(avail) <= 8)))) {
        best_g = null;
        fixed = (() => { const $r = []; for (const u of $it(avail)) { if ($T(u.jmove)) { $r.push(u); } } return $r; })();
        free_ = (() => { const $r = []; for (const u of $it(avail)) { if (!$T(u.jmove)) { $r.push(u); } } return $r; })();
        for (r of $it($range(0, ($len(free_) + 1)))) {
          for (comb of $it($combinations(free_, r))) {
            group = $add(fixed, $list(comb));
            if (!$T(group)) {
              continue;
            }
            out = this.predict(i, group, foes, $sub(pump, opp_react));
            if ($T($gi(out, "conquer"))) {
              cost = ((() => { let $s = 0; for (const u of $it(group)) { $s += $num((u.might(this) + $mul(3, champion_like(u.name)))); } return $s; })() + $mul(2, $gi(out, "lost")));
              if (((best_g == null) || (cost < $gi(best_g, 0)))) {
                best_g = [cost, group];
              }
            }
          }
        }
        if ($T(best_g)) {
          choice = $sorted($gi(best_g, 1), $kw({"key": ((x) => [!$T(x.jmove), (-x.might(this))])}));
        }
      } else {
        for (n of $it($range(1, ($len(avail) + 1)))) {
          group = $sl(avail, null, n);
          out = this.predict(i, group, foes, $sub(pump, opp_react));
          if ($T($gi(out, "conquer"))) {
            choice = group;
            break;
          }
        }
      }
      if (((choice == null) && $T($gi(SMART, 0)))) {
        group = avail;
        out = this.predict(i, group, foes, $sub(pump, opp_react));
        denial = ($eq($gi(b, "ctrl"), (1 - i)) && (opp.points >= 5));
        if (((p.ai >= 5) && $T($cm(FEAT, "get", "deny", true)) && $eq($gi(b, "ctrl"), (1 - i)) && (opp.points >= 3) && ($gi(out, "killed") >= ($gi(out, "lost") - 1)) && ($gi(out, "killed") > 0))) {
          denial = true;
        }
        held = (() => { let $s = 0; for (const b2 of $it($range(2))) { if (($eq($gi($gi(this.bf, b2), "ctrl"), (1 - i)) && $T(this.units_at((1 - i), b2)))) { $s += $num(1); } } return $s; })();
        must = ((p.ai >= 3) && $eq($gi(b, "ctrl"), (1 - i)) && ($add(opp.points, held) >= 8));
        lead = $sub(p.points, opp.points);
        tr_need = 2;
        if (($T($ga(p, "hab_push", $gi(HAB, "push"))) && (lead <= (-3)))) {
          tr_need = 0;
        }
        if (($T($ga(p, "hab_patient", $gi(HAB, "patient"))) && (lead >= 3))) {
          tr_need = 99;
        }
        if ((($gi(out, "killed") >= $add($gi(out, "lost"), tr_need)) || ($T(denial) && ($gi(out, "killed") >= $gi(out, "lost"))) || $T(must))) {
          choice = group;
        }
      }
      if (((choice == null) && !$T($gi(SMART, 0)))) {
        group = [];
        s_ = 0;
        for (u of $it(avail)) {
          $cm(group, "append", u);
          s_ = this.strength_att(group);
          if ((s_ > this.strength_def(foes))) {
            break;
          }
        }
        if ((($add(this.strength_att(group), pump) >= (this.strength_def(foes) + 1)) || (() => { for (const u of $it(group)) { if ((u.name === "Graves, Blasting Through")) return true; } return false; })())) {
          choice = group;
        }
      }
      if (((choice == null) && $T($gi(SMART, 0)) && $T($gi(FEAT16, "timing")) && $T(avail) && $T(foes) && !($T($ga(p, "hab_patient", $gi(HAB, "patient"))) && ($sub(p.points, opp.points) >= 3) && (opp.points < 6)))) {
        choice = this.pre_attack(i, bi, avail, foes, $sub(pump, opp_react));
      }
      must_now = ((p.ai >= 5) && $eq($gi(b, "ctrl"), (1 - i)) && (opp.points >= 7));
      if (($T(choice) && !$T(forced) && !$T(must_now) && $T(this.slip(p)))) {
        choice = null;
      }
      if ($T(forced)) {
        choice = $add(forced, (() => { const $r = []; for (const u of $it($OR(choice, () => []))) { if (!$in(u, forced)) { $r.push(u); } } return $r; })());
      }
      if (!$T(choice)) {
        continue;
      }
      if (((p.ai >= 2) && (this.react_threat(i, bi) > 0))) {
        key = $max(choice, $kw({"key": ((x) => (x.might(this) + $mul(2, champion_like(x.name))))}));
        if (!$T(key.protect)) {
          if (($in("Twilight Shroud", p.hand) && this.can_pay(p, 1, 0, "Twilight Shroud"))) {
            if ($T(this.cast(p, "Twilight Shroud", 1, 0))) {
              key.protect = true;
              { const $t133 = key; $t133.temp = ($t133.temp + 1); }
            }
          } else if (($in("Twilight Shroud", p.trash) && this.can_pay(p, 2, 0, "Twilight Shroud"))) {
            $cm(p.trash, "remove", "Twilight Shroud");
            this.pay(p, 2, 0, "Twilight Shroud");
            key.protect = true;
            { const $t134 = key; $t134.temp = ($t134.temp + 1); }
          }
        }
      }
      for (u of $it(choice)) {
        u.loc = bi;
        u.exhausted = true;
      }
      d_ = $gi(this.P, (1 - i));
      h0 = $len(d_.hand);
      thr0 = ((p.ai >= 4) ? this.react_threat(i, bi) : 0);
      res = this.combat(i, bi, choice);
      if (((p.ai >= 4) && (thr0 > 0))) {
        if (($len(d_.hand) >= h0)) {
          { const $t135 = d_; $t135.shown_empty = ($t135.shown_empty + 1); }
        } else {
          d_.shown_empty = $max(0, (d_.shown_empty - 2));
        }
      }
      if ((res === "conquer")) {
        $cm(conquered, "append", bi);
      }
    }
    if (((p.ai >= 5) && $T($cm(FEAT, "get", "sweep", true)))) {
      for (bi of $it($range(2))) {
        if (($in(bi, conquered) || $eq($gi($gi(this.bf, bi), "ctrl"), i))) {
          continue;
        }
        if (($T(this.units_at(0, bi)) || $T(this.units_at(1, bi)))) {
          continue;
        }
        avail = (() => { const $r = []; for (const u of $it(p.units)) { if ((!$T(u.exhausted) && (u.loc === "base") && (u.might(this) > 0))) { $r.push(u); } } return $r; })();
        if ($T(avail)) {
          u = $min(avail, $kw({"key": ((x) => x.might(this))}));
          u.loc = bi;
          u.exhausted = true;
          $cm(conquered, "append", bi);
        }
      }
    }
    if ($T($gi(SMART, 0))) {
      this.reinforce(i);
    }
    for (bi of $it(conquered)) {
      if (($T($gi(FEAT16, "rules2")) && !$T(this.units_at(i, bi)))) {
        continue;
      }
      if ($T($gi(RULES34, 0))) {
        if (!$eq($gi($gi(this.bf, bi), "ctrl"), i)) {
          $si($gi(this.bf, bi), "ctrl", i);
          if (!($hasattr(p, "scored_bf"))) {
            p.scored_bf = $set();
          }
          if ($T(this.conquer_score(i, bi))) {
            $cm(p.scored_bf, "add", bi);
          }
        }
        continue;
      }
      if (!$eq($gi($gi(this.bf, bi), "ctrl"), i)) {
        $si($gi(this.bf, bi), "ctrl", i);
        if (!($hasattr(p, "scored_bf"))) {
          p.scored_bf = $set();
        }
        if (($T($gi(FEAT16, "rules2")) && $in(bi, p.scored_bf))) {
          continue;
        }
        $cm(p.scored_bf, "add", bi);
        p_now = p.points;
        if (($eq(p_now, 7) && !((() => { for (const b2 of $it($range(2))) { if (!($eq(b2, bi) || $in(b2, conquered) || $in(b2, $ga(p, "scored_bf", $set())))) return false; } return true; })()))) {
          this.draw(p);
          if (this.v) this.say(`  ${$str(p.name)} conquers ${$str($gi($gi(this.bf, bi), "name"))} (final point needs both) -> draws`);
        } else {
          this.score(i, 1, `conquer ${$str($gi($gi(this.bf, bi), "name"))}`);
        }
        this.on_conquer(i, bi);
      }
    }
    if (!$T($gi(FEAT16, "cards"))) {
      for (bi of $it($range(2))) {
        if (($eq($gi($gi(this.bf, bi), "ctrl"), i) && $T($gi($gi($gi(this.bf, bi), "gear"), (1 - i))))) {
          $si($gi($gi(this.bf, bi), "gear"), (1 - i), []);
        }
      }
    }
  }
  predict(i, att, dfn, pump = 0, hp_key = 0, hp_each = 0) {
    let a, d, g, dfn_alive, sim, key_, sim_att, dd, ad, killed, lost;
    a = $add(this.att_total(att, dfn, i, true), $max(0, pump));
    d = this.def_total(dfn, att, true);
    if ((() => { for (const u of $it(att)) { if ((u.name === "Graves, Blasting Through")) return true; } return false; })()) {
      g = $max((() => { const $r = []; for (const u of $it(att)) { if ((u.name === "Graves, Blasting Through")) { $r.push(u.might(this)); } } return $r; })());
      dfn_alive = (() => { const $r = []; for (const u of $it(dfn)) { if (((u.might(this) + u.shield(this)) > g)) { $r.push(u); } } return $r; })();
      d = ($T(dfn_alive) ? this.def_total(dfn_alive, att, true) : 0);
    } else {
      dfn_alive = dfn;
    }
    sim = (dmg, units, defending) => {
      let order, dead, u, hp;
      order = $sorted(units, $kw({"key": ((u) => [!$T(u.is_tank()), u.kw("back"), (u.might(this) + ($T(defending) ? u.shield(this) : 0))])}));
      dead = [];
      for (u of $it(order)) {
        hp = (u.might(this) + ($T(defending) ? u.shield(this) : 0));
        if ((dmg >= hp)) {
          dmg = $sub(dmg, hp);
          $cm(dead, "append", u);
        } else {
          break;
        }
      }
      return dead;
    };
    if (($T($gi(FUZZFIX, 0)) && ($T(hp_key) || $T(hp_each)) && $T(att))) {
      key_ = $max(att, $kw({"key": ((u) => u.might(this))}));
      sim_att = (dmg, units) => {
        let order, dead, u, hp;
        order = $sorted(units, $kw({"key": ((u) => [!$T(u.is_tank()), u.kw("back"), $add((u.might(this) + hp_each), ((u === key_) ? hp_key : 0))])}));
        dead = [];
        for (u of $it(order)) {
          hp = $add((u.might(this) + hp_each), ((u === key_) ? hp_key : 0));
          if ((dmg >= hp)) {
            dmg = $sub(dmg, hp);
            $cm(dead, "append", u);
          } else {
            break;
          }
        }
        return dead;
      };
      dd = sim(a, dfn_alive, true);
      ad = sim_att(d, att);
    } else {
      dd = sim(a, dfn_alive, true);
      ad = sim(d, att, false);
    }
    killed = (((() => { let $s = 0; for (const u of $it(dfn)) { $s += $num(u.might(this)); } return $s; })() - (() => { let $s = 0; for (const u of $it(dfn_alive)) { $s += $num(u.might(this)); } return $s; })()) + (() => { let $s = 0; for (const u of $it(dd)) { $s += $num(u.might(this)); } return $s; })());
    lost = (() => { let $s = 0; for (const u of $it(ad)) { $s += $num(u.might(this)); } return $s; })();
    return $dict($kw({"conquer": (($len(dd) === $len(dfn_alive)) && ($len(ad) < $len(att))), "killed": killed, "lost": lost}));
  }
  reinforce(i) {
    let p, opp, threat, reach, bi, here, free, dfs, u;
    p = $gi(this.P, i);
    opp = $gi(this.P, (1 - i));
    threat = ($floordiv((() => { let $s = 0; for (const u of $it(opp.units)) { $s += $num(u.might(this)); } return $s; })(), 2) + 2);
    if (((p.ai >= 4) && (opp.points >= 6))) {
      threat = ((() => { let $s = 0; for (const u of $it(opp.units)) { $s += $num(u.might(this)); } return $s; })() + 1);
    }
    if (((p.ai >= 5) && $T($gi(FEAT, "rein")))) {
      reach = (() => { let $s = 0; for (const u of $it(opp.units)) { if (((u.loc === "base") || $T(this.can_gank(u)))) { $s += $num(u.might(this)); } } return $s; })();
      threat = $max(($add(reach, (($len(opp.hand) >= 2) ? 2 : 0)) + 1), 1);
      if ((opp.points >= 6)) {
        threat = (threat + 2);
      }
    }
    for (bi of $it($range(2))) {
      if (!$eq($gi($gi(this.bf, bi), "ctrl"), i)) {
        continue;
      }
      here = this.units_at(i, bi);
      free = (() => { const $r = []; for (const u of $it(p.units)) { if (((u.loc === "base") && !$T(u.exhausted))) { $r.push(u); } } return $r; })();
      dfs = this.strength_def(here);
      for (u of $it($sorted(free, $kw({"key": ((x) => (-x.might(this)))})))) {
        if (($T(here) && (dfs >= threat))) {
          break;
        }
        if (((p.leg === "shen") && ($len(here) >= 2))) {
          break;
        }
        u.loc = bi;
        u.exhausted = true;
        $cm(here, "append", u);
        dfs = this.strength_def(here);
      }
    }
  }
  on_conquer(i, bi) {
    let p, b, _, mine, d_, src_, t_, far, d, spare, u, ef, sp, t, val, bu;
    p = $gi(this.P, i);
    b = $gi(this.bf, bi);
    if ($T($gi(PB2, 0))) {
      if ((p.leg === "sett")) {
        p.settex = false;
      }
      if (($gi(b, "name") === "The Candlelit Sanctum")) {
        for (_ of $it($range(2))) {
          this.vision(p);
        }
      }
      if (((p.leg === "reksai") && !$T($ga(p, "rkleg", false)) && $T(p.deck))) {
        this.reksai_reveal(i, bi);
      }
    }
    if (($T($gi(AZ, 0)) && ($gi(b, "name") === "Hall of Legends") && (p.E >= 1))) {
      if (((p.leg === "azir") && $T(p.azleg))) {
        { const $t136 = p; $t136.E = ($t136.E - 1); }
        p.azleg = false;
      } else if (((p.leg === "akali") && $T(p.akleg))) {
        { const $t137 = p; $t137.E = ($t137.E - 1); }
        p.akleg = false;
      }
    }
    mine = this.units_at(i, bi);
    if (((p.leg === "leblanc") && $T(mine) && $T(p.hand) && !$eq($ga(p, "lbleg", (-1)), this.turn_no))) {
      d_ = $max(p.hand, $kw({"key": ((c) => $sub($gi($gi(CARDS, c), "e"), ($in(c, REMOVAL) ? 3 : 0)))}));
      $cm(p.hand, "remove", d_);
      $cm(p.trash, "append", d_);
      p.lbleg = this.turn_no;
      src_ = $max(mine, $kw({"key": ((x) => $add(x.base, x.emp))}));
      t_ = this.token(i, bi, "Reflection");
      t_.base = src_.base;
      t_.temporary = true;
      t_.exhausted = false;
    }
    if ($T($gi(FEAT16, "cards"))) {
      p.xp = ($ga(p, "xp", 0) + (() => { let $s = 0; for (const u of $it(mine)) { $s += $num(((u.name === "Master Yi, Tempered") ? 2 : ($in("Hunter's Machete", u.eq) ? 1 : 0))); } return $s; })());
    }
    if ((($gi(b, "name") === "Sunken Temple") && (() => { for (const u of $it(mine)) { if ((u.might(this) >= 5)) return true; } return false; })() && (p.E >= 1))) {
      { const $t138 = p; $t138.E = ($t138.E - 1); }
      this.draw(p);
    }
    if ((($gi(b, "name") === "Ruined Monastery") && $T(p.hand))) {
      if ((p.ai >= 5)) {
        far = (() => { const $r = []; for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "e") > (p.runes + 4))) { $r.push(c); } } return $r; })();
        if ($T(far)) {
          d = $max(far, $kw({"key": ((c) => $gi($gi(CARDS, c), "e"))}));
        } else if ((($len(p.hand) >= 3) && (p.runes < 9))) {
          spare = $OR((() => { const $r = []; for (const c of $it(p.hand)) { if (($gi($gi(CARDS, c), "t") !== "Unit")) { $r.push(c); } } return $r; })(), () => p.hand);
          d = $min(spare, $kw({"key": ((c) => $add($gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p")))}));
        } else {
          d = null;
        }
        if ($T(d)) {
          $cm(p.hand, "remove", d);
          $cm(p.trash, "append", d);
          { const $t139 = p; $t139.pending = ($t139.pending + 1); }
        }
      } else {
        d = $max(p.hand, $kw({"key": ((c) => $gi($gi(CARDS, c), "e"))}));
        $cm(p.hand, "remove", d);
        { const $t140 = p; $t140.pending = ($t140.pending + 1); }
      }
    }
    if ((($gi(b, "name") === "Protective Sands") && (p.runes <= 4) && (p.E >= 1))) {
      { const $t141 = p; $t141.E = ($t141.E - 1); }
      this.draw(p);
    }
    for (u of $it(mine)) {
      if ((u.name === "Kai'Sa, Survivor")) {
        this.draw(p);
      }
      if ($in("Last Rites", u.eq)) {
        this.last_rites(i);
      }
      for (ef of $it($cm(GEN, "get", u.name, []))) {
        if (($gi(ef, 0) === "conq_draw")) {
          this.draw(p, $gi(ef, 1));
        } else if (($gi(ef, 0) === "conq_chan")) {
          { const $t142 = p; $t142.pending = $iadd($t142.pending, $gi(ef, 1)); }
        }
      }
      if ((u.name === "Plundering Poro")) {
        this.gain_gold(p);
      }
      if ((u.name === "Kennen, Storm of Shuriken")) {
        for (sp of $it((() => { const $r = []; for (const c of $it(p.trash)) { if ($in(c, REMOVAL)) { $r.push(c); } } return $r; })())) {
          [t, val] = $it(this.removal_target(i, sp));
          if (((t != null) && this.can_pay(p, $gi($gi(CARDS, sp), "e"), $gi($gi(CARDS, sp), "p"), sp))) {
            $cm(p.trash, "remove", sp);
            this.pay(p, $gi($gi(CARDS, sp), "e"), $gi($gi(CARDS, sp), "p"), sp);
            p.kemp = true;
            this.cast_removal(i, sp, t);
            break;
          }
        }
      }
      if ($in("Boneshiver", u.eq)) {
        { const $t143 = p; $t143.pending = ($t143.pending + 1); }
      }
      if ((u.name === "Lucian, Merciless")) {
        u.exhausted = false;
      }
      if ((u.name === "Sett, Brawler")) {
        this.buff(u);
      }
      if ((u.name === "Zed, Without a Sound")) {
        this.token(i, "base", "Shadow Clone").base = 0;
      }
      if ((u.name === "Sneaky Zeebles")) {
        { const $t144 = p; $t144.P = ($t144.P + 1); }
      }
      if ($in("Warmog's Armor", u.eq)) {
        this.buff(u);
      }
      if ((u.name === "Corina Veraza")) {
        for (_ of $it($range(3))) {
          this.token(i, bi);
        }
      }
    }
    if (($in("Concert Poster", $gi($gi(b, "gear"), i)) && (p.E >= 1))) {
      { const $t145 = p; $t145.E = ($t145.E - 1); }
      this.token(i, "base");
    }
    if (($in("Pillaged Armory", $gi($gi(b, "gear"), i)) && $T(mine))) {
      this.buff($max($OR((() => { const $r = []; for (const u of $it(mine)) { if (!$T(u.buffed)) { $r.push(u); } } return $r; })(), () => [null]), $kw({"key": ((x) => ($T(x) ? x.might(this) : 0))})));
    }
    if (((() => { for (const u of $it(mine)) { if ((u.name === "Jarvan IV, Martial Paragon")) return true; } return false; })() && (() => { for (const x of $it($gi($gi(b, "gear"), i))) { if ($in("D", $gi($gi(CARDS, x), "f"))) return true; } return false; })())) {
      p.runes = $min(12, (p.runes + 1));
    }
    if (($gi(b, "name") === "Seat of Power")) {
      this.draw(p, (() => { let $s = 0; for (const b2 of $it($range(2))) { if ((!$eq(b2, bi) && $eq($gi($gi(this.bf, b2), "ctrl"), i))) { $s += $num(1); } } return $s; })());
    }
    if (($gi(b, "name") === "Monastery of Hirana")) {
      bu = (() => { const $r = []; for (const u of $it(mine)) { if ($T(u.buffed)) { $r.push(u); } } return $r; })();
      if ($T(bu)) {
        $gi(bu, 0).buffed = false;
        { const $t146 = $gi(bu, 0); $t146.base = ($t146.base - 1); }
        this.draw(p);
      }
    }
  }
  pre_options(p) {
    let out, c;
    out = [];
    for (c of $it($set(p.hand))) {
      if (((c === "Onslaught") && this.can_pay(p, 4, 0, c))) {
        $cm(out, "append", [c, "hand", 4, 0, 6]);
      }
      if (((c === "Perfect Execution") && this.can_pay(p, 3, 1, c))) {
        $cm(out, "append", [c, "hand", 3, 1, 3]);
      }
      if (((c === "Charm") && this.can_pay(p, 1, 1, c))) {
        $cm(out, "append", [c, "hand", 1, 1, "move"]);
      }
      if (((c === "Twilight Step") && this.can_pay(p, 2, 1, c))) {
        $cm(out, "append", [c, "hand", 2, 1, "move3"]);
      }
      if (((c === "Raucous Anthem") && this.can_pay(p, 7, 1, c))) {
        $cm(out, "append", [c, "hand", 7, 1, "all3"]);
      }
    }
    for (c of $it($set(p.trash))) {
      if (((c === "Onslaught") && this.can_pay(p, 4, 0, c))) {
        $cm(out, "append", [c, "flow", 4, 0, 6]);
      }
      if (((c === "Perfect Execution") && this.can_pay(p, 3, 1, c))) {
        $cm(out, "append", [c, "flow", 3, 1, 3]);
      }
      if (((c === "Twilight Step") && this.can_pay(p, 4, 1, c))) {
        $cm(out, "append", [c, "flow", 4, 1, "move3"]);
      }
    }
    return out;
  }
  pre_attack(i, bi, avail, foes, pump) {
    let p, opts, best, c, src, e, pw, v, group, cand, t, rest, out, extra, rdy, cost, _, key, u_;
    p = $gi(this.P, i);
    opts = this.pre_options(p);
    if (!$T(opts)) {
      return null;
    }
    best = null;
    for ([c, src, e, pw, v] of $it(opts)) {
      group = $list(avail);
      if ($in(v, ["move", "move3"])) {
        cand = (() => { const $r = []; for (const u of $it(foes)) { if ((!$T(u.protect) && !$in(u.name, UNTARGETABLE) && ((v === "move") || (u.might(this) <= 3)))) { $r.push(u); } } return $r; })();
        if (!$T(cand)) {
          continue;
        }
        t = $max(cand, $kw({"key": ((x) => (x.might(this) + x.shield(this)))}));
        rest = (() => { const $r = []; for (const u of $it(foes)) { if ((u !== t)) { $r.push(u); } } return $r; })();
        out = ($T(rest) ? this.predict(i, group, rest, pump) : new PyDict([["conquer", true], ["lost", 0]]));
        extra = null;
      } else {
        if ((v === "all3")) {
          group = $add(group, (() => { const $r = []; for (const u of $it(p.units)) { if (($T(u.exhausted) && (u.loc === "base") && (u.might(this) > 0) && !$in(u, group))) { $r.push(u); } } return $r; })());
          extra = null;
          out = this.predict(i, group, foes, (pump + (3 * $len(group))), undefined, 3);
        } else {
          rdy = ((c === "Perfect Execution") ? (() => { const $r = []; for (const u of $it(p.units)) { if (($T(u.exhausted) && (u.loc === "base") && (u.might(this) > 0))) { $r.push(u); } } return $r; })() : []);
          extra = ($T(rdy) ? $max(rdy, $kw({"key": ((x) => x.might(this))})) : null);
          if ((extra != null)) {
            group = $add(group, [extra]);
          }
          out = this.predict(i, group, foes, $add($add(pump, v), ((extra == null) ? 0 : 0)), v);
        }
        t = null;
      }
      if ($T($gi(out, "conquer"))) {
        cost = $add($add(e, pw), $mul(2, $cm(out, "get", "lost", 0)));
        if (((best == null) || (cost < $gi(best, 0)))) {
          best = [cost, c, src, e, pw, v, t, extra, group];
        }
      }
    }
    if ((best == null)) {
      return null;
    }
    [_, c, src, e, pw, v, t, extra, group] = $it(best);
    if ($T(this.slip(p))) {
      return null;
    }
    if ((src === "hand")) {
      $cm(p.hand, "remove", c);
      $cm(p.trash, "append", c);
    } else {
      $cm(p.trash, "remove", c);
      this.zed_banish(p);
    }
    this.pay(p, e, pw, c);
    $cm(p.plays, "append", [p.tn, c]);
    if ($in(v, ["move", "move3"])) {
      if ($T(this.answer_spell((1 - i), i, c, "move", t))) {
        return null;
      }
      t.loc = "base";
      if (this.v) this.say(`  ${$str(p.name)} casts ${$str(c)}: ${$str(t.name)} sent back before the attack`);
      return group;
    }
    key = $OR(extra, () => $max(group, $kw({"key": ((x) => x.might(this))})));
    if ($T(this.counter_any((1 - i), c))) {
      return null;
    }
    if ((v === "all3")) {
      for (u_ of $it(p.units)) {
        u_.exhausted = false;
        { const $t147 = u_; $t147.temp = ($t147.temp + 3); }
      }
      if (this.v) this.say(`  ${$str(p.name)} casts Raucous Anthem before attacking`);
      return group;
    }
    if ((c === "Perfect Execution")) {
      key.exhausted = false;
      { const $t148 = key; $t148.temp = ($t148.temp + 0); }
      key.pe_assault = this.turn_no;
    } else {
      { const $t149 = key; $t149.temp = $iadd($t149.temp, v); }
    }
    if (this.v) this.say(`  ${$str(p.name)} casts ${$str(c)} on ${$str(key.name)} before attacking`);
    return group;
  }
  best_pump(p) {
    let best, c, v;
    best = 0;
    for (c of $it(p.hand)) {
      if (($T($gi(FEAT16, "timing")) && !$in(c, COMBAT_OK))) {
        continue;
      }
      if (($in(c, PUMP) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
        v = $gi(PUMP, c);
        if ((v === "x2")) {
          v = 4;
        }
        if ((v === "all3")) {
          v = 6;
        }
        best = $max(best, v);
      }
    }
    if (($T($gi(FEAT16, "rules2")) && (() => { for (const u of $it(p.units)) { if (((u.name === "Renekton, Brute") && !$T(u.exhausted))) return true; } return false; })())) {
      best = $max(best, $min(4, $sub(p.E, $gi(this.reserve(p), 0))));
    }
    return best;
  }
  tide_swap(i, tt, bi) {
    let cand, tval, big, old;
    cand = (() => { const $r = []; for (const x of $it($gi(this.P, i).units)) { if (((x !== tt) && !$eq(x.loc, bi) && (x.might(this) > tt.might(this)) && !((x.loc !== "base") && ($len(this.units_at(i, x.loc)) === 1) && $eq($gi($gi(this.bf, x.loc), "ctrl"), i) && $T(this.units_at((1 - i), x.loc))))) { $r.push(x); } } return $r; })();
    if (!$T(cand)) {
      return null;
    }
    tval = (x) => {
      let v, locs;
      v = (x.might(this) + x.shield(this));
      if (($T($gi(TIDE2, 0)) && (x.name === "Akali, Deadly Weapon"))) {
        locs = (() => { const $r = []; for (const l of $it([bi, x.loc])) { if ((l !== "base")) { $r.push(l); } } return $r; })();
        if ((() => { for (const e of $it($gi(this.P, (1 - i)).units)) { if (($in(e.loc, locs) && !$T(e.protect) && !$in(e.name, UNTARGETABLE))) return true; } return false; })()) {
          v = (v + 4);
        }
      }
      return v;
    };
    big = $max(cand, $kw({"key": tval}));
    old = big.loc;
    big.loc = bi;
    tt.loc = old;
    if (this.v) this.say(`  ${$str($gi(this.P, i).name)}'s Tideturner swaps with ${$str(big.name)}`);
    return big;
  }
  ctrl_cleanup() {
    let bi, b, c, q_i, q, h;
    if (!$T($gi(FEAT16, "rules2"))) {
      return;
    }
    for ([bi, b] of $it($enumerate(this.bf))) {
      c = $gi(b, "ctrl");
      if (((c != null) && !$T(this.units_at(c, bi)))) {
        $si(b, "ctrl", null);
      }
    }
    for ([q_i, q] of $it($enumerate(this.P))) {
      for (h of $it($list(q.hidden))) {
        if (!$eq($gi($gi(this.bf, $gi(h, 1)), "ctrl"), q_i)) {
          $cm(q.hidden, "remove", h);
          $cm(q.trash, "append", $gi(h, 0));
        }
      }
    }
  }
  end_turn_cleanup() {
    let u, k, q;
    for ([u, k] of $it($ga(this, "tw_undo", []))) {
      if ((k === "pw")) {
        u.pw = false;
      } else {
        u.emp = 0;
      }
    }
    this.tw_undo = [];
    for (q of $it(this.P)) {
      for (u of $it(q.units)) {
        u.dmg = 0;
        u.temp = 0;
        u.shield_b = 0;
        u.tank_b = false;
        u.protect = false;
        u.ward = 0;
        u.stun = false;
      }
    }
    this.ctrl_cleanup();
  }
  heal_all() {
    let q, u;
    for (q of $it(this.P)) {
      for (u of $it(q.units)) {
        u.dmg = 0;
      }
    }
  }
  combat(i, bi, attackers) {
    let r;
    r = this._combat(i, bi, attackers);
    if ($T($gi(FEAT16, "cards"))) {
      this.heal_all();
    }
    if ($T($gi(FEAT16, "rules2"))) {
      if ((!$T(this.units_at(0, bi)) && !$T(this.units_at(1, bi)))) {
        $si($gi(this.bf, bi), "ctrl", null);
      }
      this.ctrl_cleanup();
    }
    return r;
  }
  _combat(i, bi, attackers) {
    let p, d, defenders, extra, u, t_, side_, us_, side, us, tgt, bu, tk, tu, pull, e, small, top3, un, g_, ef, live, dc, v, ok, t, them_, them, h, c, hb, th, sw, att_val, def_val, _, h0, h1, dd, bt_, a_dmg, d_dmg, dead_, alive, other;
    p = $gi(this.P, i);
    d = $gi(this.P, (1 - i));
    defenders = this.units_at((1 - i), bi);
    if (($T($gi(RULES34, 0)) && !$T(defenders))) {
      if (this.v) this.say(`  ${$str(p.name)} moves into empty ${$str($gi($gi(this.bf, bi), "name"))} with ${$str((() => { const $r = []; for (const u of $it(attackers)) { $r.push(u.name); } return $r; })())} (showdown)`);
      if (!$T(this.slip(d))) {
        this.fight_removal((1 - i), attackers, (() => { let $s = 0; for (const u of $it(attackers)) { $s += $num((u.might(this) + 1)); } return $s; })());
      }
      $ssl(attackers, null, null, (() => { const $r = []; for (const u of $it(attackers)) { if (($in(u, p.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
      return ($T(attackers) ? "conquer" : "lost");
    }
    if ((() => { for (const u of $it(attackers)) { if ((u.name === "Jarvan IV, Royal Heir")) return true; } return false; })()) {
      extra = (() => { const $r = []; for (const u of $it(p.units)) { if ((!$in(u, attackers) && (u.loc === "base"))) { $r.push(u); } } return $r; })();
      if ($T(extra)) {
        u = $max(extra, $kw({"key": ((x) => x.might(this))}));
        u.loc = bi;
        u.exhausted = true;
        $cm(attackers, "append", u);
      }
    }
    if (($T($gi(AZ, 0)) && $T(defenders) && (() => { for (const u of $it(attackers)) { if ((u.name === "Azir, Sovereign")) return true; } return false; })())) {
      for (t_ of $it((() => { const $r = []; for (const x of $it(p.units)) { if (($T(x.token) && !$in(x, attackers) && (x.might(this) > 0))) { $r.push(x); } } return $r; })())) {
        t_.loc = bi;
        $cm(attackers, "append", t_);
      }
    }
    if (($T($gi(AZ, 0)) && $T(defenders))) {
      for ([side_, us_] of $it([[p, attackers], [d, defenders]])) {
        if ((($len(us_) === 1) && $in("Mask of Foresight", side_.base_gear))) {
          { const $t150 = $gi(us_, 0); $t150.temp = ($t150.temp + $cm(side_.base_gear, "count", "Mask of Foresight")); }
        }
      }
    }
    if (($T(defenders) && (() => { for (const u of $it(attackers)) { if ((u.name === "Leona, Determined")) return true; } return false; })())) {
      $max(defenders, $kw({"key": ((x) => x.might(this))})).stun = true;
    }
    for (u of $it(attackers)) {
      if (((u.name === "Riven, Deserter") && !$T($gi(RULES34, 0)))) {
        { const $t151 = u; $t151.temp = ($t151.temp + (() => { let $s = 0; for (const x of $it(p.units)) { if (((x !== u) && $T(x.exhausted))) { $s += $num(1); } } return $s; })()); }
      }
    }
    for (u of $it($add($list(attackers), $list(defenders)))) {
      if (((u.name === "Sett, Brawler") && $T(u.buffed))) {
        u.buffed = false;
        { const $t152 = u; $t152.base = ($t152.base - 1); }
        { const $t153 = u; $t153.temp = ($t153.temp + 4); }
      }
    }
    if (this.v) this.say(`  ${$str(p.name)} attacks ${$str($gi($gi(this.bf, bi), "name"))} with ${$str((() => { const $r = []; for (const u of $it(attackers)) { $r.push(u.name); } return $r; })())} vs ${$str((() => { const $r = []; for (const u of $it(defenders)) { $r.push(u.name); } return $r; })())}`);
    if ((($gi($gi(this.bf, bi), "name") === "Durand Memorial") && $T(defenders))) {
      $max(defenders, $kw({"key": ((u) => u.might(this))})).tank_b = true;
    }
    for ([side, us] of $it([[i, attackers], [(1 - i), defenders]])) {
      if ((() => { for (const u of $it(us)) { if ((u.name === "K'Sante, Dauntless")) return true; } return false; })()) {
        tgt = $max(us, $kw({"key": ((u) => u.shield(this))}));
        { const $t154 = tgt; $t154.shield_b = $iadd($t154.shield_b, tgt.shield(this)); }
      }
    }
    if ($T($gi(FEAT16, "legends"))) {
      if (((p.leg === "ksante") && ($ga(p, "ksleg", null) == null) && (p.E >= 1) && $T(attackers))) {
        bu = $max(attackers, $kw({"key": ((u) => u.shield(this))}));
        if ((bu.shield(this) > 0)) {
          { const $t155 = p; $t155.E = ($t155.E - 1); }
          p.ksleg = bu;
          if (this.v) this.say(`  ${$str(p.name)}'s legend gives ${$str(bu.name)} Assault ${$str(bu.shield(this))}`);
        }
      }
      for ([side_, us_] of $it([[p, attackers], [d, defenders]])) {
        if (((side_.leg === "shen") && !$T($ga(side_, "shenleg", false)) && ($len(us_) >= 2))) {
          tk = $max(us_, $kw({"key": ((u) => (u.might(this) + u.shield(this)))}));
          if (!$T(tk.is_tank())) {
            tk.tank_b = true;
            side_.shenleg = true;
          }
        }
      }
    }
    if ($T($gi(FEAT16, "rules2"))) {
      for (u of $it(attackers)) {
        if (((u.name === "Shadow Clone") && !$eq($ga(u, "clone_tn", (-1)), this.turn_no))) {
          tu = (() => { const $r = []; for (const c of $it(p.trash)) { if (($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Unit")) { $r.push(c); } } return $r; })();
          if ($T(tu)) {
            $cm(p.trash, "remove", $min(tu, $kw({"key": ((c) => $gi($gi(CARDS, c), "e"))})));
            u.clone_tn = this.turn_no;
            this.zed_banish(p);
          }
        }
      }
    }
    if ($T($gi(CHAIN, 0))) {
      for (u of $it(attackers)) {
        if ((u.name === "Irresistible Faefolk")) {
          pull = (() => { const $r = []; for (const e of $it(d.units)) { if (((e.loc === "base") && !$T(e.token))) { $r.push(e); } } return $r; })();
          if ($T(pull)) {
            e = $min(pull, $kw({"key": ((x) => x.might(this))}));
            e.loc = bi;
            $cm(defenders, "append", e);
          }
        }
      }
      this.combat_triggers(i, bi, attackers, defenders);
    } else {
      for (u of $it(attackers)) {
        if ((u.name === "Graves, Blasting Through")) {
          for (e of $it($list(defenders))) {
            this.deal(e, u.might(this), "Graves");
          }
        }
        if (((u.name === "Renekton, Rage Fueled") && (p.runes <= 4))) {
          for (e of $it($list(defenders))) {
            this.deal(e, 2, "Rage Fueled");
          }
        }
        if (((u.name === "Ambessa, Respected and Feared") && $T(($T($gi(FEAT16, "cards")) ? u.pw : u.emp)))) {
          small = (() => { const $r = []; for (const e of $it(defenders)) { if (((e.might(this) < u.might(this)) && !($T($gi(AUDIT, 0)) && ($in(e.name, UNTARGETABLE) || $T(e.protect))))) { $r.push(e); } } return $r; })();
          if ($T(small)) {
            this.kill($max(small, $kw({"key": ((e) => e.might(this))})), "Ambessa");
          }
        }
        if (($T($gi(FEAT16, "rules2")) && (u.name === "Rift Herald") && $T(p.deck) && !$T($gi(MOVES, 0)))) {
          top3 = $sl(p.deck, (-3), null);
          $dsl(p.deck, (-3), null);
          un = (() => { const $r = []; for (const x of $it(top3)) { if (($cm($cm(CARDS, "get", x, new PyDict([])), "get", "t") === "Unit")) { $r.push(x); } } return $r; })();
          if ($T(un)) {
            g_ = $max(un, $kw({"key": ((x) => $gi($gi(CARDS, x), "e"))}));
            $cm(top3, "remove", g_);
            $cm(p.hand, "append", g_);
          }
          $ssl(p.deck, 0, 0, top3);
        }
        if (($T($gi(FEAT16, "rules2")) && (u.name === "Akali, Silent") && !$T($gi(MOVES, 0)))) {
          { const $t156 = u; $t156.temp = ($t156.temp + 2); }
        }
        for (ef of $it($cm(GEN, "get", u.name, []))) {
          if (($gi(ef, 0) === "atk_pump")) {
            { const $t157 = u; $t157.temp = $iadd($t157.temp, $gi(ef, 1)); }
          }
        }
        if (((u.name === "Vi, Peacekeeper") && $T(defenders))) {
          t_ = (() => { const $r = []; for (const e of $it(defenders)) { if (($in(e, d.units) && !$T(e.stun) && !$in(e.name, UNTARGETABLE) && !$T(e.protect))) { $r.push(e); } } return $r; })();
          if ($T(t_)) {
            $max(t_, $kw({"key": ((e) => e.might(this))})).stun = true;
          }
        }
        if (((u.name === "Kennen, Keeper of Balance") && $T(defenders) && (p.E >= 2))) {
          t_ = (() => { const $r = []; for (const e of $it(defenders)) { if (($in(e, d.units) && !$T(e.stun) && !$in(e.name, UNTARGETABLE) && !$T(e.protect))) { $r.push(e); } } return $r; })();
          if ($T(t_)) {
            { const $t158 = p; $t158.E = ($t158.E - 2); }
            $max(t_, $kw({"key": ((e) => e.might(this))})).stun = true;
          }
        }
        if (((u.name === "Baccai Reaper") && (p.P >= 1))) {
          { const $t159 = p; $t159.P = ($t159.P - 1); }
          { const $t160 = p; $t160.runes = ($t160.runes - 1); }
          { const $t161 = u; $t161.temp = ($t161.temp + 2); }
        }
        if (($T($gi(FEAT16, "cards")) && (u.name === "Mordekaiser, Dominating") && $T(p.hand) && $T(defenders))) {
          live = (() => { const $r = []; for (const e of $it(defenders)) { if (($in(e, d.units) && !$T(e.protect) && !($T($gi(AUDIT, 0)) && $in(e.name, UNTARGETABLE)))) { $r.push(e); } } return $r; })();
          if ($T(live)) {
            dc = $min(p.hand, $kw({"key": ((x) => $add($gi($gi(CARDS, x), "e"), ($in(x, REMOVAL) ? 5 : 0)))}));
            $cm(p.hand, "remove", dc);
            $cm(p.trash, "append", dc);
            this.kill($max(live, $kw({"key": ((e) => (e.might(this) + e.shield(this)))})), "Mordekaiser");
          }
        }
        if (($T($gi(FEAT16, "cards")) && (u.name === "Evelynn, In Control") && $T(defenders))) {
          live = (() => { const $r = []; for (const e of $it(defenders)) { if ($in(e, d.units)) { $r.push(e); } } return $r; })();
          if ($T(live)) {
            { const $t162 = $max(live, $kw({"key": ((e) => e.might(this))})); $t162.temp = ($t162.temp - 1); }
          }
        }
        if (((u.name === "Reckless Innovator") && !$T($gi(MOVES, 0)))) {
          this.gain_gold(p);
        }
        if (($in(u.name, ["Armored Tusker", "Akali, Deadly Weapon"]) && $T(defenders) && !$T($gi(MOVES, 0)))) {
          v = ((u.name === "Armored Tusker") ? u.shield(this) : ($T(u.pw) ? 2 : 1));
          ok = (() => { const $r = []; for (const e of $it(defenders)) { if (($in(e, d.units) && ((e.might(this) - e.dmg) <= v))) { $r.push(e); } } return $r; })();
          t = ($T(ok) ? $max(ok, $kw({"key": ((e) => e.might(this))})) : $max($OR((() => { const $r = []; for (const e of $it(defenders)) { if ($in(e, d.units)) { $r.push(e); } } return $r; })(), () => [null]), $kw({"key": ((e) => ($T(e) ? e.might(this) : 0))})));
          if ((t != null)) {
            this.deal(t, v, u.name);
          }
        }
        if ((u.name === "Irresistible Faefolk")) {
          pull = (() => { const $r = []; for (const e of $it(d.units)) { if (((e.loc === "base") && !$T(e.token))) { $r.push(e); } } return $r; })();
          if ($T(pull)) {
            e = $min(pull, $kw({"key": ((x) => x.might(this))}));
            e.loc = bi;
            $cm(defenders, "append", e);
          }
        }
      }
      for (u of $it(defenders)) {
        if ((u.name === "Graves, Blasting Through")) {
          for (e of $it($list(attackers))) {
            this.deal(e, u.might(this), "Graves");
          }
        }
      }
      if ($T($gi(META25, 0))) {
        for ([side_, us_, them_] of $it([[p, attackers, defenders], [d, defenders, attackers]])) {
          for (u of $it(us_)) {
            if (((u.name === "Kha'Zix, Mutating Horror") && ($len(them_) === 1))) {
              { const $t163 = u; $t163.temp = ($t163.temp + 2); }
              side_.xp = ($ga(side_, "xp", 0) + 2);
            }
          }
        }
      }
      for ([side, us, them] of $it([[i, attackers, defenders], [(1 - i), defenders, attackers]])) {
        for (u of $it($list(us))) {
          if ($in("Forgefire Cape", u.eq)) {
            for (e of $it($list(them))) {
              this.deal(e, 2, "Forgefire Cape");
            }
          }
        }
      }
    }
    attackers = (() => { const $r = []; for (const u of $it(attackers)) { if ($in(u, p.units)) { $r.push(u); } } return $r; })();
    defenders = (() => { const $r = []; for (const u of $it(defenders)) { if ($in(u, d.units)) { $r.push(u); } } return $r; })();
    if (!$T(attackers)) {
      return "lost";
    }
    if (!$T(defenders)) {
      return "conquer";
    }
    if ($T($gi(SMART, 0))) {
      for (h of $it($list(p.hidden))) {
        if (!$in(h, p.hidden)) {
          continue;
        }
        [c, hb, th] = $it(h);
        if (($eq(hb, bi) && (th < this.turn_no) && ($gi($gi(CARDS, c), "t") === "Unit"))) {
          $cm(p.hidden, "remove", h);
          u = this.place_unit(i, c, bi);
          u.exhausted = true;
          $cm(attackers, "append", u);
          if ($T($gi(AI36, 0))) {
            p.kemp = true;
          }
          if ($T($gi(PB2, 0))) {
            this.ev_flip(p);
          } else if ((p.leg === "evelynn")) {
            this.draw(p);
          }
          this.from_hidden(p, c, bi);
          if (this.v) this.say(`  ${$str(p.name)} flips ${$str(c)} into the attack`);
          if (((c === "Tideturner") && $T($gi(FEAT16, "cards")))) {
            sw = this.tide_swap(i, u, bi);
            if ((sw != null)) {
              $cm(attackers, "remove", u);
              $cm(attackers, "append", sw);
            }
          }
        }
      }
      if ((($len(attackers) >= 3) && (() => { for (const u of $it(p.units)) { if ((u.name === "Seraphine, Inspiring")) return true; } return false; })())) {
        this.draw(p);
      }
    }
    if (((p.leg === "kennen") && $T(p.kemp))) {
      p.kemp = false;
      { const $t164 = $max(attackers, $kw({"key": ((u) => u.might(this))})); $t164.temp = ($t164.temp + 2); }
    }
    att_val = () => {
      return this.att_total(attackers, defenders, i);
    };
    def_val = () => {
      return this.def_total(defenders, attackers);
    };
    if ((att_val() <= def_val())) {
      this.surprise_standard(i, bi, attackers, ($sub(def_val(), att_val()) + 1));
    }
    if ((att_val() <= def_val())) {
      this.use_pump(i, attackers, ($sub(def_val(), att_val()) + 1));
    }
    if ((att_val() > def_val())) {
      this.defender_react((1 - i), defenders, attackers, $sub(att_val(), def_val()));
    }
    $ssl(attackers, null, null, (() => { const $r = []; for (const u of $it(attackers)) { if (($in(u, p.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
    $ssl(defenders, null, null, (() => { const $r = []; for (const u of $it(defenders)) { if (($in(u, d.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
    if ($T($gi(PLAYER_AI, 0))) {
      for (_ of $it($range(2))) {
        $ssl(attackers, null, null, (() => { const $r = []; for (const u of $it(attackers)) { if (($in(u, p.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
        $ssl(defenders, null, null, (() => { const $r = []; for (const u of $it(defenders)) { if (($in(u, d.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
        if ((!$T(attackers) || !$T(defenders))) {
          break;
        }
        if ((att_val() <= def_val())) {
          h0 = $len(p.hand);
          this.surprise_standard(i, bi, attackers, ($sub(def_val(), att_val()) + 1));
          if ((att_val() <= def_val())) {
            this.use_pump(i, attackers, ($sub(def_val(), att_val()) + 1));
          }
          if ($eq($len(p.hand), h0)) {
            break;
          }
          if ((att_val() > def_val())) {
            h1 = $len(d.hand);
            this.defender_react((1 - i), defenders, attackers, $sub(att_val(), def_val()));
            if ($eq($len(d.hand), h1)) {
              break;
            }
          }
        } else {
          break;
        }
      }
    }
    $ssl(attackers, null, null, (() => { const $r = []; for (const u of $it(attackers)) { if (($in(u, p.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
    $ssl(defenders, null, null, (() => { const $r = []; for (const u of $it(defenders)) { if (($in(u, d.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
    if (($T(attackers) && $T(defenders) && ($T($ga(p, "ai30", $gi(AI30, 0))) || $T($ga(d, "ai30", $gi(AI30, 0)))))) {
      this.trick_pass(i, bi, attackers, defenders);
      $ssl(attackers, null, null, (() => { const $r = []; for (const u of $it(attackers)) { if (($in(u, p.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
      $ssl(defenders, null, null, (() => { const $r = []; for (const u of $it(defenders)) { if (($in(u, d.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
    }
    if (($T($gi(SATCHEL, 0)) && $T(attackers) && $T(defenders))) {
      for ([side_, us_, them_] of $it([[i, attackers, defenders], [(1 - i), defenders, attackers]])) {
        this.bomb_strike(side_, bi, us_, them_);
      }
      $ssl(attackers, null, null, (() => { const $r = []; for (const u of $it(attackers)) { if (($in(u, p.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
      $ssl(defenders, null, null, (() => { const $r = []; for (const u of $it(defenders)) { if (($in(u, d.units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
    }
    if (!$T(attackers)) {
      return "lost";
    }
    if (!$T(defenders)) {
      return "conquer";
    }
    if (((p.ai >= 2) && $in("Back Off", p.hand) && this.can_pay(p, 3, 0, "Back Off") && $T(attackers) && $T(defenders))) {
      dd = this.def_total(defenders, attackers, true);
      if ((dd >= $min((() => { const $r = []; for (const u of $it(attackers)) { $r.push(u.might(this)); } return $r; })()))) {
        t = $max(defenders, $kw({"key": ((x) => x.might(this))}));
        t.stun = true;
        if ($T(this.cast(p, "Back Off", 3, 0))) {
          this.draw(p);
        }
      }
    }
    if (((p.ai >= 2) && $in("One-Two Punch", p.hand) && this.can_pay(p, 3, 0, "One-Two Punch") && $T(attackers) && $T(defenders))) {
      dd = this.def_total(defenders, attackers, true);
      if ((dd >= $min((() => { const $r = []; for (const u of $it(attackers)) { $r.push(u.might(this)); } return $r; })()))) {
        t = $max(defenders, $kw({"key": ((x) => x.might(this))}));
        t.stun = true;
        if ($T(this.cast(p, "One-Two Punch", 3, 0))) {
          bt_ = $max(attackers, $kw({"key": ((x) => x.might(this))}));
          if ($T($gi(FEAT16, "cards"))) {
            this.buff(bt_);
          } else {
            { const $t165 = bt_; $t165.emp = ($t165.emp + 1); }
          }
          if (this.v) this.say(`  ${$str(p.name)} One-Two Punches ${$str(t.name)}`);
        }
      }
    }
    if ($T($gi(PB2, 0))) {
      this.decree_choice(i, attackers, defenders);
    }
    a_dmg = this.att_total(attackers, defenders, i, true);
    d_dmg = this.def_total(defenders, attackers, true);
    dead_ = [];
    this.assign(a_dmg, defenders, true, attackers, dead_);
    this.assign(d_dmg, attackers, false, defenders, dead_);
    this.resolve_deaths(dead_, "combat");
    attackers = (() => { const $r = []; for (const u of $it(attackers)) { if ($in(u, p.units)) { $r.push(u); } } return $r; })();
    defenders = (() => { const $r = []; for (const u of $it(defenders)) { if ($in(u, d.units)) { $r.push(u); } } return $r; })();
    for (u of $it($add(attackers, defenders))) {
      if ((u.name === "Mournful Witness")) {
        u.emp = 2;
      }
      if (((u.name === "Affectionate Poro") && $eq(u.dmg, 0))) {
        this.draw($gi(this.P, u.owner));
      }
    }
    for ([side, alive] of $it([[i, attackers], [(1 - i), defenders]])) {
      other = ($eq(side, i) ? defenders : attackers);
      if (($T(alive) && !$T(other) && (() => { for (const x of $it(alive)) { if ((x.name === "Nidalee, Cat Form")) return true; } return false; })())) {
        this.draw($gi(this.P, side));
      }
      if (($T(alive) && !$T(other) && $in("Blossoming Dreamroot", $gi($gi($gi(this.bf, bi), "gear"), side)))) {
        this.draw($gi(this.P, side));
      }
    }
    if (($T(attackers) && !$T(defenders))) {
      return "conquer";
    }
    if (($T(attackers) && $T(defenders))) {
      for (u of $it(attackers)) {
        u._loc = "base";
      }
      return "bounce";
    }
    return "lost";
  }
  att_total(att, dfn, i, dealing = false) {
    let tot, pk, vile, u, m;
    tot = 0;
    pk = $gi(this.P, i);
    if (($T($gi(FEAT16, "legends")) && (pk.leg === "ksante") && ($ga(pk, "ksleg", null) == null) && (pk.E >= 1) && $T(att))) {
      tot = $iadd(tot, $max((() => { const $r = []; for (const u of $it(att)) { $r.push(u.shield(this)); } return $r; })()));
    }
    if (($T(att) && ($gi(att, 0).loc !== "base") && $in("Demacian Standard", $gi($gi($gi(this.bf, $gi(att, 0).loc), "gear"), i)))) {
      tot = (tot + 2);
    }
    vile = $max($OR((() => { const $r = []; for (const x of $it(dfn)) { if ((x.name === "Vilemaw")) { $r.push(x.might(this)); } } return $r; })(), () => [0]));
    for (u of $it(att)) {
      if (($T(dealing) && $T(vile) && (u.might(this) < vile))) {
        continue;
      }
      m = $add((u.might(this) + u.kw("assault")), ((u.name === "Repair Specialist") ? $len(this.all_gear(i)) : 0));
      if (($T($gi(FEAT16, "cards")) && (u.name === "Ambessa, Respected and Feared") && $T(u.pw))) {
        m = (m + 2);
      }
      if ($eq($ga(u, "pe_assault", (-1)), this.turn_no)) {
        m = (m + 3);
      }
      if (($T($gi(FEAT16, "rules2")) && (u.name === "Shadow Fiend") && $T(u.pw))) {
        m = (m + 3);
      }
      if (($T($gi(FEAT16, "rules2")) && $eq($ga(u, "as2_tn", (-1)), this.turn_no))) {
        m = (m + 2);
      }
      if (($T($gi(FEAT16, "rules2")) && (u.name === "Shadow Clone") && ($eq($ga(u, "clone_tn", (-1)), this.turn_no) || (!$T(dealing) && (() => { for (const c of $it($gi(this.P, i).trash)) { if (($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Unit")) return true; } return false; })())))) {
        m = (m + 4);
      }
      if (((u.name === "Fiora, Peerless") && ($len(att) === 1) && ($len(dfn) === 1))) {
        m = (m + u.might(this));
      }
      if (($gi(this.P, i).leg === "ksante")) {
        if (!$T($gi(FEAT16, "legends"))) {
          m = $iadd(m, u.shield(this));
        } else if (($ga($gi(this.P, i), "ksleg", null) === u)) {
          m = $iadd(m, u.shield(this));
        }
      }
      if (($T(dealing) && $in(u.name, ["Graves, Blasting Through"]))) {
        m = 0;
      }
      if (($T(dealing) && $T(u.stun))) {
        m = 0;
      }
      if (($T(dealing) && (u.name === "Sacred Protector") && ($len(att) !== 2))) {
        m = 0;
      }
      if (($T(dealing) && (u.name === "Orianna, Exquisite") && (!$T($gi(AUDIT, 0)) || !$T(this.gear_here(u))))) {
        m = 0;
      }
      tot = $iadd(tot, $max(0, m));
    }
    return tot;
  }
  gear_here(u) {
    let b;
    if ((u.loc === "base")) {
      return $bool($gi(this.P, u.owner).base_gear);
    }
    b = $gi(this.bf, u.loc);
    return ($bool($gi($gi(b, "gear"), u.owner)) || ($gi($gi(b, "bombs"), u.owner) > 0) || (() => { for (const x of $it($gi(this.P, u.owner).units)) { if ((($T(x.eq) || $T($ga(x, "anim", false))) && $eq(x.loc, u.loc))) return true; } return false; })());
  }
  def_total(dfn, att, dealing = false) {
    let tot, vile, u, m;
    tot = 0;
    vile = $max($OR((() => { const $r = []; for (const x of $it(att)) { if ((x.name === "Vilemaw")) { $r.push(x.might(this)); } } return $r; })(), () => [0]));
    for (u of $it(dfn)) {
      m = (u.might(this) + u.shield(this));
      if ((($len(dfn) === 1) && ($gi(this.P, u.owner).leg === "masteryi"))) {
        m = (m + 2);
      }
      if (($T(dealing) && $T(vile) && (u.might(this) < vile))) {
        m = 0;
      }
      if (((u.name === "Fiora, Peerless") && ($len(att) === 1) && ($len(dfn) === 1))) {
        m = (m + u.might(this));
      }
      if (($T(dealing) && $in(u.name, ["Graves, Blasting Through"]))) {
        m = 0;
      }
      if (($T(dealing) && (u.name === "Sacred Protector") && ($len(dfn) !== 2))) {
        m = 0;
      }
      if (($T(dealing) && $T(u.stun))) {
        m = 0;
      }
      if (($T(dealing) && (u.name === "Orianna, Exquisite") && (u.loc !== "base") && !((() => { for (const g of $it($gi($gi($gi(this.bf, u.loc), "gear"), u.owner))) { if (!$T($cm($gi(CARDS, g), "get", "eq"))) return true; } return false; })()) && !((() => { for (const x of $it($gi(this.P, u.owner).units)) { if (($T(x.token) && $T($ga(x, "anim", false)) && $eq(x.loc, u.loc))) return true; } return false; })()))) {
        m = 0;
      }
      tot = $iadd(tot, $max(0, m));
    }
    return tot;
  }
  uval(u) {
    let c, v;
    if ($T(u.token)) {
      return (0.5 + (0.4 * u.might(this)));
    }
    c = $cm(CARDS, "get", u.name, new PyDict([]));
    v = (($add($cm(c, "get", "e", 2), $cm(c, "get", "p", 0)) + 1) + (2 * $len(u.eq)));
    if ($T(champion_like(u.name))) {
      v = (v + 2);
    }
    return v;
  }
  _deaths(dmg, units, defending) {
    let dead, hpf, order, u, hp;
    dead = $set();
    hpf = ((u) => ($T($gi(RULES34, 0)) ? this.cmight(u, units, [], defending) : (u.might(this) + ($T(defending) ? u.shield(this) : 0))));
    order = $sorted(units, $kw({"key": ((u) => [!$T(u.is_tank()), u.kw("back"), hpf(u)])}));
    for (u of $it(order)) {
      hp = ($T($gi(RULES34, 0)) ? $max(1, ($sub(hpf(u), u.dmg) + u.ward)) : ($sub(hpf(u), u.dmg) + u.ward));
      if (($T($gi(RULES34, 0)) && (dmg <= 0))) {
        break;
      }
      if ((dmg >= hp)) {
        dmg = $sub(dmg, hp);
        $cm(dead, "add", u);
      } else {
        dmg = 0;
      }
      if ((dmg <= 0)) {
        break;
      }
    }
    return dead;
  }
  fight_score(s, i, att, dfn) {
    let a, d, da, dd, lost_a, lost_d, alive_a, alive_d, v;
    a = this.att_total(att, dfn, i, true);
    d = this.def_total(dfn, att, true);
    da = this._deaths(d, att, false);
    dd = this._deaths(a, dfn, true);
    lost_a = (() => { let $s = 0; for (const u of $it(da)) { if (!$T(u.retreat)) { $s += $num(this.uval(u)); } } return $s; })();
    lost_d = (() => { let $s = 0; for (const u of $it(dd)) { if (!$T(u.retreat)) { $s += $num(this.uval(u)); } } return $s; })();
    alive_a = (() => { const $r = []; for (const u of $it(att)) { if (!$in(u, da)) { $r.push(u); } } return $r; })();
    alive_d = (() => { const $r = []; for (const u of $it(dfn)) { if (!$in(u, dd)) { $r.push(u); } } return $r; })();
    v = $sub($add((($T(alive_a) && !$T(alive_d)) ? $ga($gi(this.P, i), "conq_v", $gi(CONQ_V, 0)) : 0), lost_d), lost_a);
    return ($eq(s, i) ? v : (-v));
  }
  _has_gear(p) {
    return $OR((() => { for (const c of $it(p.hand)) { if (($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t") === "Gear")) return true; } return false; })(), () => $OR(p.base_gear, () => $OR(p.loose_eq, () => $OR((() => { for (const u of $it(p.units)) { if ($T(u.eq)) return true; } return false; })(), () => (() => { for (const b of $it(this.bf)) { if ($T($gi($gi(b, "gear"), $cm(this.P, "index", p)))) return true; } return false; })()))));
  }
  trick_options(s, i, us, them) {
    let p, out, ef, tw, cost, hand, bi, c, e, pw, src, where, a, b, d, e0, p0, live, z, cl, u, cd, bonus, ee, v, two, x, t, kind, val, m, keep;
    p = $gi(this.P, s);
    out = [];
    ef = ($eq(s, i) ? 0.45 : 0.15);
    tw = $ga(p, "trick_w", $gi(TRICK_W, 0));
    if (($T($ga(p, "hab_thrift", $gi(HAB, "thrift"))) && !$eq(s, i) && ($sub(p.points, $gi(this.P, (1 - s)).points) >= 3) && ($gi(this.P, (1 - s)).points < 6))) {
      tw = (tw * 1.5);
    }
    cost = (e, pw, bonus = 0.0) => {
      return $sub($add($add(tw, $mul(ef, e)), $mul(0.6, pw)), bonus);
    };
    hand = $set(p.hand);
    bi = ($T(us) ? $gi(us, 0).loc : null);
    if (($T($ga(p, "gaps31", $gi(GAPS31, 0))) && $T(us) && $T(them))) {
      for (c of $it(hand)) {
        if (($in(c, AMBUSH) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
          [e, pw] = $it([$gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p")]);
          $cm(out, "append", [c, e, pw, $add((0.5 + $mul(ef, e)), $mul(0.6, pw)), ["ambush", c, us, s, null]]);
        }
      }
      src = [];
      if (($in("Switcheroo", hand) && this.can_pay(p, 2, 2, "Switcheroo"))) {
        $cm(src, "append", ["hand", 2, 2]);
      }
      if ((() => { for (const h of $it(p.hidden)) { if ((($gi(h, 0) === "Switcheroo") && $eq($gi(h, 1), bi) && ($gi(h, 2) < this.turn_no))) return true; } return false; })()) {
        $cm(src, "append", ["hidden", 0, 0]);
      }
      if ($T(src)) {
        [where, e, pw] = $it($min(src, $kw({"key": ((x) => $gi(x, 1))})));
        for (a of $it(us)) {
          for (b of $it(them)) {
            if (($T(b.protect) || $in(b.name, UNTARGETABLE) || $T(this.wild_safe(b)))) {
              continue;
            }
            d = (b.might(this) - a.might(this));
            if ((d > 0)) {
              $cm(out, "append", ["Switcheroo", e, pw, cost(e, pw), ["swap", a, b, d, where]]);
            }
          }
        }
      }
      if (!$eq(s, i)) {
        for ([c, e0, p0] of $it([["Thwonk!", 2, 0], ["Existential Dread", 1, 1]])) {
          if (($in(c, hand) && this.can_pay(p, (e0 + 2), p0, c))) {
            live = $sorted((() => { const $r = []; for (const t of $it(them)) { if ((!$T(t.stun) && !$T(t.protect) && !$in(t.name, UNTARGETABLE))) { $r.push(t); } } return $r; })(), $kw({"key": ((x) => (-x.might(this)))}));
            if (($len(live) >= 2)) {
              $cm(out, "append", [c, (e0 + 2), p0, cost((e0 + 2), p0), ["stun2", $gi(live, 0), $gi(live, 1)]]);
            }
          }
        }
      }
      for (z of $it((() => { const $r = []; for (const x of $it(p.units)) { if (((x.name === "Zed, Without a Sound") && (x.loc === "base") && !$in(x, us))) { $r.push(x); } } return $r; })())) {
        cl = (() => { const $r = []; for (const x of $it(us)) { if ((x.name === "Shadow Clone")) { $r.push(x); } } return $r; })();
        if (($T(cl) && this.can_pay(p, 1, 1, "Zed, Without a Sound"))) {
          $cm(out, "append", ["Zed, Without a Sound", 1, 1, ((0.3 + ef) + 0.6), ["zswap", z, $gi(cl, 0), us]]);
        }
      }
    }
    if (($T($gi(AZ, 0)) && $eq(s, i) && (p.leg === "akali") && !$T($ga(p, "akleg", true)) && $T(us) && (bi != null))) {
      for (u of $it(us)) {
        if ((($len(us) > 1) || (u.might(this) >= 3))) {
          $cm(out, "append", ["Akali legend", 0, 0, 0.6, ["akret", u, us, bi]]);
        }
      }
    }
    for (c of $it(hand)) {
      if (!$in(c, COMBAT_OK)) {
        continue;
      }
      cd = $gi(CARDS, c);
      e = this.pe(p, c);
      pw = $gi(cd, "p");
      if (!(this.can_pay(p, e, pw, c))) {
        continue;
      }
      if (($in(c, PUMP) && !$in(c, ["Smoke Screen", "Raucous Anthem", "Bonds of Strength"]))) {
        bonus = ((c === "Discipline") ? 2.0 : 0.0);
        ee = (((c === "Battle Preparations") && $T(this._has_gear(p))) ? $max(0, (e - 2)) : e);
        for (u of $it(us)) {
          if ((c === "Block")) {
            $cm(out, "append", [c, e, pw, cost(ee, pw), ["block", u]]);
            continue;
          }
          v = $gi(PUMP, c);
          if ((v === "x2")) {
            v = u.might(this);
          }
          if (((c === "Guttural Roar") && ($T(u.pw) || $T(u.emp)))) {
            v = 4;
          }
          if (($T($ga(p, "gaps31", $gi(GAPS31, 0))) && (c === "En Garde"))) {
            v = (1 + (($len((() => { const $r = []; for (const x of $it($gi(this.P, s).units)) { if ($eq(x.loc, u.loc)) { $r.push(x); } } return $r; })()) === 1) ? 1 : 0));
          }
          if ((!($isinstance(v, $int)) || (v <= 0))) {
            continue;
          }
          $cm(out, "append", [c, e, pw, cost(ee, pw, bonus), ["pump", u, v]]);
        }
      } else if (((c === "Bonds of Strength") && $T(us))) {
        two = $sl($sorted(us, $kw({"key": ((y) => (-y.might(this)))})), null, 2);
        $cm(out, "append", [c, e, pw, cost(e, pw), ["bonds", two, 1]]);
        if (this.can_pay(p, (e + 2), pw, c)) {
          $cm(out, "append", [c, (e + 2), pw, cost((e + 2), pw), ["bonds", two, 2]]);
        }
      } else if (((c === "Decree of Focus") && (() => { for (const x of $it(them)) { if ($in(x.name, FURY)) return true; } return false; })())) {
        for (u of $it(us)) {
          $cm(out, "append", [c, e, pw, cost(e, pw), ["pump", u, 4]]);
        }
      } else if ((c === "Ki Barrier")) {
        for (u of $it(us)) {
          $cm(out, "append", [c, e, pw, cost(e, pw), ["ward", u, 7]]);
        }
      } else if (($T($gi(PB2, 0)) && (c === "Blood Rush") && $eq(s, i))) {
        for (u of $it(us)) {
          $cm(out, "append", [c, e, pw, cost(e, pw), ["pump", u, 2]]);
          if (this.can_pay(p, (e + 1), pw, c)) {
            $cm(out, "append", [c, (e + 1), pw, cost((e + 1), pw), ["pump", u, 4]]);
          }
        }
      } else if (((c === "Tactical Retreat") || ($T($gi(AI36, 0)) && (c === "Flash")))) {
        for (u of $it(us)) {
          if (!$T(u.token)) {
            $cm(out, "append", [c, e, pw, cost(e, pw), ["retreat", u]]);
          }
        }
      } else if ($in(c, ["Mesmerize", "High Note", "Decree of Insight", "Smoke Screen", "Stupefy", "Thwonk!", "Existential Dread"])) {
        if (($in(c, ["Thwonk!", "Existential Dread"]) && $eq(s, i))) {
          continue;
        }
        x = (() => { let $s = 0; for (const u of $it(p.units)) { if ($T(u.exhausted)) { $s += $num(1); } } return $s; })();
        for (t of $it(them)) {
          if (($T(t.protect) || $in(t.name, UNTARGETABLE) || $T(this.wild_safe(t)))) {
            continue;
          }
          if ($in(c, ["Thwonk!", "Existential Dread"])) {
            if ($T(t.stun)) {
              continue;
            }
            $cm(out, "append", [c, e, pw, cost(e, pw), ["stun", t]]);
            continue;
          }
          if ((c === "Mesmerize")) {
            v = 2;
          } else if ((c === "High Note")) {
            v = x;
          } else if ((c === "Decree of Insight")) {
            v = ($in("Body", $cm(DOMAINS, "get", t.name, [])) ? 5 : 0);
          } else if ((c === "Smoke Screen")) {
            v = $min(4, $max(0, (t.might(this) - 1)));
          } else {
            v = 1;
          }
          if ((v <= 0)) {
            continue;
          }
          $cm(out, "append", [c, e, pw, cost(e, pw, ((c === "Stupefy") ? 2.0 : 0.0)), ["minus", t, v]]);
        }
      }
    }
    if (($T($gi(PB2, 0)) && $T($ga(p, "fight_rm", true)) && $T(us) && $T(them))) {
      for (c of $it(hand)) {
        if ((!$in(c, REMOVAL) || !$in(c, COMBAT_OK) || $in(c, ["Star-Crossed", "Dockside Lock-Up", "Temporal Breach"]))) {
          continue;
        }
        [kind, val] = $it($gi(REMOVAL, c));
        if (!$in(kind, ["dmg", "bounce", "kill_le", "kill_any", "banish_any"])) {
          continue;
        }
        e = this.ecost(p, c);
        pw = $gi($gi(CARDS, c), "p");
        if (!(this.can_pay(p, e, pw, c))) {
          continue;
        }
        for (t of $it(them)) {
          if (($T(t.protect) || $in(t.name, UNTARGETABLE) || $in(t.name, UNTARGETABLE_COMBAT) || $T(this.deflected(t)) || $T(this.wild_safe(t)))) {
            continue;
          }
          m = t.might(this);
          if (((kind === "dmg") && ($add(val, (($gi($gi(this.bf, t.loc), "name") === "Void Gate") ? 1 : 0)) < $sub(m, t.dmg)))) {
            continue;
          }
          if (($in(kind, ["bounce", "kill_le"]) && (m > val))) {
            continue;
          }
          keep = ((kind === "bounce") ? 0.4 : 1.0);
          $cm(out, "append", [c, e, pw, cost(e, pw, $mul(keep, this.uval(t))), ["remove", t, them]]);
        }
      }
    }
    return out;
  }
  _apply(act, undo = false) {
    let k, x, u, us, bi, a, b, d, z, cl, t, them;
    k = $gi(act, 0);
    if ((k === "pump")) {
      { const $t166 = $gi(act, 1); $t166.temp = $iadd($t166.temp, ($T(undo) ? (-$gi(act, 2)) : $gi(act, 2))); }
    } else if ((k === "minus")) {
      { const $t167 = $gi(act, 1); $t167.temp = $iadd($t167.temp, ($T(undo) ? $gi(act, 2) : (-$gi(act, 2)))); }
    } else if ((k === "bonds")) {
      for (x of $it($gi(act, 1))) {
        { const $t168 = x; $t168.temp = $iadd($t168.temp, ($T(undo) ? (-$gi(act, 2)) : $gi(act, 2))); }
      }
    } else if ((k === "ward")) {
      { const $t169 = $gi(act, 1); $t169.ward = $iadd($t169.ward, ($T(undo) ? (-$gi(act, 2)) : $gi(act, 2))); }
    } else if ((k === "retreat")) {
      $gi(act, 1).retreat = !$T(undo);
    } else if ((k === "akret")) {
      [u, us, bi] = $it([$gi(act, 1), $gi(act, 2), $gi(act, 3)]);
      if ($T(undo)) {
        u._loc = bi;
        $cm(us, "append", u);
      } else {
        u._loc = "base";
        $cm(us, "remove", u);
      }
    } else if ((k === "stun")) {
      $gi(act, 1).stun = !$T(undo);
    } else if ((k === "swap")) {
      [a, b, d] = $it([$gi(act, 1), $gi(act, 2), $gi(act, 3)]);
      { const $t170 = a; $t170.temp = $iadd($t170.temp, ($T(undo) ? (-d) : d)); }
      { const $t171 = b; $t171.temp = $iadd($t171.temp, ($T(undo) ? d : (-d))); }
    } else if ((k === "stun2")) {
      { const $t172 = !$T(undo);
        $gi(act, 1).stun = $t172;
        $gi(act, 2).stun = $t172;
      }
    } else if ((k === "ambush")) {
      if ($T(undo)) {
        u = $gi(act, 4);
        $cm($gi(this.P, $gi(act, 3)).units, "remove", u);
        $cm($gi(act, 2), "remove", u);
      } else {
        u = new Unit($gi(act, 1), $gi(act, 3), this.turn_no);
        u._loc = ($T($gi(act, 2)) ? $gi($gi(act, 2), 0).loc : "base");
        u._ex = false;
        $cm($gi(this.P, $gi(act, 3)).units, "append", u);
        $cm($gi(act, 2), "append", u);
        $si(act, 4, u);
      }
    } else if ((k === "zswap")) {
      [z, cl, us] = $it([$gi(act, 1), $gi(act, 2), $gi(act, 3)]);
      if ($T(undo)) {
        [z._loc, cl._loc] = $it([cl._loc, z._loc]);
        $cm(us, "remove", z);
        $cm(us, "append", cl);
      } else {
        [z._loc, cl._loc] = $it([cl._loc, z._loc]);
        $cm(us, "remove", cl);
        $cm(us, "append", z);
      }
    } else if ((k === "remove")) {
      [t, them] = $it([$gi(act, 1), $gi(act, 2)]);
      if ($T(undo)) {
        if (!$in(t, them)) {
          $cm(them, "append", t);
        }
      } else if ($in(t, them)) {
        $cm(them, "remove", t);
      }
    } else if ((k === "block")) {
      u = $gi(act, 1);
      if ($T(undo)) {
        { const $t173 = u; $t173.shield_b = ($t173.shield_b - 3); }
        u.tank_b = $ga(u, "_tb0", false);
      } else {
        u._tb0 = u.tank_b;
        { const $t174 = u; $t174.shield_b = ($t174.shield_b + 3); }
        u.tank_b = true;
      }
    }
  }
  trick_pass(i, bi, att, dfn) {
    let passes, s, acts, p, us, them, base, best, c, e, pw, cst, act, v, g, _, foe, u, t, u_, h_, stopped, b4, x, k, n;
    passes = 0;
    s = i;
    acts = 0;
    while (((passes < 2) && (acts < 8))) {
      p = $gi(this.P, s);
      if ((!$T($ga(p, "ai30", $gi(AI30, 0))) || $T(this.slip(p)))) {
        passes = (passes + 1);
        s = (1 - s);
        continue;
      }
      us = ($eq(s, i) ? att : dfn);
      them = ($eq(s, i) ? dfn : att);
      $ssl(us, null, null, (() => { const $r = []; for (const u of $it(us)) { if (($in(u, $gi(this.P, s).units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
      $ssl(them, null, null, (() => { const $r = []; for (const u of $it(them)) { if (($in(u, $gi(this.P, (1 - s)).units) && $eq(u.loc, bi))) { $r.push(u); } } return $r; })());
      if ((!$T(us) || !$T(them))) {
        break;
      }
      base = this.fight_score(s, i, att, dfn);
      best = null;
      for ([c, e, pw, cst, act] of $it(this.trick_options(s, i, us, them))) {
        this._apply(act);
        v = this.fight_score(s, i, att, dfn);
        this._apply(act, true);
        g = ($sub(v, base) - cst);
        if (((g > $ga(p, "trick_m", $gi(TRICK_MARGIN, 0))) && ((best == null) || (g > $gi(best, 0))))) {
          best = [g, c, e, pw, act];
        }
      }
      if ((best == null)) {
        passes = (passes + 1);
        s = (1 - s);
        continue;
      }
      [_, c, e, pw, act] = $it(best);
      foe = $gi(this.P, (1 - s));
      acts = (acts + 1);
      if (($gi(act, 0) === "ambush")) {
        $cm(p.hand, "remove", c);
        this.pay(p, e, pw, c);
        $cm(p.plays, "append", [p.tn, c]);
        u = this.place_unit(s, c, bi);
        $cm(us, "append", u);
        if (this.v) this.say(`  ${$str(p.name)} ambushes with ${$str(c)} for value`);
        passes = 0;
        s = (1 - s);
        continue;
      }
      if (($gi(act, 0) === "zswap")) {
        this.pay(p, e, pw, c);
        this._apply(act);
        if (this.v) this.say(`  ${$str(p.name)}'s Zed swaps in for a Shadow Clone`);
        passes = 0;
        s = (1 - s);
        continue;
      }
      if (($gi(act, 0) === "remove")) {
        t = $gi(act, 1);
        $cm(p.hand, "remove", c);
        this.pay(p, e, pw, c);
        $cm(p.trash, "append", c);
        $cm(p.plays, "append", [p.tn, c]);
        if (this.v) this.say(`  ${$str(p.name)} answers in the fight with ${$str(c)} on ${$str(t.name)}`);
        this.cast_removal(s, c, t);
        passes = 0;
        s = (1 - s);
        continue;
      }
      if (($gi(act, 0) === "akret")) {
        p.akleg = true;
        this._apply(act);
        u_ = $gi(act, 1);
        u_.exhausted = !$T($ga(p, "akemp", false));
        if (this.v) this.say(`  ${$str(p.name)}'s Akali legend pulls ${$str(u_.name)} back to base`);
        passes = 0;
        s = (1 - s);
        continue;
      }
      if ((($gi(act, 0) === "swap") && ($gi(act, 4) === "hidden"))) {
        h_ = (() => { for (const h of $it(p.hidden)) { if ((($gi(h, 0) === "Switcheroo") && $eq($gi(h, 1), bi))) { return h; } } throw new Error('StopIteration'); })();
        $cm(p.hidden, "remove", h_);
        $cm(p.trash, "append", c);
      } else {
        $cm(p.hand, "remove", c);
        this.pay(p, e, pw, c);
        $cm(p.trash, "append", c);
      }
      $cm(p.plays, "append", [p.tn, c]);
      stopped = false;
      if ($in($gi(act, 0), ["minus", "stun", "stun2"])) {
        stopped = this.answer_spell((1 - s), s, c, "minus", $gi(act, 1));
      } else if (($gi(act, 0) === "swap")) {
        stopped = this.answer_spell((1 - s), s, c, "minus", $gi(act, 2));
      } else if (($in("Riposte", foe.hand) && this.can_pay(foe, 2, 2, "Riposte") && $T($ga(foe, "ai30", $gi(AI30, 0))) && $T(them))) {
        if ($T(this.cast(foe, "Riposte", 2, 2))) {
          { const $t175 = $max(them, $kw({"key": ((x) => x.might(this))})); $t175.temp = $iadd($t175.temp, $gi($gi(CARDS, c), "e")); }
          stopped = true;
          if (this.v) this.say(`  ${$str(foe.name)} Ripostes ${$str(c)}`);
        }
      } else if (($add($gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p")) >= ($T($gi(RESP, 0)) ? 2 : 3))) {
        stopped = this.counter_any((1 - s), c);
      }
      if (!$T(stopped)) {
        b4 = (() => { const $r = new PyDict(); for (const x of $it(p.units)) { $r.set(x, x.might(this)); } return $r; })();
        this._apply(act);
        if ($T($ga(p, "gaps31", $gi(GAPS31, 0)))) {
          for (x of $it($list(p.units))) {
            if ($in(x, b4)) {
              this.mighty_check(s, x, $gi(b4, x));
            }
          }
        }
        if ((c === "Discipline")) {
          this.draw(p);
        }
        if ((c === "Stupefy")) {
          this.draw(p);
        }
        if ((c === "Battle Preparations")) {
          this.show_off(p);
        }
        if (((c === "Existential Dread") && ($gi(act, 0) === "stun") && this.can_pay(p, 2, 0) && (($cm($cm(CARDS, "get", $gi(act, 1).name, new PyDict([])), "get", "e", 0) >= 4) || $T($gi(act, 1).eq)))) {
          this.pay(p, 2, 0);
          this.bounce($gi(act, 1));
        }
        if (this.v) this.say(`  ${$str(p.name)} plays ${$str(c)} (${$str($gi(act, 0))}) for value`);
      }
      passes = 0;
      s = (1 - s);
    }
    for (k of $it([i, (1 - i)])) {
      p = $gi(this.P, k);
      if (($T($ga(p, "ai30", $gi(AI30, 0))) && $in("Show of Strength", p.hand) && this.can_pay(p, 2, 1, "Show of Strength"))) {
        n = (() => { let $s = 0; for (const u of $it(p.units)) { if ((u.might(this) >= 5)) { $s += $num(1); } } return $s; })();
        if ((n >= 2)) {
          if ($T(this.cast(p, "Show of Strength", 2, 1))) {
            this.draw(p, n);
            if (this.v) this.say(`  ${$str(p.name)} plays Show of Strength mid-fight, draws ${$str(n)}`);
          }
        }
      }
    }
  }
  use_pump(i, us, need) {
    let p, u, c, dfs, cand, t, small, bi_, base_, x, dfs_k, dfs_, src, v_, ok_, t_, cands, v, good, cs, foe, bonds_rep, ds_;
    p = $gi(this.P, i);
    if ($T($gi(SMART, 0))) {
      if ($T($gi(FEAT16, "rules2"))) {
        for (u of $it(us)) {
          if (((u.name === "Renekton, Brute") && (need > 0) && (p.E >= need) && (need <= 4))) {
            { const $t176 = p; $t176.E = $sub($t176.E, need); }
            { const $t177 = u; $t177.temp = $iadd($t177.temp, need); }
            if (this.v) this.say(`  ${$str(p.name)}'s Renekton pumps +${$str(need)}`);
            need = 0;
            if ((u.might(this) >= 10)) {
              u.pw = true;
            }
          }
        }
      }
      for (u of $it(us)) {
        if (((u.name === "Vi, Hotheaded") && this.can_pay(p, 2, 1, u.name) && (need > 0))) {
          this.pay(p, 2, 1, u.name);
          need = (need - u.might(this));
          { const $t178 = u; $t178.temp = ($t178.temp + u.might(this)); }
          if (this.v) this.say(`  ${$str(p.name)}'s Vi doubles`);
        }
      }
      if ((need <= 0)) {
        return;
      }
      for (c of $it($set(p.trash))) {
        if ($T($gi(FEAT16, "timing"))) {
          break;
        }
        if (((c === "Onslaught") && this.can_pay(p, 4, 0) && (need > 0))) {
          $cm(p.trash, "remove", "Onslaught");
          this.pay(p, 4, 0, "Onslaught");
          { const $t179 = $max(us, $kw({"key": ((x) => x.might(this))})); $t179.temp = ($t179.temp + 6); }
          need = (need - 6);
        }
      }
      if ((need <= 0)) {
        return;
      }
      dfs = (() => { const $r = []; for (const u of $it($gi(this.P, (1 - i)).units)) { if ($eq(u.loc, $gi(us, 0).loc)) { $r.push(u); } } return $r; })();
      need = this.fight_removal(i, dfs, need);
      if ((need <= 0)) {
        return;
      }
      if (($in("Charm", p.hand) && !$T($gi(FEAT16, "timing")) && this.can_pay(p, 1, 1, "Charm"))) {
        cand = (() => { const $r = []; for (const u of $it(dfs)) { if (!$T(u.protect)) { $r.push(u); } } return $r; })();
        if ($T(cand)) {
          t = $max(cand, $kw({"key": ((x) => (x.might(this) + x.shield(this)))}));
          if ($T(this.cast(p, "Charm", 1, 1))) {
            t.loc = "base";
            need = $sub(need, (t.might(this) + t.shield(this)));
            if (this.v) this.say(`  ${$str(p.name)} Charms ${$str(t.name)} away`);
            if ((need <= 0)) {
              return;
            }
          }
        }
      }
      if (($in("Twilight Step", p.hand) && !$T($gi(FEAT16, "timing")) && this.can_pay(p, 2, 1, "Twilight Step"))) {
        small = (() => { const $r = []; for (const u of $it(dfs)) { if (((u.might(this) <= 3) && !$T(u.protect))) { $r.push(u); } } return $r; })();
        if ($T(small)) {
          t = $max(small, $kw({"key": ((x) => (x.might(this) + x.shield(this)))}));
          if ($T(this.cast(p, "Twilight Step", 2, 1))) {
            t.loc = "base";
            need = $sub(need, (t.might(this) + t.shield(this)));
            if (this.v) this.say(`  ${$str(p.name)} Twilight Steps ${$str(t.name)} away`);
            if ((need <= 0)) {
              return;
            }
          }
        }
      }
      for (c of $it($set(p.trash))) {
        if (($T($gi(FEAT16, "timing")) && !$in(c, COMBAT_OK))) {
          continue;
        }
        if (($in(c, PUMP) && $in(c, FLOW) && (need > 0) && this.can_pay(p, $gi($gi(FLOW, c), 0), $gi($gi(FLOW, c), 1), c) && $isinstance($gi(PUMP, c), $int))) {
          $cm(p.trash, "remove", c);
          this.pay(p, $gi($gi(FLOW, c), 0), $gi($gi(FLOW, c), 1), c);
          { const $t180 = $max(us, $kw({"key": ((x) => x.might(this))})); $t180.temp = $iadd($t180.temp, $gi(PUMP, c)); }
          need = $sub(need, $gi(PUMP, c));
        }
      }
      if ((need <= 0)) {
        return;
      }
      if ((!$T($ga(p, "ai30", $gi(AI30, 0))) && $in("Decree of Focus", p.hand) && this.can_pay(p, 1, 0, "Decree of Focus") && (() => { for (const u of $it(dfs)) { if ($in(u.name, FURY)) return true; } return false; })())) {
        if ($T(this.cast(p, "Decree of Focus", 1, 0))) {
          { const $t181 = $max(us, $kw({"key": ((x) => x.might(this))})); $t181.temp = ($t181.temp + 4); }
          need = (need - 4);
          if ((need <= 0)) {
            return;
          }
        }
      }
      if (($in("Cannon Barrage", p.hand) && this.can_pay(p, 2, 1, "Cannon Barrage") && (() => { for (const u of $it(dfs)) { if (($sub((u.might(this) + u.shield(this)), u.dmg) <= 2)) return true; } return false; })())) {
        if ($T(this.cast(p, "Cannon Barrage", 2, 1))) {
          for (u of $it($list(dfs))) {
            this.deal(u, 2, "Cannon Barrage");
          }
          if (this.v) this.say(`  ${$str(p.name)} plays Cannon Barrage`);
          return;
        }
      }
    }
    if (($T($gi(SMART, 0)) && $T($gi(FEAT16, "cards")) && (need > 0) && $in("Satchel Charge", p.hand) && this.can_pay(p, 3, 1, "Satchel Charge"))) {
      bi_ = $gi(us, 0).loc;
      base_ = (() => { const $r = []; for (const u of $it(p.units)) { if (((u.loc === "base") && !$in(u, us))) { $r.push(u); } } return $r; })();
      if (((bi_ !== "base") && $T(base_))) {
        x = $max(base_, $kw({"key": ((y) => y.might(this))}));
        if ($T(this.cast(p, "Satchel Charge", 3, 1))) {
          if (true) {
            x.loc = bi_;
            $cm(us, "append", x);
            need = $sub(need, (x.might(this) + x.kw("assault")));
            { const $t182 = $gi($gi(this.bf, bi_), "bombs"), $t183 = i; $si($t182, $t183, ($gi($t182, $t183) + 1)); }
            if (this.v) this.say(`  ${$str(p.name)} Satchel Charges ${$str(x.name)} into the fight`);
          }
          if ((need <= 0)) {
            return;
          }
        }
      }
    }
    if (($T($gi(PB, 0)) && (need > 0) && $T(us) && ($gi(us, 0).loc !== "base"))) {
      need = this.thrill_in(i, us, $gi(us, 0).loc, need);
      if ((need <= 0)) {
        return;
      }
      dfs_k = (() => { const $r = []; for (const u of $it($gi(this.P, (1 - i)).units)) { if ($eq(u.loc, $gi(us, 0).loc)) { $r.push(u); } } return $r; })();
      need = this.ki_burst(i, dfs_k, need);
      if ((need <= 0)) {
        return;
      }
    }
    if (($T($gi(SMART, 0)) && $T($gi(FEAT16, "cards")) && $in("Ntofo Strikes", p.hand) && (need > 0) && this.can_pay(p, 2, 1, "Ntofo Strikes"))) {
      dfs_ = (() => { const $r = []; for (const u of $it($gi(this.P, (1 - i)).units)) { if (($eq(u.loc, $gi(us, 0).loc) && !$T(u.protect) && !$in(u.name, UNTARGETABLE_COMBAT))) { $r.push(u); } } return $r; })();
      src = $max($OR((() => { const $r = []; for (const u of $it(p.units)) { if (!$T(u.token)) { $r.push(u); } } return $r; })(), () => us), $kw({"key": ((x) => x.shield(this))}));
      v_ = (src.shield(this) + 2);
      ok_ = (() => { const $r = []; for (const u of $it(dfs_)) { if (((u.might(this) - u.dmg) <= v_)) { $r.push(u); } } return $r; })();
      if ($T(ok_)) {
        t_ = $max(ok_, $kw({"key": ((x) => (x.might(this) + x.shield(this)))}));
        if ($T(this.cast(p, "Ntofo Strikes", 2, 1))) {
          if (!$T(this.answer_spell((1 - i), i, "Ntofo Strikes", "shield_dmg", t_))) {
            { const $t184 = src; $t184.shield_b = ($t184.shield_b + 2); }
            need = $sub(need, (t_.might(this) + t_.shield(this)));
            this.deal(t_, v_, "Ntofo Strikes");
            if (this.v) this.say(`  ${$str(p.name)} Ntofo Strikes ${$str(t_.name)} mid-fight`);
          }
          if ((need <= 0)) {
            return;
          }
        }
      }
    }
    if ($T($ga(p, "ai30", $gi(AI30, 0)))) {
      return;
    }
    cands = [];
    for (c of $it($set(p.hand))) {
      if (($T($gi(FEAT16, "timing")) && !$in(c, COMBAT_OK))) {
        continue;
      }
      if (($in(c, PUMP) && this.can_pay(p, this.pe(p, c), $gi($gi(CARDS, c), "p"), c))) {
        v = $gi(PUMP, c);
        if (($T($gi(AUDIT, 0)) && (c === "Bonds of Strength"))) {
          v = $mul($min(2, $len(us)), ((this.can_pay(p, 4, 0, c) && (need > $min(2, $len(us)))) ? 2 : 1));
        }
        if ((v === "x2")) {
          v = $max((() => { const $r = []; for (const u of $it(us)) { $r.push(u.might(this)); } return $r; })());
        }
        if ((v === "all3")) {
          v = (3 * $len(us));
        }
        $cm(cands, "append", [v, c]);
      }
    }
    if (!$T(cands)) {
      return;
    }
    good = (() => { const $r = []; for (const x of $it(cands)) { if (($gi(x, 0) >= need)) { $r.push(x); } } return $r; })();
    if ((!$T(good) && (p.ai >= 2))) {
      cs = $sorted(cands, $kw({"reverse": true}));
      if (((($len(cs) >= 2) && ($add($gi($gi(cs, 0), 0), $gi($gi(cs, 1), 0)) >= need) && this.can_pay(p, $add(this.pe(p, $gi($gi(cs, 0), 1)), this.pe(p, $gi($gi(cs, 1), 1))), $add($gi($gi(CARDS, $gi($gi(cs, 0), 1)), "p"), $gi($gi(CARDS, $gi($gi(cs, 1), 1)), "p")), $gi($gi(cs, 0), 1)) && !$eq($gi($gi(cs, 0), 1), $gi($gi(cs, 1), 1))) || (($len(cs) >= 2) && $eq($gi($gi(cs, 0), 1), $gi($gi(cs, 1), 1)) && ($cm(p.hand, "count", $gi($gi(cs, 0), 1)) >= 2) && ($mul($gi($gi(cs, 0), 0), 2) >= need) && this.can_pay(p, $mul(2, $gi($gi(CARDS, $gi($gi(cs, 0), 1)), "e")), $mul(2, $gi($gi(CARDS, $gi($gi(cs, 0), 1)), "p")), $gi($gi(cs, 0), 1))))) {
      } else {
        return;
      }
    }
    [v, c] = $it(($T(good) ? $min(good) : $max(cands)));
    foe = $gi(this.P, (1 - i));
    bonds_rep = $AND($gi(AUDIT, 0), () => $AND((c === "Bonds of Strength"), () => (v > $min(2, $len(us)))));
    $cm(p.hand, "remove", c);
    this.pay(p, $add(this.pe(p, c), ($T(bonds_rep) ? 2 : 0)), $gi($gi(CARDS, c), "p"), c);
    $cm(p.trash, "append", c);
    if (($in("Riposte", foe.hand) && this.can_pay(foe, 2, 2, "Riposte"))) {
      if ($T(this.cast(foe, "Riposte", 2, 2, $gi(AUDIT, 0)))) {
        if (this.v) this.say(`  ${$str(foe.name)} Ripostes ${$str(c)}`);
        if ($T($gi(AUDIT, 0))) {
          ds_ = (() => { const $r = []; for (const x of $it(foe.units)) { if ($eq(x.loc, $gi(us, 0).loc)) { $r.push(x); } } return $r; })();
          if ($T(ds_)) {
            { const $t185 = $max(ds_, $kw({"key": ((x) => x.might(this))})); $t185.temp = $iadd($t185.temp, $gi($gi(CARDS, c), "e")); }
          }
        }
        return;
      }
    }
    if (($in("Hard Bargain", foe.hand) && this.can_pay(foe, 2, 0, "Hard Bargain") && !(this.can_pay(p, 2, 0, "Hard Bargain")))) {
      if ($T(this.cast(foe, "Hard Bargain", 2, 0))) {
        if (this.v) this.say(`  ${$str(foe.name)} counters ${$str(c)}`);
        return;
      }
    }
    if (((v >= 3) && $T(this.counter_any((1 - i), c)))) {
      return;
    }
    u = $max(us, $kw({"key": ((x) => x.might(this))}));
    if (($gi(PUMP, c) === "all3")) {
      for (x of $it(us)) {
        { const $t186 = x; $t186.temp = ($t186.temp + 3); }
      }
    } else if (($gi(PUMP, c) === "x2")) {
      { const $t187 = u; $t187.temp = ($t187.temp + u.might(this)); }
    } else if (($T($gi(FEAT16, "rules2")) && (c === "Guttural Roar") && ($T(u.pw) || $T(u.emp)))) {
      { const $t188 = u; $t188.temp = ($t188.temp + 4); }
    } else if ((c === "Block")) {
      { const $t189 = u; $t189.shield_b = ($t189.shield_b + 3); }
      u.tank_b = true;
    } else if (($T($gi(AUDIT, 0)) && (c === "Bonds of Strength"))) {
      for (x of $it($sl($sorted(us, $kw({"key": ((y) => (-y.might(this)))})), null, 2))) {
        { const $t190 = x; $t190.temp = $iadd($t190.temp, ($T(bonds_rep) ? 2 : 1)); }
      }
    } else {
      { const $t191 = u; $t191.temp = $iadd($t191.temp, $gi(PUMP, c)); }
    }
    if (($T($gi(PB, 0)) && (u.name === "Irelia, Fervent"))) {
      { const $t192 = u; $t192.temp = ($t192.temp + 1); }
    }
    if (($T($gi(AUDIT, 0)) && (c === "Battle Preparations"))) {
      this.show_off(p);
    }
    if (((c === "Discipline") && $T($gi(DISC_FIX, 0)))) {
      this.draw(p);
    }
    if (this.v) this.say(`  ${$str(p.name)} plays ${$str(c)}`);
  }
  _base_knobs(p) {
    if (($ga(p, "la_base", null) == null)) {
      p.la_base = (() => { const $r = new PyDict(); for (const k of $it(LOOK_KEYS)) { if ($hasattr(p, k)) { $r.set(k, $ga(p, k)); } } return $r; })();
    }
    return p.la_base;
  }
  _restore(p) {
    let base, k;
    base = this._base_knobs(p);
    for (k of $it(LOOK_KEYS)) {
      if ($in(k, base)) {
        $setattr(p, k, $gi(base, k));
      } else if ($hasattr(p, k)) {
        $delattr(p, k);
      }
    }
  }
  determinize(i) {
    let o, me, pool, n;
    o = $gi(this.P, (1 - i));
    me = $gi(this.P, i);
    pool = $add(o.hand, o.deck);
    this.rng.shuffle(pool);
    n = $len(o.hand);
    o.hand = $sl(pool, null, n);
    o.deck = $sl(pool, n, null);
    this.rng.shuffle(me.deck);
  }
  playout(cur, t, max_turns, plan, seed) {
    let g, gp, k, v, dep, res, me_, op_, d_;
    g = $deepcopy(this);
    g.rollout = true;
    g.v = false;
    g.log = [];
    g.rng = $random_mod.Random(seed);
    g.determinize(cur);
    gp = $gi(g.P, cur);
    for ([k, v] of $it($cm(plan, "items"))) {
      $setattr(gp, k, v);
    }
    gp.la_restore = true;
    Unit.G = g;
    dep = $ga($gi(this.P, cur), "look_depth", $gi(LOOK_DEPTH, 0));
    res = g.run(cur, t, ($T(dep) ? $min(max_turns, $add(t, dep)) : max_turns));
    if (($T(dep) && (res == null))) {
      [me_, op_] = $it([$gi(g.P, cur), $gi(g.P, (1 - cur))]);
      d_ = ($sub(me_.points, op_.points) + ((0.15 * ((() => { let $s = 0; for (const u of $it(me_.units)) { $s += $num(u.might(g)); } return $s; })() - (() => { let $s = 0; for (const u of $it(op_.units)) { $s += $num(u.might(g)); } return $s; })())) / 5));
      return (0.5 + $max((-0.45), $min(0.45, $mul(0.08, d_))));
    }
    return (($eq(res, cur) ? 1.0 : ((res == null) ? 0.5 : 0.0)) + (0.01 * $sub($gi(g.P, cur).points, $gi(g.P, (1 - cur)).points)));
  }
  lookahead(cur, t, max_turns) {
    let p, base, R, seeds, best, results, plans, cands, sh, r1, keep, r2, sc, name_, plan, order, alive, v_, score, r, k, v;
    p = $gi(this.P, cur);
    base = this._base_knobs(p);
    this._restore(p);
    R = $int(p.look);
    seeds = (() => { const $r = []; for (const _ of $it($range(R))) { $r.push(this.rng.random()); } return $r; })();
    best = null;
    results = [];
    plans = $list(LOOK_PLANS);
    cands = $sl($sorted((() => { const $r = new PySet(); for (const c of $it(p.hand)) { if (($in($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t"), ["Unit", "Spell", "Gear"]) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) { $r.add(c); } } return $r; })(), $kw({"key": ((c) => [(-$add($gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"))), c])})), null, $gi(LOOK_CARDS, 0));
    plans = $iadd(plans, (() => { const $r = []; for (const c of $it(cands)) { $r.push([$add("hold ", c), new PyDict([["la_skip", c]])]); } return $r; })());
    if ((() => { for (const c of $it(p.hand)) { if ($in(c, REMOVAL)) return true; } return false; })()) {
      $cm(plans, "append", ["second-best removal target", new PyDict([["la_tgt", 1]])]);
    }
    sh = $ga(p, "look_sh", $gi(LOOK_SH, 0));
    if ($T(sh)) {
      [r1, keep, r2] = $it(sh);
      r2 = $max(r2, r1);
      seeds = $add(seeds, (() => { const $r = []; for (const _ of $it($range($max(0, $sub(r2, R))))) { $r.push(this.rng.random()); } return $r; })());
      sc = new PyDict([]);
      for ([name_, plan] of $it(plans)) {
        $si(sc, name_, (() => { const $r = []; for (const r of $it($range(r1))) { $r.push(this.playout(cur, t, max_turns, plan, $gi(seeds, r))); } return $r; })());
      }
      order = $sorted(plans, $kw({"key": ((np_) => ((-$sum($gi(sc, $gi(np_, 0)))) / r1))}));
      alive = $add($sl(order, null, keep), (() => { const $r = []; for (const x of $it(plans)) { if ((($gi(x, 0) === "normal") && !$in(x, $sl(order, null, keep)))) { $r.push(x); } } return $r; })());
      for ([name_, plan] of $it(alive)) {
        { const $t193 = sc, $t194 = name_; $si($t193, $t194, $iadd($gi($t193, $t194), (() => { const $r = []; for (const r of $it($range(r1, r2))) { $r.push(this.playout(cur, t, max_turns, plan, $gi(seeds, r))); } return $r; })())); }
      }
      for ([name_, plan] of $it(plans)) {
        v_ = ($sum($gi(sc, name_)) / $len($gi(sc, name_)));
        $cm(results, "append", [name_, v_]);
        if (!$in(name_, (() => { const $r = []; for (const a_ of $it(alive)) { $r.push($gi(a_, 0)); } return $r; })())) {
          continue;
        }
        if (((best == null) || (v_ > $add($gi(best, 1), (($gi(best, 0) === "normal") ? ($gi(LOOK_MARGIN, 0) / r2) : 1e-09))))) {
          best = [name_, v_, plan];
        }
      }
    } else {
      for ([name_, plan] of $it(plans)) {
        score = 0.0;
        for (r of $it($range(R))) {
          score = $iadd(score, this.playout(cur, t, max_turns, plan, $gi(seeds, r)));
        }
        $cm(results, "append", [name_, (score / R)]);
        if (((best == null) || (score > $add($gi(best, 1), (($gi(best, 0) === "normal") ? $gi(LOOK_MARGIN, 0) : 1e-09))))) {
          best = [name_, score, plan];
        }
      }
    }
    Unit.G = this;
    p.la_last = $gi(best, 0);
    p.la_stats = $ga(p, "la_stats", new PyDict([]));
    $si(p.la_stats, $gi(best, 0), ($cm(p.la_stats, "get", $gi(best, 0), 0) + 1));
    if (this.v) this.say($add($add(`  ${$str(p.name)} looks ahead: `, $cm(", ", "join", (() => { const $r = []; for (const [n, v] of $it(results)) { $r.push(`${$str(n)} ${$fmt(v, ".2f")}`); } return $r; })())), ` -> ${$str($gi(best, 0))}`));
    for ([k, v] of $it($cm($gi(best, 2), "items"))) {
      $setattr(p, k, v);
    }
    p.la_restore = true;
  }
  flurry(i) {
    let p, c, lost, q, u;
    p = $gi(this.P, i);
    c = "Flurry of Blades";
    while (($T($gi(AI36, 0)) && $in(c, p.hand) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
      lost = (q) => {
        return (() => { let $s = 0; for (const u of $it(q.units)) { if (((u.loc !== "base") && !$T(u.protect) && $eq(u.ward, 0) && (((u.might(this) - u.dmg) <= 1) || (() => { for (const x of $it($gi(this.P, (1 - u.owner)).units)) { if ((x.name === "Elder Dragon")) return true; } return false; })()))) { $s += $num(this.uval(u)); } } return $s; })();
      };
      if (($sub(lost($gi(this.P, (1 - i))), lost(p)) < 1.5)) {
        break;
      }
      $cm(p.hand, "remove", c);
      this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
      $cm(p.trash, "append", c);
      $cm(p.plays, "append", [p.tn, c]);
      if (this.v) this.say(`  ${$str(p.name)} plays Flurry of Blades`);
      for (q of $it(this.P)) {
        for (u of $it($list(q.units))) {
          if (((u.loc !== "base") && $in(u, q.units))) {
            this.deal(u, 1, c);
          }
        }
      }
    }
  }
  eot(j) {
    let p, idle, mighty;
    p = $gi(this.P, j);
    if ((p.ai < 3)) {
      return;
    }
    this.flurry(j);
    if ($T($ga(p, "ai30", $gi(AI30, 0)))) {
      while (($in("Life from Stone", p.hand) && this.can_pay(p, 1, 0, "Life from Stone"))) {
        idle = (() => { const $r = []; for (const u of $it(p.units)) { if (!$T(u.exhausted)) { $r.push(u); } } return $r; })();
        if (!$T(idle)) {
          break;
        }
        $min(idle, $kw({"key": ((x) => x.might(this))})).exhausted = true;
        if ($T(this.cast(p, "Life from Stone", 1, 0))) {
          this.draw(p);
          { const $t195 = p; $t195.pending = ($t195.pending + 1); }
          if (this.v) this.say(`  ${$str(p.name)} plays Life from Stone at end of turn`);
        }
      }
      while (($in("Stupefy", p.hand) && this.can_pay(p, $gi($gi(CARDS, "Stupefy"), "e"), $gi($gi(CARDS, "Stupefy"), "p"), "Stupefy") && ($T(p.units) || $T($gi(this.P, (1 - j)).units)))) {
        if ($T(this.cast(p, "Stupefy", $gi($gi(CARDS, "Stupefy"), "e"), $gi($gi(CARDS, "Stupefy"), "p")))) {
          this.draw(p);
          if (this.v) this.say(`  ${$str(p.name)} plays Stupefy at end of turn to draw`);
        }
      }
    }
    while (($in("Discipline", p.hand) && this.can_pay(p, 2, 0, "Discipline") && (($cm(p.hand, "count", "Discipline") >= $gi(EOT_DISC, 0)) || ($len(p.hand) <= 2)))) {
      if ($T(this.cast(p, "Discipline", 2, 0))) {
        this.draw(p);
        if (this.v) this.say(`  ${$str(p.name)} plays Discipline at end of turn to draw`);
      }
    }
    mighty = (() => { const $r = []; for (const u of $it(p.units)) { if ((u.might(this) >= 5)) { $r.push(u); } } return $r; })();
    if (($in("Show of Strength", p.hand) && ($len(mighty) >= 1) && this.can_pay(p, 2, 1, "Show of Strength"))) {
      if ($T(this.cast(p, "Show of Strength", 2, 1))) {
        this.draw(p, $len(mighty));
        if (this.v) this.say(`  ${$str(p.name)} plays Show of Strength at end of turn, draws ${$str($len(mighty))}`);
      }
    }
  }
  surprise_standard(i, bi, attackers, need) {
    let p, base, u;
    p = $gi(this.P, i);
    if (((p.leg !== "jarvan") || $T(p.jleg) || !$in("Demacian Standard", p.hand))) {
      return;
    }
    if (!((() => { for (const u of $it(p.units)) { if ((u.name === "Jarvan IV, Martial Paragon")) return true; } return false; })())) {
      return;
    }
    if ($in("Demacian Standard", $gi($gi($gi(this.bf, bi), "gear"), i))) {
      return;
    }
    if (!(this.can_pay(p, 2, 2, "Demacian Standard"))) {
      return;
    }
    base = (() => { const $r = []; for (const u of $it(p.units)) { if ((u.loc === "base")) { $r.push(u); } } return $r; })();
    if ((!$T(base) || ((2 + $max((() => { const $r = []; for (const u of $it(base)) { $r.push(u.might(this)); } return $r; })())) < need))) {
      return;
    }
    if ($T(this.slip(p))) {
      return;
    }
    $cm(p.hand, "remove", "Demacian Standard");
    this.pay(p, 2, 1, "Demacian Standard");
    $cm($gi($gi($gi(this.bf, bi), "gear"), i), "append", "Demacian Standard");
    $cm(p.plays, "append", [p.tn, "Demacian Standard"]);
    u = this.jarvan_move(i, bi, true);
    if ((u != null)) {
      u.exhausted = true;
      $cm(attackers, "append", u);
    }
    if (this.v) this.say(`  ${$str(p.name)} surprise Demacian Standard at ${$str($gi($gi(this.bf, bi), "name"))}`);
  }
  charm_deny(i) {
    let p, o, bi, b, th, t;
    p = $gi(this.P, i);
    o = $gi(this.P, (1 - i));
    if ((!$in("Charm", p.hand) || !(this.can_pay(p, 1, 1, "Charm")))) {
      return;
    }
    for ([bi, b] of $it($enumerate(this.bf))) {
      th = this.units_at((1 - i), bi);
      if ((!$eq($gi(b, "ctrl"), (1 - i)) || ($len(th) !== 1))) {
        continue;
      }
      t = $gi(th, 0);
      if (($T(t.protect) || $in(t.name, UNTARGETABLE) || $T(this.deflected(t)))) {
        continue;
      }
      if ($T(this.cast(p, "Charm", 1, 1))) {
        $cm(p.plays, "append", [p.tn, "Charm"]);
        if (($in(t, o.units) && $eq(t.loc, bi))) {
          t.loc = "base";
          if (this.v) this.say(`  ${$str(p.name)} Charms ${$str(o.name)}'s ${$str(t.name)} off ${$str($gi(b, "name"))} (no hold for them next turn)`);
        }
        this.ctrl_cleanup();
      }
      return;
    }
  }
  satchel_value(i) {
    let p, mine, theirs, mv, x;
    p = $gi(this.P, i);
    if (!($T($gi(SATCHEL, 0)) && $in("Satchel Charge", p.hand) && this.can_pay(p, 3, 1, "Satchel Charge"))) {
      return;
    }
    if (($sub(p.E, $gi(this.reserve(p), 0)) < 3)) {
      return;
    }
    mine = (() => { const $r = []; for (const b_ of $it($range(2))) { if ($eq($gi($gi(this.bf, b_), "ctrl"), i)) { $r.push(b_); } } return $r; })();
    theirs = (() => { const $r = []; for (const b_ of $it($range(2))) { if (($eq($gi($gi(this.bf, b_), "ctrl"), (1 - i)) && (() => { for (const u of $it(this.units_at((1 - i), b_))) { if (((u.might(this) <= 2) && !$T(u.protect))) return true; } return false; })())) { $r.push(b_); } } return $r; })();
    mv = (() => { const $r = []; for (const x of $it(p.units)) { if (((x.loc === "base") && (x.might(this) > 0))) { $r.push(x); } } return $r; })();
    if (!($T(mine) && $T(theirs) && $T(mv))) {
      return;
    }
    x = $max(mv, $kw({"key": ((y) => y.might(this))}));
    if ($T(this.cast(p, "Satchel Charge", 3, 1))) {
      $cm(p.plays, "append", [p.tn, "Satchel Charge"]);
      x.loc = $gi(mine, 0);
      { const $t196 = $gi($gi(this.bf, $gi(theirs, 0)), "bombs"), $t197 = i; $si($t196, $t197, ($gi($t196, $t197) + 1)); }
      if (this.v) this.say(`  ${$str(p.name)}'s Satchel Charge moves ${$str(x.name)} to ${$str($gi($gi(this.bf, $gi(mine, 0)), "name"))} and drops a Bomb at ${$str($gi($gi(this.bf, $gi(theirs, 0)), "name"))}`);
    }
  }
  thrill_in(i, us_or_dfn, bi, need) {
    let p, base_, x, u;
    p = $gi(this.P, i);
    if (((need <= 0) || !$in("Thrill of the Hunt", p.hand) || (bi === "base") || !(this.can_pay(p, 2, 1, "Thrill of the Hunt")))) {
      return need;
    }
    base_ = (() => { const $r = []; for (const u of $it(p.units)) { if (((u.loc === "base") && !$T(u.token) && !$T(u.eq) && !$in(u, us_or_dfn) && (u.might(this) > 0))) { $r.push(u); } } return $r; })();
    if (!$T(base_)) {
      return need;
    }
    x = $max(base_, $kw({"key": ((y) => (y.might(this) + y.shield(this)))}));
    if ((((x.might(this) + 2) < need) && ($len(us_or_dfn) > 0) && (x.might(this) < 4))) {
      return need;
    }
    if (!$T(this.cast(p, "Thrill of the Hunt", 2, 1))) {
      return need;
    }
    $cm(p.plays, "append", [p.tn, "Thrill of the Hunt"]);
    $cm(p.units, "remove", x);
    u = this.place_unit(i, x.name, bi);
    $cm(us_or_dfn, "append", u);
    if (this.v) this.say(`  ${$str(p.name)} plays Thrill of the Hunt: ${$str(x.name)} is banished and played into ${$str($gi($gi(this.bf, bi), "name"))}`);
    return ((need - u.might(this)) - u.shield(this));
  }
  reksai_reveal(i, bi) {
    let p, top_, c, ok;
    p = $gi(this.P, i);
    p.rkleg = true;
    top_ = (() => { const $r = []; for (const _ of $it($range($min(2, $len(p.deck))))) { $r.push($cm(p.deck, "pop")); } return $r; })();
    for (c of $it(top_)) {
      if ((c === "Undertitan")) {
        { const $t198 = p; $t198.E = ($t198.E + 2); }
      }
    }
    ok = (() => { const $r = []; for (const c of $it(top_)) { if (($in($cm($cm(CARDS, "get", c, new PyDict([])), "get", "t"), ["Unit", "Gear"]) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) { $r.push(c); } } return $r; })();
    if (this.v) this.say(`  ${$str(p.name)}'s legend reveals ${$str($cm(", ", "join", top_))}`);
    if ($T(ok)) {
      c = $max(ok, $kw({"key": ((x) => [$add($gi($gi(CARDS, x), "e"), $gi($gi(CARDS, x), "p")), $cm($gi(CARDS, x), "get", "m", 0)])}));
      $cm(top_, "remove", c);
      this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
      this.resolve(i, c);
      if (this.v) this.say(`  ${$str(p.name)} plays ${$str(c)} off the top`);
    }
    for (c of $it(top_)) {
      $cm(p.deck, "insert", 0, c);
    }
  }
  ezreal_check(i) {
    let p;
    p = $gi(this.P, i);
    if (((p.leg !== "ezreal") || $T($ga(p, "ezleg", false)))) {
      return;
    }
    if (!$eq($ga(p, "ez_tn", (-1)), this.turn_no)) {
      p.ez_tn = this.turn_no;
      p.ez_n = 0;
    }
    { const $t199 = p; $t199.ez_n = ($t199.ez_n + 1); }
    if ((p.ez_n >= 2)) {
      p.ezleg = true;
      this.draw(p);
      if (this.v) this.say(`  ${$str(p.name)}'s legend draws (chose enemies twice)`);
    }
  }
  ev_flip(p) {
    let dc;
    if (((p.leg !== "evelynn") || $eq($ga(p, "ev_tn", (-1)), this.turn_no))) {
      return;
    }
    p.ev_tn = this.turn_no;
    this.draw(p);
    if ((!$eq($cm(this.P, "index", p), this.tp) && $T(p.hand))) {
      dc = $min(p.hand, $kw({"key": ((x) => $add($add($gi($gi(CARDS, x), "e"), $gi($gi(CARDS, x), "p")), (($gi($gi(CARDS, x), "t") === "Unit") ? 4 : 0)))}));
      $cm(p.hand, "remove", dc);
      $cm(p.trash, "append", dc);
    }
  }
  offer_gear(i) {
    let p, o, c, best, u, e, v, bi, b, g, _, kind, where;
    p = $gi(this.P, i);
    o = $gi(this.P, (1 - i));
    c = "An Offer You Can't Refuse";
    if ((!$in(c, p.hand) || !(this.can_pay(p, 2, 0, c)))) {
      return;
    }
    best = null;
    for (u of $it(o.units)) {
      for (e of $it(u.eq)) {
        v = $add(($cm($cm($gi(CARDS, e), "get", "eq", new PyDict([])), "get", "bonus", 0) + 1), ((u.loc !== "base") ? 2 : 0));
        if (((best == null) || (v > $gi(best, 0)))) {
          best = [v, "eq", u, e];
        }
      }
    }
    for ([bi, b] of $it($enumerate(this.bf))) {
      for (g of $it($gi($gi(b, "gear"), (1 - i)))) {
        if ($in(g, ["Dockside Lock-Up"])) {
          continue;
        }
        v = ($cm($cm(CARDS, "get", g, new PyDict([])), "get", "e", 1) + 1);
        if (((best == null) || (v > $gi(best, 0)))) {
          best = [v, "bf", bi, g];
        }
      }
    }
    if (($in("Treasure Trove", p.base_gear) && ((best == null) || ($gi(best, 0) < 4)))) {
      best = [4, "own", null, "Treasure Trove"];
    }
    if (((best == null) || ($gi(best, 0) < 3))) {
      return;
    }
    if (!$T(this.cast(p, c, 2, 0))) {
      return;
    }
    $cm(p.plays, "append", [p.tn, c]);
    [_, kind, where, g] = $it(best);
    if (((kind === "eq") && $in(g, where.eq))) {
      $cm(where.eq, "remove", g);
      $cm(o.trash, "append", g);
      this.gain_gold(o);
    } else if (((kind === "bf") && $in(g, $gi($gi($gi(this.bf, where), "gear"), (1 - i))))) {
      $cm($gi($gi($gi(this.bf, where), "gear"), (1 - i)), "remove", g);
      $cm(o.trash, "append", g);
      this.gain_gold(o);
    } else if (((kind === "own") && $in(g, p.base_gear))) {
      $cm(p.base_gear, "remove", g);
      $cm(p.trash, "append", g);
      this.draw(p);
      { const $t200 = p; $t200.pending = ($t200.pending + 1); }
      this.gain_gold(p);
    }
    if (this.v) this.say(`  ${$str(p.name)} plays ${$str(c)} on ${$str(g)}`);
  }
  cull_weak(i) {
    let p, o, val, theirs, mine;
    p = $gi(this.P, i);
    o = $gi(this.P, (1 - i));
    if ((!$in("Cull the Weak", p.hand) || !$T(o.units) || !(this.can_pay(p, $gi($gi(CARDS, "Cull the Weak"), "e"), $gi($gi(CARDS, "Cull the Weak"), "p"), "Cull the Weak")))) {
      return;
    }
    val = ((u) => $sub($add((($T(u.token) ? 0 : 2) + u.might(this)), $mul(4, champion_like(u.name))), ($in(u.name, ["Carrion Dredger", "Lonely Poro", "Watchful Sentry", "Ferrous Forerunner"]) ? 2 : 0)));
    theirs = $min(o.units, $kw({"key": val}));
    mine = ($T(p.units) ? $min(p.units, $kw({"key": val})) : null);
    if (($sub(val(theirs), ($T(mine) ? val(mine) : 0)) < 2)) {
      return;
    }
    if (!$T(this.cast(p, "Cull the Weak", $gi($gi(CARDS, "Cull the Weak"), "e"), $gi($gi(CARDS, "Cull the Weak"), "p")))) {
      return;
    }
    $cm(p.plays, "append", [p.tn, "Cull the Weak"]);
    theirs = ($T(o.units) ? $min(o.units, $kw({"key": val})) : null);
    mine = ($T(p.units) ? $min(p.units, $kw({"key": val})) : null);
    if (this.v) this.say(`  ${$str(p.name)} plays Cull the Weak: ${$str(o.name)} loses ${$str(($T(theirs) ? theirs.name : "nothing"))}, ${$str(p.name)} loses ${$str(($T(mine) ? mine.name : "nothing"))}`);
    this.resolve_deaths((() => { const $r = []; for (const x of $it([theirs, mine])) { if ((x != null)) { $r.push(x); } } return $r; })(), "Cull the Weak");
  }
  showstopper(i) {
    let p, base_, dest, u;
    p = $gi(this.P, i);
    if ((!$in("Showstopper", p.hand) || !(this.can_pay(p, 1, 1, "Showstopper")))) {
      return;
    }
    base_ = (() => { const $r = []; for (const u of $it(p.units)) { if (((u.loc === "base") && (u.might(this) > 0))) { $r.push(u); } } return $r; })();
    dest = $OR((() => { const $r = []; for (const b of $it($range(2))) { if ((!$eq($gi($gi(this.bf, b), "ctrl"), i) && !$T(this.units_at((1 - i), b)))) { $r.push(b); } } return $r; })(), () => (() => { const $r = []; for (const b of $it($range(2))) { if ($eq($gi($gi(this.bf, b), "ctrl"), i)) { $r.push(b); } } return $r; })());
    if ((!$T(base_) || !$T(dest))) {
      return;
    }
    u = $max(base_, $kw({"key": ((x) => [x.exhausted, !$T(x.buffed), x.might(this)])}));
    if (!$T(this.cast(p, "Showstopper", 1, 1))) {
      return;
    }
    $cm(p.plays, "append", [p.tn, "Showstopper"]);
    this.buff(u);
    u.loc = $gi(dest, 0);
    if (this.v) this.say(`  ${$str(p.name)} plays Showstopper: ${$str(u.name)} is buffed and moves to ${$str($gi($gi(this.bf, $gi(dest, 0)), "name"))}`);
  }
  decree_choice(i, attackers, defenders) {
    let s, us, them, p, ud, td, lose, gain;
    if (($eq($ga(this, "decree_tn", (-1)), this.turn_no) || !$T(attackers) || !$T(defenders))) {
      return;
    }
    for ([s, us, them] of $it([[i, attackers, defenders], [(1 - i), defenders, attackers]])) {
      p = $gi(this.P, s);
      if ((!$in("Imperial Decree", p.hand) || !(this.can_pay(p, $gi($gi(CARDS, "Imperial Decree"), "e"), $gi($gi(CARDS, "Imperial Decree"), "p"), "Imperial Decree")))) {
        continue;
      }
      ud = ($eq(s, i) ? this.att_total(attackers, defenders, i, true) : this.def_total(defenders, attackers, true));
      td = ($eq(s, i) ? this.def_total(defenders, attackers, true) : this.att_total(attackers, defenders, i, true));
      if ((ud < $len(them))) {
        continue;
      }
      lose = $sum($sl($sorted((() => { const $r = []; for (const u of $it(us)) { $r.push(u.might(this)); } return $r; })()), null, $min(td, $len(us))));
      gain = (() => { let $s = 0; for (const u of $it(them)) { $s += $num((u.might(this) + $mul(3, champion_like(u.name)))); } return $s; })();
      if ((($sub(gain, lose) < 4) || ($max((() => { const $r = []; for (const u of $it(them)) { $r.push(u.might(this)); } return $r; })()) < 5))) {
        continue;
      }
      if ($T(this.cast(p, "Imperial Decree", $gi($gi(CARDS, "Imperial Decree"), "e"), $gi($gi(CARDS, "Imperial Decree"), "p")))) {
        this.decree_tn = this.turn_no;
        $cm(p.plays, "append", [p.tn, "Imperial Decree"]);
        if (this.v) this.say(`  ${$str(p.name)} plays Imperial Decree: every unit that takes damage this turn dies`);
      }
      return;
    }
  }
  fight_answer(i, foes) {
    let p, c, kind, val, t, m;
    p = $gi(this.P, i);
    for (c of $it($set(p.hand))) {
      if ((!$in(c, REMOVAL) || !$in(c, COMBAT_OK))) {
        continue;
      }
      [kind, val] = $it($gi(REMOVAL, c));
      if ((!$in(kind, ["dmg", "bounce", "kill_le", "kill_any", "banish_any"]) || !(this.can_pay(p, this.ecost(p, c), $gi($gi(CARDS, c), "p"), c)))) {
        continue;
      }
      for (t of $it(foes)) {
        if (($T(t.protect) || $in(t.name, UNTARGETABLE) || $T(this.deflected(t)))) {
          continue;
        }
        m = t.might(this);
        if (($in(kind, ["kill_any", "banish_any"]) || ((kind === "dmg") && (val >= m)) || ($in(kind, ["bounce", "kill_le"]) && (m <= val)))) {
          return true;
        }
      }
    }
    return false;
  }
  ki_burst(i, them, need) {
    let p, live, cost, t, ex;
    p = $gi(this.P, i);
    if (((need <= 0) || !$in("Ki Burst", p.hand) || !(this.can_pay(p, 1, 0, "Ki Burst")))) {
      return need;
    }
    live = (() => { const $r = []; for (const u of $it(them)) { if (($in(u, $gi(this.P, (1 - i)).units) && !$T(u.stun) && !$T(u.protect) && !$in(u.name, UNTARGETABLE_COMBAT) && !$T(this.deflected(u)))) { $r.push(u); } } return $r; })();
    cost = (() => { const $r = []; for (const u of $it(p.units)) { if (!$T(u.exhausted)) { $r.push(u); } } return $r; })();
    if ((!$T(live) || !$T(cost))) {
      return need;
    }
    t = $max(live, $kw({"key": ((x) => x.might(this))}));
    if (((t.might(this) < 3) && (need > t.might(this)))) {
      return need;
    }
    ex = $min(cost, $kw({"key": ((x) => [(x.loc !== "base"), x.might(this)])}));
    ex.exhausted = true;
    if (!$T(this.cast(p, "Ki Burst", 1, 0))) {
      return need;
    }
    $cm(p.plays, "append", [p.tn, "Ki Burst"]);
    t.stun = true;
    if (this.v) this.say(`  ${$str(p.name)} plays Ki Burst (exhausting ${$str(ex.name)}): ${$str(t.name)} is Stunned`);
    return (need - t.might(this));
  }
  alpha_strike(i) {
    let p, foe, su, M, en, plan, left, val, x, h, batch, k;
    p = $gi(this.P, i);
    foe = $gi(this.P, (1 - i));
    if ((!$in("Alpha Strike", p.hand) || !$T(p.units) || !(this.can_pay(p, 3, 1, "Alpha Strike")))) {
      return;
    }
    su = $max(p.units, $kw({"key": ((x) => x.might(this))}));
    M = su.might(this);
    en = (() => { const $r = []; for (const x of $it(foe.units)) { if (((x.loc !== "base") && !$T(x.protect) && !$in(x.name, UNTARGETABLE) && !$T(this.deflected(x)))) { $r.push(x); } } return $r; })();
    $cm(en, "sort", $kw({"key": ((x) => (-(x.might(this) + $mul(3, champion_like(x.name)))))}));
    plan = [];
    left = M;
    val = 0;
    for (x of $it(en)) {
      h = $max(1, (x.might(this) - x.dmg));
      if ((h <= left)) {
        $cm(plan, "append", [x, h]);
        left = $sub(left, h);
        val = $iadd(val, (x.might(this) + $mul(3, champion_like(x.name))));
      }
    }
    if ((!$T(plan) || (val < 4))) {
      return;
    }
    if (!$T(this.cast(p, "Alpha Strike", 3, 1))) {
      return;
    }
    $cm(p.plays, "append", [p.tn, "Alpha Strike"]);
    batch = [];
    for ([x, h] of $it(plan)) {
      if (($in(x, foe.units) && (x.loc !== "base"))) {
        this.deal(x, h, "Alpha Strike", batch);
      }
    }
    k = $len((() => { const $r = []; for (const x of $it(batch)) { if ($eq(x.owner, (1 - i))) { $r.push(x); } } return $r; })());
    if (this.v) this.say(`  ${$str(p.name)}'s ${$str(su.name)} Alpha Strikes for ${$str(M)}: ${$str($cm(", ", "join", (() => { const $r = []; for (const [x, _] of $it(plan)) { $r.push(x.name); } return $r; })()))}`);
    this.resolve_deaths(batch, "Alpha Strike");
    p.xp = $add($ga(p, "xp", 0), k);
  }
  fight_removal(i, them, need) {
    let p, _, live, best, c, kind, val, t, m, v, ok, sc, m0;
    p = $gi(this.P, i);
    if (((need <= 0) || !$T($ga(p, "ai29b", $gi(AI29B, 0))))) {
      return need;
    }
    for (_ of $it($range(2))) {
      live = (() => { const $r = []; for (const u of $it(them)) { if ($in(u, $gi(this.P, (1 - i)).units)) { $r.push(u); } } return $r; })();
      if ((!$T(live) || (need <= 0))) {
        break;
      }
      best = null;
      for (c of $it($set(p.hand))) {
        if ((!$in(c, REMOVAL) || !$in(c, COMBAT_OK) || $in(c, ["Dockside Lock-Up"]))) {
          continue;
        }
        if (!(this.can_pay(p, this.ecost(p, c), $gi($gi(CARDS, c), "p"), c))) {
          continue;
        }
        [kind, val] = $it($gi(REMOVAL, c));
        for (t of $it(live)) {
          if (($T(t.protect) || $in(t.name, UNTARGETABLE) || $T(this.wild_safe(t)))) {
            continue;
          }
          m = (t.might(this) - t.dmg);
          if ((kind === "dmg")) {
            v = $add(val, (((c === "Ruthless Strike") && ($len(p.hand) > 2)) ? (5 - val) : 0));
            ok = (v >= m);
          } else if ((kind === "kill_le")) {
            ok = ((t.might(this) <= val) || ((c === "Wind and Ghosts") && !$T(t.token)));
          } else if ((kind === "gear_dmg")) {
            ok = ($max($OR((() => { const $r = []; for (const x of $it(this.all_gear(i))) { $r.push($gi($gi(CARDS, x), "e")); } return $r; })(), () => [0])) >= m);
          } else if ($in(kind, ["kill_any", "banish_any"])) {
            ok = true;
          } else {
            ok = false;
          }
          if ($T(ok)) {
            sc = $sub((t.might(this) + t.shield(this)), $gi($gi(CARDS, c), "e"));
            if (((best == null) || (sc > $gi(best, 0)))) {
              best = [sc, c, t];
            }
          }
        }
      }
      if ((best == null)) {
        break;
      }
      [_, c, t] = $it(best);
      $cm(p.hand, "remove", c);
      $cm(p.trash, "append", c);
      this.pay(p, this.ecost(p, c), $gi($gi(CARDS, c), "p"), c);
      $cm(p.plays, "append", [p.tn, c]);
      m0 = (t.might(this) + t.shield(this));
      this.cast_removal(i, c, t);
      if ((!$in(t, $gi(this.P, (1 - i)).units) || !$eq(t.loc, ($T(them) ? $gi(them, 0).loc : t.loc)))) {
        need = $sub(need, m0);
      }
      if (this.v) this.say(`  ${$str(p.name)} uses ${$str(c)} mid-fight`);
    }
    return need;
  }
  defender_react(i, dfn, att, need) {
    let p, a30, gears, bi, g, u, h, c, hb, th, dc, sw, t, lo, d, zx, base_, x, live, src, v_, ok_, t_, gain, cand, m0, kd, v, e, mine, lim, two, rp;
    p = $gi(this.P, i);
    if ($T(this.slip(p))) {
      return;
    }
    a30 = $ga(p, "ai30", $gi(AI30, 0));
    need = this.fight_removal(i, att, need);
    if (((need > 0) && $T(dfn) && (p.leg === "jarvan") && !$T(p.jleg) && (() => { for (const u of $it(p.units)) { if ((u.name === "Jarvan IV, Martial Paragon")) return true; } return false; })())) {
      gears = (() => { const $r = []; for (const c of $it(p.hand)) { if ((($gi($gi(CARDS, c), "t") === "Gear") && $in("D", $gi($gi(CARDS, c), "f")) && (c !== "Dockside Lock-Up") && this.can_pay(p, $gi($gi(CARDS, c), "e"), ($gi($gi(CARDS, c), "p") + 1), c))) { $r.push(c); } } return $r; })();
      bi = (() => { for (const u of $it($add($list(dfn), $list(att)))) { if ((u.loc !== "base")) { return u.loc; } } return null; })();
      if (($T(gears) && (bi != null) && (() => { for (const u of $it(p.units)) { if ((u.loc === "base")) return true; } return false; })())) {
        g = $min(gears, $kw({"key": ((c) => $add($gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p")))}));
        $cm(p.hand, "remove", g);
        this.pay(p, $gi($gi(CARDS, g), "e"), $gi($gi(CARDS, g), "p"), g);
        $cm($gi($gi($gi(this.bf, bi), "gear"), i), "append", g);
        u = this.jarvan_move(i, bi, true);
        if ((u != null)) {
          $cm(dfn, "append", u);
          need = $sub(need, (u.might(this) + u.shield(this)));
          if ((g === "Pillaged Armory")) {
            this.buff(u);
            need = (need - 1);
          }
        }
      }
    }
    if ($T($gi(SMART, 0))) {
      bi = (() => { for (const u of $it($add($list(dfn), $list(att)))) { if ((u.loc !== "base")) { return u.loc; } } return null; })();
      if ((bi == null)) {
        return;
      }
      $ssl(dfn, null, null, (() => { const $r = []; for (const u of $it(dfn)) { if ((u.loc !== "base")) { $r.push(u); } } return $r; })());
      if ($T($gi(PB, 0))) {
        need = this.thrill_in(i, dfn, bi, need);
        need = this.ki_burst(i, att, need);
      }
      for (h of $it($list(p.hidden))) {
        if ((need <= 0)) {
          break;
        }
        if (!$in(h, p.hidden)) {
          continue;
        }
        [c, hb, th] = $it(h);
        if (!$eq(hb, bi)) {
          continue;
        }
        $cm(p.hidden, "remove", h);
        if ($T($gi(AI36, 0))) {
          p.kemp = true;
        }
        if ($T($gi(PB2, 0))) {
          this.ev_flip(p);
        } else if (((p.leg === "evelynn") && !($eq($ga(p, "ev_tn", (-1)), this.turn_no)))) {
          p.ev_tn = this.turn_no;
          this.draw(p);
          if (($T($gi(FEAT16, "legends")) && $T(p.hand))) {
            dc = $min(p.hand, $kw({"key": ((x) => $add($add($gi($gi(CARDS, x), "e"), $gi($gi(CARDS, x), "p")), (($gi($gi(CARDS, x), "t") === "Unit") ? 4 : 0)))}));
            $cm(p.hand, "remove", dc);
            $cm(p.trash, "append", dc);
          }
        }
        if (($gi($gi(CARDS, c), "t") === "Unit")) {
          u = this.place_unit(i, c, bi);
          $cm(dfn, "append", u);
          if (((c === "Momentary Companion") && $T($gi(AUDIT, 0)))) {
            u.temporary = true;
          }
          if (((c === "Tideturner") && $T($gi(FEAT16, "cards")))) {
            sw = this.tide_swap(i, u, bi);
            if ((sw != null)) {
              $cm(dfn, "remove", u);
              $cm(dfn, "append", sw);
              u = sw;
            }
          }
          need = $sub(need, (u.might(this) + u.shield(this)));
          need = $sub(need, this.from_hidden(p, c, bi));
          if (this.v) this.say(`  ${$str(p.name)} flips ${$str(c)} to block`);
        } else if ((c === "Hidden Blade")) {
          t = $max(att, $kw({"key": ((x) => x.might(this))}));
          this.from_hidden(p);
          if (this.v) this.say(`  ${$str(p.name)} flips Hidden Blade`);
          need = (need - t.might(this));
          $cm(p.trash, "append", c);
          this.kill(t, "Hidden Blade");
          this.draw($gi(this.P, (1 - i)), 2);
        } else if ((c === "Back Off")) {
          t = $max(att, $kw({"key": ((x) => x.might(this))}));
          t.stun = true;
          need = (need - t.might(this));
          $cm(p.trash, "append", c);
          this.from_hidden(p);
          if (this.v) this.say(`  ${$str(p.name)} flips Back Off`);
        } else if (((c === "Switcheroo") && $T(att) && $T(dfn))) {
          t = $max(att, $kw({"key": ((x) => x.might(this))}));
          lo = $min(dfn, $kw({"key": ((x) => x.might(this))}));
          d = (t.might(this) - lo.might(this));
          if ((d > 0)) {
            { const $t201 = t; $t201.temp = $sub($t201.temp, d); }
            { const $t202 = lo; $t202.temp = $iadd($t202.temp, d); }
            need = $sub(need, $mul(2, d));
          }
          $cm(p.trash, "append", c);
          this.from_hidden(p);
          if (this.v) this.say(`  ${$str(p.name)} flips Switcheroo`);
        } else {
          $cm(p.trash, "append", c);
        }
      }
      if (($T($gi(FEAT16, "cards")) && $T(dfn))) {
        zx = (() => { const $r = []; for (const u of $it(dfn)) { if (((u.name === "Ziggs, Explosive") && $in(u, p.units))) { $r.push(u); } } return $r; })();
        if (($T(zx) && ($gi($gi($gi(this.bf, bi), "bombs"), i) > 0) && (need > 0))) {
          { const $t203 = $gi(zx, 0); $t203.temp = ($t203.temp + 2); }
          need = (need - 2);
          if (this.v) this.say(`  ${$str(p.name)}'s Ziggs kills a Bomb on defence (+2)`);
          this.bomb_pop(i, bi, 1);
          need = ($sub(this.att_total((() => { const $r = []; for (const u of $it(att)) { if ($in(u, $gi(this.P, (1 - i)).units)) { $r.push(u); } } return $r; })(), (() => { const $r = []; for (const u of $it(dfn)) { if ($in(u, p.units)) { $r.push(u); } } return $r; })(), (1 - i)), this.def_total((() => { const $r = []; for (const u of $it(dfn)) { if ($in(u, p.units)) { $r.push(u); } } return $r; })(), att)) + 1);
        }
        if (((need > 0) && $in("Satchel Charge", p.hand) && this.can_pay(p, 3, 1, "Satchel Charge"))) {
          base_ = (() => { const $r = []; for (const u of $it(p.units)) { if ((u.loc === "base")) { $r.push(u); } } return $r; })();
          if ($T(base_)) {
            x = $max(base_, $kw({"key": ((y) => (y.might(this) + y.shield(this)))}));
            if ($T(this.cast(p, "Satchel Charge", 3, 1))) {
              if (true) {
                x.loc = bi;
                $cm(dfn, "append", x);
                need = $sub(need, (x.might(this) + x.shield(this)));
                { const $t204 = $gi($gi(this.bf, bi), "bombs"), $t205 = i; $si($t204, $t205, ($gi($t204, $t205) + 1)); }
                if (this.v) this.say(`  ${$str(p.name)} Satchel Charges ${$str(x.name)} in to block`);
              }
            }
          }
        }
      }
      if (($T($gi(FEAT16, "cards")) && (need > 0) && $in("Ntofo Strikes", p.hand) && this.can_pay(p, 2, 1, "Ntofo Strikes"))) {
        live = (() => { const $r = []; for (const u of $it(att)) { if (($in(u, $gi(this.P, (1 - i)).units) && !$T(u.protect) && !$in(u.name, UNTARGETABLE_COMBAT))) { $r.push(u); } } return $r; })();
        src = $max($OR((() => { const $r = []; for (const u of $it(dfn)) { if ($in(u, p.units)) { $r.push(u); } } return $r; })(), () => [null]), $kw({"key": ((x) => ($T(x) ? x.shield(this) : (-1)))}));
        if (($T(live) && (src != null))) {
          v_ = (src.shield(this) + 2);
          ok_ = (() => { const $r = []; for (const u of $it(live)) { if (((u.might(this) - u.dmg) <= v_)) { $r.push(u); } } return $r; })();
          t_ = $max($OR(ok_, () => live), $kw({"key": ((x) => x.might(this))}));
          gain = (2 + ($in(t_, ok_) ? t_.might(this) : 0));
          if ((gain >= $min(need, 4))) {
            if ($T(this.cast(p, "Ntofo Strikes", 2, 1))) {
              if (!$T(this.answer_spell((1 - i), i, "Ntofo Strikes", "shield_dmg", t_))) {
                { const $t206 = src; $t206.shield_b = ($t206.shield_b + 2); }
                this.deal(t_, v_, "Ntofo Strikes");
                need = $sub(need, gain);
                if (this.v) this.say(`  ${$str(p.name)} Ntofo Strikes ${$str(t_.name)} on defence`);
              }
            }
          }
        }
      }
      for (c of $it(["Hextech Ray", "Bellows Breath", "Gust", "Rebuke", "Star-Crossed", "Smoke Screen", "Stupefy", "Temporal Breach"])) {
        if ((need <= 0)) {
          break;
        }
        if (($T($gi(FEAT16, "timing")) && (c === "Temporal Breach"))) {
          continue;
        }
        if (($T(a30) && $in(c, ["Smoke Screen", "Stupefy"]))) {
          continue;
        }
        if ((!$in(c, p.hand) || !(this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c)))) {
          continue;
        }
        live = (() => { const $r = []; for (const u of $it(att)) { if (($in(u, $gi(this.P, (1 - i)).units) && !$in(u.name, UNTARGETABLE_COMBAT) && !$T(u.protect) && !$T(this.wild_safe(u)))) { $r.push(u); } } return $r; })();
        if (!$T(live)) {
          break;
        }
        t = $max(live, $kw({"key": ((x) => x.might(this))}));
        if (($in(c, ["Hextech Ray", "Bellows Breath"]) && $eq($gi(this.P, (1 - i)).spirit, this.turn_no))) {
          continue;
        }
        if ((c === "Hextech Ray")) {
          cand = (() => { const $r = []; for (const u of $it(live)) { if (((u.might(this) - u.dmg) <= 3)) { $r.push(u); } } return $r; })();
          if (!$T(cand)) {
            continue;
          }
          t = $max(cand, $kw({"key": ((x) => x.might(this))}));
        } else if ((c === "Bellows Breath")) {
          cand = (() => { const $r = []; for (const u of $it(live)) { if (((u.might(this) - u.dmg) <= 2)) { $r.push(u); } } return $r; })();
          if (!$T(cand)) {
            continue;
          }
        } else if ((c === "Gust")) {
          cand = (() => { const $r = []; for (const u of $it(live)) { if ((u.might(this) <= 3)) { $r.push(u); } } return $r; })();
          if (!$T(cand)) {
            continue;
          }
          t = $max(cand, $kw({"key": ((x) => x.might(this))}));
        } else if ((c === "Temporal Breach")) {
          cand = (() => { const $r = []; for (const u of $it(live)) { if (($T(u.eq) || (u.emp >= 2) || (u.temp >= 2))) { $r.push(u); } } return $r; })();
          if (!$T(cand)) {
            continue;
          }
          t = $max(cand, $kw({"key": ((x) => x.might(this))}));
        }
        $cm(p.hand, "remove", c);
        this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
        $cm(p.trash, "append", c);
        m0 = t.might(this);
        kd = $cm(new PyDict([["Hextech Ray", "dmg"], ["Bellows Breath", "aoe"], ["Smoke Screen", "minus"], ["Stupefy", "minus"]]), "get", c, "bounce");
        if (((c !== "Stupefy") && $T(this.answer_spell((1 - i), i, c, kd, t)))) {
          continue;
        }
        if ((c === "Hextech Ray")) {
          this.deal(t, 3, c);
        } else if ((c === "Bellows Breath")) {
          v = (this.can_pay(p, 1, 0) ? 2 : 1);
          if ($eq(v, 2)) {
            this.pay(p, 1, 0);
          }
          for (e of $it($sl($sorted(live, $kw({"key": ((x) => x.might(this))})), null, 3))) {
            this.deal(e, v, c);
          }
        } else if ($in(c, ["Gust", "Rebuke", "Star-Crossed"])) {
          this.bounce(t);
          if ((c === "Star-Crossed")) {
            mine = (() => { const $r = []; for (const x of $it(p.units)) { if ((!$T(x.token) && !$in(x, dfn))) { $r.push(x); } } return $r; })();
            if ($T(mine)) {
              this.bounce($min(mine, $kw({"key": ((x) => $gi($gi(CARDS, x.name), "e"))})));
            }
          }
        } else if ((c === "Smoke Screen")) {
          { const $t207 = t; $t207.temp = $sub($t207.temp, $min(4, (m0 - 1))); }
        } else if ((c === "Stupefy")) {
          { const $t208 = t; $t208.temp = ($t208.temp - 1); }
          this.draw(p);
        } else if ((c === "Temporal Breach")) {
          for (e of $it(t.eq)) {
            $cm($gi(this.P, (1 - i)).loose_eq, "append", e);
          }
          t.eq = [];
          t.emp = 0;
          t.temp = 0;
        }
        $ssl(att, null, null, (() => { const $r = []; for (const u of $it(att)) { if (($in(u, $gi(this.P, (1 - i)).units) && $eq(u.loc, $gi(dfn, 0).loc))) { $r.push(u); } } return $r; })());
        need = (need - $sub(m0, ($in(t, att) ? t.might(this) : 0)));
        if (this.v) this.say(`  ${$str(p.name)} reacts with ${$str(c)}`);
      }
      if ((!$T(a30) && $in("Decree of Focus", p.hand) && (need > 0) && this.can_pay(p, 1, 0, "Decree of Focus") && (() => { for (const u of $it(att)) { if ($in(u.name, FURY)) return true; } return false; })())) {
        if ($T(this.cast(p, "Decree of Focus", 1, 0))) {
          { const $t209 = $max(dfn, $kw({"key": ((x) => x.might(this))})); $t209.temp = ($t209.temp + 4); }
          need = (need - 4);
          if (this.v) this.say(`  ${$str(p.name)} plays Decree of Focus`);
        }
      }
      if ((!$T(a30) && $in("Existential Dread", p.hand) && (need > 0) && this.can_pay(p, 1, 1, "Existential Dread"))) {
        live = (() => { const $r = []; for (const u of $it(att)) { if ((!$T(u.stun) && !($T($gi(AUDIT, 0)) && ($in(u.name, UNTARGETABLE) || $T(u.protect))))) { $r.push(u); } } return $r; })();
        if ($T(live)) {
          t = $max(live, $kw({"key": ((x) => x.might(this))}));
          if ($T(this.cast(p, "Existential Dread", 1, 1))) {
            t.stun = true;
            need = (need - t.might(this));
            if (($T($gi(AUDIT, 0)) && this.can_pay(p, 2, 0) && (($cm($cm(CARDS, "get", t.name, new PyDict([])), "get", "e", 0) >= 4) || $T(t.eq)))) {
              this.pay(p, 2, 0);
              this.bounce(t);
              $ssl(att, null, null, (() => { const $r = []; for (const x of $it(att)) { if ((x !== t)) { $r.push(x); } } return $r; })());
              if (this.v) this.say(`  ${$str(p.name)} repeats Existential Dread: ${$str(t.name)} returned to hand`);
            }
          }
        }
      }
      if (($in("Janna, Savior", p.hand) && (need > 0) && this.can_pay(p, 3, 1, "Janna, Savior") && $T(att))) {
        $cm(p.hand, "remove", "Janna, Savior");
        this.pay(p, 3, 1, "Janna, Savior");
        u = this.place_unit(i, "Janna, Savior", bi);
        $cm(dfn, "append", u);
        t = $max(att, $kw({"key": ((x) => x.might(this))}));
        t.loc = "base";
        $ssl(att, null, null, (() => { const $r = []; for (const x of $it(att)) { if ((x !== t)) { $r.push(x); } } return $r; })());
        for (x of $it(dfn)) {
          x.dmg = 0;
        }
        need = (need - (t.might(this) + 3));
        if (this.v) this.say(`  ${$str(p.name)} plays Janna and sends ${$str(t.name)} home`);
      }
      if (($in("Back Off", p.hand) && (need > 0) && this.can_pay(p, 3, 0, "Back Off"))) {
        live = (() => { const $r = []; for (const u of $it(att)) { if ((!$T(u.stun) && !($T($gi(AUDIT, 0)) && ($in(u.name, UNTARGETABLE) || $T(u.protect))))) { $r.push(u); } } return $r; })();
        if ($T(live)) {
          t = $max(live, $kw({"key": ((x) => x.might(this))}));
          if ($T(this.cast(p, "Back Off", 3, 0))) {
            t.stun = true;
            need = (need - t.might(this));
            this.draw(p);
            if (this.v) this.say(`  ${$str(p.name)} Back Offs ${$str(t.name)}`);
          }
        }
      }
      for ([c, lim] of $it([["Charm", 99], ["Siren's Song", 99], ["Twilight Step", 3]])) {
        if (($T($gi(FEAT16, "timing")) && !$in(c, COMBAT_OK))) {
          continue;
        }
        if (((need > 0) && $in(c, p.hand) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
          live = (() => { const $r = []; for (const u of $it(att)) { if (((u.might(this) <= lim) && !$T(u.protect) && !($T($gi(AUDIT, 0)) && $in(u.name, UNTARGETABLE)))) { $r.push(u); } } return $r; })();
          if ($T(live)) {
            t = $max(live, $kw({"key": ((x) => x.might(this))}));
            $cm(p.hand, "remove", c);
            this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
            $cm(p.trash, "append", c);
            t.loc = "base";
            $ssl(att, null, null, (() => { const $r = []; for (const u of $it(att)) { if ((u !== t)) { $r.push(u); } } return $r; })());
            need = (need - t.might(this));
            if (this.v) this.say(`  ${$str(p.name)} moves ${$str(t.name)} away with ${$str(c)}`);
          }
        }
      }
      if ((!$T(a30) && $in("Thwonk!", p.hand) && (need > 0) && this.can_pay(p, 2, 0, "Thwonk!"))) {
        live = (() => { const $r = []; for (const u of $it(att)) { if ((!$T(u.stun) && !($T($gi(AUDIT, 0)) && ($in(u.name, UNTARGETABLE) || $T(u.protect))))) { $r.push(u); } } return $r; })();
        if ($T(live)) {
          t = $max(live, $kw({"key": ((x) => x.might(this))}));
          if ($T(this.cast(p, "Thwonk!", 2, 0))) {
            t.stun = true;
            need = (need - t.might(this));
            if (this.v) this.say(`  ${$str(p.name)} Thwonks ${$str(t.name)}`);
            live = (() => { const $r = []; for (const u of $it(live)) { if (!$T(u.stun)) { $r.push(u); } } return $r; })();
            if (($T($gi(AUDIT, 0)) && $T(live) && (need > 0) && this.can_pay(p, 2, 0))) {
              t = $max(live, $kw({"key": ((x) => x.might(this))}));
              this.pay(p, 2, 0);
              t.stun = true;
              need = (need - t.might(this));
              if (this.v) this.say(`  ${$str(p.name)} repeats Thwonk! on ${$str(t.name)}`);
            }
          }
        }
      }
      if (($in("Cannon Barrage", p.hand) && (need > 0) && this.can_pay(p, 2, 1, "Cannon Barrage") && (() => { for (const u of $it(att)) { if (((u.might(this) - u.dmg) <= 2)) return true; } return false; })())) {
        if ($T(this.cast(p, "Cannon Barrage", 2, 1))) {
          for (u of $it($list(att))) {
            this.deal(u, 2, "Cannon Barrage");
          }
          $ssl(att, null, null, (() => { const $r = []; for (const u of $it(att)) { if ($in(u, $gi(this.P, (1 - i)).units)) { $r.push(u); } } return $r; })());
          need = (need - 3);
          if (this.v) this.say(`  ${$str(p.name)} plays Cannon Barrage`);
        }
      }
      if (($in("For Demacia!", p.hand) && ($len(dfn) >= 2) && this.can_pay(p, 3, 0, "For Demacia!") && (need > 0))) {
        if ($T(this.cast(p, "For Demacia!", 3, 0))) {
          for (u of $it(dfn)) {
            { const $t210 = u; $t210.shield_b = ($t210.shield_b + 2); }
          }
          need = (need - (4 * $len(dfn)));
          if (this.v) this.say(`  ${$str(p.name)} plays For Demacia!`);
        }
      }
      if ((!$T(a30) && $in("Ki Barrier", p.hand) && this.can_pay(p, 2, 1, "Ki Barrier") && (need > 0))) {
        if ($T(this.cast(p, "Ki Barrier", 2, 1))) {
          { const $t211 = $max(dfn, $kw({"key": ((x) => x.might(this))})); $t211.ward = ($t211.ward + 7); }
          need = (need - 7);
        }
      }
      for (c of $it($list(p.hand))) {
        if ((need <= 0)) {
          break;
        }
        if (($in(c, AMBUSH) && this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
          $cm(p.hand, "remove", c);
          this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
          u = this.place_unit(i, c, bi);
          $cm(dfn, "append", u);
          need = (need - u.might(this));
          if (this.v) this.say(`  ${$str(p.name)} ambushes with ${$str(c)}`);
        }
      }
      for (c of $it($list(p.hand))) {
        if ((need <= 0)) {
          break;
        }
        if ((!$T(a30) && $in(c, SHOWDOWN_PUMP) && $in(c, PUMP) && !$in(c, ["Discipline", "Battle Preparations", "Bonds of Strength"]) && this.can_pay(p, this.pe(p, c), $gi($gi(CARDS, c), "p"), c))) {
          u = $max(dfn, $kw({"key": ((x) => x.might(this))}));
          v = $gi(PUMP, c);
          $cm(p.hand, "remove", c);
          this.pay(p, this.pe(p, c), $gi($gi(CARDS, c), "p"), c);
          $cm(p.trash, "append", c);
          if ((v === "x2")) {
            v = u.might(this);
          }
          if ((c === "Block")) {
            { const $t212 = u; $t212.shield_b = ($t212.shield_b + 3); }
            u.tank_b = true;
          } else {
            { const $t213 = u; $t213.temp = $iadd($t213.temp, v); }
          }
          if (this.v) this.say(`  ${$str(p.name)} defends with ${$str(c)}`);
          need = $sub(need, v);
        }
      }
    }
    for (c of $it(($T(a30) ? [] : $list(p.hand)))) {
      if (!(this.can_pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c))) {
        continue;
      }
      if (($in(c, ["Discipline", "Battle Preparations", "Bonds of Strength"]) && (!$T($gi(DISC_FIX, 0)) || ((0 < need) && (need <= 4))))) {
        u = $max(dfn, $kw({"key": ((x) => x.might(this))}));
        $cm(p.hand, "remove", c);
        this.pay(p, $gi($gi(CARDS, c), "e"), $gi($gi(CARDS, c), "p"), c);
        $cm(p.trash, "append", c);
        if (($T($gi(AUDIT, 0)) && (c === "Bonds of Strength"))) {
          two = $sl($sorted(dfn, $kw({"key": ((y) => (-y.might(this)))})), null, 2);
          rp = ((need > $len(two)) && this.can_pay(p, 2, 0, c));
          if ($T(rp)) {
            this.pay(p, 2, 0, c);
          }
          for (x of $it(two)) {
            { const $t214 = x; $t214.temp = $iadd($t214.temp, ($T(rp) ? 2 : 1)); }
          }
          gain = $mul($len(two), ($T(rp) ? 2 : 1));
        } else {
          { const $t215 = u; $t215.temp = ($t215.temp + 2); }
          gain = 2;
          if (($T($gi(AUDIT, 0)) && (c === "Battle Preparations"))) {
            this.show_off(p);
          }
        }
        if ((c === "Discipline")) {
          this.draw(p);
        }
        if (this.v) this.say(`  ${$str(p.name)} reacts ${$str(c)}`);
        need = $sub(need, ($T($gi(AUDIT, 0)) ? gain : 4));
      } else if ((c === "Mesmerize")) {
        u = $max(att, $kw({"key": ((x) => x.might(this))}));
        { const $t216 = u; $t216.temp = ($t216.temp - 2); }
        $cm(p.hand, "remove", c);
        this.pay(p, 1, 1, c);
        $cm(p.trash, "append", c);
        need = (need - 2);
        if (this.v) this.say(`  ${$str(p.name)} reacts Mesmerize`);
      } else if ((c === "High Note")) {
        x = (() => { let $s = 0; for (const u of $it(p.units)) { if ($T(u.exhausted)) { $s += $num(1); } } return $s; })();
        if ((x >= 2)) {
          u = $max(att, $kw({"key": ((y) => y.might(this))}));
          { const $t217 = u; $t217.temp = $sub($t217.temp, x); }
          $cm(p.hand, "remove", c);
          this.pay(p, 3, 0, c);
          $cm(p.trash, "append", c);
          need = $sub(need, x);
          if (this.v) this.say(`  ${$str(p.name)} reacts High Note`);
        }
      } else if (((c === "Tactical Retreat") || ($T($gi(AI36, 0)) && (c === "Flash")))) {
        for (u of $it($sl($sorted(dfn, $kw({"key": ((x) => (-x.might(this)))})), null, ((c === "Flash") ? 2 : 1)))) {
          u.retreat = true;
        }
        $cm(p.hand, "remove", c);
        this.pay(p, 2, 0, c);
        $cm(p.trash, "append", c);
      }
      if ((need <= 0)) {
        break;
      }
    }
  }
  cmight(u, us, them, defending) {
    let m, pk;
    m = u.might(this);
    if (!$T($gi(RULES34, 0))) {
      return $add(m, ($T(defending) ? u.shield(this) : 0));
    }
    pk = $gi(this.P, u.owner);
    if ($T(defending)) {
      m = $iadd(m, u.shield(this));
      if ((($len(us) === 1) && (pk.leg === "masteryi"))) {
        m = (m + 2);
      }
    } else {
      m = $iadd(m, u.kw("assault"));
      if (((u.name === "Ambessa, Respected and Feared") && $T(u.pw))) {
        m = (m + 2);
      }
      if ($eq($ga(u, "pe_assault", (-1)), this.turn_no)) {
        m = (m + 3);
      }
      if (((u.name === "Shadow Fiend") && $T(u.pw))) {
        m = (m + 3);
      }
      if ($eq($ga(u, "as2_tn", (-1)), this.turn_no)) {
        m = (m + 2);
      }
      if (((u.name === "Shadow Clone") && $eq($ga(u, "clone_tn", (-1)), this.turn_no))) {
        m = (m + 4);
      }
      if (((pk.leg === "ksante") && ($ga(pk, "ksleg", null) === u))) {
        m = $iadd(m, u.shield(this));
      }
    }
    if (((u.name === "Fiora, Peerless") && ($len(us) === 1) && ($len(them) === 1))) {
      m = (m + u.might(this));
    }
    return m;
  }
  assign(dmg, units, defending, them = [], out = null) {
    let hpf, order, u, hp;
    if (($T(units) && ((() => { for (const x of $it($gi(this.P, (1 - $gi(units, 0).owner)).units)) { if ((x.name === "Elder Dragon")) return true; } return false; })() || $eq($ga(this, "decree_tn", (-1)), this.turn_no)))) {
      hpf = ((u) => 1);
    } else {
      hpf = ($T($gi(RULES34, 0)) ? ((u) => this.cmight(u, units, them, defending)) : ((u) => (u.might(this) + ($T(defending) ? u.shield(this) : 0))));
    }
    order = $sorted(units, $kw({"key": ((u) => [!$T(u.is_tank()), u.kw("back"), hpf(u)])}));
    for (u of $it(order)) {
      hp = ($sub(hpf(u), u.dmg) + u.ward);
      if ($T($gi(RULES34, 0))) {
        if ((dmg <= 0)) {
          break;
        }
        hp = $max(1, hp);
      }
      if ((dmg >= hp)) {
        dmg = $sub(dmg, hp);
        if (((out != null) && $T($gi(SIMUL, 0)))) {
          $cm(out, "append", u);
        } else {
          this.kill(u, "combat");
        }
      } else {
        { const $t218 = u; $t218.dmg = $iadd($t218.dmg, dmg); }
        dmg = 0;
      }
      if ((dmg <= 0)) {
        break;
      }
    }
  }
  resolve_deaths(dead, why) {
    let u;
    dead = (() => { const $r = []; for (const u of $it(dead)) { if ($in(u, $gi(this.P, u.owner).units)) { $r.push(u); } } return $r; })();
    $cm(dead, "sort", $kw({"key": ((u) => $eq(u.owner, this.tp))}));
    this.doomed = $list(dead);
    this.death_batch = ($ga(this, "death_batch", 0) + 1);
    this.in_batch = true;
    for (u of $it(dead)) {
      this.kill(u, why);
    }
    this.doomed = [];
    this.in_batch = false;
  }
  play(max_turns = 40) {
    let p, cur;
    Unit.G = this;
    for (p of $it(this.P)) {
      this.mulligan(p);
    }
    cur = this.rng.randrange(2);
    this.first = cur;
    return this.run(cur, 0, max_turns);
  }
  run(cur, t0, max_turns = 40) {
    let t, k, _j, _pp, _tb;
    for (t of $it($range(t0, max_turns))) {
      if (this.v) this.say(`T${$str((t + 1))} ${$str($gi(this.P, cur).name)} (${$str($gi(this.P, 0).points)}-${$str($gi(this.P, 1).points)})`);
      if (($T($ga($gi(this.P, cur), "look", 0)) && !$T($ga(this, "rollout", false)))) {
        this.lookahead(cur, t, max_turns);
      }
      this.take_turn(cur);
      if (($ga($gi(this.P, cur), "la_restore", null) != null)) {
        this._restore($gi(this.P, cur));
        $gi(this.P, cur).la_restore = null;
      }
      for (k of $it($range(2))) {
        if ((($gi(this.P, k).points >= 8) && ($gi(this.P, k).points > $gi(this.P, (1 - k)).points))) {
          return k;
        }
      }
      if ($T($ga($gi(this.P, (1 - cur)), "eot", $gi(EOT, 0)))) {
        this.eot((1 - cur));
      }
      for (_j of $it([0, 1])) {
        _pp = $gi(this.P, _j);
        if ($T($ga(_pp, "mine_back", 0))) {
          _tb = $gi($sorted($range(2), $kw({"key": ((b_) => (-$len(this.units_at((1 - _j), b_))))})), 0);
          { const $t219 = $gi($gi(this.bf, _tb), "bombs"), $t220 = _j; $si($t219, $t220, $iadd($gi($t219, $t220), _pp.mine_back)); }
          _pp.mine_back = 0;
        }
      }
      if ($T($gi(this.P, cur).extra)) {
        $gi(this.P, cur).extra = false;
        continue;
      }
      cur = (1 - cur);
    }
    return null;
  }
}

return {Game, PyRandom};
}
