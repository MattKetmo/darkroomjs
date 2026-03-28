# Core vs features map (Phase 2.1)

This document describes how the Darkroom-style browser library in `lib/js/` splits **core engine** vs **features/plugins**, lists **static dependencies**, flags **tight coupling / magic values**, and suggests **Phase 3 extraction** targets. No code changes are implied here.

## Phase 2.1 — definitions (tailored to this repo)

**Core engine** — Code that defines the public `Darkroom` constructor, lifecycle (DOM replacement, Fabric view/source canvases, image pipeline, transformation stack, refresh), the **plugin and transformation base types** (`Darkroom.Plugin`, `Darkroom.Transformation`), **shared UI primitives** (`Darkroom.UI`), **shared utilities** (`Darkroom.Utils` and its pure helpers), and **bundle bootstrap** (SVG sprite injection, entry load order). Core code is what you need to host *any* editor surface; it assumes **global `fabric`** and attaches **`window.Darkroom`**.

**Feature / plugin** — Code that registers on `Darkroom.plugins['…']`, adds toolbar actions, listens for core/custom events, and/or implements a concrete transformation for a specific tool (crop, rotate, undo/redo, save). Features may still call core APIs (`applyTransformation`, `toolbar`, `dispatchEvent`, etc.).

**Mixed** — A single file that contains both a **reusable transformation** (image pipeline) and **plugin-specific UI / Fabric subclass**; split is noted per file.

**Entry** — `lib/entry-darkroom.js` is not runtime logic but defines **mandatory script order** (same contract as the legacy Gulp concat pipeline). Treat it as **core packaging**, not a user-facing “plugin.”

---

## File classification

| Path | Role |
|------|------|
| `lib/entry-darkroom.js` | **Core (packaging)** — ordered side-effect imports only |
| `lib/js/core/bootstrap.js` | **Core** — injects hidden `#darkroom-icons` sprite container |
| `lib/js/core/darkroom.js` | **Core** — `Darkroom` instance, canvases, transformations stack, plugin init |
| `lib/js/core/plugin.js` | **Core** — `Darkroom.Plugin` base + `extend` |
| `lib/js/core/transformation.js` | **Core** — `Darkroom.Transformation` base + `extend` |
| `lib/js/core/ui.js` | **Core** — `Darkroom.UI` (Toolbar, ButtonGroup, Button) |
| `lib/js/core/utils.js` | **Core** — `Darkroom.Utils` facade |
| `lib/js/extend-object.js` | **Core** — `extendObject` (merge defaults); tested from `tests/unit/` |
| `lib/js/math-viewport.js` | **Core** — `boundingBoxForRotatedRect`; tested from `tests/unit/` |
| `lib/js/plugins/darkroom.history.js` | **Feature** — undo/redo plugin |
| `lib/js/plugins/darkroom.save.js` | **Feature** — save / `selfDestroy` callback plugin |
| `lib/js/plugins/darkroom.rotate.js` | **Feature** — **mixed**: inline `Rotation` transformation + rotate toolbar plugin |
| `lib/js/plugins/darkroom.crop.js` | **Feature** — **mixed**: inline `Crop` transformation + `CropZone` Fabric subclass + crop UI plugin |

---

## Static dependency notes

**ES modules (`import` / `export`)**

- `lib/entry-darkroom.js` → `./js/core/bootstrap.js`, `darkroom.js`, `plugin.js`, `transformation.js`, `ui.js`, `utils.js`, then `./js/plugins/darkroom.history.js`, `darkroom.rotate.js`, `darkroom.crop.js`, `darkroom.save.js` (order matters for side effects).
- `lib/js/core/utils.js` → `../extend-object.js` (`extendObject`), `../math-viewport.js` (`boundingBoxForRotatedRect`).

**Runtime globals (no `import` in file)**

- All `lib/js/core/*.js` (except `utils.js`) and all `plugins/*.js` rely on **`Darkroom`** already existing on `window` (IIFE pattern after `darkroom.js` runs).
- **`fabric`** is global in: `darkroom.js`, `darkroom.history.js` (IIFE arg), `darkroom.crop.js`, `darkroom.rotate.js` (via `fabric.Image`, `fabric.Canvas`, `fabric.util`, etc.).
- **`document` / `window`**: `bootstrap.js`, `darkroom.js`, `ui.js`, plugins (DOM events, `fabric.document` in crop).

**Cross-core references**

- `darkroom.js` → `Darkroom.Utils.computeImageViewPort`, `Darkroom.UI.Toolbar`, `fabric.Canvas` / `fabric.Image`.
- `plugin.js`, `transformation.js` → `Darkroom.Utils.extend` (at runtime when `.extend()` is called).
- `ui.js` → `Darkroom.Utils.extend` for button defaults.

**Plugin registry**

- Plugins assign **`Darkroom.plugins['history' | 'save' | 'crop' | 'rotate']`**; `darkroom.js` initializes from **`Darkroom.plugins`** (starts as `[]` but gains string-keyed constructor properties — array used as object bag).

**External test imports**

- `tests/unit/extend-object.test.js` → `lib/js/extend-object.js`
- `tests/unit/math-viewport.test.js` → `lib/js/math-viewport.js`

**Build**

- `vite.config.js` references `lib/entry-darkroom.js` as entry and treats `lib/js/core/bootstrap.js` specially (injection hook).

---

## Hardcoded values, magic strings, tight coupling (file:line)

**`lib/js/core/bootstrap.js`**

