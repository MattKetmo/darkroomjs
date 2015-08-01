#!/bin/bash

# Update gh-pages branch
git branch -D gh-pages
git checkout -b gh-pages HEAD

# Build demo
rm -rf build
rm -rf demo/{build,vendor}
gulp build --prod
cp -r build demo/build
mkdir demo/vendor
cp bower_components/fabric/dist/fabric.min.js demo/vendor/fabric.js

# Commit
git add -f demo
git commit -m "Build GH pages"

# Push & reset
git push origin `git subtree split --prefix demo HEAD`:gh-pages --force
git checkout -
