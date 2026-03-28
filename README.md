# imgtorjs

![License MIT](http://img.shields.io/badge/license-MIT-blue.svg)

**imgtorjs** is a maintained fork of **[DarkroomJS](https://github.com/mattketmo/darkroomjs)** — an extensible image editing library for the browser built on HTML5 canvas and **Fabric.js** (rotation, cropping, plugins, toolbar). The upstream project is **discontinued**; this fork keeps the same MIT license and intent while modernising tooling, dependencies, and runtime targets under a new name.

| | Original | This fork |
|---|----------|-----------|
| **Name** | DarkroomJS | **imgtorjs** |
| **Repository** | [mattketmo/darkroomjs](https://github.com/mattketmo/darkroomjs) | `imgtorjs` (this repo) |
| **Status** | No longer maintained | Active maintenance / migration track |

Upstream credit: Matthieu Moquet and contributors to DarkroomJS. This fork may diverge in API and build layout as described in the migration plan.

## Migration plan (chained PRs)

Modernisation is intentionally split into **eleven sequential pull requests**, each building on the previous merge to `main`. **Sub-agents are not parallelised:** each PR blocks the next until it is merged. Each step has a dedicated **sub-agent prompt** (through security hardening, then **functional tests + feature docs**, then an **MCP-oriented block** for agents).

**Full chain and copy-paste agent prompts:** [docs/migration-subagents.md](docs/migration-subagents.md)

Summary of the chain:

1. Assess dependencies, frameworks, Node, and build tool  
2. Document codebase size, tests, frontend vs tooling, production intent  
3. Node.js 22 LTS and reproducible `npm install`  
4. `npm audit`, `npm-check-updates`, dependency-by-dependency plan  
5. ES5 → modern JS (const/let, arrows, templates, async/await where safe)  
6. Replace Gulp with Vite or esbuild  
7. Fabric.js / demo stack upgrades or documented pin  
8. ESLint, Prettier, optional TypeScript, test runner (DOM/canvas-ready)  
9. Security fixes, unused deps, secret scan  
10. **Functional tests** for every core feature and bundled plugin; **test matrix**; README + [docs/FEATURES.md](docs/FEATURES.md) kept in sync with code  
11. **MCP / agent operations pack** — handbook, resource catalog, Cursor notes ([docs/mcp/README.md](docs/mcp/README.md))  

The npm `package.json` field `name` may still read `darkroom` until a rename lands in a migration PR; the **public name for this fork is imgtorjs**.

### For AI agents

Start from [docs/mcp/imgtorjs-agent-handbook.md](docs/mcp/imgtorjs-agent-handbook.md) and the [feature catalogue](docs/FEATURES.md). The migration plan’s **PR 11** finalizes the MCP resource list and Cursor wiring ([docs/mcp/CURSOR.md](docs/mcp/CURSOR.md)).

---

## Historical note (upstream)

The text below is largely preserved from the original DarkroomJS README for API and concept documentation.

### Pintura alternative (upstream suggestion)

The original author suggested **[Pintura Image Editor](https://www.ktm.sh/pintura)** as a maintained commercial alternative. This fork does not replace that recommendation; it exists for users who want a small, MIT-licensed canvas editor lineage.

---

## Building

- Install [Node.js](https://nodejs.org/) (target **22 LTS** for the migration track; see [docs/migration-subagents.md](docs/migration-subagents.md)) and `npm`.
- Run `npm install` to install dependencies.
- Run `npm start` to build assets and start the demo webserver (currently Gulp-based until PR 6 in the migration chain).

## Features & plugins (summary)

Stable **IDs** below are for docs, tests, and automation. Full detail, edge cases, and event ordering live in **[docs/FEATURES.md](docs/FEATURES.md)**.

### Core

| ID | Summary | Entry points | Options (`Darkroom` defaults) | Events (DOM, on canvas element) | Source |
| --- | --- | --- | --- | --- | --- |
| `feature.core.initialization` | Replace `<img>` with toolbar + viewport/source Fabric canvases; load image | `new Darkroom(element, options)` — `element` is selector string or `HTMLImageElement` | `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `ratio`, `backgroundColor`, `plugins`, `initialize` | — | `lib/js/core/darkroom.js` (`_initializeDOM`, `_initializeImage`, `_initializePlugins`) |
| `feature.core.transformations` | Stack of `Transformation` instances; apply to source canvas then refresh viewport | `applyTransformation(transformation)` | — | `core:transformation` after refresh | `darkroom.js` |
| `feature.core.refresh` | Rebuild viewport image from `sourceImage` data URL; min/max/ratio scaling | `refresh(next?)` | uses constructor options | — | `darkroom.js` |
| `feature.core.reinitialize` | Rebuild from original element + replay transformation stack | `reinitializeImage()` | — | `core:reinitialized` when stack empty | `darkroom.js` |
| `feature.core.lifecycle` | Tear down UI and restore static `<img>` from edited source | `selfDestroy()` | — | — | `darkroom.js` |
| `feature.core.events` | Subscribe / emit custom DOM events on the Fabric canvas element | `addEventListener`, `dispatchEvent` | — | e.g. `core:transformation`, `core:reinitialized` | `darkroom.js` |
| `feature.core.plugin-base` | Plugin constructor merges `defaults` with `options.plugins[name]`; `false` disables plugin | `Darkroom.Plugin.extend({...})` | per-plugin `defaults` | — | `lib/js/core/plugin.js` |
| `feature.core.transformation-base` | `applyTransformation(sourceCanvas, sourceImage, next)` | `Darkroom.Transformation.extend` | per-transform `options` | — | `lib/js/core/transformation.js` |
| `feature.ui.toolbar` | Toolbar button groups and SVG icon buttons | `Darkroom.UI.Toolbar`, `ButtonGroup`, `Button` | button `image`, `type`, `hide`, `disabled` | — | `lib/js/core/ui.js` |
| `feature.bootstrap.svg-sprite` | Injected SVG defs for toolbar icons (`#darkroom-icons`) | runs on load | — | — | `lib/js/core/bootstrap.js` |

### Bundled plugins

| ID | Summary | Plugin key | Options (`plugins.<key>`) | Events | Source |
| --- | --- | --- | --- | --- | --- |
| `plugin.history` | Undo / redo transformation stack | `history` | (none in defaults) | listens: `core:transformation` | `lib/js/plugins/darkroom.history.js` |
| `plugin.rotate` | Rotate image ±90° via toolbar | `rotate` | (none) | — | `lib/js/plugins/darkroom.rotate.js` |
| `plugin.crop` | Interactive crop zone, ok/cancel, keyboard quick crop | `crop` | `minHeight`, `minWidth`, `ratio`, `quickCropKey` | `crop:update` (and listens `core:transformation`) | `lib/js/plugins/darkroom.crop.js` |
| `plugin.save` | Save button; default callback calls `selfDestroy()` | `save` | `callback` | — | `lib/js/plugins/darkroom.save.js` |

**Global prerequisites:** `fabric` global (Fabric.js), `window.Darkroom` after bundle load. Bundle order is defined in `gulpfile.js` (until migrated).

---

## Usage

Instantiate a new Darkroom object with a reference to the image element:

```html
<img src="some-image.jpg" id="target">
<script>
  new Darkroom('#target');
</script>
```

You can also pass some options:

```javascript
new Darkroom('#target', {
  // Canvas initialization size
  minWidth: 100,
  minHeight: 100,
  maxWidth: 500,
  maxHeight: 500,

  // Plugins options
  plugins: {
    crop: {
      minHeight: 50,
      minWidth: 50,
      ratio: 1
    },
    save: false // disable plugin
  },

  // Post initialization method
  initialize: function() {
    // Active crop selection
    this.plugins['crop'].requireFocus();

    // Add custom listener
    this.addEventListener('core:transformation', function() { /* ... */ });
  }
});
```

## Why?

It is easy to crop an image in a web page with a small script. For rotation, brightness, and extensible plugins, you either assemble pieces yourself or use a library. DarkroomJS / **imgtorjs** uses HTML5 canvas (via Fabric.js) without relying on jQuery for the core library.

## The concept

The library is designed to be easily extendable. The core script transforms the target image into a canvas with a Fabric.js instance and an empty toolbar. Features live in separate plugins; each plugin can add toolbar buttons and behaviour.

## Contributing

Run `npm develop` to build and watch files while developing (until the build migrates to Vite — see migration doc).

## FAQ

How can I access the edited image?

Ask the canvas for image data inside your callback (for example in the save plugin):

```javascript
save: {
      callback: function() {
          this.darkroom.selfDestroy(); // Cleanup
          var newImage = dkrm.canvas.toDataURL();
          fileStorageLocation = newImage;
      }
  }
```

## License

DarkroomJS / imgtorjs is released under the MIT License. See the [bundled LICENSE file](LICENSE) for details.
