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

  Toolbar.prototype.createButtonGroup = function(options) {
    var buttonGroup = document.createElement('li');
    buttonGroup.className = 'darkroom-button-group';
    //buttonGroup.innerHTML = '<ul></ul>';
    this.actionsElement.appendChild(buttonGroup);

    return new ButtonGroup(buttonGroup);
  };

  function ButtonGroup(element) {
    this.element = element;
  }

  ButtonGroup.prototype.createButton = function(options) {
    var defaults = {
      image: 'help',
      type: 'default',
      group: 'default',
      hide: false
    };

    options = extend(options, defaults);

    var button = document.createElement('span');
    button.className = 'darkroom-button darkroom-button-' + options.type;
    button.innerHTML = '<i class="icon-' + options.image + '"></i>';
    this.element.appendChild(button);

    var button = new Button(button);
    button.hide(options.hide);

    return button;
  }

  function Button(element) {
    this.element = element;
  }
  Button.prototype = {
    addEventListener: function(eventName, callback) {
      this.element.addEventListener(eventName, callback);
    },
    active: function(value) {
      if (value)
        this.element.className += ' darkroom-button-active';
      else
        this.element.className = this.element.className.replace(/darkroom-button-active/, '');
    },
    hide: function(value) {
      if (value)
        this.element.className += ' darkroom-button-hidden';
      else
        this.element.className = this.element.className.replace(/darkroom-button-hidden/, '');
    },
  };


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
      this.container = document.createElement('div');
      this.container.className = 'darkroom-container';

      // Assemble elements
      this.container.appendChild(toolbar);
      this.container.appendChild(canvasContainer);

      // Replace image with new DOM
      element.parentNode.replaceChild(this.container, element);

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
      this.plugins = {};

      for (var i = 0, n = plugins.length; i < n; i++) {
        var plugin = plugins[i];
        plugin.init(this, this.options.plugins[plugin.name]);
        this.plugins[plugin.name] = plugin;
      }
    },

    getPlugin: function(name) {
      return this.plugins[name];
    },

    selfDestroy: function() {
      var container = this.container;

      var image = new Image();
      image.onload = function() {
        container.parentNode.replaceChild(image, container);
      }

      image.src = this.canvas.toDataURL();

      // TODO
      // - destroy plugins
      // - delete canvas
    }

  };

})(window, window.document, fabric);
