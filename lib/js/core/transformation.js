(function () {
  'use strict';

  Darkroom.Transformation = Transformation;

  function Transformation(options) {
    this.options = options;
  }

  Transformation.prototype = {
    applyTransformation: function (_image) {
      /* no-op */
    },
  };

  // Inspired by Backbone.js extend capability.
  Transformation.extend = function (protoProps) {
    const parent = this;
    let child;

    if (protoProps && Object.prototype.hasOwnProperty.call(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function () {
        return parent.apply(this, arguments);
      };
    }

    Darkroom.Utils.extend(child, parent);

    const Surrogate = function () {
      this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    if (protoProps) Darkroom.Utils.extend(child.prototype, protoProps);

    child.__super__ = parent.prototype;

    return child;
  };
})();
