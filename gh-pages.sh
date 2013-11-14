#!/bin/sh

# Update gh-pages branch
git branch -D gh-pages
git checkout -b gh-pages master

# Compile assets
grunt build
grunt docs
git add -f build docs
git commit -m "Build GH pages"

# Push & reset
git push -f origin gh-pages
git checkout master
