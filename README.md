# Amra's Doodle Bot ✦

Hooded chibi characters, each drawn by code from a small JSON spec, in the **Little Magic Studio** style: kawaii, whimsical, magic, elves, wolves, unicorns and pearls, in fineliner pen or coloured pencil.

**Live site:** https://wanamra.github.io/doodle-bot/

## What you can do on the site

| Page | What it's for |
| --- | --- |
| **Studio** | The original six friends: Nova, Alpha, Luna, Elowen, Twinkle, Pearl |
| **The Luna Crown** | A werewolf microdrama cast: Selene (before and reborn), Alpha Caelan, Seraphina, Kieran, Lucian, the Moon Goddess and the gossiping pack |
| **Living scene** | The Silver Moon Courtyard: the Luna Crown pack living in a tappable world, told in four chapters (`docs/living.html`) |
| **Scene maker** | Put up to four characters on a background in a 9:16, 1:1 or 16:9 frame, add a caption, download a full-size PNG |

Every character has **PNG** (transparent, 1080 px tall) and **SVG** download buttons, and each page has **Download all** for a zip of the whole cast. The **Spec lab** lets you change any character, preview it, download it, and copy its spec.

## How it works

1. **Request**: someone asks for a character.
2. **Spec**: the bot fills in a JSON spec from fixed options only. It never draws pixels.
3. **Render**: `docs/renderer.js` draws the spec as an SVG doodle, the same way every time.
4. **Use**: download it, or drop it into a scene.

## Repo layout

| path | what it is |
| --- | --- |
| `specs/` | Studio friends, one JSON spec each |
| `specs/luna-crown/` | The Luna Crown cast |
| `tools/build.mjs` | checks every spec and writes `docs/cast.json` |
| `docs/renderer.js` | the renderer and the list of allowed values |
| `docs/app.js` | the site: sheets, downloads, spec lab, scene maker |
| `docs/living.js` | the living scene: courtyard, chapters, character lines, taps |
| `AGENTS.md` | rules and steps for the bot that draws new characters |

## Add a character by hand

```sh
cp specs/nova.json specs/willow.json   # or specs/luna-crown/<name>.json for the series
node tools/build.mjs                   # checks specs, writes docs/cast.json
git add -A && git commit -m "draw Willow" && git push
```

Every allowed value is listed in `AGENTS.md`.

## Preview locally

```sh
python3 -m http.server -d docs    # then open http://localhost:8000
```

Inspired by [kevintngo/doodle-bot](https://github.com/kevintngo/doodle-bot).
