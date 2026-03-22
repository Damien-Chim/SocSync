# Share your local app with ngrok

Expose `http://localhost:3000` (Next.js dev) on a public HTTPS URL.

## Prereqs

1. **Dev server running** in another terminal: `pnpm dev`
2. **ngrok** installed and logged in (`ngrok config add-authtoken <token>` from [dashboard.ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken))

## Start the tunnel

```bash
pnpm tunnel
# same as: ngrok http 3000
```

## Get your link

- **Web UI:** open [http://127.0.0.1:4040](http://127.0.0.1:4040) — copy the **Forwarding** `https://….ngrok-free.app` URL.
- **CLI:** `curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url'`

**Free tier:** the subdomain **changes each time** you restart ngrok (unless you use a paid reserved domain).

**Browser warning:** first-time visitors may see ngrok’s interstitial page — click **Visit Site**.

## Supabase / auth

If you test **login or signup** through the tunnel, add your ngrok URL to Supabase:

**Authentication → URL configuration → Redirect URLs** (and Site URL if needed), e.g. `https://YOUR-SUBDOMAIN.ngrok-free.app/**`

## Troubleshooting

- **Agent too old:** `brew upgrade ngrok/ngrok/ngrok`
- **Wrong port:** if dev uses another port, e.g. `ngrok http 3001`
