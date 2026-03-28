# Parallel subagents and stackable PRs

This complements [migration-subagents.md](../migration-subagents.md): **large refactors** (core extraction, plugin API) should stay **one PR at a time** on `main`. For **Phase 1–2 prep** you can run **a few agents in parallel** if each agent owns a **disjoint set of paths** so rebases rarely conflict.

## Principles

1. **One writer per path family** — e.g. only one agent edits `package.json` / lockfile per batch.
2. **Docs parallelise cleanly** — different files under `docs/testing/` vs `docs/architecture/` vs `docs/migration/`.
3. **Tests parallelise by file** — one agent per `tests/unit/<area>.test.js` (or `tests/integration/*.spec.js`), never two agents on the same test file.
4. **Stack PRs** — open PR B **from** branch that already contains PR A if B depends on A; use GitHub **stacked PRs** (or sequential merge) so CI stays green.

## Minimal parallel lanes (low conflict risk)

| Lane | Owns (examples) | Typical agent task |
|------|-------------------|---------------------|
| **Infra** | `package.json`, `package-lock.json`, `vitest.config.js`, `.github/workflows/*` | Coverage provider, CI artifacts, scripts, thresholds |
| **Registry** | `docs/testing/feature-registry.md` | Inventory + category tags (Phase 1.2–1.3) |
| **Architecture** | `docs/architecture/core-vs-features-map.md` | Core vs feature map (Phase 2.2) |
| **Tests — utils** | `tests/unit/extend-object.test.js`, `tests/unit/math-viewport.test.js` | Already present; extend only in this lane |
| **Tests — core** | `tests/unit/darkroom.core.test.js` (new) | Darkroom lifecycle (Phase 1.4) |
| **Tests — plugins** | `tests/unit/plugin.*.test.js` (one file per plugin) | Isolated plugin suites |
| **E2E** | `e2e/*.spec.js` | Playwright; keep `testDir` as today (`e2e/`) |

**Do not parallelise** two agents on **Infra** in the same batch (lockfile hell).

**Suggested batch size:** **2–3** agents — e.g. Infra (once) + Registry + Architecture; then after merge, N agents each adding **one** new test file under `tests/unit/`.

## Coverage gates (Phase 1.5)

- `vitest.config.js` uses **`coverage.all: true`** over `lib/js/**` and `lib/entry-darkroom.js` so reported totals reflect the whole library.
- **Thresholds** start as a **non-regression floor** (~current aggregate). Raise toward **80% lines / 70% branches** in a dedicated PR once the suite covers core + plugins (update `thresholds` in `vitest.config.js` and adjust in the same PR as new tests).
- CI runs `npm run test:coverage` and uploads the `coverage/` artifact.

## Stackable PR order (Phases 1 → 5)

Use short-lived branches; merge to `main` in roughly this order. Steps in the **same bullet** can be **one PR**; bullets are **sequential** across the list.

1. **PR — Test infra & CI** — Vitest coverage, workflow, `test:coverage`, folder docs (`tests/README.md`, `tests/integration/`, `tests/e2e/` pointer). *Completes 1.1 + part of 1.5.*
2. **PR — Feature registry** — `docs/testing/feature-registry.md` only (optional: combine with PR 3 if you want fewer PRs).
3. **PR — Architecture map** — `docs/architecture/core-vs-features-map.md` only.
4. **PR — Baseline tests (as-is code)** — expand `tests/unit/` per registry; no refactor yet. *1.4 / “lock behaviour”.*
5. **PR — Raise coverage thresholds** — after aggregate clears your target.
6. **PR — Core extraction** — `src/core/` + move engine; **single agent**; full test run. *Phase 3.1.*
7. **PR — One plugin at a time** — repeat per plugin. *Phase 3.2.*
8. **PR — Decouple + events + config** — hardcoding, bus, dependency resolution. *Phase 3.3–3.6.*
9. **PR — DX** — public API JSDoc/TS, plugin guide, `create-plugin` scaffold, `core.debug()`. *Phase 4.*
10. **PR — Governance** — ESLint boundaries, changelog policy, regression tag rules. *Phase 5.*

## Subagent prompt templates (copy-paste)

**Agent — Registry (read-only codebase, write one file)**  
“You may only create or edit `docs/testing/feature-registry.md`. Inventory `lib/js/**`, categories, coverage gaps. Do not change JS or config.”

**Agent — Architecture map**  
“You may only create or edit `docs/architecture/core-vs-features-map.md`. Classify each file core vs feature, dependencies, coupling. No code changes.”

**Agent — New unit test file**  
“You may only add `tests/unit/<name>.test.js` and shared fixtures under `tests/fixtures/` if needed. Do not edit `package.json` or `vitest.config.js` unless asked.”

**Agent — Infra**  
“You may edit `package.json`, `vitest.config.js`, `.github/workflows/ci.yml`, and `package-lock.json`. Do not edit application code under `lib/`.”

Ensure subagents run in **Agent mode** (write enabled); read-only sessions will return markdown in chat instead of committing files.

---

## Open GitHub PR chain (concrete branches)

Branches use `migration/pr-NN-*` so they stay grouped.

| Order | Branch                         | Open PR with base                    |
| ----- | ------------------------------ | ------------------------------------ |
| 1     | `migration/pr-01-coverage-ci-docs` | `main`                           |
| 2     | `migration/pr-02-core-unit-dom`    | `migration/pr-01-coverage-ci-docs` until PR 1 merges |

After **PR 1** merges: `git fetch origin && git checkout migration/pr-02-core-unit-dom && git rebase origin/main` and in GitHub set PR 2’s **base** to `main`.

### Push and open (GitHub CLI)

```bash
git push -u origin migration/pr-01-coverage-ci-docs
gh pr create --base main --head migration/pr-01-coverage-ci-docs \
  --title "test(ci): Vitest coverage, CI artifact, tracked migration docs" \
  --body "## What
- \`@vitest/coverage-v8\`, \`npm run test:coverage\`, baseline coverage thresholds.
- CI runs coverage and uploads the \`coverage/\` artifact.
- Stop gitignoring \`docs/\`; add migration/testing/architecture docs and tests layout READMEs.

## Next
Merge, then rebase \`migration/pr-02-core-unit-dom\` onto \`main\` and retarget PR 2 (or open PR 2 stacked on PR 1 first)."

git push -u origin migration/pr-02-core-unit-dom
gh pr create --base migration/pr-01-coverage-ci-docs --head migration/pr-02-core-unit-dom \
  --title "test(unit): happy-dom harness for core, UI, plugins" \
  --body "Stacked on PR 1. Adds \`happy-dom\` and \`tests/unit/darkroom-*.test.js\`; raises coverage floors. Rebase onto \`main\` after PR 1 merges."
```
