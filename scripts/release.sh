#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
echo "Repo root: $ROOT"

echo "1) Install and build"
npm --prefix "$ROOT/backend" ci
npm --prefix "$ROOT/frontend" ci
npm --prefix "$ROOT/backend" run build
npm --prefix "$ROOT/frontend" run build

echo "2) Run lint (non-fatal)"
npm --prefix "$ROOT/backend" run lint || true
npm --prefix "$ROOT/frontend" run lint || true

echo "3) Run audit (non-fatal)"
npm --prefix "$ROOT/backend" audit --audit-level=high || true
npm --prefix "$ROOT/frontend" audit --audit-level=high || true

echo "4) Create release branch and tag (local)"
read -p "Release version (e.g. v1.0.0): " VERSION
git checkout -b "release/$VERSION"
git add -A
git commit -m "chore(release): prepare $VERSION" || echo "no changes to commit"
git tag -a "$VERSION" -m "Release $VERSION"

echo "Release prepared locally. Push with:" 
echo "  git push origin release/$VERSION && git push origin $VERSION"
