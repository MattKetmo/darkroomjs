#!/bin/bash
set -euo pipefail

# Update gh-pages branch (run from repo root after npm install)
git branch -D gh-pages 2>/dev/null || true
git checkout -b gh-pages HEAD

npm run build
npm run sync:demo

git add -f demo
git commit -m "Build GH pages"

git push origin "$(git subtree split --prefix demo HEAD)":gh-pages --force
git checkout -
