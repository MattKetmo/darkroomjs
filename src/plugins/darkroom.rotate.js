;(function(window, document) {

  window.DarkroomPlugins['rotate'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomRotatePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.leftButton = buttonGroup.createButton({
        image: 'images-rotate-left'
      });

      this.rightButton = buttonGroup.createButton({
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

      var darkroom = this.darkroom;
      var canvas = darkroom.canvas;

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

        darkroom.dispatchEvent(new Event('image:change'));
      };

      image.src = darkroom.snapshotImage();
    }
  });
})(window, document);
