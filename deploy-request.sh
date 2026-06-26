#!/usr/bin/env bash
# Ship a jizo-landing change live to jizo.buildwithoracle.com — runnable from the box.
#
# WHY: pushing to main does NOT auto-deploy. The site is a Cloudflare Worker on the
# fleet account, published by the Oracle-Landing/landing-oracle consultant
# (consultant-gated, not git-auto-deploy; jizo is not in its registry). This script
# builds, pushes source, and files the redeploy issue the consultant loop picks up (~1 min).
set -euo pipefail
cd "$(dirname "$0")"
REASON="${1:-content update}"

echo "==> build"
npm run build

echo "==> push source to origin/main"
git push origin HEAD:main

echo "==> file redeploy request (consultant runs the actual CF deploy)"
gh issue create --repo Oracle-Landing/landing-oracle \
  --title "Redeploy Jizo 🗿 → jizo.buildwithoracle.com (${REASON})" \
  --body "Source is on main; please redeploy jizo.buildwithoracle.com. Reason: ${REASON}"

echo "==> done. Verify live in ~1-2 min (expect 200):"
echo '    curl -s -o /dev/null -w "%{http_code}\n" "https://jizo.buildwithoracle.com/read/<slug>/?cb=$(date +%s)"'
