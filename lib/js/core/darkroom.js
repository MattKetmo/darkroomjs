(function () {
  'use strict';

  window.Darkroom = Darkroom;

  // Core object of DarkroomJS.
  // Basically it's a single object, instanciable via an element
  // (it could be a CSS selector or a DOM element), some custom options,
  // and a list of plugin objects (or none to use default ones).
  function Darkroom(element, options, _plugins) {
    return this.constructor(element, options, _plugins);
  }

  // Create an empty list of plugin objects, which will be filled by
  // other plugin scripts. This is the default plugin list if none is
  // specified in Darkroom'ss constructor.
  Darkroom.plugins = [];

  Darkroom.prototype = {
    // Reference to the main container element
    containerElement: null,

    // Reference to the Fabric canvas object
    canvas: null,

    // Reference to the Fabric image object
    image: null,

    // Reference to the Fabric source canvas object
    sourceCanvas: null,

    // Reference to the Fabric source image object
    sourceImage: null,

    // Track of the original image element
    originalImageElement: null,

    // Stack of transformations to apply to the image source
    transformations: [],

    // Default options
    defaults: {
      // Canvas properties (dimension, ratio, color)
      minWidth: null,
      minHeight: null,
      maxWidth: null,
      maxHeight: null,
      ratio: null,
      backgroundColor: '#fff',

      // Plugins options
      plugins: {},

      // Post-initialisation callback
      initialize: function () {
        /* noop */
      },
    },

    // List of the instancied plugins
    plugins: {},

    // This options are a merge between `defaults` and the options passed
    // through the constructor
    options: {},

    constructor: function (element, options, _plugins) {
      this.options = Darkroom.Utils.extend(options, this.defaults);

      if (typeof element === 'string') element = document.querySelector(element);
      if (null === element) return;

      const image = new Image();
      image.onload = function () {
        // Initialize the DOM/Fabric elements
        this._initializeDOM(element);
        this._initializeImage();

        // Then initialize the plugins
        this._initializePlugins(Darkroom.plugins);

        // Public method to adjust image according to the canvas
        this.refresh(
          function () {
            // Execute a custom callback after initialization
            this.options.initialize.bind(this).call();
          }.bind(this),
        );
      }.bind(this);

      //image.crossOrigin = 'anonymous';
      image.src = element.src;
    },

    selfDestroy: function () {
      const container = this.containerElement;
      const image = new Image();
      image.onload = function () {
        container.parentNode.replaceChild(image, container);
      };

      image.src = this.sourceImage.toDataURL();
    },

    // Add ability to attach event listener on the core object.
    // It uses the canvas element to process events.
    addEventListener: function (eventName, callback) {
      this.canvas.getElement().addEventListener(eventName, callback);
    },

    dispatchEvent: function (eventName) {
      this.canvas
        .getElement()
        .dispatchEvent(new Event(eventName, { bubbles: true, cancelable: true }));
    },

    // Adjust image & canvas dimension according to min/max width/height
    // and ratio specified in the options.
    // This method should be called after each image transformation.
    refresh: function (next) {
      const clone = new Image();
      clone.onload = function () {
        this._replaceCurrentImage(new fabric.Image(clone));

        if (next) next();
      }.bind(this);
      clone.src = this.sourceImage.toDataURL();
    },

    _replaceCurrentImage: function (newImage) {
      if (this.image) {
        this.image.remove();
      }

      this.image = newImage;
      this.image.selectable = false;

      // Adjust width or height according to specified ratio
      const viewport = Darkroom.Utils.computeImageViewPort(this.image);
      let canvasWidth = viewport.width;
      let canvasHeight = viewport.height;

      if (null !== this.options.ratio) {
        const canvasRatio = +this.options.ratio;
        const currentRatio = canvasWidth / canvasHeight;

        if (currentRatio > canvasRatio) {
          canvasHeight = canvasWidth / canvasRatio;
        } else if (currentRatio < canvasRatio) {
          canvasWidth = canvasHeight * canvasRatio;
        }
      }

      // Then scale the image to fit into dimension limits
      let scaleX = 1;
      let scaleY = 1;

      if (null !== this.options.maxWidth && this.options.maxWidth < canvasWidth) {
        scaleX = this.options.maxWidth / canvasWidth;
      }
      if (null !== this.options.maxHeight && this.options.maxHeight < canvasHeight) {
        scaleY = this.options.maxHeight / canvasHeight;
      }
      const scaleMin = Math.min(scaleX, scaleY);

      scaleX = 1;
      scaleY = 1;
      if (null !== this.options.minWidth && this.options.minWidth > canvasWidth) {
        scaleX = this.options.minWidth / canvasWidth;
      }
      if (null !== this.options.minHeight && this.options.minHeight > canvasHeight) {
        scaleY = this.options.minHeight / canvasHeight;
      }
      const scaleMax = Math.max(scaleX, scaleY);

      const scale = scaleMax * scaleMin; // one should be equals to 1

      canvasWidth *= scale;
      canvasHeight *= scale;

      // Finally place the image in the center of the canvas
      this.image.setScaleX(1 * scale);
      this.image.setScaleY(1 * scale);
      this.canvas.add(this.image);
      this.canvas.setWidth(canvasWidth);
      this.canvas.setHeight(canvasHeight);
      this.canvas.centerObject(this.image);
      this.image.setCoords();
    },

    // Apply the transformation on the current image and save it in the
    // transformations stack (in order to reconstitute the previous states
    // of the image).
    applyTransformation: function (transformation) {
      this.transformations.push(transformation);

      transformation.applyTransformation(
        this.sourceCanvas,
        this.sourceImage,
        this._postTransformation.bind(this),
      );
    },

    _postTransformation: function (newImage) {
      if (newImage) this.sourceImage = newImage;

      this.refresh(
        function () {
          this.dispatchEvent('core:transformation');
        }.bind(this),
      );
    },

    // Initialize image from original element plus re-apply every
    // transformations.
    reinitializeImage: function () {
      this.sourceImage.remove();
      this._initializeImage();
      this._popTransformation(this.transformations.slice());
    },

    _popTransformation: function (transformations) {
      if (0 === transformations.length) {
        this.dispatchEvent('core:reinitialized');
        this.refresh();
        return;
      }

      const transformation = transformations.shift();

      const next = function (newImage) {
        if (newImage) this.sourceImage = newImage;
        this._popTransformation(transformations);
      };

      transformation.applyTransformation(this.sourceCanvas, this.sourceImage, next.bind(this));
    },

    // Create the DOM elements and instanciate the Fabric canvas.
    // The image element is replaced by a new `div` element.
    // However the original image is re-injected in order to keep a trace of it.
    _initializeDOM: function (imageElement) {
      // Container
      const mainContainerElement = document.createElement('div');
      mainContainerElement.className = 'darkroom-container';

      // Toolbar
      const toolbarElement = document.createElement('div');
      toolbarElement.className = 'darkroom-toolbar';
      mainContainerElement.appendChild(toolbarElement);

      // Viewport canvas
      const canvasContainerElement = document.createElement('div');
      canvasContainerElement.className = 'darkroom-image-container';
      const canvasElement = document.createElement('canvas');
      canvasContainerElement.appendChild(canvasElement);
      mainContainerElement.appendChild(canvasContainerElement);

      // Source canvas
      const sourceCanvasContainerElement = document.createElement('div');
      sourceCanvasContainerElement.className = 'darkroom-source-container';
      sourceCanvasContainerElement.style.display = 'none';
      const sourceCanvasElement = document.createElement('canvas');
      sourceCanvasContainerElement.appendChild(sourceCanvasElement);
      mainContainerElement.appendChild(sourceCanvasContainerElement);

      // Original image
      imageElement.parentNode.replaceChild(mainContainerElement, imageElement);
      imageElement.style.display = 'none';
      mainContainerElement.appendChild(imageElement);

      // Instanciate object from elements
      this.containerElement = mainContainerElement;
      this.originalImageElement = imageElement;

      this.toolbar = new Darkroom.UI.Toolbar(toolbarElement);

      this.canvas = new fabric.Canvas(canvasElement, {
        selection: false,
        backgroundColor: this.options.backgroundColor,
      });

      this.sourceCanvas = new fabric.Canvas(sourceCanvasElement, {
        selection: false,
        backgroundColor: this.options.backgroundColor,
      });
    },

    // Instanciate the Fabric image object.
    // The image is created as a static element with no control,
    // then it is add in the Fabric canvas object.
    _initializeImage: function () {
      this.sourceImage = new fabric.Image(this.originalImageElement, {
        // Some options to make the image static
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hasControls: false,
        hasBorders: false,
      });

      this.sourceCanvas.add(this.sourceImage);

      // Adjust width or height according to specified ratio
      const viewport = Darkroom.Utils.computeImageViewPort(this.sourceImage);
      const canvasWidth = viewport.width;
      const canvasHeight = viewport.height;

      this.sourceCanvas.setWidth(canvasWidth);
      this.sourceCanvas.setHeight(canvasHeight);
      this.sourceCanvas.centerObject(this.sourceImage);
      this.sourceImage.setCoords();
    },

    // Initialize every plugins.
    // Note that plugins are instanciated in the same order than they
    // are declared in the parameter object.
    _initializePlugins: function (plugins) {
      for (const name in plugins) {
        const plugin = plugins[name];
        const options = this.options.plugins[name];

        // Setting false into the plugin options will disable the plugin
        if (options === false) continue;

        // Avoid any issues with _proto_
        if (!Object.prototype.hasOwnProperty.call(plugins, name)) continue;

        this.plugins[name] = new plugin(this, options);
      }
    },
  };
})();
