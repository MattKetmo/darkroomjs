//     DarkroomJS

//     (c) 2013 Matthieu Moquet.
//     DarkroomJS may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://mattketmo.github.io/darkroomjs

;(function(window, document, fabric) {
  'use strict';

  // Utilities
  // ---------

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

  // Root definitions
  // ----------------

  // Core object of DarkroomJS.
  // Basically it's a single object, instanciable via an element
  // (it could be a CSS selector or a DOM element), some custom options,
  // and a list of plugin objects (or none to use default ones).
  function Darkroom(element, options, plugins) {
    return this.init(element, options, plugins);
  }

  // Darkroom namespace is the only one available outside of this context.
  window.Darkroom = Darkroom;

  // Create an empty list of plugin objects, which will be filled by
  // other plugin scripts. This is the default plugin list if none is
  // specified in Darkroom'ss constructor.
  Darkroom.plugins = [];

  // Define a plugin object. This is the (abstract) parent class which
  // has to be extended for each plugin.
  function Plugin(darkroom, options) {
    this.darkroom = darkroom;
    this.options = extend(options, this.defaults);
    this.initialize();
  }

  Plugin.prototype = {
    defaults: {},
    initialize: function() { }
  }

  // Inspired by Backbone.js extend capability.
  Plugin.extend = function(protoProps) {
    var parent = this;
    var child;

    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    extend(child, parent);

    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps) extend(child.prototype, protoProps);

    child.__super__ = parent.prototype;

    return child;
  }

  // Attach the plugin class into the main namespace.
  Darkroom.Plugin = Plugin;

  // UI elements
  // -----------

  // Toolbar object.
  function Toolbar(element) {
    this.element = element;
    this.actionsElement = element.querySelector('.darkroom-toolbar-actions');
  }

  Toolbar.prototype.createButtonGroup = function(options) {
    var buttonGroup = document.createElement('li');
    buttonGroup.className = 'darkroom-button-group';
    /*buttonGroup.innerHTML = '<ul></ul>';*/
    this.actionsElement.appendChild(buttonGroup);

    return new ButtonGroup(buttonGroup);
  };

  // ButtonGroup object.
  function ButtonGroup(element) {
    this.element = element;
  }

  ButtonGroup.prototype.createButton = function(options) {
    var defaults = {
      image: 'help',
      type: 'default',
      group: 'default',
      hide: false,
      disabled: false
    };

    options = extend(options, defaults);

    var button = document.createElement('button');
    button.className = 'darkroom-button darkroom-button-' + options.type;
    button.innerHTML = '<i class="darkroom-icon-' + options.image + '"></i>';
    this.element.appendChild(button);

    var button = new Button(button);
    button.hide(options.hide);
    button.disable(options.disabled);

    return button;
  }

  // Button object.
  function Button(element) {
    this.element = element;
  }
  Button.prototype = {
    addEventListener: function(eventName, callback) {
      var el = this.element;
      if (el.addEventListener){
        el.addEventListener(eventName, callback);
      } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, callback);
      }
    },
    active: function(value) {
      if (value)
        this.element.classList.add('darkroom-button-active');
      else
        this.element.classList.remove('darkroom-button-active');
    },
    hide: function(value) {
      if (value)
        this.element.classList.add('darkroom-button-hidden');
      else
        this.element.classList.remove('darkroom-button-hidden');
    },
    disable: function(value) {
      this.element.disabled = (value) ? true : false;
    }
  };

  // Extend the default fabric canvas object to add default options.
  var Canvas = fabric.util.createClass(fabric.Canvas, {
  });

  // Core object prototype
  // ---------------------

  Darkroom.prototype = {
    // This is the default options.
    // It has it's own options, such as dimension specification (min/max
    // width and height), plus options for each plugins.
    // Option for those plugins are passed through plugin name.
    // `init` option is a callback called after image is loaded into the
    // canvas.
    defaults: {
      // main options
      minWidth: null,
      minHeight: null,
      maxWidth: null,
      maxHeight: null,

      // plugins options
      plugins: {},

      // after initialisation callback
      init: function() {}
    },

    // Add ability to attach event listener on the core object.
    // It uses the canvas element to process events.
    addEventListener: function(eventName, callback) {
      var el = this.canvas.getElement();
      if (el.addEventListener){
        el.addEventListener(eventName, callback);
      } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, callback);
      }
    },
    dispatchEvent: function(eventName) {
      // Use the old way of creating event to be IE compatible
      // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
      var event = document.createEvent('Event');
      event.initEvent(eventName, true, true);

      this.canvas.getElement().dispatchEvent(event);
    },

    // Initialisation.
    // It will replace the given image element by a canvas plus some wrapper
    // `div` blocks. A toolbar object is instanciated and the image is loaded
    // into the canvas element. Finally it calls each plugins initialisation
    // methods.
    init: function(element, options, plugins) {
      var _this = this;
      this.options = extend(options, this.defaults);

      if (typeof element === 'string')
        element = document.querySelector(element);
      if (null === element)
        return;

      var plugins = plugins || Darkroom.plugins;

      var image = new Image();

      image.onload = function() {
        _this
          .createFabricImage(element)
          .initDOM(element)
          .initPlugins(plugins)
        ;

        // Execute a custom callback after initialization
        _this.options.init.bind(_this).call();
      }

      /*image.crossOrigin = 'anonymous';*/
      image.src = element.src;
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

      this.canvas.setWidth(this.image.getWidth());
      this.canvas.setHeight(this.image.getHeight());
      this.canvas.add(this.image);
      this.canvas.centerObject(this.image);
      this.image.setCoords();

      return this;
    },

    createFabricImage: function(imgElement) {
      var width = imgElement.width;
      var height = imgElement.height;
      var scaleMin = 1;
      var scaleMax = 1;
      var scaleX = 1;
      var scaleY = 1;

      if (null !== this.options.maxWidth && this.options.maxWidth < width) {
        scaleX =  this.options.maxWidth / width;
      }
      if (null !== this.options.maxHeight && this.options.maxHeight < height) {
        scaleY =  this.options.maxHeight / height;
      }
      scaleMin = Math.min(scaleX, scaleY);

      scaleX = 1;
      scaleY = 1;
      if (null !== this.options.minWidth && this.options.minWidth > width) {
        scaleX =  this.options.minWidth / width;
      }
      if (null !== this.options.minHeight && this.options.minHeight > height) {
        scaleY =  this.options.minHeight / height;
      }
      scaleMax = Math.max(scaleX, scaleY);

      var scale = scaleMax * scaleMin; // one should be equals to 1

      width *= scale;
      height *= scale;

      this.image = new fabric.Image(imgElement, {
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
      this.image.setScaleX(scale);
      this.image.setScaleY(scale);

      return this;
    },

    initPlugins: function(plugins) {
      this.plugins = {};

      for (var name in plugins) {
        var plugin = plugins[name];
        var options = this.options.plugins[name];

        // Setting false into the plugin options will disable the plugin
        if (options === false) {
          continue;
        }

        this.plugins[name] = new plugin(this, options);
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

      image.src = this.snapshotImage();

      /* TODO
       - destroy plugins
       - delete canvas
      */
    },

    snapshotImage: function() {
      return this.image.toDataURL();
    }

  };

})(window, window.document, fabric);
