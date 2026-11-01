// Checks every spec and writes docs/cast.json.
//   specs/<name>.json            → series "studio"
//   specs/<series>/<name>.json   → that series (for example specs/luna-crown/selene.json)
// Run from the repo root:  node tools/build.mjs
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';

await import('../docs/renderer.js'); // one source of truth for allowed values
const { OPTIONS, DEFAULTS } = globalThis.Doodle;
const HEX = /^#[0-9a-f]{6}$/i;
const WORD = /^[a-z][a-z-]{0,23}$/;
const TEXT = ['name', 'theme', 'role', 'group', 'order', 'hood', 'accent', 'capeColor'];

function check(spec, file) {
  const problems = [];
  if (typeof spec.name !== 'string' || !/^[\p{L}\p{N} '-]{1,16}$/u.test(spec.name)) problems.push("name: 1 to 16 letters, numbers, spaces, - or '");
  if (spec.role !== undefined && (typeof spec.role !== 'string' || spec.role.length > 40 || /[<>]/.test(spec.role))) problems.push('role: plain words, 40 characters at most');
  for (const k of ['theme', 'group']) if (spec[k] !== undefined && !WORD.test(spec[k])) problems.push(`${k}: a short lowercase word`);
  if (spec.order !== undefined && typeof spec.order !== 'number') problems.push('order: a number');
  for (const k of ['hood', 'accent', 'capeColor']) if (spec[k] !== undefined && !HEX.test(spec[k])) problems.push(`${k}: a colour like #b9a3dd`);
  for (const [k, vals] of Object.entries(OPTIONS)) if (spec[k] !== undefined && !vals.includes(spec[k])) problems.push(`${k}: one of ${vals.join(' ')}`);
  const known = new Set([...TEXT, ...Object.keys(OPTIONS)]);
  for (const k of Object.keys(spec)) if (!known.has(k)) problems.push(`${k}: not a spec field`);
  if (problems.length) { console.error(`✗ ${file}\n  ${problems.join('\n  ')}`); return false; }
  return true;
}

const files = [];
for (const entry of readdirSync('specs').sort()) {
  const path = `specs/${entry}`;
  if (statSync(path).isDirectory()) {
    if (!WORD.test(entry)) { console.error(`✗ ${path}: series folders use lowercase words`); process.exit(1); }
    for (const f of readdirSync(path).sort()) if (f.endsWith('.json')) files.push({ path: `${path}/${f}`, series: entry, id: f.slice(0, -5) });
  } else if (entry.endsWith('.json')) files.push({ path, series: 'studio', id: entry.slice(0, -5) });
}

let ok = true;
const friends = [];
const ids = new Set();
for (const { path, series, id } of files) {
  if (!/^[a-z0-9-]+$/.test(id)) { console.error(`✗ ${path}: file names use lowercase letters, numbers and -`); ok = false; continue; }
  if (ids.has(id)) { console.error(`✗ ${path}: another spec already uses the file name ${id}.json`); ok = false; continue; }
  ids.add(id);
  let spec;
  try { spec = JSON.parse(readFileSync(path, 'utf8')); } catch (e) { console.error(`✗ ${path}: not valid JSON (${e.message})`); ok = false; continue; }
  if (!check(spec, path)) { ok = false; continue; }
  friends.push({ id, series, ...DEFAULTS, ...spec });
}
if (!ok) { console.error('\nNothing written. Fix the problems above and run again.'); process.exit(1); }

friends.sort((a, b) => a.series.localeCompare(b.series) || (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
writeFileSync('docs/cast.json', JSON.stringify({ updated: new Date().toISOString(), friends: friends.map(({ order, ...f }) => f) }, null, 1) + '\n');
const count = friends.reduce((m, f) => ({ ...m, [f.series]: (m[f.series] || 0) + 1 }), {});
console.log(`✓ ${friends.length} friends written to docs/cast.json (${Object.entries(count).map(([k, v]) => `${k}: ${v}`).join(', ')})`);
