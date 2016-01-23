export function RotateTransformation(angle) {
  return (drawer) => {
    // Keep angle under 360
    angle = (drawer.image.getAngle() + angle) % 360;

    // Apply rotate on image
    drawer.image.rotate(angle);

    let height = Math.abs(drawer.image.getWidth() * (Math.sin(angle * Math.PI / 180))) +
      Math.abs(drawer.image.getHeight() * (Math.cos(angle * Math.PI / 180)));

    let width = Math.abs(drawer.image.getHeight() * (Math.sin(angle * Math.PI / 180))) +
      Math.abs(drawer.image.getWidth() * (Math.cos(angle * Math.PI / 180)));

    // Adjust canvas dimensions
    drawer.canvas.setWidth(width);
    drawer.canvas.setHeight(height);

    // Rerender canvas & image
    drawer.canvas.centerObject(drawer.image);
    drawer.image.setCoords();
    drawer.canvas.renderAll();
  };
}
