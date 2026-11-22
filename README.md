# Avishek & Baishali — Groom side (বরপক্ষ) invitation

Static site, no build step. Hosted on Cloudflare Pages; guest wishes are stored in Supabase (project `wedding`).

- `index.html`, `styles.css`, `app.js` — the invitation (same code on both sides)
- `config.js` — everything specific to this side: dates, time, venue, letter text, hosts
- `admin.html` — private page to read wishes (email magic-link login; only emails in `wedding_admins` can read)
- `og.jpg` — WhatsApp/Facebook link preview

## Change something
Edit `config.js` (e.g. `eventTime` once the lagna is fixed, and `countdownTo`), commit, push. Cloudflare redeploys in about a minute.

## Cloudflare Pages settings
Framework preset: None · Build command: (empty) · Build output directory: `/`
