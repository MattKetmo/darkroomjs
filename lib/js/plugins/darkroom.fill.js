(function() {
  'use strict';

  var Fill = Darkroom.Transformation.extend({
    applyTransformation: function(canvas, image, next) {

      // Snapshot the image delimited by the fill zone
      var snapshot = new Image();
      snapshot.onload = function() {
        var imgInstance = new fabric.Image(this, {
          // options to make the image static
          selectable:     false,
          evented:        false,
          lockMovementX:  true,
          lockMovementY:  true,
          lockRotation:   true,
          lockScalingX:   true,
          lockScalingY:   true,
          lockUniScaling: true,
          hasControls:    false,
          hasBorders:     false
        });

        // Add image
        image.remove();
        canvas.add(imgInstance);
        next(imgInstance);
      };

      var viewport    = Darkroom.Utils.computeImageViewPort(image);
      var imageWidth  = viewport.width;
      var imageHeight = viewport.height;

      var left   = this.options.left * imageWidth;
      var top    = this.options.top * imageHeight;
      var width  = Math.min(this.options.width * imageWidth, imageWidth - left);
      var height = Math.min(this.options.height * imageHeight, imageHeight - top);

      var rect = new fabric.Rect({
        originX:     'left',
        originY:     'top',
        strokeWidth: 0,
        selectable:  false,
        left:        left,
        top:         top,
        width:       width,
        height:      height,
        fill:        'black'
      });

      canvas.add(rect);
      snapshot.src = canvas.toDataURL();
    }
  });

  Darkroom.plugins['fill'] = Darkroom.Plugin.extend({
    // Init point
    startX: null,
    startY: null,

    // Keyfill
    isKeyFilling: false,
    isKeyLeft: false,
    isKeyUp: false,

    defaults: {
      // min fill dimension
      minHeight: 1,
      minWidth: 1,
      // ensure fill ratio
      ratio: null,
    },

    initialize: function InitDarkroomFillPlugin() {
      // extend functions for selecting area
      Darkroom.Utils.extend(this, Darkroom.SelectProps)

      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.activateButton = buttonGroup.createButton({
        image: 'fill'
      });

      this.okButton = buttonGroup.createButton({
        image: 'done',
        type: 'success',
        hide: true
      });

      this.cancelButton = buttonGroup.createButton({
        image: 'close',
        type: 'danger',
        hide: true
      });

      // Buttons click
      this.activateButton.addEventListener('click', this.toggleSelect.bind(this));
      this.okButton.addEventListener('click', this.fill.bind(this));
      this.cancelButton.addEventListener('click', this.releaseFocus.bind(this));

      // Canvas events
      this.darkroom.canvas.on('mouse:down', this.onMouseDown.bind(this));
      this.darkroom.canvas.on('mouse:move', this.onMouseMove.bind(this));
      this.darkroom.canvas.on('mouse:up', this.onMouseUp.bind(this));
      this.darkroom.canvas.on('object:moving', this.onObjectMoving.bind(this));
      this.darkroom.canvas.on('object:scaling', this.onObjectScaling.bind(this));

      fabric.util.addListener(fabric.document, 'keydown', this.onKeyDown.bind(this));
      fabric.util.addListener(fabric.document, 'keyup', this.onKeyUp.bind(this));

      this.darkroom.addEventListener('core:transformation', this.releaseFocus.bind(this));
    },

    fill: function fill() {
      if (!this.hasFocus())
        return;

      // Avoid filling empty zone
      if (this.selectedZone.width < 1 && this.selectedZone.height < 1)
        return;

      var image = this.darkroom.image;

      // Compute fill zone dimensions
      var top    = this.selectedZone.getTop() - image.getTop();
      var left   = this.selectedZone.getLeft() - image.getLeft();
      var width  = this.selectedZone.getWidth();
      var height = this.selectedZone.getHeight();

      // Adjust dimensions to image only
      if (top < 0) {
        height += top;
        top     = 0;
      }

      if (left < 0) {
        width += left;
        left   = 0;
      }

      this.darkroom.applyTransformation(new Fill({
        top:    top / image.getHeight(),
        left:   left / image.getWidth(),
        width:  width / image.getWidth(),
        height: height / image.getHeight(),
        fill:   this.color
      }));
    }
  });
})();
