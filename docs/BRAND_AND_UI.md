# Brand & UI (Steel Sisters & Striders — Ballari)

The in-app visual system is aligned with the official **logo** (`public/brand/logo-full.jpg`, sourced from the master artwork).

## Palette (Tailwind)

| Token | Role |
|--------|------|
| `paper` | Void background (`#050408`) and subtle tints (`raised`, `muted`, `deep` borders) |
| `ink` | Primary text on dark surfaces |
| `violet` | Logo ribbon purple — primary actions, focus, links |
| `magenta` | Stride accent — secondary CTAs and highlights |
| `steel` | Chrome / silver — borders, secondary copy, metallic feel |
| `energy` / `energy-soft` | Gradients (violet → silver / magenta) |

## Typography

- **Display:** Montserrat (uppercase headings, athletic poster feel)
- **Body:** Inter

## Surfaces

- Default experience is **dark-first** (logo on black).
- Cards use `bg-paper-raised`; fields use `bg-paper-muted` for separation from cards.

## Assets

- **Full lockup:** `public/brand/logo-full.jpg` — used on the marketing home page and in the signed-in top bar.
- **PWA icons** (`/icons/*`, apple touch) are unchanged in this pass; regenerate from the logo when you want pixel-perfect app icons.

## Source file

Canonical logo asset: **`public/brand/logo-full.jpg`** (served at **`/brand/logo-full.jpg`**).
