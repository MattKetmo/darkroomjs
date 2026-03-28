/**
 * Axis-aligned bounding box of a rectangle rotated about its center.
 * Matches Darkroom.Utils.computeImageViewPort when passed Fabric image dimensions and angle.
 * @param {number} width
 * @param {number} height
 * @param {number} angleDeg rotation in degrees (same convention as Fabric)
 */
export function boundingBoxForRotatedRect(width, height, angleDeg) {
  const theta = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  return {
    height: Math.abs(width * sin) + Math.abs(height * cos),
    width: Math.abs(height * sin) + Math.abs(width * cos),
  };
}
