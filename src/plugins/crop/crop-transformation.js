function computeImageViewPort(image) {
  return {
    height: Math.abs(image.getWidth() * (Math.sin(image.getAngle() * Math.PI / 180))) +
      Math.abs(image.getHeight() * (Math.cos(image.getAngle() * Math.PI / 180))),
    width: Math.abs(image.getHeight() * (Math.sin(image.getAngle() * Math.PI / 180))) +
      Math.abs(image.getWidth() * (Math.cos(image.getAngle() * Math.PI / 180)))
  };
}

export function CropTransformation(options = {}) {
  return (drawer) => new Promise((resolve, reject) => {
    // Snapshot the image delimited by the crop zone
    var snapshot = new Image();
    var viewport;
    var imageWidth;
    var imageHeight;
    var left;
    var top;
    var width;
    var height;

    snapshot.onload = function () {
      // Update canvas size
      drawer.canvas.setWidth(this.width);
      drawer.canvas.setHeight(this.height);

      // Add image
      drawer.setImage(snapshot);
      drawer.render();

      resolve();
    };

    viewport = computeImageViewPort(drawer.image);
    imageWidth = viewport.width;
    imageHeight = viewport.height;
    left = options.left * imageWidth;
    top = options.top * imageHeight;
    width = Math.min(options.width * imageWidth, imageWidth - left);
    height = Math.min(options.height * imageHeight, imageHeight - top);

    snapshot.src = drawer.canvas.toDataURL({
      left: left,
      top: top,
      width: width,
      height: height
    });
  });
}
