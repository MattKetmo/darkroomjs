;(function(Darkroom, fabric, window) {
  'use strict';

  var eventListeners = {

    dragover: function(event) { event.preventDefault(); },

    drop: function(event) {

      var darkroom = this.darkroom,
          options  = this.options;

      event.preventDefault();

      if (event.dataTransfer.files.length > 0) {

        var file = event.dataTransfer.files[0];

        if      (file.size > options.maxFileSize) { console.log('Darkroom drag and drop', 'file too big.'); }
        else if (!file.type.match('^image/.*'))   { console.log('Darkroom drag and drop', 'not image.');    }
        else {

          fabric.Image.fromURL(window.URL.createObjectURL(file), function(newImage) {

            darkroom.replaceImage(newImage);
            darkroom.dispatchEvent('image:new');
          });
        }
      }
    }
  };

  Darkroom.plugins['dragndrop'] = Darkroom.Plugin.extend({
    defaults: {
      maxFileSize: (10 * 1024 * 1024)
    },
    initialize: function() {

      var container = this.darkroom.container;

      container.addEventListener('dragover', eventListeners.dragover);
      container.addEventListener('drop', eventListeners.drop.bind(this));
    }
  });
})(Darkroom, fabric, window);
