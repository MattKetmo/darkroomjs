;(function(window, document, Darkroom) {
  'use strict';

  var _this = null;

  var imageProps = {
    resize: {
        controlsAboveOverlay: true,
        lockScalingFlip:      true,
        lockUniScaling:       true,
        lockScalingX:         false,
        lockScalingY:         false,
        hasControls:          true,
        hasBorders:           true,
        selectable:           true,
        evented:              true
    }
  };

  var adjustImage = function() {
    var options = _this.options,
        canvas  = _this.canvas,
        image   = _this.image;

    canvas
      .setHeight(image.getHeight())
      .setWidth(image.getWidth());

    image
      .center()
      .setCoords();

    canvas.renderAll();

    var maxHeight = options.maxHeight,
        minHeight = options.minHeight,
        maxWidth  = options.maxWidth,
        minWidth  = options.minWidth,
        height    = image.getHeight(),
        width     = image.getWidth();

    if (height >= maxHeight || height <= minHeight || width >= maxWidth || width <= minWidth) {
      image.set({
        lockScalingX: true,
        lockScalingY: true
      });
    }
  };

  var states = {
    resizeNotClicked: function() {
      var buttons = _this.buttons,
          image   = _this.image;

      buttons.resize.removeEventListener('click', actions.resizeClicked.click);
      buttons.resize.addEventListener('click', actions.resizeNotClicked.click);
      image.set(imageProps.original);
    },
    resizeClicked: function() {
      var buttons = _this.buttons,
          image   = _this.image;

      image.set(imageProps.resize);

      buttons.resize.removeEventListener('click', actions.resizeNotClicked.click);
      buttons.resize.addEventListener('click', actions.resizeClicked.click);
    }
  };

  var actions = {
    resizeNotClicked: {
      click: function() {
        var buttons = _this.buttons,
            image   = _this.image;

        buttons.resize.active(true);
        buttons.cancel.hide(false);
        buttons.ok.hide(false);

        image.clone(function(img) {
          _this.originalImage = img;
        });

        states.resizeClicked();
      }
    },
    resizeClicked: {
      click: function() {
        var originalImage = _this.originalImage,
            currentImage  = _this.image,
            darkroom      = _this.darkroom,
            buttons       = _this.buttons,
            options       = _this.options,
            canvas        = _this.canvas;

        buttons.resize.active(false);
        buttons.cancel.hide(true);
        buttons.ok.hide(true);

        canvas.remove(currentImage);
        canvas.add(originalImage);

        darkroom.image = originalImage;
        _this.image    = originalImage;

        currentImage.off('scaling', adjustImage);
        originalImage.on('scaling', adjustImage);

        canvas
          .setHeight(originalImage.getHeight())
          .setWidth(originalImage.getWidth())
          .renderAll();

        states.resizeNotClicked();
      }
    }
  };

  Darkroom.plugins['resize'] = Darkroom.Plugin.extend({
    defaults: {
      maxHeight: 700,
      minHeight: 150,
      maxWidth:  1200,
      minWidth:  200
    },
    initialize: function initDarkroomResizePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          canvas      = this.darkroom.canvas,
          image       = this.darkroom.image;
          _this       = this;

      this.canvas = canvas;
      this.image  = image;

      this.buttons = {
        resize: buttonGroup.createButton({
          image: 'resize',
          active: false
        }),
        cancel: buttonGroup.createButton({
          image: 'cancel',
          type:  'danger',
          hide:  true
        }),
        ok:  buttonGroup.createButton({
          image: 'accept',
          type:  'success',
          hide:  true
        })
      };

      imageProps.original = {
        controlsAboveOverlay: image.get('controlsAboveOverlay'),
        lockScalingFlip:      image.get('lockScalingFlip'),
        lockUniScaling:       image.get('lockUniScaling'),
        lockScalingX:         image.get('lockScalingX'),
        lockScalingY:         image.get('lockScalingY'),
        selectable:           image.get('selectable'),
        hasControls:          image.get('hasControls'),
        hasBorders:           image.get('hasBorders'),
        evented:              image.get('evented')
      };

      this.buttons.cancel.addEventListener('click', actions.resizeClicked.click);
      this.buttons.ok.addEventListener('click', function() {
        _this.buttons.resize.active(false);
        _this.buttons.cancel.hide(true);
        _this.buttons.ok.hide(true);
        states.resizeNotClicked();
      });

      image.on('scaling', adjustImage);
      states.resizeNotClicked();
    }
  });
})(window, document, Darkroom);
