# ImgTor (imgtorjs / DarkroomJS fork)

![License MIT](http://img.shields.io/badge/license-MIT-blue.svg)
[![CI](https://github.com/ai-tonia/imgtorjs/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ai-tonia/imgtorjs/actions/workflows/ci.yml)

**ImgTor** is the maintained fork of **[DarkroomJS](https://github.com/mattketmo/darkroomjs)** — an extensible image editing library for the browser on HTML5 canvas and **Fabric.js**. The repository is **imgtorjs**; the npm package name is **`imgtor`**. The upstream project is discontinued; this fork keeps the same MIT license and browser API (`window.Darkroom`) while modernising the toolchain (Vite, Dart Sass, Node 22+).

| | Original | This fork |
| --- | --- | --- |
| **Name** | DarkroomJS | **ImgTor** (npm: `imgtor`, repo: **imgtorjs**) |
| **Repository** | [mattketmo/darkroomjs](https://github.com/mattketmo/darkroomjs) | [ai-tonia/imgtorjs](https://github.com/ai-tonia/imgtorjs) |
| **Status** | No longer maintained | Active maintenance |

Upstream credit: Matthieu Moquet and contributors to DarkroomJS.

### Install from npm

```bash
npm install imgtor
```

The package ships **`build/darkroom.js`** and **`build/darkroom.css`** (generated before publish). You still need **Fabric.js 1.4.x** on the page before loading ImgTor.

**TypeScript:** types live in **`types/darkroom.d.ts`**. Use `/// <reference types="imgtor" />` or point `tsconfig` at that file so `Darkroom` is a known global.

## Migration plan (optional chained PRs)

Further modernisation can follow **eleven sequential pull requests** (each merge blocks the next). **Sub-agents should not run in parallel** for this chain.

**Prompts and order:** [docs/migration-subagents.md](docs/migration-subagents.md) (if that file exists in your checkout; it may live outside the published npm tarball).

Summary:

1. Assess dependencies and build tool  
2. Scope, tests, frontend vs tooling  
3. Node.js LTS and reproducible `npm install`  
4. `npm audit` / dependency plan  
5. Modern JS syntax  
6. Build tool (this fork uses **Vite** already)  
7. Fabric / demo stack  
8. ESLint, Prettier, Vitest (largely in place)  
9. Security pass  
10. Functional tests + [docs/FEATURES.md](docs/FEATURES.md) catalogue  
11. MCP / agent handbook ([docs/mcp/](docs/mcp/) if present)

### For AI agents

If present: [docs/mcp/imgtorjs-agent-handbook.md](docs/mcp/imgtorjs-agent-handbook.md), [docs/FEATURES.md](docs/FEATURES.md), [docs/mcp/CURSOR.md](docs/mcp/CURSOR.md).

## What changed in this fork

- **Build:** Gulp and native `node-sass` were replaced by **Vite** (IIFE bundle) and **Dart Sass** so installs work on current Node.
- **Tooling:** ESLint, Prettier, Vitest, Playwright e2e; see **CONTRIBUTING.md**.
- **Demo:** `npm start` builds, syncs assets into `demo/build/`, serves the demo on port **2222**.

## ⚠️ Upstream notice (historical)

The upstream library has been discontinued and is **no longer maintained** by the original author.

[![Pintura Image Editor demo](demo/images/doka-image-editor-gh.gif?raw=true 'Pintura Image Editor (click the image to view)')](https://www.ktm.sh/pintura)

**[[Demo] Try Pintura Image Editor →](https://www.ktm.sh/pintura)**

## Requirements

- **Node.js 22+** and npm (see `engines` in `package.json`)

## Fabric.js

The library targets **Fabric.js 1.4.x** (same era as the original DarkroomJS). The demo loads **`demo/vendor/fabric.js`**. Newer Fabric majors are a separate breaking effort; see **CONTRIBUTING.md**.

## Building

```bash
npm install
npm run build
```

The published npm tarball includes **`build/darkroom.js`** and **`build/darkroom.css`** (`package.json` `files`, `main`, `style`). **`npm publish`** runs **`prepublishOnly`** → **`npm run build`** first.

Built output goes to **`build/`** (gitignored locally). The demo loads **`./build/...`** under `demo/`, so **`npm start`** runs **`npm run build`**, **`npm run sync:demo`** (copies into **`demo/build/`**), then serves on port **2222**.

- **`npm start`** — build, sync demo assets, serve `demo/` on **2222**  
- **`npm run develop`** — watch JS (Vite) and SCSS (parallel watchers; stop with Ctrl+C)

## Features & plugins (summary)

Stable **IDs** for docs and tests. More detail: **[docs/FEATURES.md](docs/FEATURES.md)** when present.

### Core

| ID | Summary | Entry points | Options | Events | Source |
| --- | --- | --- | --- | --- | --- |
| `feature.core.initialization` | Replace `<img>` with toolbar + Fabric canvases | `new Darkroom(element, options)` | `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `ratio`, `backgroundColor`, `plugins`, `initialize` | — | `lib/js/core/darkroom.js` |
| `feature.core.transformations` | Transformation stack | `applyTransformation(transformation)` | — | `core:transformation` | `darkroom.js` |
| `feature.core.refresh` | Viewport from source image | `refresh(next?)` | constructor options | — | `darkroom.js` |
| `feature.core.reinitialize` | Replay stack from original | `reinitializeImage()` | — | `core:reinitialized` | `darkroom.js` |
| `feature.core.lifecycle` | Restore `<img>` from canvas | `selfDestroy()` | — | — | `darkroom.js` |
| `feature.core.events` | DOM events on canvas element | `addEventListener`, `dispatchEvent` | — | `core:*`, `crop:update` | `darkroom.js` |
| `feature.core.plugin-base` | Plugin `defaults` + `plugins[name]` | `Darkroom.Plugin.extend` | per-plugin | — | `lib/js/core/plugin.js` |
| `feature.core.transformation-base` | Canvas transform hook | `Darkroom.Transformation.extend` | per-transform | — | `lib/js/core/transformation.js` |
| `feature.ui.toolbar` | Toolbar / buttons | `Darkroom.UI.*` | — | — | `lib/js/core/ui.js` |
| `feature.bootstrap.svg-sprite` | Icon sprite (`#darkroom-icons`) | load | — | — | `lib/js/core/bootstrap.js` |

### Bundled plugins

| ID | Summary | Plugin key | Options | Events | Source |
| --- | --- | --- | --- | --- | --- |
| `plugin.history` | Undo / redo | `history` | — | listens `core:transformation` | `darkroom.history.js` |
| `plugin.rotate` | ±90° rotation | `rotate` | — | — | `darkroom.rotate.js` |
| `plugin.crop` | Crop UI | `crop` | `minHeight`, `minWidth`, `ratio`, `quickCropKey` | `crop:update` | `darkroom.crop.js` |
| `plugin.save` | Save / destroy | `save` | `callback` | — | `darkroom.save.js` |

**Globals:** `fabric`, then `window.Darkroom` after the bundle. Entry order is defined in **`lib/entry-darkroom.js`** / **Vite** config.

## Usage

```html
<img src="some-image.jpg" id="target" />
<script src="path/to/fabric.js"></script>
<script src="path/to/build/darkroom.js"></script>
<script>
  new Darkroom('#target');
</script>
```

```javascript
new Darkroom('#target', {
  minWidth: 100,
  minHeight: 100,
  maxWidth: 500,
  maxHeight: 500,
  plugins: {
    crop: { minHeight: 50, minWidth: 50, ratio: 1 },
    save: false,
  },
  initialize: function () {
    this.plugins['crop'].requireFocus();
    this.addEventListener('core:transformation', function () {
      /* ... */
    });
  },
});
```

## Why?

It is easy to crop an image on a page with a small script; for rotation and richer canvas editing you often use a library. This project uses **HTML5 canvas** (via Fabric.js) without jQuery in the core.

## The concept

The core turns the target image into a Fabric canvas and an empty toolbar. Features live in plugins; each plugin can add toolbar buttons and behaviour.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Quick start:

```bash
npm run develop
```

Checks:

```bash
npm test
npm run test:e2e
npm run lint
```

See [RELEASING.md](RELEASING.md) and [SECURITY.md](SECURITY.md).

## FAQ

How can I access the edited image?

Ask the canvas for data inside your save callback (or another hook):

```javascript
save: {
  callback: function () {
    this.darkroom.selfDestroy();
    const newImage = dkrm.canvas.toDataURL();
    fileStorageLocation = newImage;
  },
},
```

## License

Released under the MIT License. See [LICENSE](LICENSE).
