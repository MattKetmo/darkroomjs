# Migration chain: sub-agent prompts and PR order

This repo is a maintained fork of [DarkroomJS](https://github.com/mattketmo/darkroomjs) under the name **imgtorjs**. Work is split into **eleven sequential pull requests**. Each PR should merge to `main` (or your default branch) before the next branch is opened **from the updated `main`**, so every step builds on the previous one.

**See also:** [parallel-subagents-and-pr-stack.md](./migration/parallel-subagents-and-pr-stack.md) for **safe parallel lanes** (docs + separate test files), the **Phase 1–5 stack**, and **concrete branch names / `gh pr create` commands** for tidy PR batches.

## Blocking chain — no parallel sub-agents

**Sub-agents must not run in parallel** for the **eleven migration refactors** below (runtime moves, Gulp removal, etc.): PR *N+1* should not start until PR *N* is **merged** into `main` and you have pulled/rebased. **Exception:** short **test-infra / unit-test** batches may use a **two-step branch stack** (`migration/pr-01-*` then `migration/pr-02-*`) as documented in the parallel stack file—merge PR 1 first, rebase PR 2 onto `main`, then merge PR 2.

**Convention**

- Branch naming: `migration/0N-short-slug` (e.g. `migration/01-assess`).
- Open PR *N* only after PR *N−1* is **merged** (not merely approved).
- Each sub-agent run should commit with a message like `migration(0N): <summary>`.

---

## PR 1 — Sub-agent: assess what you have

**Branch:** `migration/01-assess`  
**Goal:** Produce a written assessment; no behavioural rewrites yet.

**Prompt (copy for a sub-agent):**

> You are working in the imgtorjs repo (fork of DarkroomJS).  
>
> 1. Read `package.json` and list every dependency and devDependency with exact semver ranges.
> 2. Identify frameworks/libraries: check `lib/js/**/*.js`, `demo/`, `bower.json`, and vendored `demo/vendor/fabric.js`. Note jQuery, Backbone, Angular 1.x, React, etc., if any.
> 3. Infer required Node.js from `engines` in package.json, CI configs, or Gulp 3.x compatibility; state assumptions if `engines` is missing.
> 4. Identify the build tool (here: **Gulp 3** with concat, sass, uglify, gulp-connect, etc.) and list gulp tasks from `gulpfile.js`.
>
> Deliverable: add `docs/migration/01-assessment.md` with these findings and a one-paragraph technical summary.

**Acceptance:** `docs/migration/01-assessment.md` exists and is accurate against the repo.

---

## PR 2 — Sub-agent: understand the scope

**Branch:** `migration/02-scope` (from `main` after PR 1)

**Prompt:**

> Using `01-assessment.md` and the tree, document migration scope.  
>
> 1. Approximate codebase size (LOC or file counts for `lib/`, `demo/`).
> 2. List any test suite (`test/`, `tests/`, `*.spec.js`, CI).
> 3. Classify: frontend library, demo app, Node tooling only, or mixed.
> 4. Note upstream status (original project discontinued) and whether this fork targets production maintenance.
>
> Deliverable: `docs/migration/02-scope.md`.

**Acceptance:** `02-scope.md` answers all four areas with evidence (paths, commands run).

---

## PR 3 — Sub-agent: update the runtime first

**Branch:** `migration/03-node-runtime` (from `main` after PR 2)

**Prompt:**

> 1. Target **Node.js 22 LTS** (as of 2026). Add or update `"engines": { "node": ">=22 <23" }` in `package.json` if appropriate for the team.
> 2. Run `node --version` and `npm --version`; paste outputs into `docs/migration/03-node-install-log.md`.
> 3. Run `npm install` from a clean `node_modules` (document `rm -rf node_modules` if used). Capture **full** errors/warnings in the same log file.
> 4. Do not upgrade Gulp stack in this PR unless required to install; if install fails, document and apply the **minimal** change needed to get a reproducible install on Node 22.
>
> Deliverable: `03-node-install-log.md` + any minimal `package.json` / lockfile fix.

**Acceptance:** A developer on Node 22 can follow the doc and complete install (or the doc explains the blocker).

---

## PR 4 — Sub-agent: audit dependencies

**Branch:** `migration/04-audit-deps` (from `main` after PR 3)

**Prompt:**

> 1. Run `npm audit` and save human-readable summary to `docs/migration/04-npm-audit.txt` (or `.md`).
> 2. Run `npx npm-check-updates` (or document why it cannot run) and save output to `docs/migration/04-ncu.txt`.
> 3. Produce `docs/migration/04-dependency-plan.md`: ordered list of packages to bump **one at a time** in follow-up PRs, with risk notes (Gulp 3 → 4 is a major jump; prefer replacing with Vite in PR 6 per plan).
>
> **Do not** mass-update every dependency in this PR.

**Acceptance:** Audit + NCU artifacts and a dependency-by-dependency plan.

---

## PR 5 — Sub-agent: modernise JS syntax

**Branch:** `migration/05-modern-js` (from `main` after PR 4)

**Prompt:**

> In `lib/js/**/*.js` and `gulpfile.js` (only where needed for consistency), modernise syntax without changing public API behaviour:  
>
> - Prefer `const`/`let` over `var`.  
> - Arrow functions where they preserve `this` semantics correctly.  
> - Template literals, destructuring, optional chaining only where safe.  
> - Replace callback-only flows with `async`/`await` **only** when equivalent and tests/demo still work.  
> If the project stays on CommonJS for now, keep `require` unless PR 6 introduces ESM build.  
> Deliverable: code changes + short `docs/migration/05-syntax-notes.md` listing files touched and any intentional non-migrations (e.g. Fabric global).

**Acceptance:** Demo/build still runs; notes explain boundaries.

---

## PR 6 — Sub-agent: replace or remove the build tool

**Branch:** `migration/06-build-tool` (from `main` after PR 5)

**Prompt:**

> Replace **Gulp 3** with **Vite** or **esbuild** (team choice; Vite recommended for dev server + SCSS).  
>
> 1. Reproduce current outputs: bundled `darkroom.js` / CSS (and SVG sprite behaviour if applicable).
> 2. Update `package.json` scripts (`develop`, `start`, `build`).
> 3. Remove Gulp-only dependencies once redundant.
> 4. Document commands in `docs/migration/06-build-migration.md`.
>
> Ensure `demo` can be served for local testing.

**Acceptance:** One-command dev and production build; Gulp removed or clearly deprecated in docs.

---

## PR 7 — Sub-agent: update or replace the framework

**Branch:** `migration/07-framework` (from `main` after PR 6)

**Prompt:**

> This library uses **Fabric.js** (vendored / bower-era). Plan and execute **one** of:  
>
> - Upgrade Fabric to a supported version and fix breaking API changes; or  
> - Document why Fabric stays pinned and isolate vendor file with version + license note.  
> If jQuery appears only in demo, trim or replace with native DOM APIs.  
> No full Angular/Backbone rewrite expected here unless discovered; state N/A in `docs/migration/07-framework.md` if not applicable.

**Acceptance:** `07-framework.md` states decision; demo works.

---

## PR 8 — Sub-agent: add or modernise tooling

**Branch:** `migration/08-tooling` (from `main` after PR 7)

**Prompt:**

> Add **ESLint** (flat config preferred) with sensible modern rules, **Prettier**, and wire `lint` / `format` scripts.  
> Add **TypeScript** only if the team agrees the library size warrants it; otherwise document “deferred” in `docs/migration/08-tooling.md`.  
> Add **Vitest** or **Jest** with config suited to **browser/DOM** testing (e.g. `happy-dom` / `jsdom`, or Playwright test runner if you prefer e2e for canvas). PR 10 will add a **full functional suite**, not only smoke tests.  
> Deliverable: config files + README section pointer.

**Acceptance:** `npm run lint` (and format) work; TS/test decision documented.

---

## PR 9 — Sub-agent: fix security issues

**Branch:** `migration/09-security` (from `main` after PR 8)

**Prompt:**

> 1. Apply `npm audit fix` where safe; document any remaining issues in `docs/migration/09-security.md`.
> 2. Remove unused dependencies (verify with dep check or manual proof).
> 3. Grep for hardcoded secrets, API keys, tokens (`apiKey`, `secret`, `password=`, high-entropy strings); document findings (even if none).
>
> Deliverable: dependency cleanup + security notes.

**Acceptance:** Audit improved or exceptions documented; no secrets committed.

---

## PR 10 — Sub-agent: functional tests + feature documentation

**Branch:** `migration/10-functional-tests-docs` (from `main` after PR 9)

**Prompt:**

> **Testing (functional, not smoke-only)**  
> 1. Using the test runner from PR 8, add **functional tests** so that **every core feature and every bundled plugin** has explicit coverage. Treat “feature” as user-visible behaviour (toolbar, transformation, lifecycle), not only internal helpers.  
> 2. Maintain a **coverage matrix** in `docs/migration/10-test-matrix.md`: rows = feature/plugin IDs, columns = test file + brief scenario (e.g. “rotate right applies 90° transformation”, “history undo pops last transformation”). **No row without at least one test.**  
> 3. Prefer fast unit/integration tests with Fabric/jsdom where fidelity allows; use browser/e2e tests only where canvas behaviour cannot be trusted in jsdom—document the split in `docs/migration/10-test-strategy.md`.  
> 4. If a feature is untestable in CI without a real browser, add a **skipped-with-reason** test or a Playwright (or similar) job—do not leave features silently untested.  
>
> **Documentation (README + agent-friendly)**  
> 5. Update **root `README.md`** with a dedicated **“Features & plugins”** section structured for both humans and **AI agents**: stable headings, tables with columns such as **ID**, **Summary**, **Entry points** (global/API), **Options** (`defaults` / `plugins.*`), **Events emitted**, **Source file(s)**. Cover at minimum: core (`Darkroom` constructor, `applyTransformation`, `refresh`, `selfDestroy`, `addEventListener` / `dispatchEvent`), transformation pipeline, toolbar/UI, and each plugin: `history`, `rotate`, `crop`, `save`.  
> 6. Add `docs/FEATURES.md` as a **canonical catalogue** (can mirror README tables with more detail: edge cases, event ordering, known limitations). README should link to it.  
> 7. Ensure CI runs `npm test` on every push/PR if CI exists.  
>
> Deliverables: green functional suite, `10-test-matrix.md`, `10-test-strategy.md`, updated README + `docs/FEATURES.md`.

**Acceptance:**

- `docs/migration/10-test-matrix.md` lists every feature/plugin in the bundle; each has ≥1 mapped test.  
- `npm test` passes in CI (or documented blocker with follow-up issue).  
- README + `docs/FEATURES.md` match the code and use explicit, grep-friendly **IDs** (e.g. `feature.core.initialization`, `plugin.crop`).

---

## PR 11 — Sub-agent: MCP block for agents

**Branch:** `migration/11-mcp-agents` (from `main` after PR 10)

**Prompt:**

> Agents and IDE integrations should operate this library **without spelunking** the whole repo. Add an **MCP-oriented documentation block** (no requirement to publish a separate npm MCP server unless the team wants it).  
>
> 1. **Handbook:** Finalize `docs/mcp/imgtorjs-agent-handbook.md` as the single “how to work with imgtorjs” doc: clone → install → build → test commands; public API cheat sheet; link to `docs/FEATURES.md` and test matrix; **do / don’t** (e.g. do not assume jQuery; Fabric global/version).  
> 2. **Resource catalog:** Maintain `docs/mcp/resources.json` listing logical resource IDs, human titles, and **repo-relative paths** so a maintainer can expose them via MCP “filesystem” or custom server (e.g. `imgtorjs/handbook` → `docs/mcp/imgtorjs-agent-handbook.md`). **Include** `docs/migration/10-test-matrix.md` as `imgtorjs/test-matrix` once PR 10 has merged (file must exist).  
> 3. **Cursor / agent wiring:** Add `docs/mcp/CURSOR.md` with copy-paste instructions: suggested `@`-mentions or file includes for agents; optional snippet for `.cursor/mcp.json` **placeholder** (user fills paths/servers)—do not commit secrets.  
> 4. **Root pointer:** Add a short **“For AI agents”** subsection in `README.md` linking to `docs/mcp/README.md` and the handbook.  
>
> Deliverables: handbook, `resources.json`, `CURSOR.md`, `docs/mcp/README.md` (index), README pointer.

**Acceptance:**

- A new contributor (or agent) can follow `docs/mcp/README.md` and locate all canonical docs in ≤3 hops.  
- `resources.json` is valid JSON and lists every file agents should prioritize (handbook, FEATURES, migration chain, **and** `10-test-matrix.md` after PR 10).

---

## Quick reference: merge order

| PR  | Branch slug                 | Main output                                              |
| --- | --------------------------- | -------------------------------------------------------- |
| 1   | `01-assess`                 | `01-assessment.md`                                       |
| 2   | `02-scope`                  | `02-scope.md`                                            |
| 3   | `03-node-runtime`           | `03-node-install-log.md`                                 |
| 4   | `04-audit-deps`             | audit + NCU + plan                                       |
| 5   | `05-modern-js`              | ES modern syntax                                         |
| 6   | `06-build-tool`             | Vite/esbuild                                             |
| 7   | `07-framework`              | Fabric / demo                                            |
| 8   | `08-tooling`                | ESLint, Prettier, optional TS, test runner               |
| 9   | `09-security`               | audit + cleanup + secret scan                            |
| 10  | `10-functional-tests-docs`  | functional tests + README + `docs/FEATURES.md` + matrix  |
| 11  | `11-mcp-agents`             | MCP doc block + resources catalog + Cursor notes           |

After PR 11, consider a single release commit: bump version, tag, and publish under the **imgtorjs** package name if publishing to npm.

---

## Cursor Task tool usage

**Sequential only:** run **one** sub-agent at a time for this chain. Wait for merge to `main`, then start the next PR’s sub-agent.

For each PR, spawn a sub-agent with `subagent_type: generalPurpose` or `explore` as appropriate, paste the **Prompt** block for that PR, and require the **Acceptance** criteria before opening the PR. Always set the sub-agent’s git branch to the listed `migration/…` branch and base it on **current `main`** after the previous PR is merged. PRs **10** and **11** are documentation- and test-heavy; allow larger diffs but keep commits scoped per PR.

**Do not** launch parallel Task sub-agents for PRs 1–11 or combine “explore all PRs” in one go — that breaks the blocking guarantees above.