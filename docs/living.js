// Silver Moon Courtyard: a living, tappable scene from The Luna Crown.
(() => {
  const D = window.Doodle, INK = D.INK;
  const NS = 'http://www.w3.org/2000/svg';
  const world = document.getElementById('world');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  const r = D.rng('silver-moon');
  const W = 170, H = W * 204 / 200;

  // ---------- the courtyard ----------
  function background() {
    let s = `<defs>${D.DEFS}<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#231e44"/><stop offset=".55" stop-color="#4d4280"/><stop offset="1" stop-color="#8676b3"/></linearGradient>
      <radialGradient id="warm"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>`;
    s += '<rect width="1600" height="900" fill="url(#sky)"/>';
    let st = '';
    for (let i = 0; i < 95; i++) st += `<circle class="twinkle" style="animation-delay:${(-r() * 3).toFixed(2)}s" cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 430).toFixed(0)}" r="${(1 + r() * 2.2).toFixed(1)}" fill="#fff8e6"/>`;
    for (let i = 0; i < 9; i++) st += `<path class="twinkle" style="animation-delay:${(-r() * 3).toFixed(2)}s" d="${D.sparkle(r() * 1600, r() * 380, 6 + r() * 5)}" fill="#fff8e6"/>`;
    s += `<g>${st}</g>`;
    // moon
    s += `<g id="moon" class="tap" tabindex="0" role="button" aria-label="The moon">
      <circle id="moonGlow" class="glow-moon" cx="1320" cy="150" r="130" fill="#fbf2d5" opacity=".14"/>
      <circle cx="1320" cy="150" r="92" fill="#fbf2d5" opacity=".14"/>
      <circle cx="1320" cy="150" r="66" fill="#fbf2d5" stroke="${INK}" stroke-width="3"/>
      <circle cx="1298" cy="136" r="12" fill="#efe2bd"/><circle cx="1342" cy="170" r="8" fill="#efe2bd"/><circle cx="1336" cy="128" r="5" fill="#efe2bd"/></g>`;
    // hills + back forest
    s += `<path d="M0,480 Q300,390 620,455 T1240,435 T1600,455 V900 H0Z" fill="#3c3570" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 0; i < 18; i++) {
      const x = i * 95 + r() * 40 - 20; if (x > 520 && x < 1080) continue;
      const h = 110 + r() * 70, w = h * .45, b = 560;
      for (let t = 0; t < 3; t++) { const tw = w * (1 - t * .22), ty = b - h * t * .28; s += `<path d="M${x - tw / 2},${ty} L${x},${ty - h * .5} L${x + tw / 2},${ty}Z" fill="${t % 2 ? '#332d5d' : '#2c2750'}" stroke="#1f1b38" stroke-width="2.4" stroke-linejoin="round"/>`; }
    }
    // ground and courtyard
    s += `<rect x="0" y="560" width="1600" height="340" fill="#5f6e8c" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M640,684 H960 L1120,900 H480Z" fill="#a59dcc" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M300,640 Q800,600 1300,640 L1360,900 H240Z" fill="#8a82ba" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M640,684 H960 L1120,900 H480Z" fill="#a59dcc" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 0; i < 60; i++) { const y = 650 + r() * 240, x = 300 + r() * 1040; s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(10 + r() * 12).toFixed(0)}" ry="${(4 + r() * 4).toFixed(0)}" fill="none" stroke="#6f679f" stroke-width="2"/>`; }
    // pack hall
    s += `<rect x="570" y="340" width="460" height="292" fill="#e8dccb" stroke="${INK}" stroke-width="3"/>`;
    for (let y = 380; y < 630; y += 42) s += `<path d="M572,${y} H1028" stroke="#d6c4ac" stroke-width="2"/>`;
    s += `<path d="M538,352 L800,206 L1062,352Z" fill="#6f5f9e" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M538,352 H1062" stroke="${INK}" stroke-width="5"/>`;
    s += `<path d="${D.crescent(800, 292, 26)}" fill="#f6d36b" stroke="${INK}" stroke-width="2.4"/>`;
    for (const x of [640, 960]) s += `<circle cx="${x}" cy="440" r="60" fill="url(#warm)"/><path d="M${x - 26},475 V418 A26,26 0 0,1 ${x + 26},418 V475Z" fill="#ffe2a0" stroke="${INK}" stroke-width="3"/><path d="M${x},392 V475 M${x - 26},440 H${x + 26}" stroke="${INK}" stroke-width="2"/>`;
    for (const x of [598, 1002]) s += `<path d="M${x - 16},366 H${x + 16} V470 L${x},458 L${x - 16},470Z" fill="#b9a3dd" stroke="${INK}" stroke-width="2.6"/><path d="${D.crescent(x, 410, 9)}" fill="#f6d36b" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<path d="M715,632 V480 A85,85 0 0,1 885,480 V632Z" fill="#3a3260" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M768,630 V566 A32,32 0 0,1 832,566 V630Z" fill="#f2d27a" stroke="${INK}" stroke-width="2.6"/><path d="M780,630 V570 A20,20 0 0,1 820,570 V630Z" fill="#9a82cf" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="784" y="604" width="32" height="26" rx="3" fill="#cbbbe0" stroke="${INK}" stroke-width="2"/>`;
    s += `<g id="crown" class="tap" tabindex="0" role="button" aria-label="The Luna crown" style="transition:opacity .8s"><path d="M784,602 L783,584 L792,592 L800,578 L808,592 L817,584 L816,602Z" fill="#f6d36b" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="800" cy="590" r="2.6" fill="#f59ab5" stroke="${INK}" stroke-width="1"/></g>`;
    s += `<rect x="690" y="632" width="220" height="18" fill="#d9cfe6" stroke="${INK}" stroke-width="2.6"/><rect x="670" y="650" width="260" height="18" fill="#cfc4e0" stroke="${INK}" stroke-width="2.6"/><rect x="650" y="668" width="300" height="18" fill="#c5b9da" stroke="${INK}" stroke-width="2.6"/>`;
    // trees
    const tree = (x, top, bottom, id) => {
      let t = `<rect x="${x - 15}" y="${top + 60}" width="30" height="${bottom - top - 60}" fill="#6b5040" stroke="${INK}" stroke-width="3"/>`;
      t += `<g class="sway" style="animation-delay:${id ? '-1.3s' : '0s'}">`;
      for (const [dx, dy, rr] of [[-60, 40, 62], [55, 46, 58], [0, 0, 72], [-28, 78, 54], [36, 86, 52]]) t += `<circle cx="${x + dx}" cy="${top + dy}" r="${rr}" fill="#3f5d63" stroke="${INK}" stroke-width="3"/>`;
      for (let i = 0; i < 6; i++) t += `<path d="M${x - 60 + r() * 120},${top - 20 + r() * 110} q6,-6 12,0" fill="none" stroke="#5d8086" stroke-width="2.4" stroke-linecap="round"/>`;
      return t + '</g>';
    };
    s += tree(118, 380, 800, 0) + tree(1405, 400, 770, 1);
    // owl
    s += `<g id="owl" class="tap" tabindex="0" role="button" aria-label="The owl"><path d="M150,470 h70" stroke="#6b5040" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="186" cy="448" rx="18" ry="22" fill="#a08a7a" stroke="${INK}" stroke-width="2.4"/><path d="M170,432 l-2,-12 l10,8 M202,432 l2,-12 l-10,8" fill="#a08a7a" stroke="${INK}" stroke-width="2"/>
      <g id="owlEyes"><circle cx="179" cy="442" r="6" fill="#fff8ee" stroke="${INK}" stroke-width="1.6"/><circle cx="193" cy="442" r="6" fill="#fff8ee" stroke="${INK}" stroke-width="1.6"/><circle cx="179" cy="443" r="2.4" fill="${INK}"/><circle cx="193" cy="443" r="2.4" fill="${INK}"/></g>
      <path d="M184,450 l2,4 l2,-4Z" fill="#f2c25b" stroke="${INK}" stroke-width="1.2"/></g>`;
    // bench
    s += `<rect x="168" y="742" width="150" height="14" rx="4" fill="#a9805a" stroke="${INK}" stroke-width="2.6"/><rect x="176" y="712" width="134" height="12" rx="4" fill="#a9805a" stroke="${INK}" stroke-width="2.6"/><path d="M182,756 v26 M304,756 v26 M190,724 v18 M296,724 v18" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    // lanterns
    for (const [x, id] of [[470, 'lanternL'], [1130, 'lanternR']]) {
      s += `<path d="M${x},582 V790" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
      s += `<g id="${id}" class="tap lantern" tabindex="0" role="button" aria-label="A lantern"><circle class="lglow" cx="${x}" cy="562" r="58" fill="url(#warm)"/><path d="M${x - 16},546 h32 l-4,36 h-24Z" fill="#ffe2a0" stroke="${INK}" stroke-width="2.6"/><path d="M${x - 20},546 h40 l-8,-12 h-24Z" fill="#6f5f9e" stroke="${INK}" stroke-width="2.4"/></g>`;
    }
    // campfire
    s += `<ellipse cx="1560" cy="842" rx="46" ry="12" fill="#8a6a4a" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<g id="fire" class="tap" tabindex="0" role="button" aria-label="The campfire"><circle cx="1470" cy="820" r="80" fill="url(#warm)"/>
      <path d="M1436,850 L1504,830 M1436,830 L1504,850" stroke="#6b5040" stroke-width="10" stroke-linecap="round"/><path d="M1436,850 L1504,830 M1436,830 L1504,850" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".5"/>
      <path class="flicker" d="M1470,834 C1446,824 1450,800 1462,786 C1462,800 1470,800 1472,790 C1480,800 1494,812 1470,834Z" fill="#f6b35b" stroke="${INK}" stroke-width="2.4"/>
      <path class="flicker" style="animation-delay:-.25s" d="M1470,832 C1460,826 1462,812 1468,806 C1470,814 1476,816 1478,812 C1482,822 1478,830 1470,832Z" fill="#f6e08a"/></g>`;
    // grass tufts and flowers in front
    for (let i = 0; i < 26; i++) { const x = r() * 1600, y = 820 + r() * 70; if (x > 480 && x < 1120 && y < 900) continue; s += `<path d="M${x},${y} l-5,-12 M${x},${y} l0,-15 M${x},${y} l5,-12" stroke="#86a0a6" stroke-width="2.4" stroke-linecap="round"/>`; }
    for (let i = 0; i < 8; i++) { const x = 20 + r() * 260, y = 820 + r() * 60; s += `<circle cx="${x}" cy="${y}" r="5" fill="${['#f6b3cb', '#c9b6f2', '#fbe3a0'][i % 3]}" stroke="${INK}" stroke-width="1.4"/>`; }
    return s;
  }
  world.innerHTML = background() + '<g id="chars"></g><g id="fx"></g><g id="flies"></g><g id="bubbles"></g>';
  const $ = (id) => document.getElementById(id);
  let flies = '';
  for (let i = 0; i < 14; i++) flies += `<circle class="fly" style="animation-delay:${(-r() * 9).toFixed(1)}s;animation-duration:${(7 + r() * 5).toFixed(1)}s" cx="${(r() * 1600).toFixed(0)}" cy="${(480 + r() * 300).toFixed(0)}" r="3" fill="#fff1a8" opacity=".85"/>`;
  $('flies').innerHTML = flies;

  // ---------- the story ----------
  const CHAPTERS = [
    {
      title: 'An ordinary night',
      text: 'The Silver Moon pack gathers in the courtyard. Selene, the wolfless maid, sweeps while the omegas whisper and Seraphina eyes the crown on the throne.',
      crown: true, moon: false,
      intro: [['omega-pip', 700], ['omega-wren', 2100], ['seraphina', 3600]],
      cast: {
        selene: { x: 420, y: 790, mode: 'walk', range: [330, 580], o: { eyes: 'dots', mouth: 'smile' }, line: 'Just one more corner to sweep…' },
        'alpha-caelan': { x: 800, y: 640, line: 'Where is my fated mate?' },
        seraphina: { x: 1000, y: 712, mode: 'walk', range: [960, 1100], o: { prop: 'none' }, line: 'One day that crown will be mine.' },
        kieran: { x: 1310, y: 726, line: 'Everything is going to plan.' },
        lucian: { x: 1525, y: 838, line: '…the fire is warm tonight.' },
        'elder-maren': { x: 243, y: 760, o: { mark: 'zzz', brows: 'none' }, line: 'Zzz… back in my day…' },
        'omega-pip': { x: 650, y: 852, line: 'Did you hear the news?' },
        'omega-wren': { x: 760, y: 858, line: 'Tell me everything!' },
        'moon-goddess': { x: 1320, y: 330, hide: true },
        'selene-reborn': { x: 420, y: 790, hide: true },
      },
    },
    {
      title: 'The rejection',
      text: 'The Alpha finds his fated mate at last, and refuses her in front of the whole pack. Seraphina smiles. The omegas cannot stop talking.',
      crown: true, moon: false,
      intro: [['alpha-caelan', 600], ['selene', 2700], ['seraphina', 4500], ['omega-pip', 6000]],
      cast: {
        selene: { x: 520, y: 796, line: 'But the Moon chose us…' },
        'alpha-caelan': { x: 700, y: 786, line: 'A wolfless maid? I reject you.' },
        seraphina: { x: 905, y: 712, o: { prop: 'none' }, line: 'Poor little Selene.' },
        kieran: { x: 1010, y: 728, line: 'Perfect.' },
        lucian: { x: 1525, y: 838, line: 'The moon sees everything.' },
        'elder-maren': { x: 243, y: 760, o: { eyes: 'dots' }, line: 'Such a shame.' },
        'omega-pip': { x: 330, y: 856, line: 'Rejected! In front of everyone!' },
        'omega-wren': { x: 420, y: 866, o: { mouth: 'o' }, line: 'No way!' },
        'moon-goddess': { x: 1320, y: 330, hide: true },
        'selene-reborn': { x: 520, y: 796, hide: true },
      },
    },
    {
      title: 'The fake Luna',
      text: 'With Kieran’s help, Seraphina fakes her bloodline and takes the crown. The pack bows to her, and Selene is pushed to the edge of the courtyard.',
      crown: false, moon: false,
      intro: [['seraphina', 600], ['selene', 2500], ['lucian', 4300]],
      cast: {
        seraphina: { x: 800, y: 640, o: { prop: 'crown' }, line: 'Bow to your new Luna!' },
        'alpha-caelan': { x: 935, y: 664, o: { eyes: 'dots', brows: 'soft', mouth: 'smile' }, line: 'Seraphina… my true mate.' },
        kieran: { x: 668, y: 668, line: 'Long live Luna Seraphina.' },
        selene: { x: 150, y: 836, line: 'That crown was never hers.' },
        lucian: { x: 1380, y: 836, line: 'Patience. Your time will come.' },
        'elder-maren': { x: 243, y: 760, o: { eyes: 'side-eye' }, line: 'Hmm. Something smells wrong.' },
        'omega-pip': { x: 640, y: 846, mode: 'bow', line: 'Long live Luna Sera!' },
        'omega-wren': { x: 760, y: 856, mode: 'bow', line: 'She’s so pretty…' },
        'moon-goddess': { x: 1320, y: 330, hide: true },
        'selene-reborn': { x: 150, y: 836, hide: true },
      },
    },
    {
      title: 'Reborn',
      text: 'At midnight the Moon Goddess descends. Selene wakes with silver blood and her wolf at last. The crown finds its true Luna, and the whole pack bows.',
      crown: false, moon: true,
      intro: [['moon-goddess', 900], ['selene-reborn', 2700], ['alpha-caelan', 4500], ['seraphina', 6000]],
      cast: {
        'moon-goddess': { x: 410, y: 580, mode: 'float', line: 'Rise, Silver Blood.' },
        selene: { x: 410, y: 806, hide: true },
        'selene-reborn': { x: 410, y: 806, o: { prop: 'crown' }, line: 'I am the true Luna.' },
        lucian: { x: 290, y: 836, o: { eyes: 'happy' }, line: 'Together, my Luna.' },
        'alpha-caelan': { x: 630, y: 806, o: { brows: 'worried', mouth: 'open', eyes: 'dots' }, line: 'Selene… forgive me!' },
        seraphina: { x: 1160, y: 746, o: { prop: 'none', mouth: 'o', eyes: 'dots', brows: 'worried' }, line: 'No… this can’t be!' },
        kieran: { x: 1262, y: 736, o: { mouth: 'frown' }, line: 'Run, Sera!' },
        'elder-maren': { x: 150, y: 812, mode: 'bow', o: { eyes: 'happy' }, line: 'The prophecy is true!' },
        'omega-pip': { x: 790, y: 850, mode: 'bow', o: { eyes: 'sparkle' }, line: 'Bow to the true Luna!' },
        'omega-wren': { x: 895, y: 858, mode: 'bow', o: { eyes: 'heart' }, line: 'She’s glowing!' },
      },
    },
  ];

  // ---------- characters ----------
  const people = {};
  let chapter = 0;

  function placeTransform(p) { return `translate(${(p.x - W / 2).toFixed(1)}px, ${(p.y - H * 192 / 204).toFixed(1)}px)`; }
  function draw(p) {
    const spec = { ...p.base, ...(p.o || {}) };
    const key = JSON.stringify(spec);
    if (key !== p.drawn) { p.svg.innerHTML = D.inner(spec, 'pen'); p.drawn = key; }
  }
  function make(id, base) {
    const g = el('g', { class: 'who tap', tabindex: '0', role: 'button', 'aria-label': `${base.name}, ${base.role || ''}` });
    const bob = el('g', { class: 'bob' }); bob.style.animationDelay = `${(-r() * 3).toFixed(2)}s`;
    const svg = el('svg', { width: W, height: H.toFixed(1), viewBox: '0 0 200 204', overflow: 'visible' });
    bob.append(svg); g.append(bob); $('chars').append(g);
    const p = { id, base, g, bob, svg, x: 0, y: 0, mode: 'idle' };
    g.addEventListener('click', () => tapPerson(p));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapPerson(p); } });
    people[id] = p;
  }
  function headTop(p) { const k = p.base.size === 'small' ? .78 : 1; return p.y - H * k * .98 + (p.mode === 'float' ? -10 : 0); }

  function setChapter(i, first = false) {
    chapter = (i + CHAPTERS.length) % CHAPTERS.length;
    const ch = CHAPTERS[chapter];
    clearBubbles();
    for (const [id, p] of Object.entries(people)) {
      const c = ch.cast[id]; if (!c) continue;
      Object.assign(p, { x: c.x, y: c.y, o: c.o, line: c.line, range: c.range, mode: c.mode || 'idle' });
      p.g.style.setProperty('--dur', first ? '0s' : '1.6s');
      p.g.style.transform = placeTransform(p);
      p.g.classList.toggle('gone', !!c.hide);
      p.g.classList.remove('walking');
      p.g.classList.toggle('float', p.mode === 'float');
      p.g.classList.toggle('bow', p.mode === 'bow');
      p.g.setAttribute('aria-hidden', c.hide ? 'true' : 'false');
      p.g.setAttribute('tabindex', c.hide ? '-1' : '0');
      draw(p);
    }
    $('crown').style.opacity = ch.crown ? '1' : '0';
    $('crown').style.pointerEvents = ch.crown ? 'auto' : 'none';
    $('moonGlow').style.transform = ch.moon ? 'scale(1.7)' : 'scale(1)';
    $('moonGlow').style.opacity = ch.moon ? '.3' : '.14';
    setTimeout(sortDepth, first ? 0 : 1700);
    $('chNum').textContent = `Chapter ${chapter + 1}`;
    $('chTitle').textContent = ch.title;
    $('chText').textContent = ch.text;
    $('next').textContent = chapter === CHAPTERS.length - 1 ? 'Start again ↺' : 'Next chapter ▶';
    document.querySelectorAll('#dots button').forEach((b, k) => b.setAttribute('aria-current', k === chapter ? 'step' : 'false'));
    const token = ++introToken;
    for (const [id, ms] of ch.intro) setTimeout(() => { if (token === introToken && people[id]) say(people[id].x, headTop(people[id]), people[id].line, id); }, first ? ms + 600 : ms + 1200);
    if (ch.moon && !first) setTimeout(() => sparkleBurst(410, 560, 18, '#fbf2d5'), 900);
  }
  let introToken = 0;
  function sortDepth() { Object.values(people).sort((a, b) => a.y - b.y).forEach((p) => $('chars').append(p.g)); }

  // wandering
  setInterval(() => {
    if (reduce) return;
    for (const p of Object.values(people)) {
      if (p.mode !== 'walk' || p.g.classList.contains('walking') || Math.random() < .35) continue;
      const [a, b] = p.range; const nx = a + Math.random() * (b - a); const d = Math.abs(nx - p.x);
      if (d < 40) continue;
      const dur = d / 70;
      p.x = nx; p.g.style.setProperty('--dur', `${dur.toFixed(2)}s`); p.g.classList.add('walking'); p.g.style.transform = placeTransform(p);
      setTimeout(() => p.g.classList.remove('walking'), dur * 1000);
    }
  }, 1800);

  // ---------- bubbles and effects ----------
  const live = {};
  function clearBubbles() { $('bubbles').replaceChildren(); for (const k of Object.keys(live)) delete live[k]; }
  function say(x, y, text, key = 'x', ms = 3000) {
    if (!text) return;
    if (live[key]) live[key].remove();
    const g = el('g', { class: 'bubble', 'pointer-events': 'none' });
    const t = el('text', { x, y: y - 26, 'text-anchor': 'middle', 'font-family': 'Gaegu, "Comic Sans MS", cursive', 'font-weight': '700', 'font-size': '27', fill: INK });
    t.textContent = text; g.append(t); $('bubbles').append(g);
    const bb = t.getBBox(); const pad = 14;
    let bx = bb.x - pad, bw = bb.width + pad * 2;
    const shift = Math.max(8 - bx, 0) - Math.max(bx + bw - 1592, 0);
    t.setAttribute('x', x + shift); bx += shift;
    const rect = el('rect', { x: bx, y: bb.y - 8, width: bw, height: bb.height + 16, rx: 16, fill: '#fffdf8', stroke: INK, 'stroke-width': 2.6 });
    const tail = el('path', { d: `M${x - 9},${bb.y + bb.height + 6} L${x},${y - 4} L${x + 9},${bb.y + bb.height + 6}`, fill: '#fffdf8', stroke: INK, 'stroke-width': 2.6, 'stroke-linejoin': 'round' });
    const cover = el('path', { d: `M${x - 7},${bb.y + bb.height + 6.5} H${x + 7}`, stroke: '#fffdf8', 'stroke-width': 4 });
    g.insertBefore(cover, t); g.insertBefore(tail, cover); g.insertBefore(rect, tail);
    live[key] = g;
    setTimeout(() => { if (live[key] === g) { g.remove(); delete live[key]; } }, ms);
  }
  function sparkleBurst(x, y, n = 10, color = '#f6d36b') {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, d = 40 + Math.random() * 50;
      const s = el('path', { class: 'spark', d: D.sparkle(x, y, 5 + Math.random() * 5), fill: color, stroke: INK, 'stroke-width': 1 });
      s.style.setProperty('--dx', `${(Math.cos(a) * d).toFixed(0)}px`); s.style.setProperty('--dy', `${(Math.sin(a) * d - 20).toFixed(0)}px`);
      $('fx').append(s); setTimeout(() => s.remove(), 1100);
    }
  }
  function tapPerson(p) {
    if (p.g.classList.contains('gone')) return;
    p.bob.classList.remove('hop'); void p.bob.getBBox(); p.bob.classList.add('hop');
    setTimeout(() => p.bob.classList.remove('hop'), 560);
    say(p.x, headTop(p), p.line || p.base.role, p.id);
  }
  const onTap = (id, fn) => { const n = $(id); n.addEventListener('click', fn); n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); };
  onTap('moon', () => {
    const s = el('path', { class: 'shoot', d: `M1200,70 l46,-4 l-46,8Z ${D.sparkle(1200, 72, 8)}`, fill: '#fff8e6' });
    $('fx').append(s); setTimeout(() => s.remove(), 1300);
    if (chapter === 3) say(people['moon-goddess'].x, headTop(people['moon-goddess']), 'The moon never forgets her own.', 'moon-goddess');
    else say(1320, 70, ['Make a wish…', 'The moon is watching.', 'Almost midnight…'][chapter % 3], 'moon');
  });
  for (const id of ['lanternL', 'lanternR']) onTap(id, () => { const g = $(id).querySelector('.lglow'); g.style.opacity = g.style.opacity === '0' ? '1' : '0'; });
  onTap('fire', () => { for (let i = 0; i < 12; i++) { const c = el('circle', { class: 'spark', cx: 1470, cy: 790, r: 3 + Math.random() * 3, fill: i % 2 ? '#f6d36b' : '#f6b35b' }); c.style.setProperty('--dx', `${((Math.random() - .5) * 90).toFixed(0)}px`); c.style.setProperty('--dy', `${(-60 - Math.random() * 90).toFixed(0)}px`); $('fx').append(c); setTimeout(() => c.remove(), 1100); } });
  onTap('owl', () => { const e = $('owlEyes'); e.style.opacity = '0'; setTimeout(() => (e.style.opacity = '1'), 260); say(186, 418, chapter === 2 ? 'Hoo… that’s not the real Luna.' : 'Hoo… hoo?', 'owl', 2200); });
  onTap('crown', () => { sparkleBurst(800, 590, 12); say(800, 570, 'The Luna crown, waiting…', 'crown', 2200); });

  // ---------- chapter controls ----------
  $('dots').innerHTML = CHAPTERS.map((c, i) => `<button type="button" aria-label="Chapter ${i + 1}: ${c.title}"></button>`).join('');
  $('dots').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setChapter([...$('dots').children].indexOf(b)); });
  $('next').addEventListener('click', () => setChapter(chapter + 1));
  $('prev').addEventListener('click', () => setChapter(chapter - 1));
  addEventListener('keydown', (e) => { if (e.target.closest('input, select, textarea')) return; if (e.key === 'ArrowRight') setChapter(chapter + 1); if (e.key === 'ArrowLeft') setChapter(chapter - 1); });

  fetch('cast.json', { cache: 'no-cache' })
    .then((res) => res.json())
    .then((d) => {
      const ids = Object.keys(CHAPTERS[0].cast);
      for (const id of ids) { const base = d.friends.find((f) => f.id === id); if (base) make(id, base); }
      setChapter(0, true);
    })
    .catch(() => { $('chText').textContent = 'The pack could not be loaded. Refresh the page to try again.'; });
})();
