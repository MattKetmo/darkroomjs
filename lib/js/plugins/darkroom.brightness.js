;(function(Darkroom, fabric, document) {
  'use strict';

  var state = null,
      _this = null;

  var helpers = {

    changeBrightness: function(increment) {

      var canvas = _this.canvas,
          image  = _this.image;

      image.filters.push(new fabric.Image.filters.Brightness({brightness: increment}));
      image.applyFilters(canvas.renderAll.bind(canvas));
    }
  };

  var states = {

    notActive: function() {

      _this.image = null;

      buttons.brightness.active(false);

      buttons.decrease.hide(true);
      buttons.increase.hide(true);
      buttons.accept.hide(true);
      buttons.reject.hide(true);

      buttons.brightness.element.removeEventListener('click', eventListeners.deActivate);
      buttons.brightness.addEventListener('click', eventListeners.activate);
    },
    active: function() {

      var OPTS = [
        'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY',
        'lockUniScaling', 'hasControls', 'hasBorders', 'selectable', 'evented'
      ];

      var image = _this.image = _this.darkroom.image;

      image.clone(

        function(newImage) { _this.originalImage = newImage; },
        OPTS
      );

      buttons.brightness.active(true);

      buttons.decrease.hide(false);
      buttons.increase.hide(false);
      buttons.accept.hide(false);
      buttons.reject.hide(false);

      buttons.brightness.element.removeEventListener('click', eventListeners.activate);
      buttons.brightness.addEventListener('click', eventListeners.deActivate);
    }
  };

  var eventListeners = {

    deActivate: function() {

      var originalImage = _this.originalImage,
          canvas        = _this.canvas;

      Darkroom.replaceImage(originalImage);
      states.notActive();
    },

    activate: function() {

      states.active();
    },

    accept: function() {

      _this.originalImage = null;
      states.notActive();
    },

    reject: function() { eventListeners.deActivate(); },

    decrease: function() { helpers.changeBrightness(-_this.options.step); },
    increase: function() { helpers.changeBrightness(_this.options.step);  }
  }

  Darkroom.plugins['brightness'] = Darkroom.Plugin.extend({

    defaults: {
      step: 10
    },

    initialize: function() {

      _this = this;

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          buttons     = this.buttons = {};

      buttons.brightness = buttonGroup.createButton({image: 'brightness'});
      buttons.increase   = buttonGroup.createButton({image: 'add'});
      buttons.decrease   = buttonGroup.createButton({image: 'subtract'});
      buttons.accept     = buttonGroup.createButton({image: 'accept', type: 'success'});
      buttons.reject     = buttonGroup.createButton({image: 'reject', type: 'danger'});


      buttons.decrease.addEventListener('click', eventListeners.decrease);
      buttons.increase.addEventListener('click', eventListeners.increase);
      buttons.accept.addEventListener('click', eventListeners.accept);
      buttons.reject.addEventListener('click', eventListeners.reject);

      states.notActive();

      // buttons.brightness = button;

      // button.addEventListener('mouseover', function() {
      //   button.active(true);
      // });

      // button.addEventListener('mouseout', function() {
      //   button.active(false);
      // });

      // button.addEventListener('wheel', function(event) {

      //   event.preventDefault();

      //   var deltaY = event.wheelDeltaY,
      //       step   = options.step;

      //   var brightness;

      //   if (deltaY < 0) { brightness = -step; }
      //   else            { brightness =  step; }

      //   image.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness }));
      //   image.applyFilters(canvas.renderAll.bind(canvas));
      // });
    }
  });
})(Darkroom, fabric, document);
