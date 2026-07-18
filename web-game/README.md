# 雷鸣战场 Web

Phaser 3 + TypeScript + Vite. Tank / samolyot jangi, baza ishlab chiqarish, PC va mobile boshqaruv.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda Vite ko‘rsatgan URL (odatda http://localhost:5173).

## Skriptlar

| Buyruq | Vazifa |
|--------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Buildni ko‘rish |

## Boshqaruv

- **Main Menu** — PC/Mobile, jamoa, jang
- **PC:** WASD, Space, sichqoncha, R, ESC
- **Mobile:** joystick pack, OT / B / R / AI / ☰
- Zavod / aerodrom / vertolyot maydoni ustiga bosing → ishlab chiqarish

## Papkalar

- `src/game/scenes` — Boot, Preload, MainMenu, Battle
- `src/game/entities` — Tank, Aircraft, Building, Projectile
- `src/game/ui` — BuildMenu, MobileControls, ConfirmDialog
- `public/assets` — tanks, aircraft, buildings, maps, ui, audio

## Netlify

Repo ildizidagi `netlify.toml` avtomatik sozlaydi (`base=web-game`, `publish=dist`).  
Lokal: `npm run build && npm run preview`
