;(function(Darkroom, fabric, window) {
  'use strict';

  var _this = null,
      root  = null;

  var requestFileSystem = (window.webkitRequestFileSystem || window.requestFileSystem);

  var eventListeners = {

    dragover: function(event) { event.preventDefault(); },

    drop: function(event) {

      var darkroom = _this.darkroom,
          options  = _this.options;

      event.preventDefault();

      Array.prototype.forEach.call(event.dataTransfer.files, function(file) {

        root.getFile(file.name, {create: true, exclusive: false}, function(fileEntry) {

          if      (!fileEntry.isFile)               { console.log('Darkroom drag and drop', 'not file.');     }
          else if (file.size > options.maxFileSize) { console.log('Darkroom drag and drop', 'file too big.'); }
          else if (!file.type.match('^image/.*'))   { console.log('Darkroom drag and drop', 'not image.');    }
          else {

            fabric.Image.fromURL(window.URL.createObjectURL(file), function(newImage) {

              darkroom.replaceImage(newImage);
              darkroom.dispatchEvent('image:new');
            });
          }
        });
      });
    }
  };

  Darkroom.plugins['dragndrop'] = Darkroom.Plugin.extend({
    defaults: {
      maxFileSize: (10 * 1024 * 1024)
    },
    initialize: function initDarkroomDragnDropPlugin() {

      if (typeof(window.indexedDB) == 'undefined') { console.log('Darkroom', 'drag and drop not supported.'); }
      else {

        _this = this;

        var container = this.darkroom.container,
            options   = this.options;

        requestFileSystem(TEMPORARY, options.maxFileSize, function(fs) {

          root = fs.root;
          container.addEventListener('dragover', eventListeners.dragover);
          container.addEventListener('drop', eventListeners.drop);
        });
      }
    }
  });
})(Darkroom, fabric, window);
