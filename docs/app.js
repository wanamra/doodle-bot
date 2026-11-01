(() => {
  const D = window.Doodle;
  const INK = D.INK;
  const $ = (s) => document.querySelector(s);
  const esc = D.esc;

  // ---------- one-time setup ----------
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${D.DEFS}</defs></svg>`);
  const grain = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .42  0 0 0 0 .36  0 0 0 0 .3  0 0 0 .1 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
  document.documentElement.style.setProperty('--paper-grain', `url("data:image/svg+xml,${encodeURIComponent(grain)}")`);

  const SERIES = {
    studio: { title: 'Little Magic Studio', tag: 'test cast', night: false, groups: null },
    'luna-crown': { title: 'The Luna Crown', tag: 'a werewolf microdrama', night: true, groups: [['mates', 'Destined Mates', 'var(--washi-blue)'], ['antagonists', 'Antagonists', 'var(--washi-pink)'], ['pack', 'Supporting Pack', 'var(--washi-mint)']] },
  };
  const WASHI = ['var(--washi-blue)', 'var(--washi-pink)', 'var(--washi-mint)', 'var(--washi-yellow)'];

  let LOOK = 'pen';
  let view = 'studio';
  let original = [];   // as loaded from cast.json
  let cast = [];       // with lab edits
  let currentId = null;
  const byId = (id) => cast.find((c) => c.id === id);
  const work = () => byId(currentId);
  const slug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'friend';

  // ---------- rings ----------
  const ringsEl = $('#rings');
  const ringSvg = `<svg viewBox="0 0 34 18" width="34" height="18"><circle cx="24" cy="9" r="4.2" fill="#e3d6c8" stroke="#8d7f86" stroke-width="1.2"/><path d="M3,9 C3,2 26,1 26,9" fill="none" stroke="#4d4550" stroke-width="2.6" stroke-linecap="round"/><path d="M3,9 C3,2 26,1 26,9" fill="none" stroke="#a79ca8" stroke-width="1" stroke-linecap="round"/></svg>`;
  function drawRings() { const h = ringsEl.parentElement.clientHeight; ringsEl.innerHTML = ringSvg.repeat(Math.max(6, Math.floor((h - 36) / 34))); }

  // ---------- character sheet ----------
  function skyDecor() {
    const r = D.rng('luna-sky');
    let s = '';
    for (let i = 0; i < 26; i++) s += `<circle cx="${(r() * 100).toFixed(1)}%" cy="${(r() * 100).toFixed(1)}%" r="${(0.6 + r() * 1.4).toFixed(1)}" fill="#fff8e6" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
    return `<svg class="sky" aria-hidden="true">${s}<g transform="translate(40 34)"><circle r="20" fill="#fbf2d5" opacity=".18"/><path d="${D.crescent(0, 0, 13)}" fill="#fbf2d5" stroke="${INK}" stroke-width="1.2"/></g></svg>`;
  }
  function card(c, i) {
    const reborn = i > 0 && /reborn/.test(c.id);
    return `<div class="friend${c.id === currentId ? ' on' : ''}${reborn ? ' reborn' : ''}" data-id="${c.id}">
      <button class="pick" type="button" aria-label="Open ${esc(c.name)} in the spec lab">${D.svg(c, { look: LOOK })}
        <span class="washi" style="background:${WASHI[i % 4]};transform:rotate(${i % 2 ? 1.5 : -1.5}deg)">${esc(c.name)}</span>
        <span class="role">${esc(c.role || c.theme)}</span></button>
      <div class="dl"><button type="button" data-dl="png" aria-label="Download ${esc(c.name)} as PNG">PNG</button><button type="button" data-dl="svg" aria-label="Download ${esc(c.name)} as SVG">SVG</button></div>
    </div>`;
  }
  function drawSheet() {
    const meta = SERIES[view];
    if (!meta) return;
    $('#book').classList.toggle('night', meta.night);
    $('#sheetTitle').innerHTML = (meta.night ? skyDecor() : '') + `<span class="big">${meta.title}</span><span class="tag">${meta.tag}</span>`;
    const list = cast.filter((c) => c.series === view);
    let html = '';
    if (meta.groups) {
      for (const [g, label, color] of meta.groups) {
        const items = list.filter((c) => c.group === g);
        if (!items.length) continue;
        html += `<div style="display:grid;gap:10px;margin-bottom:14px"><span class="group-label" style="background:${color}">${label}</span><div class="cast">${items.map((c) => card(c, list.indexOf(c))).join('')}</div></div>`;
      }
      const rest = list.filter((c) => !meta.groups.some(([g]) => g === c.group));
      if (rest.length) html += `<div class="cast">${rest.map((c) => card(c, list.indexOf(c))).join('')}</div>`;
    } else html = `<div class="cast">${list.map(card).join('')}</div>`;
    $('#sheet').innerHTML = html;
    requestAnimationFrame(drawRings);
  }

  $('#sheet').addEventListener('click', (e) => {
    const f = e.target.closest('.friend'); if (!f) return;
    const id = f.dataset.id;
    const dl = e.target.closest('[data-dl]');
    if (dl) { download(byId(id), dl.dataset.dl, id, dl); return; }
    if (e.target.closest('.pick')) {
      currentId = id; syncFields(); drawLab(); drawSheet();
      $('#sheet').querySelector(`[data-id="${id}"]`)?.classList.add('hop');
      $('#labh').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  });

  // ---------- downloads ----------
  function saveBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  const svgFile = (spec) => D.svg(spec, { look: LOOK, standalone: true, height: 1080 });
  function svgToCanvas(svgText, w, h) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
      img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); resolve(c); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('The drawing could not be turned into an image.')); };
      img.src = url;
    });
  }
  const canvasBlob = (c) => new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('PNG export failed'))), 'image/png'));
  async function pngBlob(spec) { const text = svgFile(spec); return canvasBlob(await svgToCanvas(text, Math.round(1080 * 200 / 204), 1080)); }
  async function download(spec, kind, name, btn) {
    const label = btn?.textContent;
    try {
      if (btn) btn.textContent = '…';
      if (kind === 'svg') saveBlob(new Blob([svgFile(spec)], { type: 'image/svg+xml' }), `${name}.svg`);
      else saveBlob(await pngBlob(spec), `${name}.png`);
    } catch (err) { alertInline(err.message); }
    finally { if (btn) setTimeout(() => (btn.textContent = label), 400); }
  }
  function alertInline(msg) { const t = $('#sceneToast'); t.textContent = msg; }

  function loadZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = () => res(window.JSZip); s.onerror = () => rej(new Error('The zip tool could not load. Check your connection and try again.'));
      document.head.append(s);
    });
  }
  $('#zipAll').addEventListener('click', async (e) => {
    const btn = e.currentTarget, label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Packing…';
    try {
      const Zip = await loadZip(); const zip = new Zip();
      for (const c of cast.filter((x) => x.series === view)) {
        zip.file(`svg/${c.id}.svg`, svgFile(c));
        zip.file(`png/${c.id}.png`, await pngBlob(c));
      }
      saveBlob(await zip.generateAsync({ type: 'blob' }), `${view}-doodles.zip`);
      btn.textContent = 'Downloaded';
    } catch (err) { btn.textContent = err.message.slice(0, 60); }
    setTimeout(() => { btn.textContent = label; btn.disabled = false; }, 1800);
  });

  // ---------- spec lab ----------
  const fieldsEl = $('#fields');
  fieldsEl.innerHTML =
    '<label for="f-name">name<input type="text" id="f-name" maxlength="16"></label>' +
    '<label for="f-role">role<input type="text" id="f-role" maxlength="40"></label>' +
    '<label for="f-hood">hood colour<input type="color" id="f-hood"></label>' +
    '<label for="f-accent">accent colour<input type="color" id="f-accent"></label>' +
    '<label for="f-capeColor">cape colour<input type="color" id="f-capeColor"></label>' +
    Object.entries(D.OPTIONS).map(([k, vals]) => `<label for="f-${k}">${k}<select id="f-${k}">${vals.map((v) => `<option>${v}</option>`).join('')}</select></label>`).join('');
  const FIELD_KEYS = ['name', 'role', 'hood', 'accent', 'capeColor', ...Object.keys(D.OPTIONS)];
  function syncFields() { const w = work(); if (!w) return; for (const k of FIELD_KEYS) document.getElementById('f-' + k).value = w[k] ?? ''; }
  fieldsEl.addEventListener('input', (e) => {
    const k = e.target.id.slice(2), w = work(); if (!w || !k) return;
    w[k] = e.target.value || (k === 'name' ? 'Friend' : k === 'role' ? '' : w[k]);
    drawLab(); drawSheet(); queueScene();
  });
  function specJson(s) {
    const out = { name: s.name };
    if (s.role) out.role = s.role;
    if (s.group) out.group = s.group;
    out.theme = s.theme;
    for (const k of ['hood', 'accent']) out[k] = s[k];
    if (s.cape !== 'none') out.capeColor = s.capeColor;
    for (const k of Object.keys(D.OPTIONS)) if (s[k] !== D.DEFAULTS[k]) out[k] = s[k];
    return JSON.stringify(out, null, 2);
  }
  function drawLab() {
    const w = work(); if (!w) return;
    $('#big').innerHTML = D.svg(w, { look: LOOK });
    $('#bigName').textContent = w.name;
    $('#json').textContent = specJson(w);
  }
  document.querySelectorAll('[data-lab-dl]').forEach((b) => b.addEventListener('click', () => download(work(), b.dataset.labDl, slug(work().name), b)));

  const NAMES = ['Mochi', 'Willow', 'Orion', 'Sable', 'Clover', 'Juniper', 'Selwyn', 'Bramble', 'Opal', 'Fenrir', 'Lumi', 'Coral'];
  const HOODS = ['#b9a3dd', '#9eabc9', '#cfc8ea', '#a9d4b0', '#f7dbe7', '#bfe3e5', '#f6d9b8', '#d7c4ee', '#c6dcef', '#e8c6d6'];
  const ACCENTS = ['#8a73c6', '#f2c25b', '#f4a7b9', '#c9b6f2', '#f6c8b6', '#8fc79a', '#e9d9a0'];
  const THEMES = { wolf: { ears: 'wolf' }, elf: { ears: 'elf', hat: 'sprout' }, unicorn: { hat: 'horn', mane: 'rainbow' }, sea: { hat: 'shell', prop: 'pearl' }, magic: { hat: 'wizard' } };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  $('#dice').addEventListener('click', () => {
    const w = work(); if (!w) return;
    const theme = pick(Object.keys(THEMES));
    Object.assign(w, { name: pick(NAMES), role: '', theme, hood: pick(HOODS), accent: pick(ACCENTS), capeColor: pick(HOODS) });
    for (const [k, vals] of Object.entries(D.OPTIONS)) w[k] = pick(vals);
    for (const k of ['wings', 'cape', 'aura', 'accessory', 'brows']) if (Math.random() < .6) w[k] = D.DEFAULTS[k];
    w.size = 'normal';
    Object.assign(w, THEMES[theme]);
    if (w.hat === 'horn' && w.ears === 'wolf') w.ears = 'none';
    syncFields(); drawLab(); drawSheet(); queueScene();
  });
  $('#reset').addEventListener('click', () => {
    const i = cast.findIndex((c) => c.id === currentId); if (i < 0) return;
    cast[i] = { ...original.find((c) => c.id === currentId) };
    syncFields(); drawLab(); drawSheet(); queueScene();
  });
  $('#copy').addEventListener('click', async (e) => {
    const btn = e.currentTarget, txt = $('#json').textContent;
    try { await navigator.clipboard.writeText(txt); btn.textContent = 'Copied'; }
    catch { const sel = getSelection(), rg = document.createRange(); rg.selectNodeContents($('#json')); sel.removeAllRanges(); sel.addRange(rg); btn.textContent = 'Selected, press copy'; }
    setTimeout(() => (btn.textContent = 'Copy spec'), 1600);
  });

  // ---------- scene maker ----------
  const FRAMES = { story: [1080, 1920], square: [1080, 1080], wide: [1920, 1080] };
  const PRESETS = [
    { label: 'Rejected', frame: 'story', bg: 'forest', ids: ['selene', 'alpha-caelan'], cap: 'Rejected by my fated mate' },
    { label: 'The fake Luna', frame: 'story', bg: 'throne', ids: ['kieran', 'seraphina', 'alpha-caelan'], cap: 'She stole my crown' },
    { label: 'Reborn', frame: 'story', bg: 'sky', ids: ['moon-goddess', 'selene-reborn'], cap: 'The Moon Goddess chose me' },
    { label: 'Pack gossip', frame: 'story', bg: 'hall', ids: ['omega-pip', 'selene', 'elder-maren', 'omega-wren'], cap: 'They called me wolfless' },
    { label: 'The hidden heir', frame: 'wide', bg: 'forest', ids: ['selene-reborn', 'lucian'], cap: 'Together we take the throne' },
    { label: 'Studio friends', frame: 'square', bg: 'paper', ids: ['nova', 'twinkle', 'pearl'], cap: '' },
  ];

  function stars(r, W, H, n, top, u, color = '#fff8e6') {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * top).toFixed(0)}" r="${((1.2 + r() * 2.6) * u).toFixed(1)}" fill="${color}" opacity="${(0.45 + r() * 0.55).toFixed(2)}"/>`;
    for (let i = 0; i < Math.round(n / 8); i++) { const x = r() * W, y = r() * H * top; s += `<path d="${D.sparkle(x, y, (7 + r() * 6) * u)}" fill="${color}"/>`; }
    return s;
  }
  const BACKS = {
    forest(W, H) {
      const u = Math.min(W, H) / 1080, r = D.rng('forest' + W + H), g = H * 0.8, k = 3 * u;
      let s = `<defs><linearGradient id="bgF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2750"/><stop offset=".62" stop-color="#6e5e9f"/><stop offset="1" stop-color="#b9a6d8"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bgF)"/>`;
      s += stars(r, W, H, 70, 0.6, u);
      const mx = W * 0.76, my = H * (H > W ? 0.16 : 0.22), mr = Math.min(W, H) * 0.1;
      s += `<circle cx="${mx}" cy="${my}" r="${mr * 1.9}" fill="#fbf2d5" opacity=".1"/><circle cx="${mx}" cy="${my}" r="${mr * 1.4}" fill="#fbf2d5" opacity=".16"/><circle cx="${mx}" cy="${my}" r="${mr}" fill="#fbf2d5" stroke="${INK}" stroke-width="${k}"/>`;
      s += `<circle cx="${mx - mr * .3}" cy="${my - mr * .2}" r="${mr * .18}" fill="#efe2bd"/><circle cx="${mx + mr * .35}" cy="${my + mr * .3}" r="${mr * .12}" fill="#efe2bd"/>`;
      s += `<path d="M0,${g - H * .1} Q${W * .3},${g - H * .2} ${W * .6},${g - H * .08} T${W},${g - H * .12} L${W},${H} L0,${H}Z" fill="#4a4378" stroke="${INK}" stroke-width="${k}"/>`;
      const n = Math.max(6, Math.round(W / 150));
      for (let i = 0; i < n; i++) {
        const x = (i + .5) * W / n + (r() - .5) * W / n * .6, h = (0.16 + r() * 0.12) * H * (H > W ? .75 : 1), w = h * .42, b = g + 6 * u;
        for (let t = 0; t < 3; t++) { const tw = w * (1 - t * .22), ty = b - h * t * .28; s += `<path d="M${x - tw / 2},${ty} L${x},${ty - h * .48} L${x + tw / 2},${ty}Z" fill="${t % 2 ? '#353060' : '#2f2a52'}" stroke="#1f1b38" stroke-width="${k * .8}" stroke-linejoin="round"/>`; }
        s += `<rect x="${x - w * .06}" y="${b - 2}" width="${w * .12}" height="${12 * u}" fill="#3a2f3a"/>`;
      }
      s += `<rect x="0" y="${g}" width="${W}" height="${H - g}" fill="#5b528c" stroke="${INK}" stroke-width="${k}"/>`;
      for (let i = 0; i < 14; i++) { const x = r() * W, y = g + 30 * u + r() * (H - g - 40 * u); s += `<path d="M${x},${y} l${-6 * u},${-14 * u} M${x},${y} l0,${-18 * u} M${x},${y} l${6 * u},${-14 * u}" stroke="#7f76b5" stroke-width="${k * .9}" stroke-linecap="round"/>`; }
      for (let i = 0; i < 10; i++) s += `<circle cx="${r() * W}" cy="${H * .45 + r() * H * .35}" r="${(3 + r() * 3) * u}" fill="#fff1a8" opacity=".75"/>`;
      return s;
    },
    hall(W, H) {
      const u = Math.min(W, H) / 1080, g = H * 0.78, k = 3 * u;
      let s = `<rect width="${W}" height="${H}" fill="#efe0cc"/>`;
      const bh = 90 * u;
      for (let y = bh, row = 0; y < g; y += bh, row++) { s += `<path d="M0,${y} H${W}" stroke="#dcc6aa" stroke-width="${2 * u}"/>`; for (let x = (row % 2) * bh; x < W; x += bh * 2) s += `<path d="M${x},${y - bh} V${y}" stroke="#dcc6aa" stroke-width="${2 * u}"/>`; }
      const ww = Math.min(W * .26, H * .2), wx = W / 2 - ww / 2, wt = H * .1, wb = H * (H > W ? .42 : .52);
      s += `<defs><linearGradient id="bgW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2750"/><stop offset="1" stop-color="#7a69aa"/></linearGradient></defs>`;
      s += `<path d="M${wx},${wb} V${wt + ww / 2} A${ww / 2},${ww / 2} 0 0,1 ${wx + ww},${wt + ww / 2} V${wb}Z" fill="url(#bgW)" stroke="${INK}" stroke-width="${k * 1.4}"/>`;
      s += `<path d="${D.crescent(W / 2 + ww * .12, wt + ww * .55, ww * .16)}" fill="#fbf2d5" stroke="${INK}" stroke-width="${k * .7}"/>`;
      s += `<path d="M${W / 2},${wt} V${wb} M${wx},${(wt + wb) / 2 + ww * .2} H${wx + ww}" stroke="${INK}" stroke-width="${k}"/>`;
      for (const bx of [W * .16, W * .84]) {
        const bw = Math.min(W * .13, H * .1), bt = H * .07, bb = H * (H > W ? .34 : .44);
        s += `<path d="M${bx - bw * .7},${bt} H${bx + bw * .7}" stroke="#8a6a4a" stroke-width="${k * 2}" stroke-linecap="round"/>`;
        s += `<path d="M${bx - bw / 2},${bt} H${bx + bw / 2} V${bb} L${bx},${bb - bw * .35} L${bx - bw / 2},${bb}Z" fill="#b9a3dd" stroke="${INK}" stroke-width="${k}"/>`;
        s += `<path d="${D.crescent(bx, (bt + bb) / 2 - bw * .1, bw * .22)}" fill="#f6d36b" stroke="${INK}" stroke-width="${k * .7}"/>`;
      }
      s += `<rect x="0" y="${g}" width="${W}" height="${H - g}" fill="#d2a982" stroke="${INK}" stroke-width="${k}"/>`;
      for (let y = g + 40 * u; y < H; y += 46 * u) s += `<path d="M0,${y} H${W}" stroke="#bf946c" stroke-width="${2.2 * u}"/>`;
      return s;
    },
    throne(W, H) {
      const u = Math.min(W, H) / 1080, g = H * 0.78, k = 3 * u;
      let s = `<rect width="${W}" height="${H}" fill="#e9def2"/>`;
      for (const px of [W * .09, W * .91]) { const pw = Math.min(W * .09, 110 * u); s += `<rect x="${px - pw / 2}" y="0" width="${pw}" height="${g}" fill="#f7f0e8" stroke="${INK}" stroke-width="${k}"/><rect x="${px - pw * .65}" y="${g - 26 * u}" width="${pw * 1.3}" height="${26 * u}" fill="#efe4d6" stroke="${INK}" stroke-width="${k}"/>`; }
      for (let i = 0; i < 9; i++) { const r = D.rng('th' + i); s += `<path d="${D.sparkle(W * (.2 + r() * .6), H * (.05 + r() * .25), 9 * u)}" fill="#f6d36b" opacity=".7"/>`; }
      const th = Math.min(H * .34, W * .55), tw = th * .5, tx = W / 2, tb = g + 10 * u, tt = tb - th;
      s += `<path d="M${tx - tw / 2},${tb} V${tt + tw / 2} A${tw / 2},${tw / 2} 0 0,1 ${tx + tw / 2},${tt + tw / 2} V${tb}Z" fill="#f2d27a" stroke="${INK}" stroke-width="${k * 1.3}"/>`;
      s += `<path d="M${tx - tw * .36},${tb} V${tt + tw / 2} A${tw * .36},${tw * .36} 0 0,1 ${tx + tw * .36},${tt + tw / 2} V${tb}Z" fill="#9a82cf" stroke="${INK}" stroke-width="${k}"/>`;
      s += `<path d="${D.crescent(tx, tt - th * .02, tw * .14)}" fill="#fbf2d5" stroke="${INK}" stroke-width="${k * .8}"/>`;
      s += `<rect x="0" y="${g}" width="${W}" height="${H - g}" fill="#cbbbe0" stroke="${INK}" stroke-width="${k}"/>`;
      s += `<path d="M${W * .38},${g} H${W * .62} L${W * .8},${H} H${W * .2}Z" fill="#d98aa0" stroke="${INK}" stroke-width="${k}"/>`;
      s += `<path d="M${W * .405},${g + 4 * u} L${W * .24},${H} M${W * .595},${g + 4 * u} L${W * .76},${H}" stroke="#f6d36b" stroke-width="${k * 1.4}"/>`;
      return s;
    },
    sky(W, H) {
      const u = Math.min(W, H) / 1080, r = D.rng('sky' + W + H), k = 3 * u;
      let s = `<defs><linearGradient id="bgS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2a52"/><stop offset=".55" stop-color="#7b68aa"/><stop offset="1" stop-color="#f0c3d4"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bgS)"/>`;
      s += stars(r, W, H, 90, 0.7, u);
      const mr = Math.min(W, H) * .13, mx = W * .72, my = H * (H > W ? .17 : .24);
      s += `<circle cx="${mx}" cy="${my}" r="${mr * 1.6}" fill="#fbf2d5" opacity=".12"/><path d="${D.crescent(mx, my, mr)}" fill="#fbf2d5" stroke="${INK}" stroke-width="${k}"/>`;
      const cy = H * .86;
      for (let i = 0; i < 14; i++) { const x = (i / 13) * W, rr = (60 + r() * 50) * u * (W > H ? 1.2 : 1); s += `<circle cx="${x}" cy="${cy + r() * 40 * u}" r="${rr}" fill="#fdf7fb" stroke="${INK}" stroke-width="${k}"/>`; }
      s += `<rect x="0" y="${cy + 30 * u}" width="${W}" height="${H}" fill="#fdf7fb"/>`;
      return s;
    },
    paper(W, H) {
      const u = Math.min(W, H) / 1080, r = D.rng('paper' + W + H), k = 2.6 * u;
      let s = `<rect width="${W}" height="${H}" fill="#fbf5ea"/>`;
      for (let i = 0; i < 18; i++) {
        const x = r() * W, y = r() * H * .5, t = i % 3, sz = (10 + r() * 12) * u;
        s += t === 0 ? `<path d="${D.sparkle(x, y, sz)}" fill="#f6d36b" stroke="${INK}" stroke-width="${k}" stroke-linejoin="round"/>`
          : t === 1 ? `<path d="${D.heart(x, y, sz * .6)}" fill="#f6b3cb" stroke="${INK}" stroke-width="${k}"/>`
          : `<path d="${D.crescent(x, y, sz * .7)}" fill="#c9b6f2" stroke="${INK}" stroke-width="${k}"/>`;
      }
      s += `<path d="M${W * .06},${H * .9} H${W * .94}" stroke="#d9cbbd" stroke-width="${4 * u}" stroke-dasharray="${14 * u} ${12 * u}" stroke-linecap="round"/>`;
      return s;
    },
  };

  function sceneSvg(sc) {
    const [W, H] = FRAMES[sc.frame];
    const chars = sc.ids.map(byId).filter(Boolean);
    const n = chars.length, tall = H > W, ground = H * (tall ? 0.88 : 0.9);
    let out = BACKS[sc.bg](W, H);
    if (n) {
      // portrait frames: bigger friends that overlap a little, with every other one standing a step back
      const ch = Math.min(H * (tall ? 0.46 : 0.62), (W / n) * (tall ? 1.7 : 1.25) * (204 / 200)), cw0 = ch * 200 / 204;
      const placed = chars.map((c, i) => {
        const back = tall && n >= 3 && i % 2 === 1;
        const k = back ? 0.88 : 1, h = ch * k, w = cw0 * k, g = ground - (back ? H * 0.045 : 0);
        return { c, back, h, w, g, cx: W * (i + 0.5) / n };
      });
      for (const p of [...placed.filter((q) => q.back), ...placed.filter((q) => !q.back)]) {
        const scale = (p.c.size === 'small' ? .78 : 1);
        out += `<ellipse cx="${p.cx}" cy="${p.g}" rx="${p.w * .28 * scale}" ry="${p.w * .045 * scale}" fill="#2a2338" opacity=".18"/>`;
        out += `<svg x="${(p.cx - p.w / 2).toFixed(1)}" y="${(p.g - p.h * (192 / 204)).toFixed(1)}" width="${p.w.toFixed(1)}" height="${p.h.toFixed(1)}" viewBox="0 0 200 204">${D.inner(p.c, LOOK)}</svg>`;
      }
    }
    return { W, H, text: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${D.DEFS}</defs>${out}</svg>` };
  }
  async function sceneCanvas(sc) {
    const { W, H, text } = sceneSvg(sc);
    const c = await svgToCanvas(text, W, H);
    const cap = sc.cap.trim();
    if (cap) {
      try { await document.fonts.load('700 80px Gaegu'); } catch { /* falls back to cursive */ }
      const ctx = c.getContext('2d'), u = Math.min(W, H) / 1080;
      let fs = 78 * u; ctx.font = `700 ${fs}px Gaegu, "Comic Sans MS", cursive`;
      while (ctx.measureText(cap).width > W * .82 && fs > 30) { fs -= 4; ctx.font = `700 ${fs}px Gaegu, "Comic Sans MS", cursive`; }
      const tw = ctx.measureText(cap).width, padX = 34 * u, bh = fs * 1.25, y = H * (H > W ? .075 : .1);
      ctx.save(); ctx.translate(W / 2, y); ctx.rotate(-0.025);
      ctx.fillStyle = '#f6e2a4'; ctx.globalAlpha = .96; ctx.fillRect(-tw / 2 - padX, -bh / 2, tw + padX * 2, bh);
      ctx.globalAlpha = .35; ctx.fillStyle = '#ffffff';
      for (let x = -tw / 2 - padX; x < tw / 2 + padX; x += 18 * u) ctx.fillRect(x, -bh / 2, 6 * u, bh);
      ctx.globalAlpha = 1; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cap, 0, fs * .06); ctx.restore();
    }
    return c;
  }

  const scene = { frame: 'story', bg: 'forest', ids: ['selene', 'alpha-caelan', '', ''], cap: 'Rejected by my fated mate' };
  function fillSceneSelects() {
    const groups = Object.entries(SERIES).map(([k, m]) => `<optgroup label="${m.title}">${cast.filter((c) => c.series === k).map((c) => `<option value="${c.id}">${esc(c.name)}${c.role ? ' · ' + esc(c.role) : ''}</option>`).join('')}</optgroup>`).join('');
    for (let i = 1; i <= 4; i++) $(`#s-${i}`).innerHTML = '<option value="">none</option>' + groups;
  }
  function syncScene() {
    $('#s-frame').value = scene.frame; $('#s-bg').value = scene.bg; $('#s-cap').value = scene.cap;
    for (let i = 1; i <= 4; i++) $(`#s-${i}`).value = scene.ids[i - 1] || '';
  }
  let sceneToken = 0, sceneQueued = false;
  function queueScene() { if (view !== 'scenes' || sceneQueued) return; sceneQueued = true; requestAnimationFrame(drawScene); }
  async function drawScene() {
    sceneQueued = false;
    const t = ++sceneToken;
    try {
      const c = await sceneCanvas(scene);
      if (t !== sceneToken) return;
      const out = $('#sceneCanvas');
      out.width = c.width; out.height = c.height; out.getContext('2d').drawImage(c, 0, 0);
    } catch (err) { $('#sceneToast').textContent = err.message; }
  }
  $('#presets').innerHTML = PRESETS.map((p, i) => `<button type="button" class="chip" data-p="${i}">${p.label}</button>`).join('');
  $('#presets').addEventListener('click', (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return;
    const p = PRESETS[+b.dataset.p];
    Object.assign(scene, { frame: p.frame, bg: p.bg, cap: p.cap, ids: [...p.ids, '', '', ''].slice(0, 4) });
    syncScene(); queueScene();
  });
  document.querySelector('#scenes .fields').addEventListener('input', (e) => {
    const id = e.target.id;
    if (id === 's-frame') scene.frame = e.target.value;
    else if (id === 's-bg') scene.bg = e.target.value;
    else if (id === 's-cap') scene.cap = e.target.value;
    else if (/^s-\d$/.test(id)) scene.ids[+id.slice(2) - 1] = e.target.value;
    queueScene();
  });
  $('#scenePng').addEventListener('click', async (e) => {
    const btn = e.currentTarget; btn.disabled = true; $('#sceneToast').textContent = 'Drawing full size…';
    try {
      const c = await sceneCanvas(scene);
      const names = scene.ids.filter(Boolean).join('-') || 'scene';
      saveBlob(await canvasBlob(c), `scene-${scene.bg}-${names}.png`);
      $('#sceneToast').textContent = `Downloaded (${c.width} × ${c.height})`;
    } catch (err) { $('#sceneToast').textContent = err.message; }
    btn.disabled = false;
  });

  // ---------- look switch ----------
  document.querySelector('.looks').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    LOOK = b.dataset.look;
    document.querySelectorAll('.looks button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawSheet(); drawLab(); queueScene();
  });

  // ---------- pages ----------
  function route() {
    const h = location.hash.slice(1);
    view = h === 'luna-crown' || h === 'scenes' ? h : 'studio';
    document.querySelectorAll('.tabs a').forEach((a) => a.setAttribute('aria-current', a.dataset.view === view ? 'page' : 'false'));
    const sheetView = view !== 'scenes';
    $('#book').hidden = !sheetView; $('#lab').hidden = !sheetView; $('#how').hidden = view !== 'studio'; $('#scenes').hidden = sheetView;
    if (sheetView) {
      if (!work() || work().series !== view) currentId = cast.find((c) => c.series === view)?.id;
      drawSheet(); syncFields(); drawLab();
    } else queueScene();
  }
  addEventListener('hashchange', route);
  addEventListener('resize', drawRings);

  fetch('cast.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((d) => {
      original = d.friends; cast = original.map((c) => ({ ...c }));
      fillSceneSelects(); syncScene(); route();
    })
    .catch(() => { $('#sheet').textContent = 'The character sheet could not load. Refresh the page to try again.'; });
})();
