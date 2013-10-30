;(function(window, document) {

  var DarkroomRotatePlugin = {
    name: 'rotate',

    defaults: {

    },

    init: function InitDarkroomRotatePlugin(darkroom, options) {
      this.darkroom = darkroom;
      this.options = Darkroom.extend(options, this.defaults);

      this.leftButton = darkroom.toolbar.createButton({
        image: 'images-rotate-left'
      });

      this.rightButton = darkroom.toolbar.createButton({
        image: 'images-rotate-right'
      });

      this.leftButton.addEventListener('click', this.rotateLeft.bind(this));
      this.rightButton.addEventListener('click', this.rotateRight.bind(this));
    },

    rotateLeft: function rotateLeft() {
      this.rotate(-90);
    },

    rotateRight: function rotateRight() {
      this.rotate(90);
    },

    rotate: function rotate(angle) {
      var _this = this;

      var canvas = this.darkroom.canvas;

      // Snapshot current image
      var image = new Image();

      image.onload = function() {
        // Validate image
        if (this.height < 1 || this.width < 1) {
          return;
        }

        // Create new image
        var imgInstance = new fabric.Image(this, {
          top: this.width/2,
          left: this.height/2,
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
          hasBorders: false
        });
        imgInstance.rotate(angle);

        // Update canvas size
        canvas.setWidth(this.height);
        canvas.setHeight(this.width);

        // Add image
        _this.darkroom.image.remove();
        _this.darkroom.image = imgInstance;
        canvas.add(imgInstance);
      };

      image.src = canvas.toDataURL();
    }
  }

  window.DarkroomPlugins.push(DarkroomRotatePlugin);
})(window, document);
