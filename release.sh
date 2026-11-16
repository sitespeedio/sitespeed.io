#!/bin/bash
# Releases run on GitHub Actions — see .github/workflows/release.yml. This
# script is a thin wrapper that triggers the workflow and (separately) syncs
# the local ../onlinetest checkout, which is the only piece of the release
# flow that genuinely has to happen on the maintainer's machine.

set -e

case "${1:-}" in
  patch|minor|major)
    gh workflow run release.yml -f releaseType="$1"
    echo "Release workflow triggered. Track it with: gh run watch"
    ;;
  sync-onlinetest)
    if [ -d "../onlinetest" ] && [ -f "../onlinetest/release/update-cli-help.cjs" ]; then
      echo "Updating onlinetest CLI help…"
      bin/sitespeed.js --help-all | node ../onlinetest/release/update-cli-help.cjs -
      echo "  Remember to commit & push ../onlinetest/server/public/sitespeed-help.json"
    else
      echo "No onlinetest checkout at ../onlinetest — nothing to sync"
    fi
    ;;
  *)
    cat <<'EOF'
Usage: ./release.sh <patch|minor|major>
       ./release.sh sync-onlinetest

The patch/minor/major form triggers the GitHub Actions release workflow
(.github/workflows/release.yml). The actual release — version bump, docs
regeneration, npm publish with provenance, SBOM generation, GitHub
release and Docker image build — happens on GitHub from there.

After the release completes:
  git pull origin main
  ./release.sh sync-onlinetest   # only if ../onlinetest is checked out

Trusted Publishing on npmjs.com must be configured for sitespeed.io to
trust this workflow; without it the publish step in the workflow fails.
EOF
    exit 1
    ;;
esac
