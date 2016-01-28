# Change Log

All notable changes to this project will be documented in this file.

## 3.0.0 (Unreleased)

Rewrite everything using **ES6 & Webpack**.

- Make library compatible with **UMD**
- Simplify code & plugins creation
- Use of **Promise** everywhere
- Basic custom event emitter service
- Remove bower configuration
- Inline styles (ie. no more external CSS file)
- Remove gulp (prefer npm scripts)

## 2.0.1 (2015-08-03)

- Add type "button" to avoid html5 submit validation (#24)

## 2.0.0 (2015-08-01)

- Use of **Gulp** for the build process
- Replace the webfont by **SVG symbols** (which are direclty included in the compiled javascript)
- Ability to change **canvas ratio**
- Original image is kept and changes are done on a clone

## 1.0.x (2014)

Initial release.

- Create canvas with FabricJS from an image element
- Plugins: Crop, History, Rotate, Save
- Build process via Grunt
- Build webfont from SVG files to display the icons
