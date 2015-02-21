;(function(Darkroom, fabric, window) {
  'use strict';

  var _this = null,
      root  = null;

  var requestFileSystem = (window.webkitRequestFileSystem || window.requestFileSystem);

  var helpers = {

    getOptions: function(img) {

      var OPTS = [
        'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY',
        'lockUniScaling', 'hasControls', 'hasBorders', 'selectable', 'evented'
      ];

      return OPTS.reduce(

        function(acc, opt) {

          acc[opt] = img.get('name');
          return acc;
        },
        {}
      );
    }
  };

  var eventListeners = {

    dragover: function(event) { event.preventDefault(); },

    drop: function(event) {

      var currentImage = _this.image,
          darkroom     = _this.darkroom,
          options      = _this.options,
          canvas       = _this.canvas;

      event.preventDefault();

      Array.prototype.forEach.call(event.dataTransfer.files, function(file) {

        root.getFile(file.name, {create: true, exclusive: false}, function(fileEntry) {

          if (fileEntry.isFile && file.type.match('^image/.*') && file.size <= options.maxFileSize) {

            fabric.Image.fromURL(window.URL.createObjectURL(file), function(newImage) {

              var height = Math.min(Math.max(options.minHeight, newImage.height), options.maxHeight),
                  width  = Math.min(Math.max(options.minWidth, newImage.width),   options.maxWidth);

              canvas.remove(currentImage);
              canvas.setHeight(height);
              canvas.setWidth(width);

              newImage
                .set(helpers.getOptions(currentImage))
                .set({height: height, width: width});

              canvas.add(newImage);

              darkroom.image = newImage;
              currentImage   = newImage;
            });
          }
        });
      });
    }
  };

  Darkroom.plugins['dragndrop'] = Darkroom.Plugin.extend({
    defaults: {
      maxFileSize: (5 * 1024 * 1024),
      maxWidth:    800,
      maxHeight:   600,
      minHeight:   300,
      minWidth:    400,
    },
    initialize: function initDarkroomDragnDropPlugin() {

      _this = this;

      var container = this.darkroom.container,
          options   = this.options;

      this.darkroom = this.darkroom,
      this.canvas   = this.darkroom.canvas,
      this.image    = this.darkroom.image;

      container.addEventListener('dragover', eventListeners.dragover);

      requestFileSystem(TEMPORARY, options.maxFileSize, function(fs) {

        root = fs.root;
        container.addEventListener('drop', eventListeners.drop);
      });
    }
  });
})(Darkroom, fabric, window);
