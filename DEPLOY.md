# Deploying jizo.buildwithoracle.com

**Pushing to `main` does NOT make it live.** The site is a Cloudflare **Worker** on the
fleet CF account, published by the `Oracle-Landing/landing-oracle` **consultant** —
consultant-gated, not git-auto-deploy. jizo is **not** in the consultant's
`deployments/registry.json`, so nothing redeploys on push by itself.

## Ship a change (one command, from the box)
```
./deploy-request.sh "what changed"
```
It builds, pushes source to `origin/main`, and files the redeploy issue in
`Oracle-Landing/landing-oracle`. The consultant loop picks it up (~1 min) and runs
`npx wrangler deploy`. Then verify (expect `200`):
```
curl -s -o /dev/null -w "%{http_code}\n" "https://jizo.buildwithoracle.com/read/<slug>/?cb=$(date +%s)"
```

## Confirmed dead-ends (2026-06-26) — don't re-spelunk
- The box **cannot** run the CF deploy itself: no fleet CF token, `wrangler` not authed, no consultant checkout on box.
- `maw talk-to jizo` / Discord DM do **not** deliver deploy requests (jizo federation node = 0 active agents; bot-to-bot DM blocked).
- Pushing `main` alone ≠ live.
- The **only** trigger that works = the Oracle-Landing redeploy issue. Precedent: #48 deploy, #50/#51/#53 redeploy, #54 (book 2, verified 200 in ~1 min).

## Durable upgrade (needs P'Nat)
Add a `jizo` entry to `landing-oracle/deployments/registry.json` so the freshness-loop
auto-redeploys on source change. Full box-side self-deploy would need the fleet CF token
(account a5eabdc2) placed on the box — that is P'Nat's credential decision.
