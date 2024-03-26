(function() {
  Darkroom.SelectProps = {
    // Avoid select zone to go beyond the canvas edges
    onObjectMoving: function(event) {
      if (!this.hasFocus()) {
        return;
      }

      var currentObject = event.target;
      if (currentObject !== this.selectedZone)
        return;

      var canvas = this.darkroom.canvas;
      var x      = currentObject.getLeft(), y = currentObject.getTop();
      var w      = currentObject.getWidth(), h = currentObject.getHeight();
      var maxX   = canvas.getWidth() - w;
      var maxY   = canvas.getHeight() - h;

      if (x < 0)
        currentObject.set('left', 0);
      if (y < 0)
        currentObject.set('top', 0);
      if (x > maxX)
        currentObject.set('left', maxX);
      if (y > maxY)
        currentObject.set('top', maxY);

      this.darkroom.dispatchEvent('select:update');
    },

    // Prevent select zone from going beyond the canvas edges (like mouseMove)
    onObjectScaling: function(event) {
      if (!this.hasFocus()) {
        return;
      }

      var preventScaling = false;
      var currentObject  = event.target;
      if (currentObject !== this.selectedZone)
        return;

      var canvas  = this.darkroom.canvas;
      var pointer = canvas.getPointer(event.e);
      var x       = pointer.x;
      var y       = pointer.y;

      var minX = currentObject.getLeft();
      var minY = currentObject.getTop();
      var maxX = currentObject.getLeft() + currentObject.getWidth();
      var maxY = currentObject.getTop() + currentObject.getHeight();

      if (null !== this.options.ratio) {
        if (minX < 0 || maxX > canvas.getWidth() || minY < 0 || maxY > canvas.getHeight()) {
          preventScaling = true;
        }
      }

      if (minX < 0 || maxX > canvas.getWidth() || preventScaling) {
        var lastScaleX = this.lastScaleX || 1;
        currentObject.setScaleX(lastScaleX);
      }
      if (minX < 0) {
        currentObject.setLeft(0);
      }

      if (minY < 0 || maxY > canvas.getHeight() || preventScaling) {
        var lastScaleY = this.lastScaleY || 1;
        currentObject.setScaleY(lastScaleY);
      }
      if (minY < 0) {
        currentObject.setTop(0);
      }

      if (currentObject.getWidth() < this.options.minWidth) {
        currentObject.scaleToWidth(this.options.minWidth);
      }
      if (currentObject.getHeight() < this.options.minHeight) {
        currentObject.scaleToHeight(this.options.minHeight);
      }

      this.lastScaleX = currentObject.getScaleX();
      this.lastScaleY = currentObject.getScaleY();

      this.darkroom.dispatchEvent('select:update');
    },

    // Init select zone
    onMouseDown: function(event) {
      if (!this.hasFocus()) {
        return;
      }

      var canvas = this.darkroom.canvas;

      // recalculate offset, in case canvas was manipulated since last `calcOffset`
      canvas.calcOffset();
      var pointer = canvas.getPointer(event.e);
      var x = pointer.x;
      var y = pointer.y;
      var point = new fabric.Point(x, y);

      // Check if user want to scale or drag the select zone.
      var activeObject = canvas.getActiveObject();
      if (activeObject === this.selectedZone || this.selectedZone.containsPoint(point)) {
        return;
      }

      canvas.discardActiveObject();
      this.selectedZone.setWidth(0);
      this.selectedZone.setHeight(0);
      this.selectedZone.setScaleX(1);
      this.selectedZone.setScaleY(1);

      this.startX = x;
      this.startY = y;
    },

    // Extend fill zone
    onMouseMove: function(event) {
      // Quick fill feature
      if (this.isKeyFilling)
        return this.onMouseMoveKeyFill(event);

      if (null === this.startX || null === this.startY) {
        return;
      }

      var canvas  = this.darkroom.canvas;
      var pointer = canvas.getPointer(event.e);
      var x       = pointer.x;
      var y       = pointer.y;

      this._renderSelectZone(this.startX, this.startY, x, y);
    },

    onMouseMoveKeyFill: function(event) {
      var canvas = this.darkroom.canvas;
      var zone   = this.selectedZone;

      var pointer = canvas.getPointer(event.e);
      var x       = pointer.x;
      var y       = pointer.y;

      if (!zone.left || !zone.top) {
        zone.setTop(y);
        zone.setLeft(x);
      }

      this.isKeyLeft =  x < zone.left + zone.width / 2 ;
      this.isKeyUp = y < zone.top + zone.height / 2 ;

      this._renderSelectZone(
        Math.min(zone.left, x),
        Math.min(zone.top, y),
        Math.max(zone.left+zone.width, x),
        Math.max(zone.top+zone.height, y)
      );
    },

    // Finish fill zone
    onMouseUp: function(event) {
      if (null === this.startX || null === this.startY) {
        return;
      }

      var canvas = this.darkroom.canvas;
      this.selectedZone.setCoords();
      canvas.setActiveObject(this.selectedZone);
      canvas.calcOffset();

      this.startX = null;
      this.startY = null;
    },

    onKeyDown: function(event) {
      if (false === this.options.quickFillKey || event.keyCode !== this.options.quickFillKey || this.isKeyFilling)
        return;

      // Active quick f flow
      this.isKeyFilling = true ;
      this.darkroom.canvas.discardActiveObject();
      this.selectedZone.setWidth(0);
      this.selectedZone.setHeight(0);
      this.selectedZone.setScaleX(1);
      this.selectedZone.setScaleY(1);
      this.selectedZone.setTop(0);
      this.selectedZone.setLeft(0);
    },

    onKeyUp: function(event) {
      if (false === this.options.quickFillKey || event.keyCode !== this.options.quickFillKey || !this.isKeyFilling)
        return;

      // Unactive quick  flow
      this.isKeyFilling = false;
      this.startX       = 1;
      this.startY       = 1;
      this.onMouseUp();
    },

    selectZone: function(x, y, width, height, forceDimension) {
      if (!this.hasFocus())
        this.requireFocus();

      if (!forceDimension) {
        this._renderSelectZone(x, y, x+width, y+height);
      } else {
        this.selectedZone.set({
          'left':    x,
          'top':     y,
          'width':   width,
          'height':  height
        });
      }

      var canvas = this.darkroom.canvas;
      canvas.bringToFront(this.selectedZone);
      this.selectedZone.setCoords();
      canvas.setActiveObject(this.selectedZone);
      canvas.calcOffset();

      this.darkroom.dispatchEvent('select:update');
    },

    toggleSelect: function() {
      if (!this.hasFocus())
        this.requireFocus();
      else
        this.releaseFocus();
    },

    // Test wether fill zone is set
    hasFocus: function() {
      return this.selectedZone !== undefined;
    },

    // Create the fill zone
    requireFocus: function() {
      this.selectedZone = new Darkroom.Utils.SelectZone({
        fill:               'transparent',
        hasBorders:         false,
        originX:            'left',
        originY:            'top',
        cornerColor:        '#444',
        cornerSize:         8,
        transparentCorners: false,
        lockRotation:       true,
        hasRotatingPoint:   false,
      });

      if (null !== this.options.ratio) {
        this.selectedZone.set('lockUniScaling', true);
      }

      this.darkroom.canvas.add(this.selectedZone);
      this.darkroom.canvas.defaultCursor = 'crosshair';

      this.activateButton.active(true);
      this.okButton.hide(false);
      this.cancelButton.hide(false);
    },

    // Remove the fill zone
    releaseFocus: function() {
      if (undefined === this.selectedZone)
        return;

      this.selectedZone.remove();
      this.selectedZone = undefined;

      this.activateButton.active(false);
      this.okButton.hide(true);
      this.cancelButton.hide(true);

      this.darkroom.canvas.defaultCursor = 'default';

      this.darkroom.dispatchEvent('select:update');
    },

    _renderSelectZone: function(fromX, fromY, toX, toY) {
      var canvas = this.darkroom.canvas;

      var isRight = (toX > fromX);
      var isLeft = !isRight;
      var isDown = (toY > fromY);
      var isUp = !isDown;

      var minWidth = Math.min(+this.options.minWidth, canvas.getWidth());
      var minHeight = Math.min(+this.options.minHeight, canvas.getHeight());

      // Define corner coordinates
      var leftX = Math.min(fromX, toX);
      var rightX = Math.max(fromX, toX);
      var topY = Math.min(fromY, toY);
      var bottomY = Math.max(fromY, toY);

      // Replace current point into the canvas
      leftX = Math.max(0, leftX);
      rightX = Math.min(canvas.getWidth(), rightX);
      topY = Math.max(0, topY)
      bottomY = Math.min(canvas.getHeight(), bottomY);

      // Recalibrate coordinates according to given options
      if (rightX - leftX < minWidth) {
        if (isRight)
          rightX = leftX + minWidth;
        else
          leftX = rightX - minWidth;
      }
      if (bottomY - topY < minHeight) {
        if (isDown)
          bottomY = topY + minHeight;
        else
          topY = bottomY - minHeight;
      }

      // Truncate truncate according to canvas dimensions
      if (leftX < 0) {
        // Translate to the left
        rightX += Math.abs(leftX);
        leftX = 0
      }
      if (rightX > canvas.getWidth()) {
        // Translate to the right
        leftX -= (rightX - canvas.getWidth());
        rightX = canvas.getWidth();
      }
      if (topY < 0) {
        // Translate to the bottom
        bottomY += Math.abs(topY);
        topY = 0
      }
      if (bottomY > canvas.getHeight()) {
        // Translate to the right
        topY -= (bottomY - canvas.getHeight());
        bottomY = canvas.getHeight();
      }

      var width = rightX - leftX;
      var height = bottomY - topY;
      var currentRatio = width / height;

      if (this.options.ratio && +this.options.ratio !== currentRatio) {
        var ratio = +this.options.ratio;

        if(this.isKeySelecting) {
          isLeft = this.isKeyLeft;
          isUp = this.isKeyUp;
        }

        if (currentRatio < ratio) {
          var newWidth = height * ratio;
          if (isLeft) {
            leftX -= (newWidth - width);
          }
          width = newWidth;
        } else if (currentRatio > ratio) {
          var newHeight = height / (ratio * height/width);
          if (isUp) {
            topY -= (newHeight - height);
          }
          height = newHeight;
        }

        if (leftX < 0) {
          leftX = 0;
          //TODO
        }
        if (topY < 0) {
          topY = 0;
          //TODO
        }
        if (leftX + width > canvas.getWidth()) {
          var newWidth = canvas.getWidth() - leftX;
          height = newWidth * height / width;
          width = newWidth;
          if (isUp) {
            topY = fromY - height;
          }
        }
        if (topY + height > canvas.getHeight()) {
          var newHeight = canvas.getHeight() - topY;
          width = width * newHeight / height;
          height = newHeight;
          if (isLeft) {
            leftX = fromX - width;
          }
        }
      }

      // Apply coordinates
      this.selectedZone.left   = leftX;
      this.selectedZone.top    = topY;
      this.selectedZone.width  = width;
      this.selectedZone.height = height;

      this.darkroom.canvas.bringToFront(this.selectedZone);

      this.darkroom.dispatchEvent('select:update');
    }
  }
})();
