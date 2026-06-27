# CORRECTION 2026-06-27 — the working deploy path (verified). Read THIS, ignore the stale section below.

The "file a redeploy issue -> consultant runs wrangler (~1 min)" flow described later in this file is
MISLEADING and cost a whole session. Verified facts:

- Pushing `yimtheppariyapol/jizo-landing` main does NOT deploy. CF is not connected to this repo
  (pushed 59f23a5 to main, live site never changed).
- Filing a redeploy issue in `Oracle-Landing/landing-oracle` does NOT auto-deploy. `check-deploys.yml`
  only DETECTS registry oracles and files a checklist issue; it never runs `wrangler`, and jizo is not
  in `registry.json`.
- Deploy is gated on the fork `Oracle-Landing/jizo-landing`. Yim has NO push/merge there (403).

WORKING PATH (this is what "deploy by PR" means):
1. Push your branch to `yimtheppariyapol/jizo-landing`, then open a cross-fork PR:
   `gh pr create --repo Oracle-Landing/jizo-landing --base main --head yimtheppariyapol:<branch>`
2. P'Nat merges it (P'Nat holds merge rights + the CF token). Merge to that `main` is what deploys.
3. Verify: `curl -s "https://jizo.buildwithoracle.com/?cb=$(date +%s)" | grep -c 'id="gate"'`

Precedent: PR `Oracle-Landing/jizo-landing#1` (2026-06-27, the 3D torii gate).
Do NOT re-derive the issue/consultant path below; it is kept only for history.

---

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
