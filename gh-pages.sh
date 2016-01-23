#!/bin/bash

# Update gh-pages branch
git branch -D gh-pages
git checkout -b gh-pages HEAD

# Build assets
rm -rf build
npm run build

# Put build into public folder
rm public/build
cp -r build public/build

# Commit
git add -f public
git commit -m "Build GH pages"

# Push & reset
git push origin `git subtree split --prefix public HEAD`:gh-pages --force
git checkout -
