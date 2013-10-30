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

    this.canvas = new fabric.Canvas(canvasEl);

    var imgInstance = new fabric.Image(image, {
      top: image.height/2,
      left: image.width/2,
      selectable: false,
      //lockHorizontally: true,
      //lockVertically: true,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      hasControls: false,
      hasBorders: false,
    });
    this.canvas.setWidth(image.width);
    this.canvas.setHeight(image.height);
    this.canvas.add(imgInstance);

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
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hasControls: false,
        hasBorders: false,
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
    doCrop: function(canvas) {
      if (this.cropRect.width < 2 && this.cropRect.height < 2) {
        return;
      }

      this.cropRect.visible = false;

      var data = canvas.toDataURL({
        left: this.cropRect.get('left'),
        top: this.cropRect.get('top'),
        width: this.cropRect.get('width'),
        height: this.cropRect.get('height')
      });

      var img = new Image();
      img.src = data;
      var imgInstance = new fabric.Image(img, {
        top: img.height/2,
        left: img.width/2,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hasControls: false,
        hasBorders: false,
      });

      // Update canvas size
      canvas.setWidth(img.width);
      canvas.setHeight(img.height);

      // Add image
      canvas.clear();
      canvas.add(imgInstance);

      this.cropRect.visible = true;
      this.cropRect.width = true;
      this.cropRect.height = true;
    },
    initialize: function(darkroom) {
      var _this = this;

      var btn = $('<button>');
      btn.addClass('darkroom-button icon-images-crop');
      btn.appendTo(darkroom.toolbar);
      btn.on('click', function() {
        _this.doCrop(darkroom.canvas);
      });

      var canvas = darkroom.canvas;

      var cropRect = new fabric.Rect({
        fill: 'black',
        opacity: 0.1,
        originX: 'left',
        originY: 'top',
        stroke: '#444',
        lockRotation: true,
        hasRotatingPoint: false,
        //width: 100,
        //height: 100,
        borderColor: 'black',
        cornerColor: 'black',
        //strokeWidth: 10
      });
      this.cropRect = cropRect;

      //cropRect.width = 200;
      //cropRect.height = 200;
      canvas.add(cropRect);
      //canvas.setActiveObject(cropRect);

      //cropRect.visible = false;

      var mousex = 0;
      var mousey = 0;
      var crop = false;
      var disabled = false;

      canvas.on('object:moving', function (event) {
        var rect = event.target;
        if (rect !== cropRect) return;

        var x = rect.get('left'), y = rect.get('top');
        var w = rect.get('width'), h = rect.get('height');
        var maxX = canvas.getWidth() - w;
        var maxY = canvas.getHeight() - h;

        if (x < 0)
          rect.set('left', 0);
        if (y < 0)
          rect.set('top', 0);
        if (x > maxX)
          rect.set('left', maxX);
        if (y > maxY)
          rect.set('top', maxY);
      });

      canvas.on("mouse:down", function (event) {
        if (disabled) return;

        var x = event.e.pageX - canvas._offset.left;
        var y = event.e.pageY - canvas._offset.top;

        var point = new fabric.Point(x, y);

        //console.log(cropRect);
        var activeObject = canvas.getActiveObject();
        if (activeObject === cropRect || cropRect.containsPoint(point)) {
          //console.log('do nothing');
          return;
        }

        canvas.discardActiveObject();
        cropRect.width = 0;
        cropRect.height = 0;
        cropRect.left = x;
        cropRect.top = y;

        crop = true;

        return;

        //cropRect.visible = true;

        canvas.bringToFront(cropRect);
        //canvas.renderAll();
        mousex = event.e.pageX;
        mousey = event.e.pageY;

      });

      canvas.on("mouse:move", function (event) {
        if (!crop || disabled) return;

        var x = event.e.pageX - canvas._offset.left;
        var y = event.e.pageY - canvas._offset.top;

        //console.log(cropRect.left + ' - ' + x);
        //console.log(cropRect.top + ' - ' + y);

        if (x > canvas.getWidth() || y > canvas.getHeight()) {
          return;
        }

        cropRect.width = +Math.abs(cropRect.left - x);
        cropRect.height = +Math.abs(cropRect.top - y);

        cropRect.setCoords();
        canvas.calcOffset();
        //cropRect.top = +Math.min(cropRect.left, x);
        //cropRect.left = +Math.min(cropRect.top, y);

        return;
      });

      canvas.on("mouse:up", function (event) {
        if (!crop) return;

        crop = false;

        cropRect.selectable = true;
        cropRect.hasControls = true;
        cropRect.hasBorders = true;

        canvas.setActiveObject(cropRect);
        canvas.calcOffset();
        //console.log(cropRect);
      });

    },
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
