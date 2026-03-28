# Phase 1 migration — test checklist / feature registry

This document is the **test checklist and feature registry** for the Phase 1 migration of ImgTor (DarkroomJS fork). Use it to plan unit, integration, and manual checks against `lib/js/**`, the bundle entry, TypeScript surface, and the demo.

## Test categories

| Category | Description |
|----------|-------------|
| **core** | Main `Darkroom` lifecycle, canvases, transformations stack, refresh/layout, DOM replacement. |
| **plugins** | Built-in plugins (`history`, `rotate`, `crop`, `save`), registration, options, and plugin-specific behaviour. |
| **api** | Public constructors, globals, and extension patterns (`extend`, plugin/transformation subclasses). |
| **ui** | Toolbar, button groups, buttons, classes, and SVG icon use. |
| **events** | Custom DOM events, Fabric canvas events, and cross-module event wiring. |
| **config** | Options merging, min/max dimensions, ratio, background, per-plugin options, disabling plugins. |
| **utils** | Shared helpers (`extend`, viewport math) and small pure modules. |
| **integration** | Bundle load order, Fabric global, built output, demo script with real DOM/canvas. |
| **regression** | Legacy behaviour and edge cases that must not break during migration (merge semantics, rotation/crop math, undo stack). |

## Sources in scope (Phase 1)

| Path | Role |
|------|------|
| `lib/entry-darkroom.js` | ESM entry; import order matches legacy concat. |
| `lib/js/**/*.js` | Runtime implementation. |
| `types/darkroom.d.ts` | Declared public API for consumers. |
| `demo/index.html` | Demo: Fabric + `build/darkroom.js`, sample `Darkroom` options. |

## Global API & entry

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| `entry-darkroom.js` imports | `lib/entry-darkroom.js` | integration | Loads bootstrap, core, plugin base, transformation, UI, utils, then four plugins in fixed order. |
| `Darkroom` (global) | `types/darkroom.d.ts`; impl `lib/js/core/darkroom.js` | api, core | Main class; `fabric` is external at runtime. |
| `Darkroom.plugins` | `darkroom.js` | api, plugins | Registry populated by plugin files (named keys on the default array). |
| `Darkroom.Utils` | `types/darkroom.d.ts`; impl `utils.js` | api, utils | `extend`, `computeImageViewPort`. |
| `Darkroom.Plugin` | `types/darkroom.d.ts`; impl `plugin.js` | api, plugins | Base plugin; `extend` for subclasses. |
| `Darkroom.Transformation` | `types/darkroom.d.ts`; impl `transformation.js` | api, core | Base transformation; `extend` for subclasses. |
| `Darkroom.UI` | `types/darkroom.d.ts`; impl `ui.js` | api, ui | `Toolbar`, `ButtonGroup`, `Button`. |

## Core: `Darkroom`

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| `Darkroom` constructor | `lib/js/core/darkroom.js` | core, api | Delegates to `constructor`; merges options with defaults; loads `element.src` into `Image`, then `_initializeDOM`, `_initializeImage`, `_initializePlugins`, `refresh`, then `options.initialize`. |
| `constructor` third arg `_plugins` | `darkroom.js` | core, regression | Currently unused; `_initializePlugins` always receives `Darkroom.plugins`. |
| `defaults` | `darkroom.js` | config | `min/max` width/height, `ratio`, `backgroundColor`, `plugins`, `initialize`. |
| `_initializeDOM` | `darkroom.js` | core, ui | Replaces `<img>` with container, toolbar, Fabric view + source canvases; keeps original img hidden; creates `Darkroom.UI.Toolbar`. |
| `_initializeImage` | `darkroom.js` | core | `fabric.Image` from original element on source canvas; viewport sizing via `computeImageViewPort`. |
| `_initializePlugins` | `darkroom.js` | plugins, config | Instantiates each plugin in `Darkroom.plugins` with `options.plugins[name]`; skips if `options === false`. |
| `refresh(next)` | `darkroom.js` | core | Clones source via `toDataURL`, `_replaceCurrentImage`; optional callback. |
| `_replaceCurrentImage` | `darkroom.js` | core, config | Replaces view `image`; applies ratio, min/max scaling, centers on canvas. |
| `applyTransformation` | `darkroom.js` | core | Pushes transformation, calls `applyTransformation(sourceCanvas, sourceImage, _postTransformation)`. |
| `_postTransformation` | `darkroom.js` | core, events | Updates `sourceImage` if provided; `refresh` then `dispatchEvent('core:transformation')`. |
| `reinitializeImage` | `darkroom.js` | core | Removes `sourceImage`, `_initializeImage`, replays `transformations` via `_popTransformation`. |
| `_popTransformation` | `darkroom.js` | core, events | Sequential apply; on empty stack dispatches `core:reinitialized` and `refresh()`. |
| `addEventListener` / `dispatchEvent` | `darkroom.js` | events | Forwards to Fabric canvas DOM element (`Event` with bubbles/cancelable). |
| `selfDestroy` | `darkroom.js` | core, plugins | Replaces container with new `<img>` from `sourceImage.toDataURL()`. |

