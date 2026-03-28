# imgtorjs — feature & plugin catalogue

Canonical reference for **behaviour**, **API surface**, and **automation IDs**. Keep this file aligned with code and with the **test matrix** (`docs/migration/10-test-matrix.md` once PR 10 lands). The README duplicates a short summary for discoverability.

## Conventions

- **ID** — Stable string; use in tests and docs (`feature.*`, `plugin.*`).
- **Entry points** — Globals / constructors intended for integrators.
- **Options** — Merged with plugin `defaults` via `Darkroom.Utils.extend`; `plugins.<name> === false` disables a plugin.

## Runtime globals

| Symbol | Role |
| --- | --- |
| `window.fabric` | Fabric.js (currently vendored in demo; see `bower.json` / build) |
| `window.Darkroom` | Main constructor and namespace |
| `Darkroom.plugins` | Map of plugin constructors (`history`, `rotate`, `crop`, `save`) |
| `Darkroom.Plugin`, `Darkroom.Transformation` | Base classes with `.extend` |

## Core features

### `feature.core.initialization`

- **Summary:** On `Image` load, wraps the target `<img>` in a `.darkroom-container`, builds toolbar + visible Fabric canvas + hidden source canvas, instantiates plugins from `Darkroom.plugins`.
- **Constructor:** `new Darkroom(element, options)` — `element` string selector or `HTMLImageElement`; missing element returns without throwing (early exit).
- **Options (defaults):** `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `ratio`, `backgroundColor`, `plugins` (per-plugin sub-options), `initialize` callback invoked after first `refresh`.
- **Files:** `lib/js/core/darkroom.js`

### `feature.core.transformations`

- **Summary:** `applyTransformation` pushes a transformation, runs `applyTransformation` on source canvas/image, then `refresh` and dispatches `core:transformation`.
- **API:** `applyTransformation(transformationInstance)`
- **Files:** `lib/js/core/darkroom.js`, `lib/js/core/transformation.js`

### `feature.core.refresh`

- **Summary:** Serializes `sourceImage` to a data URL, loads it into a new Fabric image on the viewport canvas; applies ratio and min/max dimension scaling; centers image.
- **API:** `refresh(callback?)`
- **Files:** `lib/js/core/darkroom.js`

### `feature.core.reinitialize`

- **Summary:** Clears source image, re-imports from original `<img>`, reapplies all transformations in order; when stack is empty dispatches `core:reinitialized` and `refresh`.
- **API:** `reinitializeImage()`
- **Files:** `lib/js/core/darkroom.js`

### `feature.core.lifecycle`

- **Summary:** `selfDestroy()` replaces the container with a new `<img>` whose `src` is `sourceImage.toDataURL()`.
- **API:** `selfDestroy()`
- **Files:** `lib/js/core/darkroom.js`

### `feature.core.events`

- **Summary:** Custom events are created with `document.createEvent` / `initEvent` and dispatched on the **Fabric canvas DOM element** (`canvas.getElement()`).
- **API:** `addEventListener(name, cb)`, `dispatchEvent(name)`
- **Documented names:** `core:transformation`, `core:reinitialized`, `crop:update` (crop plugin)

### `feature.core.plugin-base`

- **Summary:** Each plugin is `Darkroom.Plugin.extend({ defaults, initialize, ... })`; options come from `options.plugins[name]`.
- **Files:** `lib/js/core/plugin.js`

### `feature.core.transformation-base`

- **Summary:** `Darkroom.Transformation.extend({ applyTransformation(canvas, image, next) })`; implementors call `next(newImage?)`.
- **Files:** `lib/js/core/transformation.js`, `lib/js/plugins/darkroom.rotate.js`, `lib/js/plugins/darkroom.crop.js` (Crop transformation)

### `feature.ui.toolbar`

- **Summary:** `Toolbar.createButtonGroup()` appends a `.darkroom-button-group`; buttons use SVG `<use href="#iconId">` referencing injected sprite.
- **Files:** `lib/js/core/ui.js`

### `feature.bootstrap.svg-sprite`

- **Summary:** Injects `<!-- inject:svg -->` placeholder replaced at build with icon sprite; element `#darkroom-icons`.
- **Files:** `lib/js/core/bootstrap.js`, `gulpfile.js` (inject pipeline)

## Plugins

### `plugin.history`

- **Behaviour:** Undo pops last transformation and `reinitializeImage`; redo reapplies from internal stack. Toolbar undo/redo buttons enable/disable based on stack lengths.
- **Options:** None in `defaults`.
- **Events:** Listens `core:transformation` to update button state.
- **Files:** `lib/js/plugins/darkroom.history.js`

### `plugin.rotate`

- **Behaviour:** Left/right buttons apply `Rotation` transformation with angle ±90.
- **Options:** None.
- **Files:** `lib/js/plugins/darkroom.rotate.js`

### `plugin.crop`

- **Behaviour:** Toggle crop mode, draw/resize crop zone (Fabric rect), confirm applies `Crop` transformation; cancel releases focus. Listens to canvas mouse + keyboard (`quickCropKey`). Clamps zone to canvas; dispatches `crop:update` on move/scale. Releases on `core:transformation`.
- **Options:** `minHeight`, `minWidth`, `ratio`, `quickCropKey` (key code or false).
- **Events emitted:** `crop:update`
- **Public methods (instance):** `requireFocus()` forces crop mode UI (see `darkroom.crop.js`).
- **Files:** `lib/js/plugins/darkroom.crop.js`

### `plugin.save`

- **Behaviour:** Save button triggers `options.callback`; default destroys darkroom via `selfDestroy`.
- **Options:** `callback`
- **Files:** `lib/js/plugins/darkroom.save.js`

## Build / bundle

- **Current:** Gulp concat order in `gulpfile.js`: `bootstrap`, `darkroom`, core `*.js`, then `history`, `rotate`, `crop`, `save`.
- **After migration PR 6:** Expect Vite/esbuild; this section should be updated to match entrypoints.

## Testing expectations (PR 10)

Every **ID** in this document should appear in `docs/migration/10-test-matrix.md` with at least one mapped automated test. Prefer the same IDs in `describe`/`it` titles or tags for grep-ability.
