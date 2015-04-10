;(function(fabric, Darkroom) {
  'use strict';

  function getImplementation(_this) {

    // inspired by https://github.com/fengyuanchen/cropper methods#zoom
    var zoom = function(delta, p) {

      var canvas = _this.darkroom.canvas,
          image  = _this.darkroom.image;

      var height = image.getHeight() * delta,
          width  = image.getWidth()  * delta;

      var ratioY = canvas.height / p.y,
          ratioX = canvas.width  / p.x;

      image
        .setLeft(image.getLeft() - (width - image.getWidth()) / ratioX)
        .setTop(image.getTop() - (height - image.getHeight()) / ratioY)
        .setWidth(width)
        .setHeight(height);

      canvas.renderAll();
    };

    var eventListeners = {

      zoomOut: function() { zoom(0.95, _this.rect.getCenterPoint()); },

      zoomIn: function() { zoom(1.05, _this.rect.getCenterPoint()); },

      accept: function() {

        var darkroom = _this.darkroom,
            canvas   = _this.darkroom.canvas,
            image    = _this.darkroom.image,
            rect     = _this.rect;

        canvas.remove(rect);

        var imageUrl = canvas.toDataURL({
          left: canvas.left,
          top:  canvas.top
        });

        fabric.Image.fromURL(imageUrl, function(img) {

          Darkroom.util.makeStatic(img);
          canvas.add(img);
          canvas.remove(image);

          darkroom.image = img;
          darkroom.dispatchEvent('image:change');
          states.notActive();
        });
      },

      cancel: function() {

        var originalImage = _this.originalImage,
            darkroom      = _this.darkroom,
            canvas        = _this.darkroom.canvas,
            image         = _this.darkroom.image,
            rect          = _this.rect;

        canvas.add(originalImage);
        canvas.remove(image);
        canvas.remove(rect);

        originalImage.setCoords();
        darkroom.image = originalImage;

        states.notActive();
      }
    };

    var states = {

      notActive: function() {

        var buttons = _this.buttons,
            canvas  = _this.darkroom.canvas,
            rect    = _this.rect;

        _this.originalImage = null;
        _this.rect          = null;

        buttons.zoomOut.hide(true);
        buttons.zoomIn.hide(true);
        buttons.accept.hide(true);
        buttons.cancel.hide(true);

        buttons.zoom
          .removeEventListener('click', eventListeners.cancel)
          .addEventListener('click', states.active)
          .active(false);
      },

      active: function() {

        var buttons = _this.buttons,
            canvas  = _this.darkroom.canvas,
            image   = _this.darkroom.image;

        _this.rect = new fabric.Rect({
          opacity: 0.5,
          height: (canvas.width * 0.3),
          width:  (canvas.width * 0.3),
          left:   (canvas.width  / 2),
          top:    (canvas.height / 2)
        });

        canvas.add(_this.rect);

        Darkroom.util.cloneImage(image, function(img) { _this.originalImage = img; });

        buttons.zoomOut.hide(false);
        buttons.zoomIn.hide(false);
        buttons.accept.hide(false);
        buttons.cancel.hide(false);

        buttons.zoom
          .removeEventListener('click', states.active)
          .addEventListener('click', eventListeners.cancel)
          .active(true);
      }
    };

    return {
      eventListeners: eventListeners,
      states:         states
    };
  }

  Darkroom.plugins['zoom'] = Darkroom.Plugin.extend({

    defaults: {},

    initialize: function() {

      var buttonGroup = this.darkroom.toolbar.createButtonGroup();
      var buttons     = this.buttons = {};

      buttons.zoom    = buttonGroup.createButton({image: 'zoom'});
      buttons.zoomIn  = buttonGroup.createButton({image: 'zoom-in', hide: true});
      buttons.zoomOut = buttonGroup.createButton({image: 'zoom-out', hide: true});
      buttons.accept  = buttonGroup.createButton({image: 'accept', type: 'success', hide: true});
      buttons.cancel  = buttonGroup.createButton({image: 'cancel', type: 'danger',  hide: true});

      var implementation = getImplementation(this);

      buttons.zoomOut.addEventListener('click', implementation.eventListeners.zoomOut);
      buttons.zoomIn.addEventListener('click', implementation.eventListeners.zoomIn);
      buttons.cancel.addEventListener('click', implementation.eventListeners.cancel);
      buttons.accept.addEventListener('click', implementation.eventListeners.accept);

      implementation.states.notActive();
    }
  });
})(fabric, Darkroom);
