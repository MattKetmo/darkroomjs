;(function(Darkroom, fabric, document) {

  var state = null,
      _this = null;

  var helpers = {

    initializeWatermark: function() {

      var options = _this.options;

      return new fabric.Text(options.text, {
        fontFamily: options.fontFamily,
        fontWeight: options.fontWeight,
        opacity:    (options.opacity / 100),
        fill:       options.color
      });
    }
  };

  var eventListeners = {

    accept: function() { states.notActive(); },

    reject: function() { eventListeners.deActivate(); },

    chooseColor: function() {

      var watermark = _this.watermark,
          canvas    = _this.darkroom.canvas,
          inputs    = _this.inputs;

      var color = inputs.color.value;

      watermark.set({fill: color});
      canvas.renderAll();
    },
    chooseOpacity: function() {

      var watermark = _this.watermark,
          canvas    = _this.darkroom.canvas,
          inputs    = _this.inputs;

      var opacity = parseInt(inputs.opacity.value) / 100;

      if (opacity) {
        watermark.set({'opacity': opacity});
        canvas.renderAll();
      }
    },
    chooseText: function() {

      var watermark = _this.watermark,
          options   = _this.options,
          canvas    = _this.darkroom.canvas,
          inputs    = _this.inputs;

      var text = (inputs.text.value || options.text);

      watermark.set({text: text});
      canvas.renderAll();
    },
    chooseFont: function() {

      var watermark = _this.watermark,
          options   = _this.options,
          canvas    = _this.darkroom.canvas,
          inputs    = _this.inputs;

      var font = (inputs.font.value || options.fontFamily);

      watermark.setFontFamily(font);
      canvas.renderAll();
    },
    makeBold: function() {

      var watermark = _this.watermark,
          buttons    = _this.buttons,
          options   = _this.options,
          canvas    = _this.darkroom.canvas;

      if (state.isBold) {
        state.isBold = false;
        buttons.bold.active(false);
        watermark.setFontWeight('normal');
      }
      else {
        state.isBold = true;
        buttons.bold.active(true);
        watermark.setFontWeight('bold');
      }

      canvas.renderAll();
    },
    makeItalic: function() {

      var watermark = _this.watermark,
          buttons    = _this.buttons,
          options   = _this.options,
          canvas    = _this.darkroom.canvas;

      if (state.isItalic) {
        state.isItalic = false;
        buttons.italic.active(false);
        watermark.setFontStyle('normal');
      }
      else {
        state.isItalic = true;
        buttons.italic.active(true);
        watermark.setFontStyle('italic');
      }

      canvas.renderAll();
    },
    activate: function() { states.active(); },

    deActivate: function() {

      var watermark = _this.watermark;

      watermark.remove();
      states.notActive();
    }
  };

  var states = {

    notActive: function() {

      var buttons = _this.buttons,
          inputs  = _this.inputs;

      _this.watermark = null;

      buttons.watermark.active(false);

      buttons.accept.hide(true);
      buttons.reject.hide(true);
      buttons.italic.hide(true);
      buttons.bold.hide(true);

      Darkroom.util.forEachValue(inputs, Darkroom.util.hideElement);

      buttons.watermark.element.removeEventListener('click', eventListeners.deActivate);
      buttons.watermark.addEventListener('click', eventListeners.activate);
    },

    active: function() {

      var buttons = _this.buttons,
          options = _this.options,
          canvas  = _this.darkroom.canvas,
          inputs  = _this.inputs;

      state = {
        isItalic: (options.fontStyle  === 'italic'),
        isBold:   (options.fontWeight === 'bold')
      };

      buttons.italic.active(state.isItalic);
      buttons.bold.active(state.isBold);
      buttons.watermark.active(true);

      buttons.accept.hide(false);
      buttons.reject.hide(false);
      buttons.italic.hide(false);
      buttons.bold.hide(false);

      _this.watermark = helpers.initializeWatermark();
      canvas.add(_this.watermark);

      Darkroom.util.forEachValue(inputs, Darkroom.util.showElement);

      inputs.opacity.value = options.opacity;
      inputs.color.value   = options.color;
      inputs.font.value    = options.fontFamily;
      inputs.text.value    = options.text;

      buttons.watermark.element.removeEventListener('click', eventListeners.activate);
      buttons.watermark.addEventListener('click', eventListeners.deActivate);
    }
  };

  Darkroom.plugins['watermark'] = Darkroom.Plugin.extend({
    defaults: {
      fontFamily: 'Times New Roman',
      fontWeight: 'normal',
      fontStyle:  'normal',
      isActive:   false,
      opacity:    100,
      color:      '#000000',
      text:       'Watermark Text'
    },
    initialize: function initDarkroomWatermarkPlugin() {

      _this = this;

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          options     = this.options;

      var buttons = this.buttons = {},
          inputs  = this.inputs  = {};

      buttons.watermark = buttonGroup.createButton({image: 'watermark'});
      buttons.bold      = buttonGroup.createButton({image: 'bold'});
      buttons.italic    = buttonGroup.createButton({image: 'italic'});
      buttons.accept    = buttonGroup.createButton({image: 'accept', type: 'success', hide:  true});
      buttons.reject    = buttonGroup.createButton({image: 'cancel', type: 'danger', hide: true});

      inputs.text = Darkroom.util.createElement('input', {
        placeholder: 'Text',
        title:       'Text',
        type:        'text',
        size:        options.text.length
      });

      inputs.color = Darkroom.util.createElement('input', {
        placeholder: 'Color',
        title: 'Color',
        type:  'color'
      });

      inputs.opacity = Darkroom.util.createElement('input', {
        placeholder: 'Opacity',
        title:       'Opacity',
        type:        'number',
        step:        5,
        min:         5,
        max:         100,
      });

      inputs.font = Darkroom.util.createElement('input', {
        placeholder: 'Font',
        title:       'Font',
        type:        'text',
        size:        options.fontFamily.length
      });

      buttons.accept.addEventListener('click', eventListeners.accept);
      buttons.reject.addEventListener('click', eventListeners.reject);
      buttons.italic.addEventListener('click', eventListeners.makeItalic);
      buttons.bold.addEventListener('click', eventListeners.makeBold);

      inputs.opacity.addEventListener('input', eventListeners.chooseOpacity);
      inputs.color.addEventListener('input', eventListeners.chooseColor);
      inputs.text.addEventListener('input', eventListeners.chooseText);
      inputs.font.addEventListener('input', eventListeners.chooseFont);

      buttonGroup.element.appendChild(inputs.color);
      buttonGroup.element.appendChild(inputs.font);
      buttonGroup.element.appendChild(inputs.opacity);
      buttonGroup.element.appendChild(inputs.text);

      if (options.isActive) { states.active();    }
      else                  { states.notActive(); }
    }
  });
})(Darkroom, fabric, document);
