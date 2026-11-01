// Little Magic Studio renderer: spec in, SVG doodle out.
// Used by the site (window.Doodle) and by tools/build.mjs (for OPTIONS and DEFAULTS).
(function (root) {
  const INK = '#3d3340';

  // Every allowed value. The bot may only pick from these.
  const OPTIONS = {
    ears:      ['none', 'wolf', 'elf', 'bunny'],
    hat:       ['none', 'wizard', 'horn', 'sprout', 'shell', 'flowers', 'halo'],
    mane:      ['none', 'rainbow', 'moonlight'],
    eyes:      ['dots', 'happy', 'sleepy', 'wink', 'sparkle', 'heart', 'tears', 'side-eye', 'stern'],
    brows:     ['none', 'soft', 'stern', 'worried'],
    mouth:     ['smile', 'cat', 'open', 'o', 'fangs', 'smirk', 'frown'],
    accessory: ['none', 'eyepatch', 'tiara', 'necklace'],
    prop:      ['none', 'wand', 'book', 'scroll', 'orb', 'crystal', 'pearl', 'moon', 'plant', 'heart', 'crown', 'cane'],
    pattern:   ['none', 'stars', 'moons', 'hearts', 'dots'],
    wings:     ['none', 'angel', 'fairy'],
    cape:      ['none', 'fur', 'royal'],
    aura:      ['none', 'silver', 'gold', 'shadow'],
    badge:     ['none', 'star', 'moon', 'heart', 'paw'],
    mark:      ['none', 'sparkles', 'hearts', 'stars', 'zzz', 'music', 'bubbles', 'whisper'],
    size:      ['normal', 'small'],
  };
  const DEFAULTS = {
    theme: 'magic', hood: '#b9a3dd', accent: '#8a73c6', capeColor: '#6f6aa0',
    ears: 'none', hat: 'none', mane: 'none', eyes: 'dots', brows: 'none', mouth: 'smile', accessory: 'none',
    prop: 'none', pattern: 'none', wings: 'none', cape: 'none', aura: 'none', badge: 'none', mark: 'none', size: 'normal',
  };

  // Shared filters: "pen" (fineliner, default) and "pencil" (grain + hatching).
  const DEFS =
    '<filter id="pencil" x="-8%" y="-8%" width="116%" height="116%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.15 1.32" result="a"/>' +
    '<feComposite in="SourceGraphic" in2="a" operator="in" result="g"/>' +
    '<feTurbulence type="turbulence" baseFrequency="0.045" numOctaves="2" seed="3" result="w"/>' +
    '<feDisplacementMap in="g" in2="w" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<filter id="pen" x="-8%" y="-8%" width="116%" height="116%">' +
    '<feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" seed="5" result="w"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="w" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<pattern id="hatch" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">' +
    '<line x1="0" y1="0" x2="0" y2="3.2" stroke="#3d3340" stroke-width=".55" opacity=".22"/></pattern>';

  // ---------- helpers ----------
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = clamp(r + (t - r) * p); g = clamp(g + (t - g) * p); b = clamp(b + (t - b) * p);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function rng(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  const P = (d, fill, o = {}) =>
    `<path d="${d}" fill="${fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.w ?? 1.7}" stroke-linejoin="round" stroke-linecap="round"${o.op ? ` opacity="${o.op}"` : ''}${o.tf ? ` transform="${o.tf}"` : ''}/>` +
    (o.sketch ? `<path d="${d}" fill="none" stroke="${INK}" stroke-width=".7" opacity=".35" transform="translate(.9 .7)${o.tf ? ' ' + o.tf : ''}"/>` : '');
  const soft = (d, fill, op = .55) => `<path d="${d}" fill="${fill}" opacity="${op}"/>`;
  const E = (cx, cy, rx, ry) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
  const C = (cx, cy, r) => E(cx, cy, r, r);
  const R = (x, y, w, h, r = 2) => `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} ${-r},${r} h${-(w - 2 * r)} q${-r},0 ${-r},${-r} v${-(h - 2 * r)} q0,${-r} ${r},${-r}Z`;
  function star(cx, cy, r, n = 5, inner = .45) { let d = ''; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1); } return d + 'Z'; }
  const sparkle = (cx, cy, r) => star(cx, cy, r, 4, .32);
  const heart = (x, y, r) => `M${x},${y + r * .9} C${x - r * 1.6},${y - r * .1} ${x - r * .8},${y - r * 1.3} ${x},${y - r * .45} C${x + r * .8},${y - r * 1.3} ${x + r * 1.6},${y - r * .1} ${x},${y + r * .9}Z`;
  const crescent = (x, y, r) => `M${x},${y - r} A${r},${r} 0 0,0 ${x},${y + r} A${r * .62},${r} 0 0,1 ${x},${y - r}Z`;
  const mirror = (s) => `<g transform="translate(200 0) scale(-1 1)">${s}</g>`;
  const esc = (t) => String(t).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);

  function bodyD() {
    let d = 'M100,40 C142,40 160,70 157,106 C155,128 159,152 166,182';
    for (let i = 0; i < 6; i++) d += ' q-11,9 -22,0';
    return d + ' C41,152 45,128 43,106 C40,70 58,40 100,40Z';
  }

  let uid = 0;

  // ---------- the character ----------
  function inner(spec, look = 'pen') {
    const s = { ...DEFAULTS, ...spec };
    const id = 'd' + (++uid) + Math.random().toString(36).slice(2, 6);
    const hood = s.hood, acc = s.accent, light = shade(hood, .35), dark = shade(hood, -.18);
    const r = rng(s.name || 'friend');
    const replacesAntenna = ['wizard', 'horn', 'sprout', 'shell', 'halo'].includes(s.hat);
    let o = '';

    // aura (furthest back)
    if (s.aura !== 'none') {
      const a = { silver: ['#e3e9f8', '#f5f7ff', '#ffffff'], gold: ['#fbe8ad', '#fff6dc', '#f6d36b'], shadow: ['#857b9a', '#a79fb8', '#6d6480'] }[s.aura];
      o += soft(E(100, 116, 82, 90), a[0], s.aura === 'shadow' ? .32 : .75) + soft(E(100, 118, 68, 76), a[1], s.aura === 'shadow' ? .25 : .7);
      if (s.aura === 'shadow') o += [[28, 150], [172, 140], [36, 70], [166, 66]].map(([x, y], i) => P(`M${x},${y} q${i % 2 ? -8 : 8},-8 0,-16 q${i % 2 ? 8 : -8},-8 0,-16`, 'none', { w: 1.3, stroke: a[2], op: .7 })).join('');
      else o += [[24, 120], [176, 112], [34, 172], [170, 168], [40, 62], [162, 58]].map(([x, y], i) => P(sparkle(x, y, [4.6, 4, 3.2, 3.6, 3, 3.4][i]), a[2], { w: .8 })).join('');
    }

    // wings
    if (s.wings === 'angel') { const w = P('M62,118 C22,92 6,118 18,136 C8,148 24,166 44,156 C42,150 52,146 62,138Z', '#fffaf6', { sketch: true }) + P('M28,128 C34,132 40,134 46,134 M24,146 C32,148 40,148 48,146', 'none', { w: 1 }); o += w + mirror(w); }
    if (s.wings === 'fairy') { const w = P('M60,116 C30,80 10,96 20,118 C26,132 46,132 60,126Z', '#d8f0f3', { sketch: true }) + P('M58,132 C34,138 26,156 38,162 C48,166 58,150 60,138Z', '#e8dcf6'); o += w + mirror(w); }

    // cape (back panel)
    if (s.cape !== 'none') o += P('M54,92 C30,136 20,168 22,192 L178,192 C180,168 170,136 146,92Z', s.capeColor, { sketch: true });

    // ears behind the hood
    if (s.ears === 'wolf') { const e = P('M64,64 L56,18 L94,44Z', hood, { sketch: true }) + P('M68,56 L62,30 L86,45Z', '#f4b9c6', { w: 1.1 }); o += e + mirror(e); }
    if (s.ears === 'bunny') { const e = P(E(80, 22, 8, 22), hood, { tf: 'rotate(-14 80 34)', sketch: true }) + P(E(80, 24, 4, 15), '#f4b9c6', { w: 1, tf: 'rotate(-14 80 34)' }); o += e + mirror(e); }

    // antenna
    if (!replacesAntenna) o += P('M100,41 C99,34 101,28 100,22', 'none', { w: 1.6 }) + P(C(100, 17, 5.5), acc, { sketch: true }) + soft(C(98.2, 15.4, 1.6), '#ffffff', .85);

    // hood body, hatching, pattern
    const body = bodyD();
    o += `<clipPath id="${id}b"><path d="${body}"/></clipPath>`;
    o += P(body, hood, { sketch: true, w: 1.9 });
    if (look === 'pencil') o += `<path d="${body}" fill="url(#hatch)"/>`;
    o += soft('M60,170 q-5,8 -2,16 l100,0 q3,-8 -2,-16Z', dark, .18);
    if (s.pattern !== 'none') {
      let pat = '', n = 0;
      for (let i = 0; i < 26 && n < 10; i++) {
        const x = 48 + r() * 104, y = 126 + r() * 60;
        if (Math.hypot(x - 100, y - 150) < 30) continue;
        n++;
        pat += { stars: () => P(star(x, y, 3.6), acc, { w: 1 }), moons: () => P(crescent(x, y, 3.8), acc, { w: 1 }), hearts: () => P(heart(x, y, 2.6), acc, { w: 1 }), dots: () => P(C(x, y, 2.2), acc, { w: 1 }) }[s.pattern]();
      }
      o += `<g clip-path="url(#${id}b)">${pat}</g>`;
    }

    // mane strands on the hood
    if (s.mane !== 'none') {
      const cols = s.mane === 'rainbow' ? ['#c9b6f2', '#a9dcef'] : ['#e9e4f6', '#fff3c9'];
      o += P('M96,42 C70,44 52,70 50,100 C48,120 40,132 32,140 C52,138 60,118 62,100 C64,78 78,56 100,50Z', cols[0], { sketch: true });
      o += P('M104,45 C84,52 68,76 66,104 C64,124 56,140 46,152 C68,146 76,124 76,104 C78,82 90,62 106,53Z', cols[1]);
    }

    // elf ears
    if (s.ears === 'elf') { const e = P('M64,96 Q42,80 22,74 Q30,100 62,114Z', '#f9dcc8', { sketch: true }) + P('M58,100 Q44,90 32,84', 'none', { w: 1 }); o += e + mirror(e); }

    // face opening
    o += P(E(100, 100, 43, 36), dark, { w: 1.5 });
    o += P(E(100, 101, 39, 32), '#fff8ee', { sketch: true });
    if (s.mane !== 'none') o += P('M98,46 C118,46 134,58 140,76 C126,68 112,66 98,70Z', s.mane === 'rainbow' ? '#f6b3cb' : '#d9d2f0');

    // blush, eyes, brows, mouth
    o += soft(E(76, 111, 6.5, 3.6), '#f4a7b9') + soft(E(124, 111, 6.5, 3.6), '#f4a7b9');
    const dotEye = (x) => P(E(x, 101, 3.4, 3.9), INK, { w: 1 }) + soft(C(x - 1.1, 99.6, 1.1), '#fff', .95);
    const eye = (x, kind) => ({
      dots: dotEye(x),
      happy: P(`M${x - 5},103 Q${x},95 ${x + 5},103`, 'none', { w: 2 }),
      sleepy: P(`M${x - 5},100 Q${x},106 ${x + 5},100`, 'none', { w: 2 }),
      sparkle: P(star(x, 101, 5.2, 4, .38), INK, { w: .8 }) + soft(C(x - 1, 100, .9), '#fff', .9),
      heart: P(heart(x, 101, 4.2), '#e8607e', { w: 1.1 }),
      tears: dotEye(x) + P(`M${x + 2},106 q-3,5 0,7.5 q3,-2.5 0,-7.5Z`, '#a9d4f0', { w: .9 }),
      'side-eye': P(`M${x - 6},98.5 h12`, 'none', { w: 1.9 }) + P(C(x + 2.6, 101.6, 2.5), INK, { w: .8 }),
      stern: P(C(x, 101, 2.8), INK, { w: .8 }),
    }[kind]);
    if (s.eyes === 'wink') o += eye(85, 'dots') + P('M110,101 Q115,96 120,101', 'none', { w: 2 });
    else o += eye(85, s.eyes) + eye(115, s.eyes);
    o += ({
      none: '',
      soft: P('M80,92 Q85,89.5 90,92 M110,92 Q115,89.5 120,92', 'none', { w: 1.3 }),
      stern: P('M79,90 L91,93.5 M109,93.5 L121,90', 'none', { w: 1.8 }),
      worried: P('M79,93.5 L91,90 M109,90 L121,93.5', 'none', { w: 1.5 }),
    })[s.brows];
    o += ({
      smile: P('M95,111 Q100,116 105,111', 'none', { w: 1.6 }),
      cat: P('M93,110 Q96.5,114 100,110 Q103.5,114 107,110', 'none', { w: 1.5 }),
      open: P('M94.5,110 Q100,111 105.5,110 Q104,118 100,118 Q96,118 94.5,110Z', '#e98b9b', { w: 1.4 }),
      o: P(E(100, 113, 2.6, 3), '#e98b9b', { w: 1.3 }),
      fangs: P('M94,110 Q100,115 106,110', 'none', { w: 1.6 }) + P('M96,111.5 L97,115 L98.4,112.6Z M101.6,112.6 L103,115 L104,111.5Z', '#ffffff', { w: .9 }),
      smirk: P('M94,112.5 Q101,114.5 106.5,108.5', 'none', { w: 1.6 }),
      frown: P('M95,114.5 Q100,109.5 105,114.5', 'none', { w: 1.6 }),
    })[s.mouth];

    // accessories on the face
    if (s.accessory === 'eyepatch') o += P('M62,89 Q100,90 140,95', 'none', { w: 1.5 }) + P(E(115, 101, 7.5, 6.5), INK, { w: 1 });
    if (s.accessory === 'tiara') o += P('M84,70 L84,61 L91,66 L100,55 L109,66 L116,61 L116,70 Q100,73 84,70Z', '#f6d36b', { sketch: true }) + P(C(100, 64, 2.4), '#f59ab5', { w: .9 });

    // hats
    if (s.hat === 'wizard') {
      o += P(E(100, 63, 50, 9), shade(acc, -.12), { sketch: true });
      o += P('M60,64 Q86,38 116,2 Q118,34 142,62 Q100,70 60,64Z', acc, { sketch: true });
      if (look === 'pencil') o += '<path d="M60,64 Q86,38 116,2 Q118,34 142,62 Q100,70 60,64Z" fill="url(#hatch)"/>';
      o += P(star(104, 36, 5), '#f6d36b', { w: 1 }) + P(star(88, 52, 3.4), '#f6d36b', { w: 1 }) + P(star(120, 50, 2.6), '#f6d36b', { w: .9 });
    }
    if (s.hat === 'horn') { o += P('M90,48 L100,4 L110,48 Q100,52 90,48Z', '#ffe6a3', { sketch: true }) + P('M93,38 L107,33 M95,28 L106,24 M97,18 L104,15', 'none', { w: 1.1 }) + soft('M98,10 L95,40', '#ffffff', .8); }
    if (s.hat === 'sprout') { o += P('M100,42 C100,34 98,30 100,24', 'none', { w: 1.6 }) + P('M100,26 Q84,10 72,22 Q84,34 100,26Z', shade(hood, -.25), { sketch: true }) + P('M100,24 Q114,6 128,16 Q118,32 100,24Z', shade(hood, -.1), { sketch: true }); }
    if (s.hat === 'shell') { o += P('M74,52 C76,18 124,18 126,52 Q100,60 74,52Z', acc, { sketch: true }) + P('M100,55 L82,30 M100,55 L91,24 M100,55 L100,22 M100,55 L109,24 M100,55 L118,30', 'none', { w: 1 }) + P(C(100, 54, 4.2), '#fdf6f8', { w: 1.1 }) + soft(C(98.8, 52.8, 1.2), '#ffffff', .95); }
    if (s.hat === 'flowers') {
      const fl = (x, y, c) => { let f = ''; for (let i = 0; i < 5; i++) { const a = i * 1.2566; f += P(C(x + Math.cos(a) * 4.2, y + Math.sin(a) * 4.2, 3.4), c, { w: 1 }); } return f + P(C(x, y, 2.4), '#f6d36b', { w: .9 }); };
      o += fl(74, 56, '#f6b3cb') + fl(100, 44, '#c9b6f2') + fl(126, 56, '#fbe3a0');
    }
    if (s.hat === 'halo') o += `<path d="${E(100, 26, 24, 6)}" fill="none" stroke="#f3cc5c" stroke-width="4.2"/>` + P(E(100, 26, 26.5, 8), 'none', { w: 1 }) + P(E(100, 26, 21.5, 4), 'none', { w: 1 });

    // cape front details, necklace
    if (s.cape === 'fur') { let fur = ''; for (let x = 60, i = 0; x <= 140; x += 8, i++) fur += P(C(x, 137 - Math.abs(x - 100) * .08 + (i % 2) * 2.5, 7.6), '#f3eee8', { w: 1.1 }); o += fur + P('M64,140 q3,3 6,0 M86,142 q3,3 6,0 M108,142 q3,3 6,0 M130,140 q3,3 6,0', 'none', { w: .8, stroke: '#b9b0a6' }); }
    if (s.cape === 'royal') { const c = P('M66,131 L86,127 L80,145Z', s.capeColor, { w: 1.3 }); o += c + mirror(c) + P(C(100, 137, 4.6), '#f6d36b', { w: 1.1 }); }
    if (s.accessory === 'necklace') for (let x = 76; x <= 124; x += 6) o += P(C(x, 134 + 6 * (1 - ((x - 100) / 24) ** 2), 2.4), '#fbf4f7', { w: .8 });

    // prop, then hands in front of it
    let hands = [[80, 148], [120, 148]];
    const prop = {
      none: () => { hands = [[64, 160], [136, 160]]; return ''; },
      wand: () => { hands = [[72, 156], [128, 142]]; return P('M116,162 L146,112', 'none', { w: 4.6 }) + '<path d="M116,162 L146,112" stroke="#b98b62" stroke-width="2.6" stroke-linecap="round"/>' + P(star(148, 108, 10), '#f6d36b', { sketch: true }) + P(sparkle(162, 96, 3.6), '#f6d36b', { w: .9 }) + P(sparkle(136, 98, 2.6), '#f6d36b', { w: .8 }); },
      book: () => P(R(76, 140, 48, 11, 2), '#c7b5e8', { sketch: true }) + P(R(79, 129, 42, 11, 2), '#f6c8b6', { sketch: true }) + P(R(82, 118, 37, 11, 2), '#bfe3e5') + P('M84,145.5 h40 M86,134.5 h34', 'none', { w: .8 }) + P(star(100, 123.5, 3), '#f6d36b', { w: .8 }),
      scroll: () => P(R(82, 128, 36, 36, 3), '#fbefd9', { sketch: true }) + P(E(100, 128, 19, 3.6), '#efdcb9', { w: 1.2 }) + P(E(100, 164, 19, 3.6), '#efdcb9', { w: 1.2 }) + P('M88,138 h24 M88,145 h20 M88,152 h22', 'none', { w: .9 }),
      orb: () => soft(C(100, 145, 22), '#ffe9a8', .65) + P(C(100, 145, 14), '#ffd36b', { sketch: true }) + soft(C(95, 140, 4), '#ffffff', .8) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * .785; return P(`M${100 + Math.cos(a) * 18},${145 + Math.sin(a) * 18} L${100 + Math.cos(a) * 23},${145 + Math.sin(a) * 23}`, 'none', { w: 1.2 }); }).join(''),
      crystal: () => P('M100,124 L113,136 L110,160 L100,168 L90,160 L87,136Z', '#c4adf0', { sketch: true }) + P('M87,136 L113,136 M100,124 L100,168 M90,160 L100,136 L110,160', 'none', { w: .9 }) + soft('M92,134 L96,128 L98,150Z', '#ffffff', .6),
      pearl: () => P('M76,150 Q100,178 124,150 Q100,160 76,150Z', acc, { sketch: true }) + P('M86,158 L90,166 M100,162 L100,170 M114,158 L110,166', 'none', { w: .9 }) + P(C(100, 144, 12.5), '#fbf4f7', { sketch: true }) + soft('M90,148 A11,11 0 0,0 108,152', '#cde7f0', .7) + soft(E(95, 139, 3.4, 2.4), '#ffffff', .95),
      moon: () => P(crescent(100, 145, 17), s.hat === 'halo' || s.aura === 'gold' ? '#f6d36b' : acc, { sketch: true }) + P(sparkle(116, 130, 3.4), '#f6d36b', { w: .9 }),
      plant: () => { hands = [[86, 158], [114, 158]]; return P('M100,148 C99,138 101,132 100,126', 'none', { w: 1.5 }) + P('M100,134 Q84,120 78,132 Q88,142 100,134Z', '#8fc79a', { sketch: true }) + P('M100,128 Q116,112 124,124 Q114,136 100,128Z', '#a9d8a8', { sketch: true }) + P(heart(100, 120, 4.4), '#f6b3cb', { w: 1 }) + P('M86,146 L114,146 L110,168 L90,168Z', '#e9a785', { sketch: true }) + P('M86,146 h28', 'none', { w: 1 }); },
      heart: () => P(heart(100, 146, 15), '#f59ab5', { sketch: true }) + soft(E(92, 138, 3.4, 2.2), '#ffffff', .85),
      crown: () => P('M83,156 L82,136 L91,145 L100,130 L109,145 L118,136 L117,156Z', '#f6d36b', { sketch: true }) + P(R(82, 152, 36, 7, 2), '#f2c25b', { w: 1.2 }) + P(C(100, 141, 2.6), '#f59ab5', { w: .9 }) + P(C(89, 147, 1.8), '#c9b6f2', { w: .8 }) + P(C(111, 147, 1.8), '#a9dcef', { w: .8 }) + P(sparkle(122, 128, 3.4), '#f6d36b', { w: .8 }),
      cane: () => { hands = [[72, 156], [130, 142]]; return P('M130,190 L130,126 Q130,114 120,114 Q112,114 112,122', 'none', { w: 4.6 }) + '<path d="M130,190 L130,126 Q130,114 120,114 Q112,114 112,122" fill="none" stroke="#a9805a" stroke-width="2.6" stroke-linecap="round"/>'; },
    }[s.prop]();
    o += prop;
    for (const [x, y] of hands) o += P(C(x, y, 8.5), light, { sketch: true });

    // chest badge
    o += { none: '', star: P(star(100, 176, 6.5), '#f6d36b', { w: 1.1 }), moon: P(crescent(100, 176, 6.5), '#f6e3a2', { w: 1.1 }), heart: P(heart(100, 176, 5.4), '#f59ab5', { w: 1.1 }), paw: P(E(100, 178, 4.4, 3.6), light, { w: 1 }) + [[-5, -4], [-1.6, -7], [1.6, -7], [5, -4]].map(([dx, dy]) => P(C(100 + dx, 178 + dy, 1.8), light, { w: .9 })).join('') }[s.badge];

    // emote marks by the head
    const spots = [[158, 40], [42, 46], [170, 70]];
    o += ({
      none: () => '',
      sparkles: () => spots.map(([x, y], i) => P(sparkle(x, y, [6, 4.5, 3.5][i]), '#f6d36b', { w: 1 })).join(''),
      hearts: () => spots.map(([x, y], i) => P(heart(x, y, [4.6, 3.6, 3][i]), '#f59ab5', { w: 1 })).join(''),
      stars: () => spots.map(([x, y], i) => P(star(x, y, [5.6, 4.2, 3.4][i]), '#f6d36b', { w: 1 })).join(''),
      zzz: () => P('M150,36 h10 l-10,10 h10', 'none', { w: 1.6 }) + P('M164,22 h7 l-7,7 h7', 'none', { w: 1.4 }) + P('M174,10 h5 l-5,5 h5', 'none', { w: 1.2 }),
      music: () => P(E(152, 50, 4, 3), INK, { w: 1, tf: 'rotate(-18 152 50)' }) + P('M155.5,49 L157,30 Q164,32 166,38', 'none', { w: 1.5 }) + P(E(40, 56, 3, 2.3), INK, { w: 1, tf: 'rotate(-18 40 56)' }) + P('M42.6,55 L43.6,42', 'none', { w: 1.3 }),
      bubbles: () => spots.map(([x, y], i) => P(C(x, y, [6, 4.4, 3.2][i]), '#e3f4f6', { w: 1 }) + soft(C(x - 1.6, y - 1.6, 1.2), '#ffffff', .95)).join(''),
      whisper: () => P('M148,47 L143,56 L154,48', '#ffffff', { w: 1.2 }) + P(E(158, 40, 14, 9.5), '#ffffff', { w: 1.2 }) + [152, 158, 164].map((x) => P(C(x, 40, 1.3), INK, { w: .5 })).join('') + P('M30,56 q4,-4 8,0 q4,4 8,0 M33,64 q3,-3 6,0 q3,3 6,0', 'none', { w: 1.1 }),
    })[s.mark]();

    if (s.size === 'small') o = `<g transform="translate(100 192) scale(.78) translate(-100 -192)">${o}</g>`;
    return `<g filter="url(#${look})">${o}</g>`;
  }

  // Full SVG. standalone: true embeds the filters so the file works on its own.
  function svg(spec, { look = 'pen', standalone = false, height } = {}) {
    const size = height ? ` width="${Math.round(height * 200 / 204)}" height="${height}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 204"${size} role="img" aria-label="${esc(spec.name || 'friend')}">` +
      (standalone ? `<defs>${DEFS}</defs>` : '') + inner(spec, look) + '</svg>';
  }

  root.Doodle = { OPTIONS, DEFAULTS, DEFS, INK, inner, svg, shade, rng, star, sparkle, heart, crescent, esc };
})(typeof window !== 'undefined' ? window : globalThis);
