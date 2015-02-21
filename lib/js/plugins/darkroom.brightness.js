;(function(Darkroom, fabric, document) {
  'use strict';

  Darkroom.plugins['brightness'] = Darkroom.Plugin.extend({

    defaults: {
      step: 10
    },

    initialize: function() {

      var buttonGroup = this.darkroom.toolbar.createButtonGroup(),
          options     = this.options,
          canvas      = this.darkroom.canvas,
          image       = this.darkroom.image;

      var button = buttonGroup.createButton({image: 'brightness'});

      button.addEventListener('mouseover', function() {
        button.active(true);
      });

      button.addEventListener('mouseout', function() {
        button.active(false);
      });

      button.addEventListener('wheel', function(event) {

        event.preventDefault();

        var deltaY = event.wheelDeltaY,
            step   = options.step;

        var brightness;

        if (deltaY < 0) { brightness = -step; }
        else            { brightness =  step; }

        image.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness }));
        image.applyFilters(canvas.renderAll.bind(canvas));
      });
    }
  });
})(Darkroom, fabric, document);
