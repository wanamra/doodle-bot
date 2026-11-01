# Amra's Doodle Bot ✦

A character sheet of hooded chibi friends, each drawn by code from a small JSON spec, in the **Little Magic Studio** style: kawaii, whimsical, magic, elves, wolves (Alpha and Luna), unicorns and pearls, in fineliner pen or coloured pencil.

**Live site:** https://wanamra.github.io/doodle-bot/

## How it works

1. **Request**: someone asks for a friend.
2. **Spec**: the bot fills in `specs/<name>.json` from fixed options only. It never draws pixels.
3. **Render**: `docs/index.html` draws the spec as an SVG doodle, the same way every time.
4. **Sheet**: the friend joins the character sheet with a washi-tape name label.

Because the bot can only pick parts that already exist, every new friend matches the style of the sheet.

## Repo layout

| path | what it is |
| --- | --- |
| `specs/` | one JSON spec per friend |
| `tools/build.mjs` | checks every spec and writes `docs/cast.json` |
| `docs/` | the website (GitHub Pages): renderer, sheet and spec lab |
| `AGENTS.md` | rules and steps for the bot that draws new friends |

## Add a friend by hand

```sh
cp specs/nova.json specs/willow.json   # then edit the values
node tools/build.mjs                   # checks specs, writes docs/cast.json
git add -A && git commit -m "draw Willow" && git push
```

Every allowed value is listed in `AGENTS.md`. The **Spec lab** on the site lets you try values and copy the spec.

## Preview locally

```sh
npx serve docs    # or: python3 -m http.server -d docs
```

Inspired by [kevintngo/doodle-bot](https://github.com/kevintngo/doodle-bot).
