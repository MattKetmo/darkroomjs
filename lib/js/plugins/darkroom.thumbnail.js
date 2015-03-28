;(function(Darkroom, fabric, document) {
  'use strict';

  var _this = null;

  var states = {

    active: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs,
          image   = _this.darkroom.image;

      _this.thumbnails = {};

      Darkroom.util.cloneImage(image, function(clonedImage) { _this.originalImage = clonedImage; });

      buttons.thumbnail.active(true);
      buttons.addThumbnail.hide(false);
      buttons.accept.hide(false);
      buttons.cancel.hide(false);

      buttons.thumbnail.element.removeEventListener('click', eventListeners.activate);
      buttons.thumbnail.addEventListener('click', eventListeners.deActivate);

      inputs.thumbnails.innerHTML = '';
      inputs.height.value = '';
      inputs.width.value  = '';
      inputs.scale.value  = '';

      Darkroom.util.forEachValue(inputs, Darkroom.util.showElement);
    },

    notActive: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs;

      inputs.thumbnails.innerHTML = '';
      _this.originalImage         = null;
      _this.thumbnails            = null;

      buttons.thumbnail.active(false);
      buttons.addThumbnail.hide(true);
      buttons.accept.hide(true);
      buttons.cancel.hide(true);

      buttons.thumbnail.element.removeEventListener('click', eventListeners.deActivate);
      buttons.thumbnail.addEventListener('click', eventListeners.activate);

      Darkroom.util.forEachValue(inputs, Darkroom.util.hideElement);
    }
  };

  var eventListeners = {

    activate: function() { states.active(); },

    deActivate: function() {

      var originalImage = _this.originalImage,
          darkroom      = _this.darkroom;

      darkroom.replaceImage(originalImage);
      states.notActive();
    },

    selectThumbnail: function() {

      var thumbnails = _this.thumbnails,
          darkroom   = _this.darkroom;

      var value  = this.value.split('x'),
          height = parseInt(value[1]),
          width  = parseInt(value[0]);

      if (width && height) { darkroom.replaceImage(thumbnails[[width, height]]); }
    },

    accept: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs;

      buttons.addThumbnail.hide(true);
      buttons.accept.hide(true);

      Darkroom.util.hideElement(inputs.height);
      Darkroom.util.hideElement(inputs.width);
      Darkroom.util.hideElement(inputs.scale);
    },

    addThumbnail: function() {

      var thumbnails = _this.thumbnails,
          darkroom   = _this.darkroom,
          inputs     = _this.inputs,
          image      = _this.darkroom.image;

      var scale = parseFloat(inputs.scale.value);

      var height, width;

      if (scale) {
        height = Math.floor(image.getHeight() * scale);
        width  = Math.floor(image.getWidth()  * scale);
      }
      else {
        height = parseInt(inputs.height.value || image.getHeight());
        width  = parseInt(inputs.width.value  || image.getWidth());
      }

      height = darkroom.getHeight(height);
      width  = darkroom.getWidth(width);

      var expectedThumbnail = thumbnails[[width, height]];

      if      (image.getWidth() === width && image.getHeight() === height) { }
      else if (expectedThumbnail) {

        inputs.thumbnails.value = (width + 'x' + height);
        darkroom.replaceImage(expectedThumbnail);
      }
      else {

        Darkroom.util.cloneImage(image, function(clonedImage) {

          clonedImage.set({width: width, height: height});
          darkroom.replaceImage(clonedImage);

          var optionElement = document.createElement('option'),
              innerHTML     = (clonedImage.getWidth() + 'x' + clonedImage.getHeight());

          optionElement.innerHTML = innerHTML;
          inputs.thumbnails.appendChild(optionElement);
          inputs.thumbnails.value = innerHTML;

          thumbnails[[width, height]] = clonedImage;
        });
      }
    }
  };

  Darkroom.plugins['thumbnail'] = Darkroom.Plugin.extend({

    defaults: {},

    initialize: function() {

      _this = this;

      var darkroomOptions = this.darkroom.options,
          buttonGroup     = this.darkroom.toolbar.createButtonGroup(),
          options         = this.options;

      options.minHeight = darkroomOptions.minHeight;
      options.maxHeight = darkroomOptions.maxHeight;
      options.minWidth  = darkroomOptions.minWidth;
      options.maxWidth  = darkroomOptions.maxWidth;

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


      buttons.addThumbnail.addEventListener('click', eventListeners.addThumbnail);
      buttons.cancel.addEventListener('click', eventListeners.deActivate);
      buttons.accept.addEventListener('click', eventListeners.accept);

      inputs.thumbnails.addEventListener('change', eventListeners.selectThumbnail);

      buttonGroup.element.appendChild(inputs.scale);
      buttonGroup.element.appendChild(inputs.width);
      buttonGroup.element.appendChild(inputs.height);
      buttonGroup.element.appendChild(inputs.thumbnails);

      states.notActive();
    }
  });
})(Darkroom, fabric, document);
