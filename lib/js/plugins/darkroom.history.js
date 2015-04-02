;(function(window, document, Darkroom, fabric) {
  'use strict';

  Darkroom.plugins['history'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomHistoryPlugin() {
      this._initButtons();

      this.backHistoryStack = [];
      this.backHistoryStackSource = [];

      this.forwardHistoryStack = [];
      this.forwardHistoryStackSource = [];

      this._snapshotImage();

      this.darkroom.addEventListener('image:change', this._onImageChange.bind(this));
    },

    goBack: function() {
      if (this.backHistoryStack.length === 0) {
        return;
      }

      this.forwardHistoryStack.push(this.currentImage);
      this.forwardHistoryStackSource.push(this.currentImageSource);

      this.currentImage = this.backHistoryStack.pop();
      this.currentImageSource = this.backHistoryStackSource.pop();


      this._applyImage(this.currentImage);
      this._applyImageSource(this.currentImageSource);
      this._updateButtons();

      // Dispatch an event, so listeners will know the
      // currently viewed image has been changed.
      this.darkroom.dispatchEvent('history:navigate');
    },

    goForward: function() {
      if (this.forwardHistoryStack.length === 0) {
        return;
      }


      this.backHistoryStack.push(this.currentImage);
      this.backHistoryStackSource.push(this.currentImageSource);

      this.currentImage = this.forwardHistoryStack.pop();
      this.currentImageSource = this.forwardHistoryStackSource.pop();

      this._applyImage(this.currentImage);
      this._applyImageSource(this.currentImageSource);
      this._updateButtons();

      // Dispatch an event, so listeners will know the
      // currently viewed image has been changed.
      this.darkroom.dispatchEvent('history:navigate');
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

      var imageSource = new Image();
      imageSource.src = this.darkroom.snapshotImageSource();

      this.currentImage = image;
      this.currentImageSource = imageSource;
    },

    _onImageChange: function() {

      this.backHistoryStack.push(this.currentImage);
      this.backHistoryStackSource.push(this.currentImageSource);

      this._snapshotImage();
      this.forwardHistoryStack.length = 0;
      this.forwardHistoryStackSource.length = 0;
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
    },

    _applyImageSource: function(imageSource) {

      var imgInstance = new fabric.Image(imageSource, {
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


      this.darkroom.imageSource = imgInstance;
    }
  });
})(window, document, Darkroom, fabric);
