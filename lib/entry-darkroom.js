/**
 * Library entry — load order matches the legacy Gulp concat pipeline.
 * Depends on global `fabric` (e.g. from demo/vendor/fabric.js).
 */
import './js/core/bootstrap.js';
import './js/core/darkroom.js';
import './js/core/plugin.js';
import './js/core/transformation.js';
import './js/core/ui.js';
import './js/core/utils.js';
import './js/plugins/darkroom.history.js';
import './js/plugins/darkroom.rotate.js';
import './js/plugins/darkroom.crop.js';
import './js/plugins/darkroom.save.js';
