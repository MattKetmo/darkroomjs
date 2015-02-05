;(function(Darkroom, fabric) {

  var _this = null;

  var actions = {
    activate: function() {
      var buttons = _this.buttons,
          opacity = _this.options.opacity,
          canvas  = _this.canvas,
          text    = _this.options.text;

      buttons.cancel.hide(false);
      buttons.ok.hide(false);
      _this.watermark = new fabric.Text(text, {opacity: opacity});
      canvas.add(_this.watermark);

      states.active();
    },
    deActivate: function() {
      var watermark = _this.watermark,
          buttons = _this.buttons,
          canvas  = _this.canvas;

      buttons.cancel.hide(true);
      buttons.ok.hide(true);
      canvas.remove(watermark);

      states.notActive();
    }
  };

  var states = {
    notActive: function() {
      var buttons = _this.buttons;

      buttons.watermark.addEventListener('click', actions.activate);
      buttons.cancel.element.removeEventListener('click', actions.deActivate);
    },
    active: function() {
      var buttons = _this.buttons;

      buttons.watermark.element.removeEventListener('click', actions.activate);
      buttons.watermark.addEventListener('click', actions.deActivate);
      buttons.cancel.addEventListener('click', actions.deActivate);
    }
  };

  Darkroom.plugins['watermark'] = Darkroom.Plugin.extend({
    defaults: {
      opacity: 1,
      text:    'Watermark Text'
    },
    initialize: function initDarkroomWatermarkPlugin() {
      _this = this;

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          darkroom    = this.darkroom,
          canvas      = darkroom.canvas,
          image       = darkroom.image;

      this.canvas = canvas;
      this.image  = image;

      var buttons = this.buttons = {};
      buttons.watermark = buttonGroup.createButton({image: 'watermark'});
      buttons.ok        = buttonGroup.createButton({image: 'accept', type: 'success', hide:  true});
      buttons.cancel    = buttonGroup.createButton({image: 'cancel', type: 'danger', hide: true});

      states.notActive();
    }
  });
})(Darkroom, fabric);
