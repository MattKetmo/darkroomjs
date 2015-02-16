;(function(Darkroom, fabric, window) {
  'use strict';

  var _this = null;

  Darkroom.plugins['dragndrop'] = Darkroom.Plugin.extend({
    defaults: {
      maxFileSize: (5 * 1024 * 1024),
      maxHeight:   720,
      minHeight:   300,
      maxWidth:    1270,
      minWidth:    400,
    },
    initialize: function initDarkroomDragnDropPlugin() {

      _this = this;

      var container = this.darkroom.container,
          darkroom  = this.darkroom,
          options   = this.options,
          canvas    = this.darkroom.canvas,
          image     = this.darkroom.image;

      container.addEventListener('dragover', function(event) {
        event.preventDefault();
      });

      window.webkitRequestFileSystem(TEMPORARY, options.maxFileSize, function(fs) {

        container.addEventListener('drop', function(event) {

          event.preventDefault();

          Array.prototype.forEach.call(event.dataTransfer.files, function(file) {

            fs.root.getFile(file.name, {create: true, exclusive: false}, function(fileEntry) {

              fabric.Image.fromURL(fileEntry.toURL(), function(img) {

                var height = Math.min(Math.max(options.minHeight, img.height), options.maxHeight),
                    width  = Math.min(Math.max(options.minWidth, img.width),   options.maxWidth);

                canvas.remove(image);
                canvas.setHeight(height);
                canvas.setWidth(width);

                img.set({
                  // options to make the image static
                  selectable: false,
                  evented: false,
                  lockMovementX: true,
                  lockMovementY: true,
                  lockRotation: true,
                  lockScalingX: true,
                  lockScalingY: true,
                  lockUniScaling: true,
                  hasControls: false,
                  hasBorders: false,
                  width: width,
                  height: height
                });
                canvas.add(img);

                darkroom.image = img;
                image          = img;
              });
            });
          });
        });
      });
    }
  });
})(Darkroom, fabric, window);
