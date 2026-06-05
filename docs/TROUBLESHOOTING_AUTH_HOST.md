# Troubleshooting: `localhost` in auth cookies / redirects (Auth.js / NextAuth v5)

## Symptom

In the browser (or in copied `curl` traces), requests to **`https://sister-stride.intelliforge.tech`** include a cookie like:

```http
Cookie: … authjs.callback-url=http%3A%2F%2Flocalhost%3A3000 …
```

Decoded: **`authjs.callback-url=http://localhost:3000`**

You may also see redirects, magic links, or post-login URLs that point at **`http://localhost:3000`** even though the user is on the production host.

---

## What that cookie is

Auth.js (NextAuth v5) stores a **callback URL hint** in a cookie (name prefix `authjs.`). It is used with CSRF, sign-in, and sign-out flows so the server knows where to send the user after auth completes.

That value is **not** taken from the browser’s address bar by magic on every request: it is **written by your app’s `/api/auth/*` responses** (`Set-Cookie`) using the **canonical site URL** Auth.js believes your app lives at.

So if the cookie says **`http://localhost:3000`**, your **production server** (at some point) told the browser: “the canonical callback base is localhost.”

---

## Root cause (almost always): `AUTH_URL` on the server

Auth.js reads **`AUTH_URL`** (and may still read legacy **`NEXTAUTH_URL`** in some setups) to build absolute URLs and cookies.

If **Vercel → Project → Settings → Environment Variables → Production** has:

- `AUTH_URL=http://localhost:3000`  
  **or**
- `AUTH_URL` **missing** and another code path falls back to a localhost default,

then production `Set-Cookie` can legitimately emit **`authjs.callback-url=http://localhost:3000`**.

That matches copying values from **`.env.example`** or local `.env` into Vercel by mistake.

`trustHost: true` in `src/auth.config.ts` helps Auth.js trust **`x-forwarded-host`** for the **incoming request**, but **an explicit wrong `AUTH_URL` can still override** canonical URL behavior for cookies and redirects depending on Auth.js version and route.

---

## Why your `curl` shows both localhost cookie and a correct `callbackUrl` in the body

In your trace, the **credentials** POST includes (correct):

`callbackUrl=https://sister-stride.intelliforge.tech/walking-to-5k/register`

while the **Cookie** header still sends:

`authjs.callback-url=http://localhost:3000`

That usually means:

1. **Earlier** responses (e.g. first `GET /api/auth/csrf` or `GET /api/auth/session`) **set** the callback cookie to localhost (bad `AUTH_URL`).
2. The **sign-in** client then POSTs the **right** `callbackUrl` in the form body (from `window.location` / your app).
3. The browser **still sends the old cookie** until it expires or is overwritten. Auth.js may prefer one source over the other depending on the route; mismatches can produce confusing redirects or “wrong host” behavior.

So: **fix the server env and clear cookies**, not only the POST body.

---

## Secondary cause: stale cookies after you fixed Vercel

If you **already corrected** `AUTH_URL` on Vercel but a user still has `authjs.callback-url=http://localhost:3000`, that cookie can linger until:

- it expires, or  
- the user clears **site data** for `sister-stride.intelliforge.tech` (or uses a private window).

After changing `AUTH_URL`, **redeploy** and ask testers to **clear cookies** once.

---

## Tertiary: default in `next-auth` client `parseUrl`

The `next-auth` client bundle uses `parseUrl(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL)` for internal `__NEXTAUTH` metadata. If those are **undefined in the browser bundle**, the library’s **default** is `http://localhost:3000/api/auth` for parsing helpers.

For **same-origin fetches**, the client still uses a **relative** `/api/auth` path, so many flows work. **Cookies are set by the server**, so the bad value still traces back to **server `AUTH_URL` / mis-set cookies**, not only this default.

---

## Fix checklist (production)

1. **Vercel → Environment Variables → Production**  
   Set **`AUTH_URL`** to your real public origin, e.g.  
   **`https://sister-stride.intelliforge.tech`**  
   (no trailing slash is fine; must be **`https`**, not `http://localhost`.)

2. Remove or correct any **`NEXTAUTH_URL`** left over if it still says `localhost`.

3. **Redeploy** after saving env (Vercel does not apply new env to old deployments).

4. **Clear cookies** for the site (or whole origin) for anyone who tested before the fix.

5. Confirm **`vercel env ls`** (or dashboard) for **Preview** / **Development** if you test those environments — each can have its own wrong `AUTH_URL`.

---

## Related repo docs

- [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) — canonical production URL and `AUTH_URL` alignment.  
- [DATABASE_ENV.md](./DATABASE_ENV.md) — env loading for local vs Vercel.

---

## Optional: verify without the browser

From a machine with no cookies:

```bash
curl -sI "https://sister-stride.intelliforge.tech/api/auth/csrf" | rg -i "set-cookie|callback"
```

Inspect **`Set-Cookie`** lines. After `AUTH_URL` is correct, new sessions should **not** set `authjs.callback-url` to localhost.
