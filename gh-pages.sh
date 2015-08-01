#!/bin/bash

# Update gh-pages branch
git branch -D gh-pages
git checkout -b gh-pages HEAD

# Build assets
rm -rf build
gulp build --prod

# Put build into demo folder
rm demo/build
cp -r build demo/build

# Commit
git add -f demo
git commit -m "Build GH pages"

# Push & reset
git push origin `git subtree split --prefix demo HEAD`:gh-pages --force
git checkout -
