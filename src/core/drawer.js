import fabric from 'fabric';
import * as _ from 'lodash';

export class Drawer {
  constructor(imageElement, options = {}) {

    this.options = _.merge({
      minWidth: null,
      minHeight: null,
      maxWidth: null,
      maxHeight: null,
      ratio: null,
      backgroundColor: '#fff',
      className: 'darkroom-drawer'
    }, options);

    this.containerElement = document.createElement('div');
    this.canvasElement = document.createElement('canvas');

    this.containerElement.className = this.options.className;
    this.containerElement.appendChild(this.canvasElement);

    this.imageElement = imageElement;

    this.canvas = new fabric.Canvas(this.canvasElement, {
      backgroundColor: this.options.backgroundColor,
      selection: false
    });

    this.setImage(this.imageElement);
    this.render();
  }

  setImage(imageElement) {
    if (this.image) {
      this.image.remove();
    }

    this.image = new fabric.Image(imageElement, {
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
  }

  setFabricImage(image) {
    if (this.image) {
      this.image.remove();
    }

    this.image = image;

    this.image.set('selectable', false);
    this.image.set('evented', false);
    this.image.set('lockMovementX', true);
    this.image.set('lockMovementY', true);
    this.image.set('lockRotation', true);
    this.image.set('lockScalingX', true);
    this.image.set('lockScalingY', true);
    this.image.set('lockUniScaling', true);
    this.image.set('hasControls', false);
    this.image.set('hasBorders', false);
  }

  render() {
    // Adjust width or height according to specified ratio
    var viewport = this._computeImageViewPort(this.image);
    var canvasWidth = viewport.width;
    var canvasHeight = viewport.height;
    var canvasRatio;
    var currentRatio;
    var scaleMin = 1;
    var scaleMax = 1;
    var scaleX = 1;
    var scaleY = 1;
    var scale;

    if (null !== this.options.ratio) {
      canvasRatio = +this.options.ratio;
      currentRatio = canvasWidth / canvasHeight;

      if (currentRatio > canvasRatio) {
        canvasHeight = canvasWidth / canvasRatio;
      } else if (currentRatio < canvasRatio) {
        canvasWidth = canvasHeight * canvasRatio;
      }
    }

    // Then scale the image to fit into dimension limits
    if (null !== this.options.maxWidth && this.options.maxWidth < canvasWidth) {
      scaleX = this.options.maxWidth / canvasWidth;
    }
    if (null !== this.options.maxHeight && this.options.maxHeight < canvasHeight) {
      scaleY = this.options.maxHeight / canvasHeight;
    }
    scaleMin = Math.min(scaleX, scaleY);

    scaleX = 1;
    scaleY = 1;
    if (null !== this.options.minWidth && this.options.minWidth > canvasWidth) {
      scaleX = this.options.minWidth / canvasWidth;
    }
    if (null !== this.options.minHeight && this.options.minHeight > canvasHeight) {
      scaleY = this.options.minHeight / canvasHeight;
    }
    scaleMax = Math.max(scaleX, scaleY);

    scale = scaleMax * scaleMin; // one should be equals to 1

    canvasWidth *= scale;
    canvasHeight *= scale;

    this.image.setScaleX(1 * scale);
    this.image.setScaleY(1 * scale);
    this.canvas.add(this.image);
    this.canvas.setWidth(canvasWidth);
    this.canvas.setHeight(canvasHeight);
    this.canvas.centerObject(this.image);
    this.image.setCoords();
  }

  _computeImageViewPort(image) {
    return {
      height: Math.abs(image.getWidth() * (Math.sin(image.getAngle() * Math.PI / 180))) +
        Math.abs(image.getHeight() * (Math.cos(image.getAngle() * Math.PI / 180))),
      width: Math.abs(image.getHeight() * (Math.sin(image.getAngle() * Math.PI / 180))) +
        Math.abs(image.getWidth() * (Math.cos(image.getAngle() * Math.PI / 180)))
    };
  }
}
