# 雷鸣战场 · Web

Brauzerda ishlaydigan tank jangi demosi (**Phaser 3 + TypeScript + Vite**).

> GitHubga faqat `web-game/` (kod + `public/assets`) yuklanadi.  
> `.rwmod`, extract qilingan modlar, joystick pack va to‘liq Rusted Warfare o‘rnatmasi **gitignore**da — lokal manba sifatida qoladi.

## O‘yin (Rusted Warfare ruhida)

Kredit yig‘ish → zavod/aerodromdan birlik → dushman bazasini yo‘q qilish.  
UI/FX: RW `res/drawable` dan (credits chip, portlash, chang, menu title).

## Tezkor start

```bash
cd web-game
npm install
npm run dev
```

Brauzer: http://localhost:5173 (yoki Vite ko‘rsatgan port)

## Boshqaruv

| | PC | Mobile |
|---|---|---|
| Harakat | WASD | Joystick |
| Otish | Space / chap tugma | **OT** |
| Birlik almashtirish | R | **R** |
| Zavod menyusi | baza ustiga bosish / 1–4 | **B** yoki baza |
| Menyuga | ESC | ☰ |

Main Menu: **PC / Mobile**, jamoa (Axis / Allies), jang turi → start.

## Repo tuzilmasi

```
mod/
├── web-game/          ← GitHubga ketadigan o‘yin
│   ├── src/
│   ├── public/assets/ ← sprite, ovoz, xarita
│   └── package.json
├── .gitignore         ← manba packlar ignore
└── (lokal manba)      ← .rwmod, extract, RW install…
```

## Build

```bash
cd web-game
npm run build
npm run preview
```

## Netlify

Repo ildizida `netlify.toml` bor:

| Sozlama | Qiymat |
|---------|--------|
| Base directory | `web-game` |
| Build command | `npm run build` |
| Publish | `dist` |
| Node | 20 |

**Deploy:** Netlify → Add new site → Import from Git → shu repo.

Lokal tekshiruv:

```bash
cd web-game
npm run build
npm run preview
```

Keyin http://localhost:4173 oching — Netlifydagi kabi production build.
