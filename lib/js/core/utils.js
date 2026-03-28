import { extendObject } from '../extend-object.js';
import { boundingBoxForRotatedRect } from '../math-viewport.js';

(function () {
  'use strict';

  Darkroom.Utils = {
    extend: extend,
    computeImageViewPort: computeImageViewPort,
  };

  function extend(b, a) {
    return extendObject(b, a);
  }

  function computeImageViewPort(image) {
    return boundingBoxForRotatedRect(image.getWidth(), image.getHeight(), image.getAngle());
  }
})();
