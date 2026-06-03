# Progressive Web App (PWA)

Sister Stride is installable as a PWA using [**Serwist**](https://serwist.pages.dev/docs/next/getting-started) (`@serwist/next`).

## What you get

- **`/manifest.webmanifest`** — from `src/app/manifest.ts` (name, colours, `standalone`, icons).
- **Service worker** — `public/sw.js` is **generated at `next build`** (not committed). Precache + runtime caching via Serwist defaults; **document** offline fallback at **`/~offline`**.
- **Install / Add to Home Screen** — supported on modern mobile browsers over **HTTPS** (e.g. production on Vercel or your custom domain).
- **Dev** — Serwist is **disabled** when `NODE_ENV === "development"` in `next.config.mjs` so `next dev` stays predictable.

## Icons

Brand-colour PNGs live under `public/icons/` and `public/apple-touch-icon.png`. Regenerate after changing colours:

```bash
npm run gen:pwa-icons
```

Requires `sharp` (devDependency).

## Middleware

`middleware.ts` excludes `sw.js`, `manifest.webmanifest`, `swe-worker*`, and `icons/` so auth middleware does not intercept PWA assets.

## Optional: `window.serwist`

Serwist prepends a small client entry that registers the service worker. For TypeScript when you call `window.serwist` yourself, keep `src/serwist-env.d.ts` (references `@serwist/next/typings`).

## Related

- [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) — production URL must use **HTTPS** for the service worker to register.
