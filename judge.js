/* The Riftbound Genie offline judge.
   judge(question, ctx) reads the card names and the situation in a question and works the answer out from the card data
   and the Core Rules: card facts, keywords, timing, targeting, removal, combat, death and scoring triggers, final point,
   burn out. Returns {kind, text, facts} (facts = the structured answer, used by the 12,000-question test).
   ctx = {LIB, FAQ}. Works in the browser (window.RJudge) and in node (module.exports). */
(function (root) {
'use strict';
const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’‘`]/g, "'");
const clean = s => norm(s).replace(/'/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const KW = ['tank', 'backline', 'deflect', 'ganking', 'accelerate', 'hidden', 'ambush', 'reaction', 'action', 'deathknell', 'shield', 'assault', 'temporary', 'legion', 'vision', 'weaponmaster', 'quick-draw', 'unique', 'deploy', 'hunt', 'level', 'empower', 'flow', 'repeat', 'stun', 'buff', 'mighty', 'predict', 'burn', 'show off', 'disarm'];
const NUMW = {a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8};
const nm = s => { s = String(s).toLowerCase(); return /^\d+$/.test(s) ? +s : (NUMW[s] || 1); };

/* ---------- card text analysis ---------- */
function analyse(name, c) {
  if (!c) return null;
  if (c._a) return c._a;
  const x = c.x || '';
  const plain = x.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  // the card's own always-on keywords: text before any condition marker
  const OWN = {}; let lastEnd = -1;
  for (const m of plain.matchAll(/\[([A-Z][A-Za-z-]+)(?: (\d+))?\]/g)) {
    const pre = plain.slice(0, m.index).trimEnd();
    const gap = lastEnd >= 0 ? plain.slice(lastEnd, m.index) : null;
    const okPos = pre === '' || /[.!]$/.test(pre) || (gap !== null && /^\s*,?\s*$/.test(gap));
    const follow = plain.slice(m.index + m[0].length).trimStart();
    if (okPos && !/^\[>\]/.test(follow) && !/^[a-z]/.test(follow)) { OWN[m[1]] = m[2] ? +m[2] : (OWN[m[1]] || 1); lastEnd = m.index + m[0].length; }
    else if (!okPos) lastEnd = -1;
  }
  for (const m of plain.matchAll(/Your (\w+?)s have ((?:\[[A-Za-z-]+(?: \d+)?\](?:,? (?:and )?)?)+)/g))
    if ((c.g || []).includes(m[1])) for (const k of m[2].matchAll(/\[([A-Za-z-]+)(?: (\d+))?\]/g)) if (!OWN[k[1]]) OWN[k[1]] = k[2] ? +k[2] : 1;
  const own = Object.keys(OWN).map(k => '[' + k + (OWN[k] > 1 ? ' ' + OWN[k] : '') + ']').join(' ');
  const a = {name, type: c.t, colors: c.d || [], energy: c.e, power: c.p || 0, might: c.m, rarity: c.r, set: c.s, banned: c.ban || false, text: x, plain, token: !!c.token};
  const kw = (k, numbered) => OWN[k] ? (numbered ? OWN[k] : true) : (numbered ? 0 : false);
  a.tank = kw('Tank'); a.backline = kw('Backline'); a.ganking = kw('Ganking'); a.accelerate = kw('Accelerate');
  a.hidden = !!OWN.Hidden; a.ambush = !!OWN.Ambush; a.deploy = !!OWN.Deploy; a.quickdraw = !!OWN['Quick-Draw'];
  a.deflect = kw('Deflect', true); a.shield = kw('Shield', true); a.assault = kw('Assault', true);
  a.reaction = !!OWN.Reaction || a.quickdraw; a.action = !!OWN.Action;
  a.temporary = /^\s*\[Temporary\]/.test(plain);
  a.readyAlways = /(?:^|[.\]] )I enter ready\./.test(plain);
  a.readyCond = !a.readyAlways && /enter ready/.test(plain) ? (plain.match(/[^.]*enter ready[^.]*\./) || [''])[0].trim() : '';
  a.untargetable = /I can't be chosen by enemy spells and abilities(?! unless)/.test(plain) ? 'always' : (/I can't be chosen by enemy spells and abilities unless/.test(plain) ? (plain.match(/I can't be chosen[^.]*\./) || [''])[0] : '');
  const grab = re => { const m = plain.match(re); return m ? m[0].trim() : ''; };
  a.deathknell = grab(/\[Deathknell\](?:\[>\]| —)\s*[^.]*\.(?:\s*(?:If|Then|Otherwise)[^.]*\.)*/);
  a.onConquer = grab(/When I conquer(?: or hold)?[^.]*\.(?:\s*(?:Then|If)[^.]*\.)*/) || grab(/When I hold or conquer[^.]*\./);
  a.onHold = grab(/When I hold(?: or conquer)?[^.]*\.(?:\s*(?:Then|If)[^.]*\.)*/) || grab(/When I conquer or hold[^.]*\./);
  a.onAttack = grab(/When I attack(?: or defend)?[^.]*\.(?:\s*(?:Then|If)[^.]*\.)*/);
  a.onDefend = grab(/When I (?:attack or )?defend[^.]*\.(?:\s*(?:Then|If)[^.]*\.)*/);
  a.onPlay = grab(/When you play (?:me|this)[^.]*\.(?:\s*(?:Then|If)[^.]*\.)*/);
  a.onMove = grab(/When I move[^.]*\.(?:\s*(?:Then|If)[^.]*\.)*/);
  { const m = plain.match(/(?:Other friendly units|Your other units)(?: here)? have \+(\d+) \[Might\](?: here)?\./); a.aura = m ? +m[1] : 0; }
  a.noCombatDamage = /\bI don't deal combat damage\b/.test(plain) && !/unless/.test(grab(/I don't deal combat damage[^.]*\./));
  // removal / effects on a unit
  const first = plain.replace(/^\s*(\[(?:Hidden|Action|Reaction|Repeat)\][^[]*?)+/g, '');
  let m;
  a.effect = null;
  const WHO = '(a|an enemy|a friendly|up to one|up to one enemy|up to one friendly|an attacking|an attacking enemy)';
  const who = w => /enemy/.test(w) ? 'enemy' : (/friendly/.test(w) ? 'friendly' : 'any');
  if ((m = plain.match(new RegExp('Deal (\\d+) to ' + WHO + ' unit( at a battlefield| in a base)?(?: with (\\d+) \\[Might\\] or less)?[.,]')))) a.effect = {kind: 'damage', n: +m[1], who: who(m[2]), where: m[3] ? (/base/.test(m[3]) ? 'base' : 'battlefield') : 'any'};
  else if ((m = plain.match(/Deal (\d+) to all (enemy )?units( at a battlefield| here)?/))) a.effect = {kind: 'damage_all', n: +m[1], who: m[2] ? 'enemy' : 'all'};
  else if ((m = plain.match(new RegExp('(?:^|\\. |\\] )Kill ' + WHO + ' unit( at a battlefield)?(?: with (\\d+) \\[Might\\] or less)?[.,]')))) a.effect = {kind: 'kill', max: m[3] ? +m[3] : null, who: who(m[1]), where: m[2] ? 'battlefield' : 'any'};
  else if ((m = plain.match(/Choose (a|an enemy|a friendly) unit( at a battlefield)?\. If it has (\d+) \[Might\] or less, banish it\. Otherwise, return it to its owner's hand/))) a.effect = {kind: 'banish_or_bounce', max: +m[3], who: who(m[1]), where: m[2] ? 'battlefield' : 'any'};
  else if ((m = plain.match(/Return a friendly unit and an enemy unit to their owners' hands/))) a.effect = {kind: 'bounce', max: null, who: 'enemy', where: 'any', needFriendly: true};
  else if ((m = plain.match(/Choose (a|an enemy|a friendly) unit( at a battlefield)?\..*?kill it if it has (\d+) \[Might\] or less/))) a.effect = {kind: 'kill', max: +m[3], who: who(m[1]), where: m[2] ? 'battlefield' : 'any'};
  else if ((m = plain.match(/Return (a|an enemy|a friendly) unit( at a battlefield)?(?: with (\d+) \[Might\] or less)? to its owner's hand/))) a.effect = {kind: 'bounce', max: m[3] ? +m[3] : null, who: m[1] === 'an enemy' ? 'enemy' : (m[1] === 'a friendly' ? 'friendly' : 'any'), where: m[2] ? 'battlefield' : 'any'};
  else if ((m = plain.match(/\[Stun\] (a|an enemy|an attacking|an attacking enemy) unit/))) a.effect = {kind: 'stun', who: /enemy/.test(m[1]) ? 'enemy' : 'any'};
  else if ((m = plain.match(/Give (a|a friendly|an enemy) unit ([+-]\d+) \[Might\] this turn/))) a.effect = {kind: 'pump', n: +m[2], who: m[1] === 'a friendly' ? 'friendly' : (m[1] === 'an enemy' ? 'enemy' : 'any')};
  else if ((m = plain.match(/Banish (a|an enemy) unit( at a battlefield)?(?: with (\d+) \[Might\] or less)?/))) a.effect = {kind: 'banish', max: m[3] ? +m[3] : null, who: who(m[1]), where: m[2] ? 'battlefield' : 'any'};
  if (a.effect) a.effect.text = (plain.match(/[^.\]]*(?:Deal|Kill|Return|Stun|Give|Banish)[^.]*\./) || [''])[0].trim();
  // equipment
  if ((m = plain.match(/\+(\d+) \[Might\]/)) && /\[Equip\]/.test(plain)) a.equipBonus = +m[1];
  c._a = a; return a;
}

/* ---------- finding cards in a question ---------- */
function index(LIB) {
  if (LIB._idx) return LIB._idx;
  const full = [], heads = {};
  for (const n of Object.keys(LIB)) {
    if (n === '_idx') continue;
    const f = clean(n); const one = COMMONWORD.has(n);
    if (f.length >= 3) full.push([f, n, one]);
    if (n.includes(',')) { const h = clean(n.split(',')[0]); if (h.length >= 3) { (heads[h] = heads[h] || []).push(n); (heads[h + 's'] = heads[h + 's'] || []).push(n); } }
    if (f.length >= 4 && !one) full.push([f + 's', n, false]);   // plural or possessive: "bombs", "Elnuk Herds"
  }
  full.sort((a, b) => b[0].length - a[0].length);
  return (LIB._idx = {full, heads});
}
// one-word card names that are also ordinary words ("block", "charm", "gust") only count as cards when the question
// treats them as a card: capitalised, or right after cast / play / use / with / my / their / a / does / is ...
const COMMONWORD = new Set(['Cleave', 'Charm', 'Defy', 'Meditation', 'Block', 'Discipline', 'Reinforce', 'Stupefy', 'Retreat', 'Challenge', 'Confront', 'Mobilize', 'Sabotage', 'Gust', 'Rebuke',
  'Whirlwind', 'Possession', 'Salvage', 'Vengeance', 'Firestorm', 'Incinerate', 'Flash', 'Brawl', 'Hush', 'Fanfare', 'Supernova', 'Avalanche', 'Cataclysm', 'Encore', 'Bushwhack', 'Detonate',
  'Forecaster', 'Pickpocket', 'Premonition', 'Temptation', 'Cull', 'Purifier', 'Minefield', 'Smite', 'Friendship', 'Eclipse', 'Concentrate', 'Repulse', 'Isolate', 'Abandon', 'Conscription',
  'Sacrifice', 'Virtuoso', 'Shadow', 'Deceiver', 'Brush', 'Sanction', 'Mesmerize', 'Clairvoyance', 'Onslaught', 'Profiteer', 'Rampage', 'Stargazer', 'Lacerate', 'Rebuttal', 'Highlander',
  'Showstopper', 'Stormbringer', 'Disintegrate', 'Shakedown', 'Singularity', 'Wallop', 'Unforgiven', 'Scrapheap', 'Gearhead', 'Buff', 'Gold']);
const CARDCUE = /(?:^| )(cast|casting|play|playing|played|use|using|with|my|their|his|her|a|an|does|do|is|if|whats|what|the|of|on|counter|countered|hit|vs|and|by|from|into|card|spell|can|will|kill|kills|attack|attacks|attacking|buffed|stunned|enemy|friendly|about|against|target|targets|their own)$/;
const VOCAB = new Set(["", "abilities", "ability", "abilitys", "able", "about", "accel", "accelerate", "act", "action", "actually", "ad", "add", "added", "adding", "adds", "after", "again", "against", "al", "alive", "all", "allc", "allowed", "allows", "already", "also", "always", "am", "ambessa", "ambessas", "ambush", "amplifier", "an", "and", "angler", "another", "answer", "answers", "any", "anyones", "anything", "app", "append", "are", "arent", "armory", "arriving", "as", "aside", "ask", "assault", "assign", "assigned", "assigns", "at", "atk", "att", "attach", "attached", "attaches", "attack", "attacked", "attacker", "attackers", "attackersdie", "attacking", "attacks", "audit", "aura", "aurora", "awaken", "away", "b", "back", "backline", "bad", "baited", "ball", "ban", "banish", "banished", "banishing", "banishment", "banned", "bans", "base", "battle", "battlefield", "battlefields", "be", "because", "become", "becomes", "been", "before", "begin", "beginning", "being", "below", "best", "between", "big", "bird", "blade", "blank", "blew", "block", "blocks", "blow", "blows", "board", "bomb", "bombs", "bonus", "bool", "both", "bottom", "bounce", "bq", "break", "brings", "brittle", "broken", "brutal", "brynhir", "buff", "buffed", "buffing", "buffs", "build", "building", "burn", "burnout", "bushwhack", "but", "by", "called", "calm", "came", "can", "cancel", "cancels", "cant", "card", "cards", "cast", "casual", "cat", "catch", "cause", "chain", "champion", "change", "channel", "channels", "chaos", "charge", "charm", "checked", "checks", "choice", "choices", "choose", "chosen", "cleanup", "clone", "cm", "collect", "collections", "color", "colorless", "colors", "combat", "combatn", "combats", "come", "comes", "common", "conditional", "conditions", "conquer", "conquers", "console", "const", "contested", "control", "controller", "controlling", "controls", "copies", "cost", "costs", "could", "count", "counter", "countered", "countering", "counts", "cq", "cr", "crossed", "current", "d", "dais", "damage", "damaged", "data", "dazzling", "dd", "dead", "deal", "deals", "dealt", "death", "deathknell", "decide", "decided", "deck", "deckbuilding", "decks", "def", "defend", "defender", "defenders", "defendersdie", "defending", "defends", "deflect", "defy", "demacian", "depend", "depends", "deploy", "detonate", "detonation", "dfn", "dict", "did", "didnt", "die", "died", "dies", "difference", "different", "dirname", "disarm", "discard", "disciple", "disempower", "dk", "dl", "dmg", "do", "does", "doesnt", "doing", "domain", "done", "dont", "dose", "down", "dq", "drag", "draw", "drawing", "draws", "drop", "dt", "duel", "dump", "during", "e", "each", "effect", "effects", "eight", "either", "elif", "elnuk", "else", "emperors", "empower", "empowered", "empowering", "empties", "empty", "end", "ending", "ends", "enemies", "enemy", "energy", "engines", "enter", "enters", "entrancing", "equal", "equip", "equipment", "equipped", "eternal", "evelynn", "even", "ever", "every", "everyone", "everything", "exactly", "example", "exception", "exhaust", "exhausted", "exhausting", "exhausts", "exile", "existing", "exists", "exp", "expect", "expected", "experience", "explain", "explode", "explodes", "exploding", "explosimian", "explosive", "extra", "face", "facedown", "fact", "facts", "faefolk", "falling", "false", "faq", "faqtop", "ferrous", "fervent", "fight", "fights", "final", "finalpoint", "finish", "fire", "first", "fit", "five", "flags", "flow", "focus", "for", "forerunner", "form", "format", "four", "fpq", "free", "friendly", "from", "fs", "full", "fury", "fused", "gain", "gains", "game", "games", "gank", "ganking", "gave", "gear", "gears", "generate", "get", "gets", "gg", "ghosts", "give", "given", "gives", "go", "goes", "going", "gold", "gone", "good", "got", "gq", "graves", "graveyard", "group", "gt", "gtext", "had", "hammer", "hand", "hands", "happen", "happened", "happening", "happens", "hard", "harder", "has", "haskw", "haste", "have", "havent", "having", "he", "heal", "healing", "heals", "her", "herd", "herder", "here", "hexplosive", "hextech", "hey", "hi", "hidden", "hide", "him", "his", "hit", "hits", "hold", "holding", "holds", "hook", "horrifying", "hourglass", "how", "hows", "html", "hunt", "hunter", "i", "identity", "if", "im", "implementation", "import", "in", "includes", "including", "independent", "insert", "instant", "instead", "int", "into", "irelia", "irresistible", "is", "isinstance", "isnt", "it", "item", "items", "its", "itself", "ive", "jayce", "join", "js", "json", "judge", "judges", "just", "justified", "karthus", "kayle", "keep", "keeps", "key", "keyword", "kill", "killed", "kills", "kind", "know", "kq", "kw", "kwq", "kwt", "lambda", "lands", "last", "le", "lead", "least", "leave", "leaves", "left", "legal", "legend", "legends", "legion", "len", "length", "less", "let", "lethal", "lets", "level", "levels", "lib", "library", "like", "likely", "limit", "list", "load", "log", "long", "longer", "look", "lose", "loses", "losing", "lost", "lower", "m", "made", "main", "make", "makes", "mana", "mandatory", "many", "match", "matching", "matters", "max", "may", "maybe", "me", "mean", "meanings", "means", "mech", "medium", "method", "mid", "middle", "might", "mighty", "mill", "mind", "mine", "minefield", "minus", "miss", "mods", "moment", "mordekaiser", "more", "most", "mov", "move", "moved", "moves", "moving", "much", "mulligan", "mulligans", "multi", "must", "my", "na", "name", "napart", "nbanish", "nbonuses", "nburn", "nd", "ndisarm", "ndiscard", "need", "needs", "negate", "neither", "never", "new", "newest", "next", "nganking", "ngold", "nidalee", "nif", "nine", "nlegion", "nlevel", "nmighty", "nmoving", "no", "nobody", "nocturne", "nodmg", "non", "none", "normal", "normally", "not", "nothing", "nov", "nrecycle", "nsome", "ntext", "nthe", "numbers", "nunique", "nunspent", "nusing", "nvision", "nwhen", "nyour", "of", "off", "ok", "okay", "old", "on", "once", "one", "ones", "only", "onto", "open", "opening", "opp", "opponent", "opponents", "optional", "or", "order", "other", "otherwise", "our", "out", "outside", "over", "own", "owners", "p", "paid", "parse", "parsing", "part", "parts", "pass", "passes", "path", "pay", "paying", "peacekeeper", "per", "phase", "phases", "phrased", "pick", "pillaged", "pit", "place", "places", "play", "played", "player", "players", "playing", "plays", "please", "plus", "point", "points", "pool", "pools", "possible", "power", "pre", "predict", "predicting", "present", "print", "profiteer", "pull", "pump", "pumped", "pumps", "punch", "push", "put", "puts", "py", "python", "q", "qgen", "question", "questions", "quick", "r", "radiance", "ran", "random", "range", "rare", "rarity", "ray", "rb", "re", "reaches", "reaction", "readfilesync", "readies", "ready", "recall", "recalled", "recalling", "recruit", "recycle", "recycled", "recycling", "redraw", "reflection", "refunded", "rem", "remember", "reminder", "removal", "remove", "removed", "repeat", "replaced", "require", "res", "resolve", "resolves", "resource", "resources", "respond", "responded", "response", "result", "retreat", "return", "returned", "reveal", "rgive", "rhasa", "riftbound", "right", "riot", "riots", "riven", "rng", "role", "rookie", "row", "rq", "ruin", "rule", "rules", "run", "rune", "runes", "runner", "runs", "s", "same", "sample", "sand", "sandshifter", "satchel", "says", "score", "scored", "scores", "scoring", "seal", "seals", "search", "second", "see", "sends", "sent", "set", "setdefault", "sets", "setup", "seven", "several", "shadow", "shall", "she", "shen", "shield", "short", "shot", "should", "show", "showcase", "showdown", "showdowns", "shuffle", "shuffles", "sick", "side", "sides", "signature", "simple", "simpleu", "simply", "sirens", "six", "size", "skipped", "slice", "small", "so", "soldier", "some", "something", "sometimes", "song", "soon", "sorted", "sources", "sp", "special", "speed", "spell", "spells", "spend", "split", "spring", "sprite", "src", "stack", "standard", "star", "start", "starting", "starts", "startswith", "state", "statics", "stats", "status", "stay", "stays", "steel", "stellacorn", "still", "stop", "stops", "straight", "stringify", "strip", "stuff", "stun", "stunned", "stuns", "sub", "such", "sum", "summoning", "sunderer", "sup", "survive", "survives", "switches", "sys", "t", "table", "take", "takes", "taking", "tank", "target", "targetable", "targeted", "targeting", "targets", "temporary", "ten", "tentacle", "test", "text", "th", "than", "thanks", "that", "thats", "the", "their", "theirs", "them", "then", "there", "theres", "these", "they", "thier", "thing", "things", "third", "this", "those", "three", "through", "thundersong", "tie", "tied", "time", "times", "timing", "to", "together", "token", "tokens", "too", "took", "top", "topic", "total", "tpl", "tq", "trade", "trap", "trash", "treasure", "trigger", "triggers", "true", "try", "tt", "turn", "turns", "two", "type", "typo", "uncontrolled", "under", "unescape", "unique", "unit", "units", "unless", "unspent", "untargetable", "until", "up", "ur", "us", "use", "used", "uses", "usual", "usually", "utf", "val", "value", "values", "very", "veryhard", "vi", "victory", "vilemaw", "vision", "w", "want", "was", "wasnt", "wat", "way", "ways", "we", "weaponmaster", "went", "were", "what", "whats", "when", "whenever", "where", "wherever", "whether", "which", "while", "who", "whole", "whom", "whose", "why", "will", "win", "wind", "winning", "wins", "wiped", "with", "within", "without", "wolf", "won", "wont", "work", "works", "worse", "worth", "would", "written", "wut", "wyrm", "wyrms", "x", "xp", "xq", "yes", "yet", "you", "your", "youre", "yours", "youve", "zhonyas", "ziggs", "zone"]);
function findCards(q, LIB) {
  const {full, heads} = index(LIB); let s = ' ' + clean(q) + ' '; const hits = [];
  const raw = String(q);
  for (const [f, n, word] of full) {
    let at = s.indexOf(' ' + f + ' ');
    while (at >= 0) {
      let ok = true;
      if (word) { const before = s.slice(0, at).trimEnd(); const cap = new RegExp('(^|[^A-Za-z])' + n.replace(/[^A-Za-z0-9]/g, '.?') + '(?![A-Za-z])').test(raw); ok = cap || CARDCUE.test(before) || before === ''; }
      if (ok) { hits.push({name: n, at}); s = s.slice(0, at + 1) + '#'.repeat(f.length) + s.slice(at + 1 + f.length); }
      at = s.indexOf(' ' + f + ' ', at + 1);
    }
  }
  for (const [h, ns] of Object.entries(heads)) {
    let at = s.indexOf(' ' + h + ' ');
    if (at < 0) continue;
    const ok = ns.filter(n => !LIB[n].ban && LIB[n].t !== 'Legend');
    const pick = ok.length === 1 ? ok[0] : (ns.filter(n => LIB[n].t !== 'Legend').length === 1 ? ns.filter(n => LIB[n].t !== 'Legend')[0] : (ok.find(n => LIB[n].sim === 'full') || ok[0] || ns[0]));
    while (at >= 0) { hits.push({name: pick, at, ambiguous: ok.length > 1 ? ok : null}); s = s.slice(0, at + 1) + '#'.repeat(h.length) + s.slice(at + 1 + h.length); at = s.indexOf(' ' + h + ' '); }
  }
  if (!hits.length) {
    const words = s.trim().split(' '); let best = null;
    const lev = (a, b) => { const d = Array.from({length: a.length + 1}, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
      for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
    for (let n = 3; n >= 1; n--) for (let i = 0; i + n <= words.length; i++) {
      const w = words.slice(i, i + n).join(' '); if (w.length < 5 || w.split(' ').every(x => VOCAB.has(x))) continue;
      for (const [f, name] of full) { if (Math.abs(f.length - w.length) > 2 || f.endsWith('s') && full.some(x => x[0] + 's' === f)) continue;
        const d = lev(w, f); const lim = f.length >= 12 ? 2 : 1; if (d <= lim && (!best || d < best.d)) best = {d, name, w}; }
      for (const [h, ns] of Object.entries(heads)) { if (Math.abs(h.length - w.length) > 2 || ns.length !== 1) continue; const d = lev(w, h); const lim = h.length >= 12 ? 2 : 1; if (d <= lim && (!best || d < best.d)) best = {d, name: ns[0], w}; }
    }
    if (best) { const at = s.indexOf(' ' + best.w + ' '); hits.push({name: best.name, at, fuzzy: best.w}); s = s.slice(0, at + 1) + '#'.repeat(best.w.length) + s.slice(at + 1 + best.w.length); }
  }
  hits.sort((a, b) => a.at - b.at);
  hits.masked = s.replace(/#+/g, ' CARD ');
  return hits;
}

/* ---------- rules calculators ---------- */
function lethal(dmg, might) { return dmg >= 1 && dmg >= Math.max(might, 1) ? true : (might <= 0 && dmg >= 1); }
function unitMight(u, role) { return (u.a.might || 0) + (u.plus || 0) + (role === 'att' ? u.a.assault : 0) + (role === 'def' ? u.a.shield : 0); }
// assign damage: Tank first, Backline last, otherwise the assigning player picks the order that kills the most
function assign(total, units, role) {
  const order = units.map(u => ({u, hp: Math.max(unitMight(u, role), 0)})).sort((a, b) => (b.u.a.tank - a.u.a.tank) || (a.u.a.backline - b.u.a.backline) || (a.hp - b.hp));
  const dead = []; let left = total;
  // tanks must be assigned lethal first; then cheapest kills first; backline last
  for (const o of order) { const need = Math.max(o.hp, 1); if (left >= need) { dead.push(o.u.name); left -= need; } else { break; } }
  return {dead, left};
}
function combat(att, dfn) {
  const dmg = (us, role) => us.reduce((t, u) => t + (u.stun || u.a.noCombatDamage ? 0 : unitMight(u, role)), 0);
  const aT = dmg(att, 'att'), dT = dmg(dfn, 'def');
  const kd = assign(aT, dfn, 'def'), ka = assign(dT, att, 'att');
  const aLeft = att.length - ka.dead.length, dLeft = dfn.length - kd.dead.length;
  let result;
  if (dLeft === 0 && aLeft > 0) result = 'attacker wins and conquers';
  else if (dLeft > 0 && aLeft === 0) result = 'defender wins';
  else if (dLeft === 0 && aLeft === 0) result = 'every unit there dies: no one wins the combat, no one conquers, and the defender loses control of the empty battlefield at the next cleanup';
  else result = 'both sides survive: the attackers are recalled to base and the defender keeps the battlefield';
  return {attackTotal: aT, defendTotal: dT, attackersDie: ka.dead, defendersDie: kd.dead, result};
}

/* ---------- answer helpers ---------- */
const P = s => `<p>${s}</p>`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
const list = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const kwLine = a => {
  const k = [];
  if (a.tank) k.push('Tank'); if (a.backline) k.push('Backline'); if (a.shield) k.push(`Shield ${a.shield}`); if (a.assault) k.push(`Assault ${a.assault}`);
  if (a.deflect) k.push(a.deflect > 1 ? `Deflect ${a.deflect}` : 'Deflect'); if (a.ganking) k.push('Ganking'); if (a.accelerate) k.push('Accelerate');
  if (a.hidden) k.push('Hidden'); if (a.ambush) k.push('Ambush'); if (a.temporary) k.push('Temporary'); if (a.deploy) k.push('Deploy');
  return k;
};
function cardFacts(a) {
  const cost = a.type === 'Legend' || a.type === 'Battlefield' ? '' : ` It costs ${a.energy ?? 0} energy${a.power ? ` and ${a.power} power` : ''}.`;
  const might = a.might != null && a.type === 'Unit' ? ` It has ${a.might} Might.` : '';
  return `${esc(a.name)} is a ${a.token ? 'token ' : ''}${String(a.type || 'card').toLowerCase()}${a.colors.length ? ` (${a.colors.join('/')})` : ''}${a.rarity ? `, ${a.rarity}` : ''}${a.set && a.set !== 'Token' ? `, from ${a.set}` : ''}.${cost}${might}${a.banned ? ` <b>It is banned in Standard (${esc(a.banned)}).</b>` : ''}`;
}

/* ---------- intents ---------- */
function timing(a) {
  if (a.type === 'Legend' || a.type === 'Battlefield') return {when: 'n/a', text: `${esc(a.name)} isn't played from your hand.`};
  if (a.reaction) return {when: 'any', text: `Yes. ${esc(a.name)} has ${a.quickdraw ? 'Quick-Draw, which gives it ' : ''}Reaction: you can play it at any time you have priority, on either player's turn, during showdowns and combat, and even in response to a spell or ability before it resolves.`};
  if (a.action) return {when: 'showdown', text: `Only in a showdown or combat. ${esc(a.name)} has Action: on your own turn you can play it in your Main Phase or during a showdown or combat; on your opponent's turn only during a showdown or combat. It can't be played in response to another spell (that needs Reaction).`};
  if (a.ambush) return {when: 'ambush', text: `Yes, with Ambush: you may play ${esc(a.name)} as a Reaction, but only to a battlefield where you already have units (for example as a surprise defender).`};
  if (a.hidden) return {when: 'hidden', text: `Only if you hide it first. ${esc(a.name)} has Hidden: on your turn pay [Rainbow] to put it face down at a battlefield you control; from your next turn on it has Reaction and can be played from there for 0 energy (at that battlefield). Played from your hand normally, it's main-phase only.`};
  return {when: 'main', text: `No. ${esc(a.name)} has no Action or Reaction, so you can only play it in your own Main Phase when nothing else is happening (no showdown, combat or chain).`};
}
function targeting(a, by) {
  if (a.type !== 'Unit' && a.type !== 'Gear') return {can: 'n/a', text: `${esc(a.name)} isn't a unit or gear, so spells and abilities can't target it.`};
  if (a.untargetable === 'always') return {can: 'no', text: `No. ${esc(a.name)} says it can't be chosen by enemy spells and abilities, so your opponent can't target it at all (it can still be hit by effects that don't choose, like "all units" damage, and it fights normally in combat).`};
  if (a.untargetable) return {can: 'conditional', text: `Only sometimes: "${esc(a.untargetable)}"`};
  if (a.deflect) return {can: 'pay', cost: a.deflect, text: `Yes, but it costs more: ${esc(a.name)} has Deflect${a.deflect > 1 ? ' ' + a.deflect : ''}, so an opponent must pay ${a.deflect} extra power of any color${a.deflect > 1 ? '' : ' ([Rainbow])'} for each spell or ability that chooses it. Your own spells don't pay that.`};
  return {can: 'yes', text: `Yes. ${esc(a.name)} has no Deflect or protection, so any spell or ability that can choose a unit${a.type === 'Gear' ? ' or gear' : ''} can choose it.`};
}
function deathAns(a) {
  if (a.token) return {dk: a.deathknell || '', text: `${esc(a.name)} is a token, so it doesn't go to the trash: it simply stops existing.${a.deathknell ? ` First its Deathknell happens: "${esc(a.deathknell)}"` : ''}`};
  if (a.deathknell) return {dk: a.deathknell, text: `It goes to its owner's trash, and its Deathknell triggers: "${esc(a.deathknell)}" (a Deathknell happens when it dies, wherever it was; banishing it or returning it to hand is not dying, so no Deathknell then). Any Equipment on it stays on the board unattached and goes back to your base at the next cleanup.`};
  return {dk: '', text: `It goes to its owner's trash. ${esc(a.name)} has no Deathknell, so nothing else happens from its own text. Any Equipment on it stays on the board unattached and goes back to your base at the next cleanup.`};
}
function readyAns(a) {
  if (a.type !== 'Unit') return {ready: 'n/a', text: `${esc(a.name)} isn't a unit.`};
  if (a.readyAlways) return {ready: 'yes', text: `Yes. ${esc(a.name)} enters ready, so you can move it to attack the same turn.`};
  if (a.accelerate) { const m = a.text.match(/You may pay ((?:\[[^\]]+\])+) as an additional cost to have me enter ready/); return {ready: 'accelerate', text: `Yes, if you pay for Accelerate: as you play ${esc(a.name)} you may pay ${m ? m[1] : '[1] and one power of its color'} extra to have it enter ready. Otherwise it enters exhausted.`}; }
  if (a.readyCond) return {ready: 'conditional', text: `Only sometimes: "${esc(a.readyCond)}" Otherwise it enters exhausted and must wait until your next turn.`};
  return {ready: 'no', text: `No. Units enter play exhausted, so ${esc(a.name)} can't move (or attack) until it readies at the start of your next turn, unless another card readies it (like Ride the Wind or First Mate).`};
}
function removalAns(sp, t, ctx) {
  const e = sp.effect; if (!e) return null;
  const res = {spell: sp.name, target: t.name};
  const prot = targeting(t);
  const lines = [];
  if (t.type !== 'Unit') return {kills: 'n/a', text: `${esc(sp.name)} affects units; ${esc(t.name)} is a ${t.type.toLowerCase()}.`};
  if (e.who === 'friendly' && ctx.enemy) return {kills: 'no', text: `${esc(sp.name)} can only choose a friendly unit, so it can't hit an enemy ${esc(t.name)}.`};
  if (prot.can === 'conditional' && /unless I'm in combat/.test(t.untargetable) && !ctx.inCombat && e.kind !== 'damage_all' && ctx.enemy !== false)
    return {kills: 'no', reason: 'untargetable', text: P(`No, not outside combat: "${esc(t.untargetable)}" So ${esc(sp.name)} can only choose ${esc(t.name)} while it is in a combat (during the showdown before damage).`)};
  if (prot.can === 'no' && e.kind !== 'damage_all' && ctx.enemy !== false) { return {kills: 'no', reason: 'untargetable', text: `No. ${esc(t.name)} can't be chosen by enemy spells and abilities, so ${esc(sp.name)} can't target it.`}; }
  const might = (t.might || 0) + (ctx.plus || 0);
  if (e.kind === 'damage' || e.kind === 'damage_all') {
    let n = e.n; const notes = [];
    if (ctx.bonus) { n += ctx.bonus; notes.push(`+${ctx.bonus} Bonus Damage`); }
    const dies = n >= Math.max(might, 1);
    res.kills = dies ? 'yes' : 'no'; res.damage = n; res.might = might;
    lines.push(`${esc(sp.name)} deals ${n} to ${esc(t.name)}${notes.length ? ' (' + notes.join(', ') + ')' : ''}, which has ${might} Might. ${dies ? `That's lethal (at least its Might), so it dies at the next cleanup.` : `That isn't lethal (it needs ${might}), so it survives, and the damage heals at the end of the turn.`}`);
    lines.push(`Shield only adds Might while a unit is defending in combat, so outside combat it doesn't help against spell damage${t.shield ? ` (in combat, ${esc(t.name)} as a defender would have ${might + t.shield} Might)` : ''}.`);
  } else if (e.kind === 'kill') {
    const ok = e.max == null || might <= e.max; res.kills = ok ? 'yes' : 'no';
    lines.push(ok ? `Yes: ${esc(sp.name)} kills it${e.max != null ? ` (${esc(t.name)} has ${might} Might, at most ${e.max})` : ''}. Killing isn't damage, so Shield and damage prevention don't stop it.` : `No: ${esc(sp.name)} can only kill a unit with ${e.max} Might or less, and ${esc(t.name)} has ${might}.`);
  } else if (e.kind === 'bounce') {
    const ok = e.max == null || might <= e.max; res.kills = ok ? 'bounce' : 'no';
    lines.push(ok ? `${esc(sp.name)} returns ${esc(t.name)} to its owner's hand. That's not dying, so no Deathknell triggers, and buffs, damage and attached Equipment fall off (the Equipment stays on the board).${t.token ? ' It is a token, so it simply stops existing.' : ''}` : `No: ${esc(sp.name)} only returns a unit with ${e.max} Might or less, and ${esc(t.name)} has ${might}.`);
  } else if (e.kind === 'banish_or_bounce') {
    const ok = might <= e.max; res.kills = ok ? 'banish' : 'bounce';
    lines.push(ok ? `${esc(t.name)} has ${might} Might (${e.max} or less), so ${esc(sp.name)} banishes it. Banishing isn't dying: no Deathknell, and it doesn't go to the trash.` : `${esc(t.name)} has ${might} Might (more than ${e.max}), so ${esc(sp.name)} returns it to its owner's hand instead. Damage, buffs and attached Equipment fall off.`);
  } else if (e.kind === 'stun') { res.kills = 'no'; lines.push(`${esc(sp.name)} stuns ${esc(t.name)}: it doesn't die, but it deals no combat damage this turn.`); }
  else if (e.kind === 'banish') { const ok = e.max == null || might <= e.max; res.kills = ok ? 'banish' : 'no';
    lines.push(ok ? `${esc(sp.name)} banishes ${esc(t.name)}${e.max != null ? ` (it has ${might} Might, at most ${e.max})` : ''}. That isn't a kill: no Deathknell triggers and it doesn't go to the trash.` : `No: ${esc(sp.name)} can only banish a unit with ${e.max} Might or less, and ${esc(t.name)} has ${might}.`); }
  else if (e.kind === 'pump') { res.kills = 'no'; lines.push(`${esc(sp.name)} gives ${esc(t.name)} ${e.n > 0 ? '+' : ''}${e.n} Might this turn (${might} → ${Math.max(0, might + e.n)}).`); }
  if (e.needFriendly) lines.push(`You also have to return one of your own units with it.`);
  if (e.where === 'battlefield') lines.push(`It can only choose a unit at a battlefield, not one in a base.`);
  if (e.where === 'base') lines.push(`It can only choose a unit in a base.`);
  if (prot.can === 'pay' && ctx.enemy !== false) { lines.push(`${esc(t.name)} has Deflect, so you must pay ${prot.cost} extra power of any color to choose it.`); res.deflect = prot.cost; }
  if (t.untargetable && t.untargetable !== 'always') lines.push(`Check: "${esc(t.untargetable)}"`);
  if (res.kills === 'yes' && t.deathknell) lines.push(`When it dies its Deathknell triggers: "${esc(t.deathknell)}"`);
  res.text = lines.map(P).join(''); return res;
}

/* ---------- scenario parsers ---------- */
function sides(q, hits) {
  // units before the attack verb attack; after it, defend. "my"/"their" also mark sides.
  const nq = ' ' + clean(q) + ' ';
  let verb = nq.search(/ (attacks?|attacking|attacked|fights?|fighting|into|vs|versus|against) /); let flip = false;
  const dv = nq.search(/ (defends?|defending|blocks?|blocking) /);
  if (dv >= 0 && (verb < 0 || dv < verb)) { verb = dv; flip = true; }
  const att = [], dfn = [];
  for (const h of hits) ((verb >= 0 && h.at < verb) !== flip ? att : dfn).push(h);
  return {att, dfn, verb};
}
function mods(q, hits, LIB) {
  // per-unit modifiers: "stunned X", "X with Punch First", "+3 X", "buffed X", "empowered X"
  const nq = ' ' + clean(q) + ' '; const out = {};
  for (const h of hits) {
    const before = nq.slice(Math.max(0, h.at - 24), h.at + 1), after = nq.slice(h.at, h.at + 80).replace(/^ #+/, ' ');
    const o = {plus: 0, stun: false, notes: []};
    if (/stunned $/.test(before) || / stunned /.test(after.split(/ (and|attacks?|vs|into|against) /)[0])) o.stun = true;
    if (/buffed $/.test(before)) { o.plus += 1; o.notes.push('buff +1'); }
    const pm = before.match(/(\d+) might $/) || before.match(/plus (\d+) $/);
    if (pm) { o.plus += +pm[1]; o.notes.push('+' + pm[1]); }
    if (!out[h.name]) out[h.name] = o; else { out[h.name].plus += o.plus; out[h.name].stun = out[h.name].stun || o.stun; out[h.name].notes.push(...o.notes); }
  }
  // pump spells "Punch First on X"
  for (const h of hits) {
    const a = analyse(h.name, LIB[h.name]);
    if (!a || a.type !== 'Spell' || !a.effect || a.effect.kind !== 'pump') continue;
    const tgt = hits.find(u => u.at > h.at && LIB[u.name].t === 'Unit');
    if (tgt && out[tgt.name]) { out[tgt.name].plus += a.effect.n; out[tgt.name].notes.push(`${h.name} ${a.effect.n > 0 ? '+' : ''}${a.effect.n}`); h.used = true; }
  }
  return out;
}

/* ---------- main ---------- */
const SLANG = [[/\bdose\b/g, 'does'], [/\bwat\b|\bwut\b/g, 'what'], [/\bu\b/g, 'you'], [/\bur\b/g, 'your'], [/\bdmg\b/g, 'damage'], [/\batk\b/g, 'attack'], [/\bopp\b|\boppo\b/g, 'opponent'],
  [/\bwhats\b/g, 'what is'], [/\bthier\b/g, 'their'], [/\bteh\b/g, 'the'], [/\bcan i\b/g, 'can i'], [/\bkils\b/g, 'kills'], [/\bdeos\b/g, 'does'], [/\bplz\b/g, 'please']];
function judge(q, ctx) {
  for (const [re, to] of SLANG) q = String(q).replace(re, to);
  const LIB = ctx.LIB;
  const found = findCards(q, LIB); const hits = found.filter(h => LIB[h.name]);
  const nq = ' ' + (found.masked || clean(q)).replace(/\s+/g, ' ').trim() + ' ';   // card names masked, so "Killer" or "Bomb" don't look like intent words
  const cards = hits.map(h => analyse(h.name, LIB[h.name]));
  const seen = new Set(); const units = hits.filter(h => LIB[h.name].t === 'Unit' && !seen.has(h.name) && seen.add(h.name));
  const has = re => re.test(nq);
  const out = (kind, text, facts) => ({kind, text, facts: facts || {}, cards: [...new Set(hits.map(h => h.name))]});
  const amb = hits.find(h => h.ambiguous); const fz = hits.find(h => h.fuzzy);
  const ambNote = (fz ? P(`I read "${esc(fz.fuzzy)}" as ${esc(fz.name)}.`) : '') + (amb ? P(`"${esc(amb.name.split(',')[0])}" matches more than one card (${amb.ambiguous.map(esc).join('; ')}); I used ${esc(amb.name)}. Use the full name for another one.`) : '');

  // final point / scoring scenarios
  const pts = nq.match(/ (?:at|have|on|with) (\d+) (?:points?|pts)/) || nq.match(/ (\d+) points? /);
  if (pts && has(/ (conquer|conquers|conquered|hold|holds|holding|win|score|scores|scoring|point) /) && !units.length) {
    const p = +pts[1], target = has(/ 2v2 | two vs two | 11 points/) ? 11 : 8;
    if (p >= target - 1) {
      const allScored = has(/ (every|all|both) (other )?battlefields? (scored|already|too)|scored (every|all|both)|already scored (the other|every|all|both)/);
      const notAll = has(/ (haven't|havent|have not|hasn't|hasnt|didn't|didnt|did not|not|not yet) (scored|score)|(only|just) (scored|score|conquered|conquer) (one|1|this)|other (one|battlefield) (isn't|isnt|is not|wasn't|wasnt) (scored|done)/);
      if (has(/ hold| holds| holding/) && !has(/ conquer/)) return out('finalpoint', P(`Yes. A hold always scores, even the final point: at the start of your turn you score each battlefield you control, and reaching ${target} points wins at the next cleanup.`), {final: 'hold-wins'});
      if (has(/ conquer/)) {
        if (allScored && !notAll) return out('finalpoint', P(`Yes. You're at ${p} and you've scored every battlefield this turn, so this conquer gives you the final point and you win.`), {final: 'conquer-wins'});
        return out('finalpoint', P(`Not with that conquer${notAll ? '' : ', unless you have already scored every other battlefield this turn'}. The final point from a conquer only counts if you've scored every battlefield this turn; otherwise you draw a card instead of scoring. A hold (at the start of your turn) always scores, so if you keep that battlefield you win then.`), {final: notAll ? 'conquer-draws' : 'conquer-depends'});
      }
    }
  }
  // burn out
  if (has(/ (deck is empty|empty deck|no cards left|out of cards|run out of cards|runs out of cards|deck runs out|burn out|burnout|deck out|decked)/)) {
    return out('burnout', P(`That's a burn out. When you have to draw (or burn, or otherwise take cards) from an empty Main Deck, shuffle your trash into a new Main Deck, then your opponent gains 1 point, and then you finish drawing. If your trash is empty too, you still burn out. The point your opponent gains can win them the game. Looking at or predicting cards never burns you out.`), {burnout: true});
  }

  // combat
  if (units.length >= 2 && has(/ (attack|attacks|attacking|attacked|fight|fights|fighting|vs|versus|into|blocks?|defends?|defending|combat) /)) {
    const {att, dfn} = sides(q, units); const md = mods(q, hits, LIB);
    if (att.length && dfn.length) {
      const mk = h => ({name: h.name, a: analyse(h.name, LIB[h.name]), plus: md[h.name] ? md[h.name].plus : 0, stun: md[h.name] ? md[h.name].stun : false, notes: md[h.name] ? md[h.name].notes : []});
      const A = att.map(mk), D = dfn.map(mk);
      for (const side of [A, D]) for (const src of side) if (src.a.aura) for (const u of side) if (u !== src) { u.plus += src.a.aura; u.notes.push(`+${src.a.aura} from ${src.name}`); }
      const r = combat(A, D);
      const line = (u, role) => `${esc(u.name)} ${unitMight(u, role)} Might (${u.a.might || 0} base${role === 'att' && u.a.assault ? `, +${u.a.assault} Assault` : ''}${role === 'def' && u.a.shield ? `, +${u.a.shield} Shield` : ''}${u.plus ? `, ${u.notes.join(', ')}` : ''}${u.stun ? ', stunned: deals no damage' : ''}${u.a.tank ? ', Tank' : ''}${u.a.backline ? ', Backline' : ''}${u.a.noCombatDamage ? ', deals no combat damage' : ''})`;
      let t = P(`<b>Attackers:</b> ${A.map(u => line(u, 'att')).join('; ')}. Total damage ${r.attackTotal}.`) + P(`<b>Defenders:</b> ${D.map(u => line(u, 'def')).join('; ')}. Total damage ${r.defendTotal}.`);
      t += P(`Both sides deal their damage at the same time. Each side assigns its total to the other side's units: Tank units must be given lethal damage first, Backline units last, and a unit must get lethal damage before the next one gets any. A unit dies if it gets damage at least equal to its Might (Assault counts while attacking, Shield while defending).`);
      t += P(`<b>Result:</b> ${r.defendersDie.length ? esc(list(r.defendersDie)) + ' die' + (r.defendersDie.length === 1 ? 's' : '') : 'no defender dies'}; ${r.attackersDie.length ? esc(list(r.attackersDie)) + ' die' + (r.attackersDie.length === 1 ? 's' : '') : 'no attacker dies'}. ${r.result[0].toUpperCase() + r.result.slice(1)}${r.result.startsWith('attacker wins') ? ' (worth 1 point if they haven\'t scored that battlefield this turn)' : ''}. Damage on survivors heals right after combat.`);
      const trig = [];
      for (const u of A) { if (u.a.onAttack) trig.push(`${esc(u.name)}: "${esc(u.a.onAttack)}"`); }
      for (const u of D) { if (u.a.onDefend) trig.push(`${esc(u.name)}: "${esc(u.a.onDefend)}"`); }
      for (const u of [...A, ...D]) { if ([...r.attackersDie, ...r.defendersDie].includes(u.name) && u.a.deathknell) trig.push(`${esc(u.name)} dies → Deathknell: "${esc(u.a.deathknell)}"`); }
      if (r.result.startsWith('attacker wins')) for (const u of A) { if (!r.attackersDie.includes(u.name) && u.a.onConquer) trig.push(`${esc(u.name)} conquers: "${esc(u.a.onConquer)}"`); }
      if (trig.length) t += P(`<b>Triggers to remember</b> (they happen before damage, and can change the result): ${trig.join(' · ')}`);
      t += P(`Before damage there's a showdown: both players can still play Action and Reaction cards (pumps, stuns, removal), which would change these numbers.`);
      return out('combat', ambNote + t, {attackersDie: r.attackersDie, defendersDie: r.defendersDie, result: r.result, attackTotal: r.attackTotal, defendTotal: r.defendTotal});
    }
  }

  // a spell or ability used on a unit
  const spells = hits.filter(h => { const a = analyse(h.name, LIB[h.name]); return a && a.effect && a.type !== 'Unit' && !h.used; });
  if (spells.length && units.length && has(/ (on|at|hit|hits|target|targets|targeting|use|used|cast|play|kill|kills|die|dies|survive|survives|work|works|vs|against) /)) {
    const sp = analyse(spells[0].name, LIB[spells[0].name]); const tg = units.find(u => u.at > spells[0].at) || units[0];
    const t = analyse(tg.name, LIB[tg.name]);
    const md = mods(q, hits, LIB); const bonus = (has(/ short fused /) ? 1 : 0);
    const r = removalAns(sp, t, {inCombat: has(/ (in combat|during combat|while (it|its|she|he) (is )?(attacking|defending)|attacking|defending) /), enemy: !has(/ my own | my | friendly /) || has(/ their | enemy | opponent/), plus: md[tg.name] ? md[tg.name].plus : 0, bonus: /deal/i.test(sp.effect.text) && sp.type === 'Gear' ? bonus : 0});
    if (r) return out('removal', ambNote + r.text, {kills: r.kills, damage: r.damage, might: r.might, deflect: r.deflect || 0});
  }

  const one = cards[0];
  if (one) {
    if (has(/ (opponents? turn|their turn|other players? turn|in response|respond|during (combat|a showdown|showdown|their|an attack|the attack|their attack)|instant|at instant speed|as a reaction|reaction|react|when can i (play|cast)|can i (play|cast) .* (now|anytime|any time))/))
      { const r = timing(one); return out('timing', ambNote + P(r.text), {when: r.when}); }
    if (has(/ (target|targeted|targetable|choose|chosen|aim)/)) { const r = targeting(one); return out('target', ambNote + P(r.text), {can: r.can, cost: r.cost || 0}); }
    if (has(/ (attack (the|on the) (same )?turn|same turn|right away|immediately|enter ready|enters ready|summoning sick|haste|attack (right|straight) away)/)) { const r = readyAns(one); return out('ready', ambNote + P(r.text), {ready: r.ready}); }
    if (has(/ (dies|die|died|killed|kill|destroyed|goes to the trash|blows up|blow up|explode|explodes)/) && one.type !== 'Spell') { const r = deathAns(one); return out('death', ambNote + P(r.text), {dk: r.dk}); }
    if (has(/ (conquers?|conquering)/) && one.type === 'Unit') return out('conquer', ambNote + P(one.onConquer ? `When ${esc(one.name)} conquers: "${esc(one.onConquer)}" Conquering also scores you 1 point if you haven't scored that battlefield this turn.` : `${esc(one.name)} has no conquer ability of its own; conquering still scores 1 point if you haven't scored that battlefield this turn.`), {conquer: one.onConquer});
    if (has(/ (holds?|holding)/) && one.type === 'Unit') return out('hold', ambNote + P(one.onHold ? `When ${esc(one.name)} holds (at the start of your turn, if you still control its battlefield): "${esc(one.onHold)}"` : `${esc(one.name)} has no hold ability of its own; holding still scores 1 point.`), {hold: one.onHold});
    if (has(/ (attacks|when (it|she|he) attacks|on attack)/) && one.type === 'Unit') return out('attack', ambNote + P(one.onAttack ? `When ${esc(one.name)} attacks: "${esc(one.onAttack)}"` : `${esc(one.name)} has no "when I attack" ability.`), {attack: one.onAttack});
    // card facts
    const fact = has(/ (colou?rs?|domains?|rune) /) ? 'color' : has(/ (cost|costs|energy|power|mana|how much)/) ? 'cost' : has(/ (might|power level|strength|how big|how strong|stats?)/) ? 'might' : has(/ (rarity|rare|common|uncommon|epic)/) ? 'rarity' : has(/ (banned|legal|ban)/) ? 'banned' : has(/ (what set|which set|set is|expansion)/) ? 'set' : has(/ (type|kind of card|is it a (unit|spell|gear))/) ? 'type' : 'text';
    const keyAsk = KW.find(k => has(new RegExp(' (have|has|got|with) ' + k.replace('-', ' ?') + ' ')));
    if (keyAsk && fact === 'text') {
      const kl = kwLine(one).map(x => x.toLowerCase());
      const yes = kl.some(x => x.startsWith(keyAsk)); const some = !yes && new RegExp('\\[' + keyAsk + '(?: \\d+)?\\]', 'i').test(one.plain);
      return out('keyword', ambNote + P(yes ? `Yes: ${esc(one.name)} has ${keyAsk}.` : some ? `Not always: ${esc(one.name)} only gets ${keyAsk} under the condition in its text (or gives it to other units).` : `No: ${esc(one.name)} doesn't have ${keyAsk}.`) + P('Card text: ' + esc(one.text)), {has: yes, sometimes: some, keyword: keyAsk});
    }
    let t = P(cardFacts(one));
    if (one.text) t += P('Card text: ' + esc(one.text));
    const k = kwLine(one); if (k.length) t += P('Keywords: ' + k.join(', ') + '.');
    for (const c of cards.slice(1, 3)) t += P(cardFacts(c)) + (c.text ? P('Card text: ' + esc(c.text)) : '');
    return out('card', ambNote + t, {fact, color: one.colors, energy: one.energy, power: one.power, might: one.might, type: one.type, rarity: one.rarity, banned: !!one.banned, set: one.set});
  }
  return out('none', '', {});
}
const STOP = new Set('the a an and or of to in on at is it if i my me you your do does did can what how when why which who with for from this that be are was were will would should could have has had not no yes any all some get got about into out up down over just than then there their they them as by so its our we us work works mean means happen happens explain riftbound'.split(' '));
function faqRank(q, FAQ) {
  const nq = ' ' + clean(q).replace(/-/g, ' ') + ' ';
  const stem = w => w.replace(/(ies)$/, 'y').replace(/(ing|ed)$/, '').replace(/([^s])s$/, '$1');
  const qst = new Set(nq.trim().split(' ').filter(w => w.length > 2 && !STOP.has(w)).map(stem));
  const hit = kk => nq.includes(' ' + kk + ' ') || (kk.length > 4 && nq.includes(' ' + kk));
  const longer = []; for (const f of FAQ || []) for (const k of f.k) { const kk = clean(k); if (kk.includes(' ') && hit(kk)) longer.push(kk); }
  const inside = kk => !kk.includes(' ') && longer.some(L => L !== kk && (' ' + L + ' ').includes(' ' + kk + ' '));
  return (FAQ || []).map(f => { let sc = 0; for (const k of f.k) { const kk = clean(k); if (hit(kk) && !inside(kk)) sc += 1 + kk.split(' ').length + (f.k.length <= 3 ? 1.5 : 0) + (KW.includes(kk) ? 2 : 0); }
    if (sc > 0) for (const w of new Set(clean(f.t).split(' ').filter(x => x.length > 2 && !STOP.has(x)).map(stem))) if (qst.has(w)) sc += 2;
    return [sc, f]; }).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]);
}
// what the app shows: the worked-out ruling first, unless a plain-English FAQ answer fits the question better
function present(q, ctx) {
  const j = judge(q, ctx); const ranked = faqRank(q, ctx.FAQ);
  let faq = ranked.length ? ranked[0][1] : null; const score = ranked.length ? ranked[0][0] : 0;
  const tok = j.cards.map(n => ctx.LIB[n]).find(c => c && c.token);
  if (tok) { const f = (ctx.FAQ || []).find(x => x.t.toLowerCase().includes(j.cards.find(n => ctx.LIB[n] === tok).toLowerCase())); if (f) faq = f; }
  let main = 'judge';
  if (j.kind === 'none') main = faq ? 'faq' : 'none';
  else if (tok && faq && !['combat', 'removal'].includes(j.kind)) main = 'faq';
  else if ((j.kind === 'card' || j.kind === 'death') && j.cards.length) { const f = (ctx.FAQ || []).find(x => j.cards.some(n => x.t.toLowerCase().includes(n.split(',')[0].toLowerCase()))); if (f) { faq = f; main = 'faq'; } }
  else if (j.kind === 'card' && j.facts.fact === 'text' && faq && score >= 6 && !j.cards.some(n => q.toLowerCase().includes(n.toLowerCase().split(',')[0]))) main = 'faq';
  return {main, judge: j, faq, faq2: ranked.length > 1 && ranked[1][0] >= 3 ? ranked[1][1] : null};
}
const api = {judge, analyse, findCards, combat, timing, targeting, faqRank, present};
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.RJudge = api;
})(typeof window !== 'undefined' ? window : this);