- `6`: `id = 'darkroom-icons'`
- `11`: placeholder `<!-- inject:svg -->` (build-time coupling)
- Inline styles on injected div (`height`/`width`/`position`/`visibility`)

**`lib/js/core/darkroom.js`**

- `49`: default `backgroundColor: '#fff'`
- `91`: commented `crossOrigin`
- `123`, `127`: `fabric.Image`, `toDataURL()` pipeline
- `209`, `224`: custom events `'core:transformation'`, `'core:reinitialized'`
- `245`, `249`, `254`, `261`, `262`, `269`: class names `darkroom-container`, `darkroom-toolbar`, `darkroom-image-container`, `darkroom-source-container`, `display: none`
- `278–286`: Fabric canvas options `selection: false`, `backgroundColor` from options
- `293–305`: long list of Fabric image lock flags (duplicated conceptually in crop plugin)

**`lib/js/core/ui.js`**

- `18`: `darkroom-button-group`
- `33–36`: default button meta `'help'`, `'default'` group
- `44–46`: BEM-ish `darkroom-button`, `darkroom-button-${type}`, SVG `#${options.image}` / `xlink:href`
- `70–75`: class names `darkroom-button-active`, `darkroom-button-hidden`

**`lib/js/core/plugin.js` / `transformation.js`**

- Backbone-style `extend` / `Surrogate` pattern tightly coupled to `Darkroom.Utils.extend`

**`lib/js/plugins/darkroom.history.js`**

- `11`: listens for `'core:transformation'`
- `43–50`: icon ids `'undo'`, `'redo'`
- `69`: IIFE closes over global `fabric` (unused parameter `_fabric` — dead coupling)

**`lib/js/plugins/darkroom.save.js`**

- `14–16`: icon `'save'`; default callback calls `selfDestroy`

**`lib/js/plugins/darkroom.rotate.js`**

- `6`, `44`, `48`, `52`: angles `-90`, `90`, `% 360` in transformation
- `31–37`: icons `'rotate-left'`, `'rotate-right'`
- `9–14`: duplicates AABB math similar to `math-viewport.js` (inline sin/cos, not imported)

**`lib/js/plugins/darkroom.crop.js`**

- `24–52`: `Crop` uses `fabric.Image`, `canvas.toDataURL({ left, top, width, height })`
- `52–170`: `CropZone` — `fabric.util.createClass`, hardcoded `dashWidth = 7`, overlay `rgba(0,0,0,0.5)`, stroke colors, grid thirds `(1/3)`, `(2/3)`
- `172+`: plugin — icons `'crop'`, `'done'`, `'close'`; types `'success'`, `'danger'`
- `215–222`: Fabric canvas events `mouse:down`, `mouse:move`, `mouse:up`, `object:moving`, `object:scaling`; `fabric.util.addListener(fabric.document, 'keydown'|'keyup')`
- `249`, `301`, `445`, `538`, `656`: custom event `'crop:update'`
- `224`: listens `'core:transformation'`
- `392–414`: `event.keyCode` vs `quickCropKey` (legacy key API)
- `498–511`: `CropZone` Fabric options (`cornerColor: '#444'`, `cornerSize: 8`, etc.)

**`lib/entry-darkroom.js`**

- Comment documents **global `fabric`** prerequisite; order couples bootstrap → core → plugins

---

## Extraction candidates (Phase 3 — `src/core` vs `src/plugins`)

1. **Pure helpers** — `extend-object.js`, `math-viewport.js` → `src/core` (already isolated; keep unit tests co-located or update paths only).
2. **`Darkroom.Utils` + `computeImageViewPort`** — `src/core/utils` (single place for viewport math).
3. **Transformation base + shared “static image” Fabric defaults** — dedupe lock flags between `darkroom._initializeImage` and crop’s new `fabric.Image` into a small `src/core/fabric-image-defaults` or helper (optional hygiene).
4. **`Rotation` class** — move from `darkroom.rotate.js` to `src/core/transformations/rotate.js` or `src/plugins/rotate/transformation.js` if you want core to stay UI-free; rotate plugin stays in `src/plugins/rotate`.
5. **`Crop` transformation vs `CropZone` vs plugin** — split into `transformation` (pipeline) + `crop-zone` (Fabric object) + `plugin` (toolbar/events) under `src/plugins/crop/`.
6. **Event name constants** — `'core:transformation'`, `'core:reinitialized'`, `'crop:update'` → shared `src/core/events.js` (or similar) to avoid string drift.
7. **UI primitives** — `Darkroom.UI` → `src/core/ui` if all plugins must share; alternatively `src/core/ui-shell` + plugin-specific buttons in each plugin if you want thinner core.
8. **Bootstrap / sprite** — `bootstrap.js` + Vite inject → `src/core/icons` or build asset pipeline only.
9. **Plugin registry** — replace `Darkroom.plugins` array-as-bag with explicit registration API (`registerPlugin('history', …)`) in `src/core` for clearer dependency graph and tree-shaking later.
10. **Global `fabric`** — document or inject via `src/core/fabric.js` adapter for easier Fabric upgrades (called out in `CONTRIBUTING.md`).

---

## References in repo

- `README.md` — feature matrix pointing at `lib/js/core/*` and plugins
- `CONTRIBUTING.md` — `lib/js/` and Fabric upgrade scope
- `vite.config.js` — entry and bootstrap injection
- `tests/unit/*.test.js` — `extend-object`, `math-viewport`
