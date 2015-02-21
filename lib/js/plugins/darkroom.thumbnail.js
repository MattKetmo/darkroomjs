;(function(Darkroom, fabric, document) {
  'use strict';

  var _this = this;

  var helpers = {

    createElement: function(tag, attrs) {

      var element = document.createElement(tag);

      Object.keys(attrs).forEach(function(attrName) {
        element.setAttribute(attrName, attrs[attrName]);
      });

      return element;
    },

    hideElement: function(element) {

      element.setAttribute('style', 'display: none;');
    },

    showElement: function(element) {

      element.removeAttribute('style');
    },

    replaceImage: function(newImage, newWidth, newHeight) {

      var currentImage = _this.image,
          darkroom     = _this.darkroom,
          canvas       = _this.canvas;

      darkroom.image = newImage;
      _this.image    = newImage;

      canvas.remove(currentImage);
      canvas.setHeight(newHeight);
      canvas.setWidth(newWidth);

      newImage
        .set({height: newHeight, width: newWidth})
        .setCoords();

      canvas.add(newImage);

      return newImage;
    }
  };

  var states = {

    active: function() {

      var buttons = _this.buttons,
          options = _this.options,
          canvas  = _this.canvas,
          inputs  = _this.inputs,
          image   = _this.image;

      _this.originalImage = image;

      buttons.thumbnail.active(true);
      buttons.addThumbnail.hide(false);
      buttons.accept.hide(false);
      buttons.cancel.hide(false);

      buttons.accept.addEventListener('click', eventListeners.accept);

      buttons.thumbnail.addEventListener('click', eventListeners.deActivate);
      buttons.thumbnail.element.removeEventListener('click', eventListeners.activate);

      buttons.cancel.addEventListener('click', eventListeners.deActivate);

      buttons.addThumbnail.addEventListener('click', eventListeners.addThumbnail);

      inputs.thumbnails.addEventListener('change', eventListeners.selectThumbnail);
      inputs.thumbnails.innerHTML = '';
      inputs.height.value = '';
      inputs.width.value  = '';

      Object.keys(inputs).forEach(function(key) {

        helpers.showElement(inputs[key]);
      });
    },

    notActive: function() {

      var buttons = _this.buttons,
          options = _this.options,
          canvas  = _this.canvas,
          inputs  = _this.inputs;

      buttons.thumbnail.active(false);
      buttons.addThumbnail.hide(true);
      buttons.accept.hide(true);
      buttons.cancel.hide(true);

      buttons.accept.element.removeEventListener('click', eventListeners.accept);

      buttons.thumbnail.addEventListener('click', eventListeners.activate);
      buttons.thumbnail.element.removeEventListener('click', eventListeners.deActivate);

      buttons.cancel.element.removeEventListener('click', eventListeners.deActivate);

      buttons.addThumbnail.element.removeEventListener('click', eventListeners.addThumbnail);

      inputs.thumbnails.removeEventListener('change', eventListeners.selectThumbnail);

      Object.keys(inputs).forEach(function(key) {

        helpers.hideElement(inputs[key]);
      });
    }
  };

  var eventListeners = {

    activate: function() {

      states.active();
    },

    deActivate: function() {

      var originalImage = _this.originalImage,
          inputs        = _this.inputs;

      inputs.thumbnails.innerHTML = '';

      helpers.replaceImage(originalImage, originalImage.getWidth(), originalImage.getHeight());

      _this.thumbnails = {};

      states.notActive();
    },

    selectThumbnail: function() {

      var thumbnails = _this.thumbnails;

      var value  = this.value.split('x'),
          height = parseInt(value[1]),
          width  = parseInt(value[0]);

      if (width && height) {

        var thumbnail = thumbnails[[width, height]];
        helpers.replaceImage(thumbnail, width, height);
      }
    },

    accept: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs;

      buttons.addThumbnail.hide(true);

      buttons.accept.element.removeEventListener('click', eventListeners.accept);
      buttons.accept.hide(true);

      inputs.height.setAttribute('style', 'display: none;');
      inputs.width.setAttribute('style', 'display: none;');
    },

    addThumbnail: function() {

      var thumbnails = _this.thumbnails,
          canvas     = _this.canvas,
          inputs     = _this.inputs,
          image      = _this.image;

      var height = parseInt(inputs.height.value || image.getHeight()),
          width  = parseInt(inputs.width.value  || image.getWidth());

      var OPTS = [
        'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY',
        'lockUniScaling', 'hasControls', 'hasBorders', 'selectable', 'evented'
      ];

      image.clone(
          function(thumbnail) {

          helpers.replaceImage(thumbnail, width, height);

          if (!thumbnails[[width, height]]) {

            var optionElement = document.createElement('option');

            optionElement.innerHTML = (width + 'x' + height);
            inputs.thumbnails.appendChild(optionElement);
          }

          thumbnails[[width, height]] = thumbnail;
        },
        OPTS
      );
    }
  };

  Darkroom.plugins['thumbnail'] = Darkroom.Plugin.extend({

    defaults: {
      maxWidth:  1280,
      maxHeight: 720,
      minWidth:  400,
      minHeight: 200
    },

    initialize: function() {

      _this = this;

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          darkroom    = this.darkroom,
          options     = this.options,
          canvas      = this.darkroom.canvas,
          image       = this.darkroom.image;

      this.thumbnails = {};
      this.canvas     = canvas;
      this.image      = image;

      var buttons = this.buttons = {},
          inputs  = this.inputs  = {};

      buttons.thumbnail    = buttonGroup.createButton({image: 'thumbnail'});
      buttons.addThumbnail = buttonGroup.createButton({image: 'add', hide: true});
      buttons.accept       = buttonGroup.createButton({image: 'accept',type: 'success',hide: true});
      buttons.cancel       = buttonGroup.createButton({image: 'cancel', type: 'danger',hide: true});

      inputs.width = helpers.createElement('input', {
        placeholder: 'Width',
        title:       'Width',
        type:        'number',
        step:        10,
        min:         options.minWidth,
        max:         options.maxWidth
      });

      inputs.height = helpers.createElement('input', {
        placeholder: 'Height',
        title:       'Height',
        type:        'number',
        step:        10,
        min:         options.minHeight,
        max:         options.maxHeight
      });

      inputs.thumbnails = document.createElement('select');

      buttonGroup.element.appendChild(inputs.width);
      buttonGroup.element.appendChild(inputs.height);
      buttonGroup.element.appendChild(inputs.thumbnails);

      states.notActive();
    }
  });
})(Darkroom, fabric, document);
