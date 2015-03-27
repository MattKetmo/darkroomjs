;(function(Darkroom, fabric, document) {
  'use strict';

  var _this = null;

  var states = {

    active: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs,
          image   = _this.darkroom.image;

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
      inputs.scale.value  = '';

      Darkroom.util.forEachValue(inputs, Darkroom.util.showElement);
    },

    notActive: function() {

      var buttons = _this.buttons,
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

      Darkroom.util.forEachValue(inputs, Darkroom.util.hideElement);
    }
  };

  var eventListeners = {

    activate: function() {

      states.active();
    },

    deActivate: function() {

      var originalImage = _this.originalImage,
          darkroom      = _this.darkroom,
          inputs        = _this.inputs;

      inputs.thumbnails.innerHTML = '';

      darkroom.replaceImage(originalImage);

      _this.thumbnails = {};

      states.notActive();
    },

    selectThumbnail: function() {

      var thumbnails = _this.thumbnails,
          darkroom   = _this.darkroom;

      var value  = this.value.split('x'),
          height = parseInt(value[1]),
          width  = parseInt(value[0]);

      if (width && height) {

        var thumbnail = thumbnails[[width, height]];
        darkroom.replaceImage(thumbnail);
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
      inputs.scale.setAttribute('style', 'display: none;');
    },

    addThumbnail: function() {

      var thumbnails = _this.thumbnails,
          darkroom   = _this.darkroom,
          inputs     = _this.inputs,
          image      = _this.darkroom.image;

      var scale = parseFloat(inputs.scale.value);

      var height, width;

      if (scale) {
        height = Math.floor(image.getHeight() * scale),
        width  = Math.floor(image.getWidth()  * scale);
      }
      else {
        height = parseInt(inputs.height.value || image.getHeight()),
        width  = parseInt(inputs.width.value  || image.getWidth());
      }

      var OPTS = [
        'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY',
        'lockUniScaling', 'hasControls', 'hasBorders', 'selectable', 'evented'
      ];

      image.clone(
          function(thumbnail) {

          thumbnail.set({width: width, height: height});
          darkroom.replaceImage(thumbnail);

          var innerHTML = (width + 'x' + height);

          if (!thumbnails[[width, height]]) {

            var optionElement = document.createElement('option');

            optionElement.innerHTML = innerHTML;
            inputs.thumbnails.appendChild(optionElement);
          }

          inputs.thumbnails.value = innerHTML;
          thumbnails[[width, height]] = thumbnail;
        },
        OPTS
      );
    }
  };

  Darkroom.plugins['thumbnail'] = Darkroom.Plugin.extend({

    defaults: {},

    initialize: function() {

      _this = this;

      var darkroomOptions = this.darkroom.options,
          buttonGroup     = this.darkroom.toolbar.createButtonGroup(),
          darkroom        = this.darkroom,
          options         = this.options,
          canvas          = this.darkroom.canvas,
          image           = this.darkroom.image;

      options.minHeight = darkroomOptions.minHeight,
      options.maxHeight = darkroomOptions.maxHeight,
      options.minWidth  = darkroomOptions.minWidth,
      options.maxWidth  = darkroomOptions.maxWidth;

      this.thumbnails = {};
      this.canvas     = canvas;
      this.image      = image;

      var buttons = this.buttons = {},
          inputs  = this.inputs  = {};

      buttons.thumbnail    = buttonGroup.createButton({image: 'thumbnail'});
      buttons.addThumbnail = buttonGroup.createButton({image: 'add', hide: true});
      buttons.accept       = buttonGroup.createButton({image: 'accept',type: 'success',hide: true});
      buttons.cancel       = buttonGroup.createButton({image: 'cancel', type: 'danger',hide: true});

      inputs.scale = Darkroom.util.createElement('input', {
        placeholder: 'Scale',
        title:       'Scale',
        type:        'number',
        step:        0.5,
        min:         0
      });

      inputs.width = Darkroom.util.createElement('input', {
        placeholder: 'Width',
        title:       'Width',
        type:        'number',
        step:        10,
        min:         options.minWidth,
        max:         options.maxWidth
      });

      inputs.height = Darkroom.util.createElement('input', {
        placeholder: 'Height',
        title:       'Height',
        type:        'number',
        step:        10,
        min:         options.minHeight,
        max:         options.maxHeight
      });

      inputs.thumbnails = document.createElement('select');

      buttonGroup.element.appendChild(inputs.scale);
      buttonGroup.element.appendChild(inputs.width);
      buttonGroup.element.appendChild(inputs.height);
      buttonGroup.element.appendChild(inputs.thumbnails);

      states.notActive();
    }
  });
})(Darkroom, fabric, document);
