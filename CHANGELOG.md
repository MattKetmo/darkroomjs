# Change Log

All notable changes to this project will be documented in this file.

## Unreleased

## 3.1.2 (2026-03-28)

- **npm:** `keywords` and `bugs` URL for discoverability
- **e2e:** Playwright **`demo.toolbar.spec.js`** — toolbar visible, four button groups, eight visible buttons (demo enables crop focus on load)

## 3.1.1 (2026-03-28)

- Include **RELEASING.md** in the npm package `files` list (next to SECURITY.md)

## 3.1.0 (2026-03-28)

- Add **SECURITY.md** (responsible disclosure) and **RELEASING.md** (maintainer checklist)
- Add **Playwright** demo smoke test (`npm run test:e2e`) and run it in CI with Chromium
- Publish **SECURITY.md** in the npm package `files` list for discoverability

## 3.0.0 (2026-03-28)

- **Breaking (fork):** npm **`imgtor`** v3 — ImgTor modernization (Node 22+, Vite, Vitest, GitHub Actions CI)
- TypeScript **ambient types** for global `Darkroom` (`types/darkroom.d.ts`); **`exports`** and **`types`** in `package.json`
- **Dependabot** weekly npm updates (grouped devDependencies)
- Demo and docs: ImgTor / **ai-tonia/imgtorjs**; README CI badge and `npm install imgtor`
- npm **`main`**, **`style`**, **`files`**, **`prepublishOnly`** for publishing built assets
- **`sync:demo`**: copy `build/` → `demo/build/` (no symlink)
- Remove **Bower**; shared **`extendObject`** and viewport math with unit tests
- Modern DOM APIs (`addEventListener` / `Event`)
- Add type **button** to avoid HTML5 submit validation (#24)

## 2.0.0 (2015-08-01)

- Use of **Gulp** for the build process
- Replace the webfont by **SVG symbols** (which are direclty included in the compiled javascript)
- Ability to change **canvas ratio**
- Original image is kept and changes are done on a clone

## 1.0.x (2014)

Initial release.

- Create canvas with FabricJS from an image element
- Plugins: Crop, History, Rotate, Save
- Build process via Grunt
- Build webfont from SVG files to display the icons
