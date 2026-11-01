// Collects every spec in specs/ into docs/cast.json, after checking each one.
// Run from the repo root:  node tools/build.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

export const OPTIONS = {
  ears:    ['none', 'wolf', 'elf', 'bunny'],
  hat:     ['none', 'wizard', 'horn', 'sprout', 'shell', 'flowers', 'halo'],
  mane:    ['none', 'rainbow', 'moonlight'],
  eyes:    ['dots', 'happy', 'sleepy', 'wink', 'sparkle', 'heart'],
  mouth:   ['smile', 'cat', 'open', 'o', 'fangs'],
  prop:    ['none', 'wand', 'book', 'scroll', 'orb', 'crystal', 'pearl', 'moon', 'plant', 'heart'],
  pattern: ['none', 'stars', 'moons', 'hearts', 'dots'],
  wings:   ['none', 'angel', 'fairy'],
  badge:   ['none', 'star', 'moon', 'heart', 'paw'],
  mark:    ['none', 'sparkles', 'hearts', 'stars', 'zzz', 'music', 'bubbles'],
};
const DEFAULTS = { theme: 'magic', hood: '#b9a3dd', accent: '#8a73c6', ears: 'none', hat: 'none', mane: 'none', eyes: 'dots', mouth: 'smile', prop: 'none', pattern: 'none', wings: 'none', badge: 'none', mark: 'none' };
const HEX = /^#[0-9a-f]{6}$/i;

function check(spec, file) {
  const problems = [];
  if (typeof spec.name !== 'string' || !/^[\p{L}\p{N} '-]{1,16}$/u.test(spec.name)) problems.push('name: 1 to 16 letters, numbers, spaces, - or \'');
  if (spec.theme !== undefined && !/^[a-z-]{1,16}$/.test(spec.theme)) problems.push('theme: a short lowercase word');
  for (const k of ['hood', 'accent']) if (spec[k] !== undefined && !HEX.test(spec[k])) problems.push(`${k}: a colour like #b9a3dd`);
  for (const [k, vals] of Object.entries(OPTIONS)) if (spec[k] !== undefined && !vals.includes(spec[k])) problems.push(`${k}: one of ${vals.join(' ')}`);
  const known = new Set(['name', 'theme', 'hood', 'accent', 'order', ...Object.keys(OPTIONS)]);
  for (const k of Object.keys(spec)) if (!known.has(k)) problems.push(`${k}: not a spec field`);
  if (problems.length) { console.error(`✗ ${file}\n  ${problems.join('\n  ')}`); return false; }
  return true;
}

const files = readdirSync('specs').filter((f) => f.endsWith('.json')).sort();
let ok = true;
const friends = [];
for (const f of files) {
  let spec;
  try { spec = JSON.parse(readFileSync(`specs/${f}`, 'utf8')); } catch (e) { console.error(`✗ ${f}: not valid JSON (${e.message})`); ok = false; continue; }
  if (!check(spec, f)) { ok = false; continue; }
  friends.push({ ...DEFAULTS, ...spec });
}
if (!ok) { console.error('\nNothing written. Fix the problems above and run again.'); process.exit(1); }
friends.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
writeFileSync('docs/cast.json', JSON.stringify({ updated: new Date().toISOString(), friends: friends.map(({ order, ...f }) => f) }, null, 1) + '\n');
console.log(`✓ ${friends.length} friends written to docs/cast.json`);
