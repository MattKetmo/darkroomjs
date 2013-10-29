/**
 * DarkroomJS
 */
;(function(window, document, $) {

  /**
   * Constructor
   *
   * @param element imageOrig
   */
  var Darkroom = function(imageOrig) {
    var image = new Image()
    image.src = imageOrig.src

    var canvasEl = document.createElement('canvas');
    var canvas = new fabric.Canvas(canvasEl);

    var imgInstance = new fabric.Image(image, {
      top: image.height/2,
      left: image.width/2,
    });
    canvas.setWidth(image.width);
    canvas.setHeight(image.height);
    canvas.add(imgInstance)

    this.canvas = canvas;

    // Build container
    var container = document.createElement('div');
    container.className = 'darkroom-container';
    this.toolbar = createToolbar();
    container.appendChild(this.toolbar);

    var imageContainer = document.createElement('div');
    imageContainer.className = 'darkroom-image-container';
    imageContainer.appendChild(canvasEl);
    container.appendChild(imageContainer);

    // Insert container after image
    if (imageOrig.nextSibling) {
      imageOrig.parentNode.insertBefore(container, imageOrig.nextSibling);
    } else {
      imageOrig.parentNode.appendChild(container);
    }

    // Remove original image
    imageOrig.parentNode.removeChild(imageOrig);

    // Initialize all plugins
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i];
      plugin.initialize(this);
    }
  };

  var rotatePlugin = {
    initialize: function(darkroom) {
      var _this = this;

      var btnLeft = $('<button>');
      btnLeft.addClass('darkroom-button icon-images-rotate-left');
      btnLeft.appendTo(darkroom.toolbar);
      btnLeft.on('click', function() {
        _this.rotateImage(darkroom.canvas, -90);
      });

      var btnRight = $('<button>');
      btnRight.addClass('darkroom-button icon-images-rotate-right');
      btnRight.appendTo(darkroom.toolbar);
      btnRight.on('click', function() {
        _this.rotateImage(darkroom.canvas, 90);
      });
    },

    rotateImage: function(canvas, angle) {
      // Snapshot current image
      var data = canvas.toDataURL();
      var img = new Image();
      img.src = data;
      var imgInstance = new fabric.Image(img, {
        top: img.width/2,
        left: img.height/2,
      });
      imgInstance.rotate(angle);

      // Update canvas size
      canvas.setWidth(img.height);
      canvas.setHeight(img.width);

      // Add image
      canvas.clear();
      canvas.add(imgInstance);
    }
  };

  var cropPlugin = {
    initialize: function(darkroom) {
      var _this = this;

      var btn = $('<button>');
      btn.addClass('darkroom-button icon-images-crop');
      btn.appendTo(darkroom.toolbar);
      btn.on('click', function() {
        alert('Sorry, crop is not active for now!');
      });
    }
  }

  var plugins = [
    cropPlugin,
    rotatePlugin,
  ];

  function createToolbar() {
    var toolbar = $('<div />');
    toolbar.addClass('darkroom-toolbar');

    return toolbar.get(0);
  }

  window.Darkroom = Darkroom;

})(window, window.document, jQuery);
