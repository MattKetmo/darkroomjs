/*
  TODO
  - option min x:y (ex: 40x40)
  - option scale w:h (ex: 16:9)
  - fix depassement when scaling
 */
;(function(window, document, fabric) {

  var CropZone = fabric.util.createClass(fabric.Rect, {
    _render: function(ctx) {
      this.callSuper('_render', ctx);

      var canvas = ctx.canvas;
      var borderOffset = 0.17;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

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
        canvas.width- this.getLeft() - this.getWidth(),
        this.getHeight()
      );

      // Down rect
      ctx.fillRect(
        -this.getWidth() / 2 - this.getLeft(),
        this.getHeight() / 2  - borderOffset,
        canvas.width,
        canvas.height - this.getTop() - this.getHeight() + borderOffset
      );

      var dashWidth = 7;

      // Set dashed borders
      if (ctx.setLineDash !== undefined)
        ctx.setLineDash([dashWidth, dashWidth]);
      else if (ctx.mozDash !== undefined)
        ctx.mozDash = [dashWidth, dashWidth];

      // First lines rendering with black
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      this._renderBorders(ctx);
      this._renderGrid(ctx);

      // Re render lines in white
      ctx.lineDashOffset = dashWidth;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this._renderBorders(ctx);
      this._renderGrid(ctx);

      // Reset scale
      ctx.scale(this.scaleX, this.scaleY);
    },

    _renderBorders: function(ctx) {
      ctx.beginPath();
      ctx.moveTo(-this.getWidth()/2, -this.getHeight()/2); // upper left
      ctx.lineTo(this.getWidth()/2, -this.getHeight()/2); // upper right
      ctx.lineTo(this.getWidth()/2, this.getHeight()/2); // down right
      ctx.lineTo(-this.getWidth()/2, this.getHeight()/2); // down left
      ctx.lineTo(-this.getWidth()/2, -this.getHeight()/2); // upper left
      ctx.stroke();
    },

    _renderGrid: function(ctx) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(-this.getWidth()/2 + 1/3 * this.getWidth(), -this.getHeight()/2);
      ctx.lineTo(-this.getWidth()/2 + 1/3 * this.getWidth(), this.getHeight()/2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-this.getWidth()/2 + 2/3 * this.getWidth(), -this.getHeight()/2);
      ctx.lineTo(-this.getWidth()/2 + 2/3 * this.getWidth(), this.getHeight()/2);
      ctx.stroke();
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(-this.getWidth()/2, -this.getHeight()/2 + 1/3 * this.getHeight());
      ctx.lineTo(this.getWidth()/2, -this.getHeight()/2 + 1/3 * this.getHeight());
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-this.getWidth()/2, -this.getHeight()/2 + 2/3 * this.getHeight());
      ctx.lineTo(this.getWidth()/2, -this.getHeight()/2 + 2/3 * this.getHeight());
      ctx.stroke();
    }
  });

  window.DarkroomPlugins['crop'] = Darkroom.Plugin.extend({
    // Init point
    startX: null,
    startY: null,

    defaults: {

    },

    initialize: function InitDarkroomCropPlugin(darkroom, options) {

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

      darkroom.addEventListener('image:change', this.releaseFocus.bind(this));
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

      var minX = currentObject.getLeft();
      var minY = currentObject.getTop();
      var maxX = currentObject.getLeft() + currentObject.getWidth();
      var maxY = currentObject.getTop() + currentObject.getHeight();

      if (minX < 0 || maxX > canvas.getWidth()) {
        var lastScaleX = this.lastScaleX || 1;
        currentObject.setScaleX(lastScaleX);
      }
      if (minX < 0) {
        currentObject.setLeft(0);
      }

      if (minY < 0 || maxY > canvas.getHeight()) {
        var lastScaleY = this.lastScaleY || 1;
        currentObject.setScaleY(lastScaleY);
      }
      if (minY < 0) {
        currentObject.setTop(0);
      }

      this.lastScaleX = currentObject.getScaleX();
      this.lastScaleY = currentObject.getScaleY();
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
      this.cropZone.setScaleX(1);
      this.cropZone.setScaleY(1);

      this.startX = x;
      this.startY = y;
    },

    // Extend crop zone
    onMouseMove: function(event) {
      if (null === this.startX || null === this.startY) {
        return;
      }

      var canvas = this.darkroom.canvas;
      var x = event.e.pageX - canvas._offset.left;
      var y = event.e.pageY - canvas._offset.top;

      this._renderCropZone(this.startX, this.startY, x, y);
    },

    // Finish crop zone
    onMouseUp: function(event) {
      if (null === this.startX || null === this.startY) {
        return;
      }

      var canvas = this.darkroom.canvas;
      this.cropZone.setCoords();
      canvas.setActiveObject(this.cropZone);
      canvas.calcOffset();

      this.startX = null;
      this.startY = null;
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
      if (undefined === this.cropZone)
        return;

      this.cropZone.remove();
      this.cropZone = undefined;

      this.cropButton.active(false);
      this.okButton.hide(true);
      this.cancelButton.hide(true);

      this.darkroom.canvas.defaultCursor = 'default';
    },

    _renderCropZone: function(fromX, fromY, toX, toY) {
      var canvas = this.darkroom.canvas;

      var minX = Math.max(0, Math.min(fromX, toX));
      var minY = Math.max(0, Math.min(fromY, toY));

      var maxX = Math.min(canvas.getWidth(), Math.max(fromX, toX));
      var maxY = Math.min(canvas.getHeight(), Math.max(fromY, toY));

      this.cropZone.left = minX;
      this.cropZone.top = minY;
      this.cropZone.width = maxX - minX;
      this.cropZone.height = maxY - minY;

      this.darkroom.canvas.bringToFront(this.cropZone);
    },
  });
})(window, document, fabric);