## `Plugin` and `Transformation`

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| `Plugin` | `lib/js/core/plugin.js` | api, plugins | Sets `darkroom`, merges options with `defaults`, calls `initialize()`. |
| `Plugin.extend` | `plugin.js` | api, regression | Backbone-style subclassing; sets `__super__`. |
| `Transformation` | `lib/js/core/transformation.js` | api, core | Default `applyTransformation` no-op. |
| `Transformation.extend` | `transformation.js` | api, regression | Same pattern as `Plugin.extend`. |

## UI (`Darkroom.UI`)

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| `Toolbar` / `createButtonGroup` | `lib/js/core/ui.js` | ui | Appends `darkroom-button-group` div. |
| `ButtonGroup` / `createButton` | `ui.js` | ui, utils | Merges options with defaults; builds `<button>` with SVG `<use xlink:href="#{image}">`. |
| `Button` | `ui.js` | ui | `add/removeEventListener`, `active`, `hide`, `disable` via classes / `disabled`. |

## Plugins

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| `history` plugin | `lib/js/plugins/darkroom.history.js` | plugins, ui, events | Undo/redo stacks; listens `core:transformation`; toolbar undo/redo buttons. |
| `history.undo` / `redo` | `darkroom.history.js` | plugins, core, regression | Mutates `transformations` / `undoTransformations`, calls `reinitializeImage`. |
| `rotate` plugin | `lib/js/plugins/darkroom.rotate.js` | plugins, ui, core | Left/right buttons; `Rotation` transformation (+/-90°). |
| `Rotation` transformation | `darkroom.rotate.js` | core, utils | Rotates image, resizes source canvas to axis-aligned bbox, `next()`. |
| `crop` plugin | `lib/js/plugins/darkroom.crop.js` | plugins, ui, events, config | Crop mode, Fabric events, optional `quickCropKey`, ratio/min size; `applyTransformation` with `Crop`. |
| `Crop` transformation | `darkroom.crop.js` | core, integration | `toDataURL` region snapshot → new `fabric.Image`; `next(imgInstance)` or early exit if tiny. |
| `CropZone` (Fabric class) | `darkroom.crop.js` | ui, core | Custom `Rect` render: overlay, dashed grid, borders. |
| `crop` methods (selection) | `darkroom.crop.js` | plugins, ui | e.g. `toggleCrop`, `requireFocus`, `releaseFocus`, `selectZone`, `cropCurrentZone`, `_renderCropZone`, pointer/key handlers. |
| `save` plugin | `lib/js/plugins/darkroom.save.js` | plugins, ui, core | Save button; default callback calls `selfDestroy`. |

## Standalone modules & bootstrap

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| `extendObject` | `lib/js/extend-object.js` | utils, regression | ES module; enumerable own keys from `source` onto `target` only if `target` lacks key; `undefined` target → return `source`. |
| `Darkroom.Utils.extend` | `lib/js/core/utils.js` | utils | Thin wrapper around `extendObject`. |
| `boundingBoxForRotatedRect` | `lib/js/math-viewport.js` | utils, core | AABB for rotated rect; degrees like Fabric. |
| `computeImageViewPort` | `utils.js` | utils, core | Delegates to `boundingBoxForRotatedRect` using Fabric image getters. |
| `bootstrap` (icons) | `lib/js/core/bootstrap.js` | ui, integration | Injects `#darkroom-icons` with SVG sprite placeholder (`<!-- inject:svg -->`). |

## Demo

| Name | Location | Category tags | Behaviour note |
|------|----------|---------------|----------------|
| Script order | `demo/index.html` | integration | `./vendor/fabric.js` then `./build/darkroom.js`. |
| Inline init | `demo/index.html` | integration, config | `new Darkroom('#target', { min/max, ratio, backgroundColor, plugins.crop, initialize })`; optional `crop.requireFocus()` in `initialize`. |

## Coverage gaps (vs `tests/`)

Existing tests:

| Test file | What it covers |
|-----------|----------------|
| `tests/unit/extend-object.test.js` | `extendObject` only. |
| `tests/unit/math-viewport.test.js` | `boundingBoxForRotatedRect` only. |
| `tests/smoke.test.js` | `build/darkroom.js` and `build/darkroom.css` exist and contain expected substrings. |

**No automated tests yet for (non-exhaustive):**

- **`Darkroom`**: constructor (string vs element, null element), `_initializeDOM` structure, `_initializeImage`, `refresh` / `_replaceCurrentImage` (ratio, min/max scaling), `applyTransformation` / `_postTransformation`, `reinitializeImage` / `_popTransformation`, `selfDestroy`, `addEventListener` / `dispatchEvent`.
- **`Darkroom.Utils.extend`** as used with real option objects (not only `extendObject` in isolation).
- **`computeImageViewPort`** with mocked Fabric-like image objects.
- **`Plugin` / `Transformation`** and **`extend`** inheritance chains.
- **UI**: `Toolbar`, `ButtonGroup`, `Button` DOM and class toggles.
- **`bootstrap`**: injected icon container and sprite markup when build runs.
- **Plugins end-to-end**: `history`, `rotate`, `crop`, `save` (including `CropZone` rendering, crop ratios, `quickCropKey`, `crop:update`, undo/redo with transformation replay).
- **Events**: `core:transformation`, `core:reinitialized`, `crop:update` and their listeners.
- **Config**: `plugins[name] === false`, custom `initialize`, `save` callback override.
- **Integration / regression**: full bundle with JSDOM or browser harness, Fabric global, demo parity, CORS/`crossOrigin` behaviour (commented in core).
