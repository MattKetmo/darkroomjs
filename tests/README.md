# Tests layout

| Area        | Path                   | Runner                          | Purpose                                 |
| ----------- | ---------------------- | ------------------------------- | --------------------------------------- |
| Unit        | `tests/unit/*.test.js` | Vitest (`npm run test:unit`)    | Pure JS, mocked DOM/Fabric where needed |
| Integration | `tests/integration/`   | Vitest (when specs are added)   | Multiple modules / build + node harness |
| Smoke       | `tests/smoke.test.js`  | Vitest (`npm test`)             | Build artefacts exist                   |
| E2E         | `e2e/*.spec.js`        | Playwright (`npm run test:e2e`) | Real browser against demo server        |

Playwright is configured with `testDir: 'e2e'` (repo root). A pointer lives at `tests/e2e/README.md`.

Feature checklist: [docs/testing/feature-registry.md](../docs/testing/feature-registry.md).
