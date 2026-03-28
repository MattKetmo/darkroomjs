# Releasing

Maintainer checklist for publishing **imgtor** to npm. For local setup (Node 22+, install, build, scripts), see [CONTRIBUTING.md](CONTRIBUTING.md).

## 1. Pre-release checks on `main`

On a clean `main` branch (merge release prep first if needed):

```bash
npm test
npm run lint
npm run audit
```

Resolve failures before tagging.

## 2. Version and changelog

1. Bump **`version`** in `package.json` to `X.Y.Z` (semver).
2. Update [CHANGELOG.md](CHANGELOG.md):
   - Move notes from **`## Unreleased`** into a new dated section immediately below it.
   - Use the same heading style as existing releases: `## X.Y.Z (YYYY-MM-DD)` (ISO date).
   - List changes as bullet points; use **bold** sparingly for emphasis, consistent with prior entries.
   - Leave an empty **`## Unreleased`** section at the top for the next cycle (optional blank line under the heading is fine).

Commit these edits on `main` (or merge a PR) before tagging.

## 3. Tag and push

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

Use an annotated tag (`-a`) so the release shows a clear message. If you use a signing key, add `-s` per your project policy.

## 4. Publish to npm

From the tagged tree (usually after `git checkout vX.Y.Z` or with `main` at that commit):

```bash
npm publish
```

**Note:** The `prepublishOnly` script runs **`npm run build`**, so the tarball includes fresh `build/` assets. Ensure you are logged in (`npm whoami`) and have publish rights to the package name.

## 5. GitHub Release

Create a **Release** from tag `vX.Y.Z`. Paste a short excerpt from the matching `## X.Y.Z (YYYY-MM-DD)` section in CHANGELOG as the release description (you may trim or link to the full changelog).

## 6. Post-publish verification

On the [npm package page](https://www.npmjs.com/package/imgtor), confirm **types** and **exports** are listed correctly for consumers (TypeScript and bundler resolution). Spot-check that the published version matches the tag and that `package.json` on the registry shows `types`, `exports`, `main`, and `style` as expected.
