/**
 * @param Element|string element Image element
 * @param Array          options Options
 */
function Darkroom(element, options) {
  'use strict';
  return this.init(element, options);
}

window.DarkroomPlugins = [];

if (window.module !== undefined) {
  module.exports = Darkroom;
}

;(function(window, document, fabric) {
  'use strict';

  Darkroom.extend = extend;

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

  function Toolbar(element) {
    this.element = element;
    this.actionsElement = element.querySelector('.darkroom-toolbar-actions');
  }

  Toolbar.prototype.createButton = function(options) {
    var defaults = {
      image: 'help',
      type: 'default',
      group: 'default',
      hide: false
    };

    options = extend(options, defaults);

    var button = document.createElement('li');
    button.className = 'darkroom-toolbar-action';
    button.innerHTML = '<span class="darkroom-button darkroom-button-' + options.type + '">' +
      '<i class="icon-' + options.image + '"></i>' +
      '</span>';
    this.actionsElement.appendChild(button);

    button = button.querySelector('.darkroom-button');
    if (options.hide) {
      button.className += ' darkroom-button-hidden';
    }

    return button;
  }

  function Button(element) {

  }

  var Canvas = fabric.util.createClass(fabric.Canvas, {
  });

  Darkroom.prototype = {
    defaults: {
      plugins: {}
    },

    init: function(element, options) {
      this.options = extend(options, this.defaults);

      if (typeof element === 'string')
        element = document.querySelector(element);
      if (null === element)
        return;

      var plugins = window.DarkroomPlugins;

      this
        .initDOM(element)
        .initImage(element)
        .initPlugins(plugins)
      ;
    },

    initDOM: function(element) {
      // Create toolbar element
      var toolbar = document.createElement('div');
      toolbar.className = 'darkroom-toolbar';
      toolbar.innerHTML = '<ul class="darkroom-toolbar-actions"></ul>';

      // Create canvas element
      var canvas = document.createElement('canvas');
      var canvasContainer = document.createElement('div');
      canvasContainer.className = 'darkroom-image-container';
      canvasContainer.appendChild(canvas);

      // Create container element
      var container = document.createElement('div');
      container.className = 'darkroom-container';

      // Assemble elements
      container.appendChild(toolbar);
      container.appendChild(canvasContainer);

      // Insert container after original image
      if (element.nextSibling) {
        element.parentNode.insertBefore(container, element.nextSibling);
      } else {
        element.parentNode.appendChild(container);
      }
      // Then remove original image
      element.parentNode.removeChild(element);

      // Save elements
      this.toolbar = new Toolbar(toolbar);
      this.canvas = new Canvas(canvas, {
        selection: false,
        backgroundColor: '#ccc',
      });

      return this;
    },

    initImage: function(image) {
      this.image = new fabric.Image(image, {
        // options to make the image static
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hasControls: false,
        hasBorders: false
      });

      this.canvas.setWidth(image.width);
      this.canvas.setHeight(image.height);
      this.canvas.add(this.image);
      this.canvas.centerObject(this.image);
      this.image.setCoords();

      return this;
    },

    initPlugins: function(plugins) {
      for (var i = 0, n = plugins.length; i < n; i++) {
        var plugin = plugins[i];
        plugin.init(this, this.options.plugins[plugin.name]);
      }
    }

  };

})(window, window.document, fabric);
