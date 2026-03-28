# Integration tests

Add Vitest specs here when a scenario needs **several modules** or **built output** together (e.g. import `build/darkroom.js` with a minimal JSDOM + Fabric stub).

Naming: `*.test.js` so they are picked up by `vitest.config.js` (`tests/**/*.test.js`).

Until specs exist, CI still runs unit + smoke tests via `npm run test:coverage`.
