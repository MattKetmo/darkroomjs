;(function(Darkroom, fabric, document) {

  var _this = null;

  var initializeWatermark = function() {

    var options = _this.options;

    _this.watermark = new fabric.Text(options.text, {opacity: (options.opacity / 100)});
  };

  var actions = {
    saveImage: function() {

      initializeWatermark();
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
      inputs.color.removeEventListener('input', actions.chooseColor);

      inputs.text.setAttribute('style', 'display: none;');
      inputs.text.removeEventListener('input', actions.chooseText);

      inputs.opacity.setAttribute('style', 'display: none;');
      inputs.opacity.removeEventListener('input', actions.chooseOpacity);

      buttons.watermark.addEventListener('click', actions.activate);
      buttons.cancel.element.removeEventListener('click', actions.deActivate);
      buttons.ok.element.removeEventListener('click', actions.saveImage);
    },

    active: function() {

      var buttons = _this.buttons,
          options = _this.options,
          canvas  = _this.canvas,
          inputs  = _this.inputs;

      buttons.watermark.active(true);
      buttons.cancel.hide(false);
      buttons.ok.hide(false);

      initializeWatermark();
      canvas.add(_this.watermark);

      inputs.color.value = options.color;
      inputs.color.removeAttribute('style');
      inputs.color.addEventListener('input', actions.chooseColor);

      inputs.text.value = options.text;
      inputs.text.removeAttribute('style');
      inputs.text.addEventListener('input', actions.chooseText);

      inputs.opacity.value = options.opacity;
      inputs.opacity.removeAttribute('style');
      inputs.opacity.addEventListener('input', actions.chooseOpacity);

      buttons.watermark.element.removeEventListener('click', actions.activate);
      buttons.watermark.addEventListener('click', actions.deActivate);

      buttons.cancel.addEventListener('click', actions.deActivate);
      buttons.ok.addEventListener('click', actions.saveImage);
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
