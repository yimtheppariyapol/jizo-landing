# BOOK-REPORT — Jizo's first book

**Title:** ทำยังไงไม่ให้ fleet พังเงียบ (How to keep the fleet from failing silently)
**Subtitle:** detect → safe-auto-heal → self-verify
**Author:** 🗿 Jizo (AI · ไม่ใช่คน · Rule 6)
**Date written:** 2026-06-23
**Branch:** `book/fleet-no-silent-failure` (NOT pushed, NOT on master)

## What I built

My first long-form **book** (not a blog post), written in the fleet house-style proven by
Tonk (`/read`) and Dustboy (`/books`): คำนำ → numbered chapters → one stated principle per
chapter (blockquote) → ✅/❌ marks → self-test close → cover + inline-SVG diagrams → honest
proposal-vs-built table.

The book documents **real infra I built the same day** — the self-healing git + skill
propagation monitor for box `hello-oracle`:
- `~/.hermes/bin/fleet-git-health.sh` — detect 4 invariants (detached-HEAD, behind, unpushed, mirror-drift) + self-verify post-state + quiet-when-healthy alert policy.
- `~/.hermes/bin/fleet-git-recover.sh` — SAFE-auto recovery (lock → backup branch → `checkout -B main origin/main` → cherry-pick box-only → push, never `--force`; conflict/reject → exit non-zero, alert a human).

### Structure (คำนำ + 5 chapters + appendix + close)
1. **คำนำ** — ความเงียบที่แพงที่สุด (the silent-failure saga) + term-definition box.
2. **บทที่ 1** — the propagation chain & how a single broken link stops skills silently. *Principle: ความเงียบไม่ใช่หลักฐานว่าปกติ.* (inline SVG: propagation chain)
3. **บทที่ 2** — detect by asserting invariants, not by matching known symptoms. *Principle: นิยามสุขภาพเป็น invariant.*
4. **บทที่ 3** — safe-auto-heal only the clean case; snapshot before touching; never `--force`. *Principle: auto ได้เฉพาะกรณีสะอาด.*
5. **บทที่ 4** — self-verify: exit 0 ≠ fixed; measure post-state. *Principle: verify-before-claim applied to the healer.* (inline SVG: detect→heal→verify loop)
6. **บทที่ 5** — quiet-when-healthy alerting + q30min timer modeled on jizo-health-monitor. *Principle: alert fatigue kills monitors.*
7. **ภาคผนวก** — honest proposal-vs-built table.
8. **ปิดเล่ม** — 3 takeaways + References.

### Proof-grounded claims (verified against the real box before writing)
- `fleet-git-recover.sh` actually ran: repo `hello-oracle` holds `backup/auto-recover-20260622-181646`, `backup/auto-recover-20260622-184706`, `backup/pre-gitfix-20260623`.
- propagation chain is real: `~/.hermes/config.yaml` → `external_dirs: /root/labs/skills-mirror/skills`.
- Honestly flagged the **systemd q30min timer as PROPOSED / install-step** — not confirmed installed on the box at write time (the rest is BUILT + ran). Stated plainly in the proposal-vs-built table.

## Files added
- `src/pages/read/fleet-no-silent-failure.astro` — the reader route (book body, in-page anchored chapter TOC with scroll-spy, 2 inline SVG diagrams, principle/self-test/✅❌ styling).
- `src/pages/read/index.astro` — the `/read` library (ห้องสมุด) index page with cover card.
- `public/books/fleet-no-silent-failure.svg` — typographic cover (1200×630, site palette).
- `src/layouts/Base.astro` — added a `/read` (ห้องสมุด) link to the footer nav (1 line).
- `BOOK-REPORT.md` — this file.

## Build result — PASS

```
$ bun run build
01:39:48 ▶ src/pages/read/fleet-no-silent-failure.astro
01:39:48   └─ /read/fleet-no-silent-failure/index.html
01:39:48 ▶ src/pages/read/index.astro
01:39:48   └─ /read/index.html
01:39:48 ✓ Completed in 69ms.
01:39:48 [build] 17 page(s) built in 1.08s
01:39:48 [build] Complete!
```

Verified: both `/read` routes built, cover SVG copied to `dist/books/`, both inline SVG
diagrams present in the built HTML, **0 em-dashes** in published prose (converted to `·`).

## House-style checklist
- [x] Source = real work (my own infra, built 2026-06-23), cited file-by-file
- [x] คำนำ + numbered chapters, hook → mechanism → 1 principle → ✅/❌ → self-test each
- [x] proposal-vs-built stated honestly (timer = PROPOSED, rest = BUILT)
- [x] Thai-first prose, no em-dash, terms defined once (ศัพท์ที่ใช้ box)
- [x] Cover SVG + 2 inline-SVG diagrams (propagation chain + detect→heal→verify loop)
- [x] AI byline (Rule 6)
- [x] library page + reader route with anchored chapter TOC
- [x] `bun run build` passes (proof above)
- [x] committed on `book/...` branch, nothing pushed to master

## Deploy command Yim would run to ship it
This is human-gated; I did NOT push or deploy. To ship:

```bash
cd /root/labs/jizo-landing
git checkout master
git merge --no-ff book/fleet-no-silent-failure
git push origin master   # the deploy-freshness loop redeploys on push to master
```

(Or open a PR from `book/fleet-no-silent-failure` and merge after review.)
Live URL after deploy: https://jizo.buildwithoracle.com/read/fleet-no-silent-failure
