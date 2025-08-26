#!/usr/bin/env bash
set -euo pipefail

# GitHub repo bootstrap for mcp-mobile-server
# Requirements: GitHub CLI (gh) authenticated, git installed
# Usage:
#   OWNER=your-github-user-or-org \
#   REPO=mcp-mobile-server \
#   VISIBILITY=public \  # or private / internal (for orgs)
#   ./scripts/gh-setup.sh

OWNER="${OWNER:-}"
REPO="${REPO:-mcp-mobile-server}"
VISIBILITY="${VISIBILITY:-public}"
DESCRIPTION="Native MCP Server for Mobile Development (Android, iOS, Flutter)"
TOPICS="mcp,model-context-protocol,mobile,android,ios,flutter,cli,typescript,automation,devtools"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) is required. Install: https://cli.github.com/" >&2
  exit 1
fi

if [[ -z "${OWNER}" ]]; then
  echo "ERROR: Set OWNER=<your-github-username-or-org> as an env var." >&2
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "ERROR: Run this script from the mcp-mobile-server directory (where package.json resides)." >&2
  exit 1
fi

# Initialize git repo if needed
if [[ ! -d .git ]]; then
  git init
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: initial open-source setup"
fi

git branch -M main || true

# Create repo on GitHub (if it doesn't exist) and push
if ! gh repo view "${OWNER}/${REPO}" >/dev/null 2>&1; then
  gh repo create "${OWNER}/${REPO}" \
    --${VISIBILITY} \
    --description "${DESCRIPTION}" \
    --source . \
    --remote origin \
    --push
else
  # If repo exists, just set remote and push
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/${OWNER}/${REPO}.git"
  git push -u origin main
fi

# Set topics and enable discussions
gh repo edit "${OWNER}/${REPO}" --add-topic "${TOPICS}" --enable-discussions || true

# Create common labels (idempotent)
create_label() { gh label create "$1" --color "$2" --description "$3" 2>/dev/null || gh label edit "$1" --color "$2" --description "$3"; }
create_label bug FF0000 "Something isn't working"
create_label enhancement 36A3F7 "New feature or improvement"
create_label security 8B0000 "Security-related issue"
create_label "good first issue" 7057ff "Good for newcomers"

# Optional: basic branch protection (requires appropriate scopes). Uncomment if desired.
# gh api \
#   --method PUT \
#   -H "Accept: application/vnd.github+json" \
#   "/repos/${OWNER}/${REPO}/branches/main/protection" \
#   -f required_status_checks='{"strict":true,"contexts":["build-test-validate"]}' \
#   -f enforce_admins=true \
#   -f required_pull_request_reviews='{"required_approving_review_count":1}' \
#   -f restrictions='null'

echo "Done. Repo: https://github.com/${OWNER}/${REPO}"
