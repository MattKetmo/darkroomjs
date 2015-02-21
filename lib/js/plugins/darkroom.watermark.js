;(function(Darkroom, fabric, document) {

  var _this = null;

  var helpers = {
    initializeWatermark: function() {

      var options = _this.options;

      _this.watermark = new fabric.Text(options.text, {opacity: (options.opacity / 100)});
    }
  };

  var eventListeners = {
    saveImage: function() {

      helpers.initializeWatermark();
      states.notActive();
    },
    chooseColor: function() {

      var watermark = _this.watermark,
          canvas    = _this.canvas,
          inputs    = _this.inputs;

      var color = inputs.color.value;

      watermark.set({stroke: color, fill: color});
      canvas.renderAll();
    },
    chooseOpacity: function() {

      var watermark = _this.watermark,
          canvas    = _this.canvas,
          inputs    = _this.inputs;

      var opacity = inputs.opacity.value / 100;

      watermark.set({'opacity': opacity});
      canvas.renderAll();
    },
    chooseText: function() {

      var watermark = _this.watermark,
          options   = _this.options,
          canvas    = _this.canvas,
          inputs    = _this.inputs;

      var text = (inputs.text.value || options.text);

      watermark.set({text: text});
      canvas.renderAll();
    },
    activate: function() {

      states.active();
    },
    deActivate: function() {

      var watermark = _this.watermark,
          canvas    = _this.canvas;

      canvas.remove(watermark);

      states.notActive();
    }
  };

  var states = {

    notActive: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs;

      buttons.watermark.active(false);
      buttons.cancel.hide(true);
      buttons.ok.hide(true);

      inputs.color.setAttribute('style', 'display: none;');
      inputs.color.removeEventListener('input', eventListeners.chooseColor);

      inputs.text.setAttribute('style', 'display: none;');
      inputs.text.removeEventListener('input', eventListeners.chooseText);

      inputs.opacity.setAttribute('style', 'display: none;');
      inputs.opacity.removeEventListener('input', eventListeners.chooseOpacity);

      buttons.watermark.addEventListener('click', eventListeners.activate);
      buttons.cancel.element.removeEventListener('click', eventListeners.deActivate);
      buttons.ok.element.removeEventListener('click', eventListeners.saveImage);
    },

    active: function() {

      var buttons = _this.buttons,
          options = _this.options,
          canvas  = _this.canvas,
          inputs  = _this.inputs;

      buttons.watermark.active(true);
      buttons.cancel.hide(false);
      buttons.ok.hide(false);

      helpers.initializeWatermark();
      canvas.add(_this.watermark);

      inputs.color.value = options.color;
      inputs.color.removeAttribute('style');
      inputs.color.addEventListener('input', eventListeners.chooseColor);

      inputs.text.value = options.text;
      inputs.text.removeAttribute('style');
      inputs.text.addEventListener('input', eventListeners.chooseText);

      inputs.opacity.value = options.opacity;
      inputs.opacity.removeAttribute('style');
      inputs.opacity.addEventListener('input', eventListeners.chooseOpacity);

      buttons.watermark.element.removeEventListener('click', eventListeners.activate);
      buttons.watermark.addEventListener('click', eventListeners.deActivate);

      buttons.cancel.addEventListener('click', eventListeners.deActivate);
      buttons.ok.addEventListener('click', eventListeners.saveImage);
    }
  };

  Darkroom.plugins['watermark'] = Darkroom.Plugin.extend({
    defaults: {
      isActive: false,
      opacity:  100,
      color:    '#000000',
      text:     'Watermark Text'
    },
    initialize: function initDarkroomWatermarkPlugin() {

      _this = this;

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          darkroom    = this.darkroom,
          options     = this.options,
          canvas      = darkroom.canvas,
          image       = darkroom.image;

      this.canvas = canvas;
      this.image  = image;

      var buttons = this.buttons = {};
      var inputs  = this.inputs  = {};

      buttons.watermark = buttonGroup.createButton({image: 'watermark'});
      buttons.ok        = buttonGroup.createButton({image: 'accept', type: 'success', hide:  true});
      buttons.cancel    = buttonGroup.createButton({image: 'cancel', type: 'danger', hide: true});

      inputs.text = document.createElement('input');
      inputs.text.type = 'text';
      inputs.text.setAttribute('placeholder', 'Text');
      inputs.text.setAttribute('title', 'Text');

      inputs.color = document.createElement('input');
      inputs.color.type = 'color';
      inputs.color.setAttribute('title', 'Color');

      inputs.opacity = document.createElement('input');
      inputs.opacity.type = 'number';
      inputs.opacity.setAttribute('placeholder', 'Opacity');
      inputs.opacity.setAttribute('title', 'Opacity');
      inputs.opacity.setAttribute('min', '5');
      inputs.opacity.setAttribute('max', '100');
      inputs.opacity.setAttribute('step', '5');

      buttonGroup.element.appendChild(inputs.color);
      buttonGroup.element.appendChild(inputs.opacity);
      buttonGroup.element.appendChild(inputs.text);

      if (options.isActive) { states.active();    }
      else                  { states.notActive(); }
    }
  });
})(Darkroom, fabric, document);
