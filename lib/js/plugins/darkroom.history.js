;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['history'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomHistoryPlugin() {
      this._initButtons();

      this.backHistoryStack = [];
      this.forwardHistoryStack = [];

      this._snapshotImage();

      this.darkroom.addEventListener('image:change', this._onImageChange.bind(this));
    },

    goBack: function() {
      if (this.backHistoryStack.length === 0) {
        return;
      }

      this.forwardHistoryStack.push(this.currentImage);
      this.currentImage = this.backHistoryStack.pop();
      this._applyImage(this.currentImage);
      this._updateButtons();
    },

    goForward: function() {
      if (this.forwardHistoryStack.length === 0) {
        return;
      }

      this.backHistoryStack.push(this.currentImage);
      this.currentImage = this.forwardHistoryStack.pop();
      this._applyImage(this.currentImage);
      this._updateButtons();
    },

    _initButtons: function() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.backButton = buttonGroup.createButton({
        image: 'back',
        disabled: true
      });

      this.forwardButton = buttonGroup.createButton({
        image: 'forward',
        disabled: true
      });

      this.backButton.addEventListener('click', this.goBack.bind(this));
      this.forwardButton.addEventListener('click', this.goForward.bind(this));

      return this;
    },

    _updateButtons: function() {
      this.backButton.disable((this.backHistoryStack.length === 0))
      this.forwardButton.disable((this.forwardHistoryStack.length === 0))
    },

    _snapshotImage: function() {
      var _this = this;
      var image = new Image();
      image.src = this.darkroom.snapshotImage();

      this.currentImage = image;
    },

    _onImageChange: function() {
      this.backHistoryStack.push(this.currentImage);
      this._snapshotImage();
      this.forwardHistoryStack.length = 0;
      this._updateButtons();
    },

    // Apply image to the canvas
    _applyImage: function(image) {
      var canvas = this.darkroom.canvas;

      var imgInstance = new fabric.Image(image, {
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

      // Update canvas size
      canvas.setWidth(image.width);
      canvas.setHeight(image.height);

      // Add image
      this.darkroom.image.remove();
      this.darkroom.image = imgInstance;
      canvas.add(imgInstance);
    }
  });
})(window, document, Darkroom, fabric);
