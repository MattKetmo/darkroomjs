# imgtorjs — agent handbook

**Purpose:** One document for AI agents and automation to work safely on this repository.

## What this project is

- **imgtorjs** — maintained fork of DarkroomJS: in-browser image editing on HTML5 canvas using **Fabric.js**.
- **Not a Node server app** — library + demo; build tooling runs on Node.
- **Global API** — consumers load a bundle and use `new Darkroom(imgOrSelector, options)`.

## Read order (≤3 hops)

1. This handbook  
2. [../FEATURES.md](../FEATURES.md) — every feature/plugin ID and options  
3. [../migration-subagents.md](../migration-subagents.md) — if changing toolchain or release process  

Optional: root `README.md` (user-facing quick start).

**Migration PRs:** The eleven PRs in `migration-subagents.md` are **strictly sequential** — do not run those sub-agents in parallel; each PR must merge before the next starts.

## Commands (current baseline)

Until **PR 6** migrates the bundler:

- `npm install` — install devDependencies (Gulp stack).  
- `npm run develop` — Gulp watch + dev server (port **2222** per `gulpfile.js`).  
- `npm start` — `gulp server build --prod`.  

After migration, prefer scripts documented in `docs/migration/06-build-migration.md` (to be added in PR 6).

## Tests (after PR 8 / PR 10)

- `npm test` — once PR 10 lands, runs **functional** suite; see `docs/migration/10-test-matrix.md`.  
- Do not merge behaviour changes without updating tests and [FEATURES.md](../FEATURES.md).

## Public API cheat sheet

- `Darkroom` — constructor.  
- `darkroom.applyTransformation(t)`, `refresh`, `reinitializeImage`, `selfDestroy`.  
- `darkroom.addEventListener` / `dispatchEvent` — DOM events on canvas element.  
- Plugins: `history`, `rotate`, `crop`, `save` — register on `Darkroom.plugins['name']`; options under `options.plugins.name`.  

## Do / Don’t

**Do**

- Assume **Fabric** is a **global** `fabric` when using the classic bundle.  
- Use stable IDs from [FEATURES.md](../FEATURES.md) in tests and commits.  
- Keep README feature tables and FEATURES.md in sync when behaviour changes.  

**Don’t**

- Assume **jQuery** — core library does not require it.  
- Rename events (`core:transformation`, etc.) without a major version and doc update.  
- Commit secrets — scan per migration PR 9.  

## MCP resources

See [resources.json](resources.json) for paths to attach as MCP resources in your client.
