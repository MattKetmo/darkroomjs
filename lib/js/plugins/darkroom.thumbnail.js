;(function(Darkroom, fabric, document) {
  'use strict';

  function getImplementation(_this) {

    var state = {
      pristine: true
    };

    var helpers = {

      scaleBy: function(scale) {

        var darkroom = _this.darkroom,
            inputs   = _this.inputs,
            image    = _this.darkroom.image;

        var height = Math.floor(image.getHeight() * (1 + scale)),
            width  = Math.floor(image.getWidth()  * (1 + scale));

        if (height !== image.getHeight() || width !== image.getWidth()) {

          darkroom.replaceImage(image.set({width: width, height: height}));

          inputs.height.value = image.getHeight();
          inputs.width.value  = image.getWidth();
          state.pristine      = false;
        }
      },

      gcd: function gcd(x, y) {

        if (!y) { return x;             }
        else    { return gcd(y, x % y); }
      }
    };

    var states = {

      active: function() {

        var buttons = _this.buttons,
            inputs  = _this.inputs,
            image   = _this.darkroom.image;

        Darkroom.util.cloneImage(image, function(clonedImage) { _this.originalImage = clonedImage; });

        buttons.thumbnail.active(true);
        buttons.increase.hide(false);
        buttons.decrease.hide(false);
        buttons.accept.hide(false);
        buttons.cancel.hide(false);

        buttons.thumbnail.element.removeEventListener('click', eventListeners.activate);
        buttons.thumbnail.addEventListener('click', eventListeners.deActivate);

        inputs.height.value = '';
        inputs.width.value  = '';
        inputs.scale.value  = '';

        Darkroom.util.forEachValue(inputs, Darkroom.util.showElement);
        inputs.height.setAttribute('style', 'width: 4em;');
        inputs.width.setAttribute('style',  'width: 4em;');
        inputs.scale.setAttribute('style',  'width: 4em;');
      },

      notActive: function() {

        var buttons = _this.buttons,
            inputs  = _this.inputs;

        _this.originalImage         = null;

        buttons.thumbnail.active(false);
        buttons.increase.hide(true);
        buttons.decrease.hide(true);
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

      accept: function() {

        var darkroom = _this.darkroom,
            buttons  = _this.buttons,
            options  = _this.options,
            inputs   = _this.inputs,
            image    = _this.darkroom.image;

        var keepAspectRatio = inputs.keepAspectRatio.checked,
            height          = parseInt(inputs.height.value),
            width           = parseInt(inputs.width.value),
            scale           = parseFloat(inputs.scale.value);

        if (scale || (height || width)) {

          height = height || image.getHeight();
          width  = width  || image.getWidth();

          if (scale) {
            height = Math.floor(image.getHeight() * scale);
            width  = Math.floor(image.getWidth()  * scale);
          }
          else if (keepAspectRatio) {

          }

          if (image.getHeight() !== height || image.getWidth() !== width) {

            state.pristine = false;
            image.set({
              height: (height || image.getHeight()),
              width:  (width  || image.getWidth())
            });

            darkroom.replaceImage(image);
          }
        }

        if (!state.pristine) { darkroom.dispatchEvent('image:change'); }

        states.notActive();
      },

      increase: function() { helpers.scaleBy(+_this.options.scaleBy); },
      decrease: function() { helpers.scaleBy(-_this.options.scaleBy); }
    };

    return {
      eventListeners: eventListeners,
      states:         states
    };
  }

  Darkroom.plugins['thumbnail'] = Darkroom.Plugin.extend({

    defaults: {
      scaleBy: 0.05
    },

    initialize: function() {

      var darkroomOptions = this.darkroom.options,
          buttonGroup     = this.darkroom.toolbar.createButtonGroup(),
          options         = this.options;

      options.minHeight = darkroomOptions.minHeight;
      options.maxHeight = darkroomOptions.maxHeight;
      options.minWidth  = darkroomOptions.minWidth;
      options.maxWidth  = darkroomOptions.maxWidth;

      var buttons = this.buttons = {},
          inputs  = this.inputs  = {};

      buttons.thumbnail = buttonGroup.createButton({image: 'resize'});
      buttons.increase  = buttonGroup.createButton({image: 'add', hide: true});
      buttons.decrease  = buttonGroup.createButton({image: 'subtract', hide: true});
      buttons.accept    = buttonGroup.createButton({image: 'accept',type: 'success',hide: true});
      buttons.cancel    = buttonGroup.createButton({image: 'cancel', type: 'danger',hide: true});

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

      inputs.keepAspectRatio = Darkroom.util.createElement('input', {
        autocomplete: 'off',
        placeholder: 'Keep Aspect Ratio',
        title:       'Keep Aspect Ratio',
        type:        'checkbox'
      });

      var implementation = getImplementation(this);

      buttons.increase.addEventListener('click', implementation.eventListeners.increase);
      buttons.decrease.addEventListener('click', implementation.eventListeners.decrease);
      buttons.cancel.addEventListener('click', implementation.eventListeners.deActivate);
      buttons.accept.addEventListener('click', implementation.eventListeners.accept);

      buttonGroup.element.appendChild(inputs.scale);
      buttonGroup.element.appendChild(inputs.width);
      buttonGroup.element.appendChild(inputs.height);
      // buttonGroup.element.appendChild(inputs.keepAspectRatio);

      implementation.states.notActive();
    }
  });
})(Darkroom, fabric, document);
