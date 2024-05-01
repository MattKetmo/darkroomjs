(function() {
'use strict';

Darkroom.Utils = {
  extend: extend,
  computeImageViewPort: computeImageViewPort,
};


// Utility method to easily extend objects.
function extend(b, a) {
  var prop;
  if (b === undefined) {
    return a;
  }
  for (prop in a) {
    if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
      b[prop] = a[prop];
    }
  }
  return b;
}

function computeImageViewPort(image) {
  return {
    height: Math.abs(image.get("width") * (Math.sin(image.get("angle") * Math.PI/180))) + Math.abs(image.get("height") * (Math.cos(image.get("angle") * Math.PI/180))),
    width: Math.abs(image.get("height") * (Math.sin(image.get("angle") * Math.PI/180))) + Math.abs(image.get("width") * (Math.cos(image.get("angle") * Math.PI/180))),
  }
}

})();
