/*
  TODO
  - option min x:y (ex: 40x40)
  - option scale w:h (ex: 16:9)
  - fix depassement when scaling
  - fix mouse move to the left/up
  - add crop zone layout
 */
;(function(window, document, fabric) {

  var CropZone = fabric.util.createClass(fabric.Rect, {
    _render: function(ctx) {
      this.callSuper('_render', ctx);

      var canvas = ctx.canvas;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

      var borderOffset = 0.17;

      // Set original scale
      ctx.scale(1/this.scaleX, 1/this.scaleY);

      // Upper rect
      ctx.fillRect(
        -this.getWidth() / 2 - this.getLeft(),
        -this.getHeight() / 2 - this.getTop(),
        canvas.width,
        this.getTop() + borderOffset
      );

      // Left rect
      ctx.fillRect(
        -this.getWidth()/2 - this.getLeft(),
        -this.getHeight()/2,
        this.getLeft(),
        this.getHeight()
      );

      // Right rect
      ctx.fillRect(
        this.getWidth()/2,
        -this.getHeight()/2,
        canvas.width- this.getLeft() - this.getWidth() ,
        this.getHeight()
      );

      // Down rect
      ctx.fillRect(
        -this.getWidth() / 2 - this.getLeft(),
        this.getHeight() / 2  - borderOffset,
        canvas.width,
        canvas.height - this.getTop() - this.getHeight() + borderOffset
      );

      // Draw borders
      if (ctx.setLineDash !== undefined)
        ctx.setLineDash([5, 5]);
      else if (ctx.mozDash !== undefined)
        ctx.mozDash = [5, 5];

      ctx.beginPath();
      ctx.moveTo(-this.getWidth()/2, -this.getHeight()/2); // upper left
      ctx.lineTo(this.getWidth()/2, -this.getHeight()/2); // upper right
      ctx.lineTo(this.getWidth()/2, this.getHeight()/2); // down right
      ctx.lineTo(-this.getWidth()/2, this.getHeight()/2); // down left
      ctx.lineTo(-this.getWidth()/2, -this.getHeight()/2); // upper left
      ctx.stroke();

      // Reset scale
      ctx.scale(this.scaleX, this.scaleY);
    }
  });

  var DarkroomCropPlugin = {
    name: 'crop',

    // Boolean to check crop zone is being defined
    isZoning: false,

    defaults: {

    },

    init: function InitDarkroomRotatePlugin(darkroom, options) {

      this.darkroom = darkroom;
      this.options = Darkroom.extend(options, this.defaults);

      var buttonGroup = darkroom.toolbar.createButtonGroup();

      this.cropButton = buttonGroup.createButton({
        image: 'images-crop'
      });
      this.okButton = buttonGroup.createButton({
        image: 'navigation-accept',
        type: 'success',
        hide: true
      });
      this.cancelButton = buttonGroup.createButton({
        image: 'navigation-cancel',
        type: 'danger',
        hide: true
      });

      // Buttons click
      this.cropButton.addEventListener('click', this.toggleCrop.bind(this));
      this.okButton.addEventListener('click', this.cropCurrentZone.bind(this));
      this.cancelButton.addEventListener('click', this.releaseFocus.bind(this));

      // Canvas events
      darkroom.canvas.on('mouse:down', this.onMouseDown.bind(this));
      darkroom.canvas.on('mouse:move', this.onMouseMove.bind(this));
      darkroom.canvas.on('mouse:up', this.onMouseUp.bind(this));
      darkroom.canvas.on('object:moving', this.onObjectMoving.bind(this));
      darkroom.canvas.on('object:scaling', this.onObjectScaling.bind(this));

      darkroom.addEventListener('image:clean', this.releaseFocus.bind(this));
    },

    // Avoid crop zone to go beyond the canvas edges
    onObjectMoving: function(event) {
      if (!this.hasFocus()) {
        return;
      }

      var currentObject = event.target;
      if (currentObject !== this.cropZone)
        return;

      var canvas = this.darkroom.canvas;
      var x = currentObject.getLeft(), y = currentObject.getTop();
      var w = currentObject.getWidth(), h = currentObject.getHeight();
      var maxX = canvas.getWidth() - w;
      var maxY = canvas.getHeight() - h;

      if (x < 0)
        currentObject.set('left', 0);
      if (y < 0)
        currentObject.set('top', 0);
      if (x > maxX)
        currentObject.set('left', maxX);
      if (y > maxY)
        currentObject.set('top', maxY);
    },

    // Prevent crop zone from going beyond the canvas edges (like mouseMove)
    onObjectScaling: function(event) {
      if (!this.hasFocus()) {
        return;
      }

      var currentObject = event.target;
      if (currentObject !== this.cropZone)
        return;

      var canvas = this.darkroom.canvas;
      var x = event.e.pageX - canvas._offset.left;
      var y = event.e.pageY - canvas._offset.top;

      var canvas = this.darkroom.canvas;
      var w = currentObject.getWidth(), h = currentObject.getHeight();
      var maxX = canvas.getWidth() - w;
      var maxY = canvas.getHeight() - h;
      var maxW = canvas.getWidth() - currentObject.getLeft();
      var maxH = canvas.getHeight() - currentObject.getTop();

      // TODO
    },

    // Init crop zone
    onMouseDown: function(event) {
      if (!this.hasFocus()) {
        return;
      }

      var canvas = this.darkroom.canvas;
      var x = event.e.pageX - canvas._offset.left;
      var y = event.e.pageY - canvas._offset.top;
      var point = new fabric.Point(x, y);

      // Check if user want to scale or drag the crop zone.
      var activeObject = canvas.getActiveObject();
      if (activeObject === this.cropZone || this.cropZone.containsPoint(point)) {
        return;
      }

      canvas.discardActiveObject();
      this.cropZone.setWidth(0);
      this.cropZone.setHeight(0);
      this.cropZone.setLeft(x);
      this.cropZone.setTop(y);

      this.isZoning = true;
    },

    // Extend crop zone
    onMouseMove: function(event) {
      if (!this.isZoning) {
        return;
      }

      var canvas = this.darkroom.canvas;
      var x = event.e.pageX - canvas._offset.left;
      var y = event.e.pageY - canvas._offset.top;

      // If mouse to out of canvas, then nothing to compute
      if (x > canvas.getWidth() || y > canvas.getHeight()) {
        return;
      }

      this.cropZone.width = +Math.abs(this.cropZone.left - x);
      this.cropZone.height = +Math.abs(this.cropZone.top - y);

      canvas.bringToFront(this.cropZone);
    },

    // Finish crop zone
    onMouseUp: function(event) {
      if (!this.isZoning) {
        return;
      }

      var canvas = this.darkroom.canvas;
      this.cropZone.setCoords();
      canvas.setActiveObject(this.cropZone);
      canvas.calcOffset();

      this.isZoning = false;
    },

    selectZone: function(x, y, width, height) {
      if (!this.hasFocus())
        this.requireFocus();

      this.cropZone.set({
        'left': x,
        'top': y,
        'width': width,
        'height': height
      });

      var canvas = this.darkroom.canvas;
      canvas.bringToFront(this.cropZone);
      this.cropZone.setCoords();
      canvas.setActiveObject(this.cropZone);
      canvas.calcOffset();
    },

    toggleCrop: function() {
      if (!this.hasFocus())
        this.requireFocus();
      else
        this.releaseFocus();
    },

    cropCurrentZone: function() {
      if (!this.hasFocus()) {
        return;
      }

      // Avoid croping empty zone
      if (this.cropZone.width < 1 && this.cropZone.height < 1)
        return;

      var _this = this;
      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;

      //this.darkroom.dispatchEvent(new CustomEvent('image:clean'));

      // Hide crop rectangle to avoid snapshot it with the image
      this.cropZone.visible = false;

      // Snapshot the image delimited by the crop zone
      var image = new Image();
      image.onload = function() {
        // Validate image
        if (this.height < 1 || this.width < 1) {
          return;
        }

        var imgInstance = new fabric.Image(this, {
          top: this.height/2,
          left: this.width/2,
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

        var width = this.width;
        var height = this.height;

        // Update canvas size
        canvas.setWidth(width);
        canvas.setHeight(height);

        // Add image
        _this.darkroom.image.remove();
        _this.darkroom.image = imgInstance;
        canvas.add(imgInstance);

        darkroom.dispatchEvent(new Event('image:change'));
      };

      image.src = canvas.toDataURL({
        left: this.cropZone.getLeft(),
        top: this.cropZone.getTop(),
        width: this.cropZone.getWidth(),
        height: this.cropZone.getHeight()
      });

      this.releaseFocus();
    },

    // Test wether crop zone is set
    hasFocus: function() {
      return this.cropZone !== undefined;
    },

    // Create the crop zone
    requireFocus: function() {
      this.cropZone = new CropZone({
        fill: 'transparent',
        hasBorders: false,
        originX: 'left',
        originY: 'top',
        //stroke: '#444',
        //strokeDashArray: [5, 5],
        //borderColor: '#444',
        cornerColor: '#444',
        cornerSize: 8,
        transparentCorners: false,
        lockRotation: true,
        hasRotatingPoint: false,
      });

      this.darkroom.canvas.add(this.cropZone);
      this.darkroom.canvas.defaultCursor = 'crosshair';

      this.cropButton.active(true);
      this.okButton.hide(false);
      this.cancelButton.hide(false);
    },

    // Remove the crop zone
    releaseFocus: function() {
      this.cropZone.remove();
      this.cropZone = undefined;

      this.cropButton.active(false);
      this.okButton.hide(true);
      this.cancelButton.hide(true);

      this.darkroom.canvas.defaultCursor = 'default';
    }
  }

  window.DarkroomPlugins.push(DarkroomCropPlugin);
})(window, document, fabric);
