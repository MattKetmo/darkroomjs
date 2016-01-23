import fabric from 'fabric';
import * as _ from 'lodash';

import {CropTransformation} from './crop-transformation';
import {CropZone} from './crop-zone';

export class CropHandler {

  constructor(darkroom, buttons, options = {}) {
    this._darkroom = darkroom;
    this._drawer = darkroom.workingDrawer;
    this._buttons = buttons;

    this._cropZone = null;

    // Init point
    this._startX = null;
    this._startY = null;

    // Keycrop
    this._isKeyCroping = false;
    this._isKeyLeft = false;
    this._isKeyUp = false;

    this._options = _.merge({
      // min crop dimension
      minHeight: 1,
      minWidth: 1,
      // ensure crop ratio
      ratio: null,
      // quick crop feature (set a key code to enable it)
      quickCropKey: false
    }, options);

    // Canvas events
    this._drawer.canvas.on('mouse:down', this._onMouseDown.bind(this));
    this._drawer.canvas.on('mouse:move', this._onMouseMove.bind(this));
    this._drawer.canvas.on('mouse:up', this._onMouseUp.bind(this));
    this._drawer.canvas.on('object:moving', this._onObjectMoving.bind(this));
    this._drawer.canvas.on('object:scaling', this._onObjectScaling.bind(this));
    fabric.util.addListener(fabric.document, 'keydown', this._onKeyDown.bind(this));
    fabric.util.addListener(fabric.document, 'keyup', this._onKeyUp.bind(this));

    // Subscribe to the transformation events
    this._darkroom.events.subscribe('transformation', () => this.releaseFocus());
  }

  selectZone(x, y, width, height, forceDimension) {
    if (!this.hasFocus()) {
      this.requireFocus();
    }

    if (!forceDimension) {
      this._renderCropZone(x, y, x + width, y + height);
    } else {
      this._cropZone.set({
        'left': x,
        'top': y,
        'width': width,
        'height': height
      });
    }

    let canvas = this._drawer.canvas;

    canvas.bringToFront(this._cropZone);
    this._cropZone.setCoords();
    canvas.setActiveObject(this._cropZone);
    canvas.calcOffset();
  }

  toggleCrop() {
    if (!this.hasFocus()) {
      this.requireFocus();
    } else {
      this.releaseFocus();
    }
  }

  crop() {
    let zone = this.getCurrentZone();

    if (!zone) {
      return Promise.resolve(null);
    }

    this.releaseFocus();

    return this._darkroom.applyTransformation(
      CropTransformation(zone)
    );
  }

  getCurrentZone() {
    if (!this.hasFocus()) {
      return null;
    }

    // Avoid croping empty zone
    if (this._cropZone.width < 1 && this._cropZone.height < 1) {
      return null;
    }

    let image = this._drawer.image;

    // Compute crop zone dimensions
    let top = this._cropZone.getTop() - image.getTop();
    let left = this._cropZone.getLeft() - image.getLeft();
    let width = this._cropZone.getWidth();
    let height = this._cropZone.getHeight();

    // Adjust dimensions to image only
    if (top < 0) {
      height += top;
      top = 0;
    }

    if (left < 0) {
      width += left;
      left = 0;
    }

    return {
      // Make sure to use relative dimension since the crop will be
      // applied on the source image.
      top: top / image.getHeight(),
      left: left / image.getWidth(),
      width: width / image.getWidth(),
      height: height / image.getHeight(),
    };

  }

  // Test wether crop zone is set
  hasFocus() {
    return this._cropZone !== null;
  }

  // Create the crop zone
  requireFocus() {
    this._cropZone = new CropZone({
      fill: 'transparent',
      hasBorders: false,
      originX: 'left',
      originY: 'top',
      // stroke: '#444',
      // strokeDashArray: [5, 5],
      // borderColor: '#444',
      cornerColor: '#444',
      cornerSize: 8,
      transparentCorners: false,
      lockRotation: true,
      hasRotatingPoint: false,
    });

    if (null !== this._options.ratio) {
      this._cropZone.set('lockUniScaling', true);
    }

    this._drawer.canvas.add(this._cropZone);
    this._drawer.canvas.defaultCursor = 'crosshair';
    this._refreshButtons();
  }

  // Remove the crop zone
  releaseFocus() {
    if (null === this._cropZone) {
      return;
    }

    this._cropZone.remove();
    this._cropZone = null;

    this._drawer.canvas.defaultCursor = 'default';
    this._refreshButtons();
  }

  _refreshButtons() {
    if (this.hasFocus()) {
      this._buttons.crop.className = 'darkroom-button--active';
      this._buttons.accept.className = 'darkroom-button--success';
      this._buttons.cancel.className = 'darkroom-button--danger';
      this._buttons.accept.disabled = false;
      this._buttons.cancel.disabled = false;
    } else {
      this._buttons.crop.className = '';
      this._buttons.accept.className = 'darkroom-button--hide';
      this._buttons.cancel.className = 'darkroom-button--hide';
      this._buttons.accept.disabled = true;
      this._buttons.cancel.disabled = true;
    }
  }

  // Avoid crop zone to go beyond the canvas edges
  _onObjectMoving(event) {
    if (!this.hasFocus()) {
      return;
    }

    let currentObject = event.target;

    if (currentObject !== this._cropZone) {
      return;
    }

    let canvas = this._drawer.canvas;
    let x = currentObject.getLeft(), y = currentObject.getTop();
    let w = currentObject.getWidth(), h = currentObject.getHeight();
    let maxX = canvas.getWidth() - w;
    let maxY = canvas.getHeight() - h;

    if (x < 0) {
      currentObject.set('left', 0);
    }
    if (y < 0) {
      currentObject.set('top', 0);
    }
    if (x > maxX) {
      currentObject.set('left', maxX);
    }
    if (y > maxY) {
      currentObject.set('top', maxY);
    }
  }

  // Prevent crop zone from going beyond the canvas edges (like mouseMove)
  _onObjectScaling(event) {
    if (!this.hasFocus()) {
      return;
    }

    let preventScaling = false;
    let currentObject = event.target;

    if (currentObject !== this._cropZone) {
      return;
    }

    let canvas = this._drawer.canvas;
    // let pointer = canvas.getPointer(event.e);

    let minX = currentObject.getLeft();
    let minY = currentObject.getTop();
    let maxX = currentObject.getLeft() + currentObject.getWidth();
    let maxY = currentObject.getTop() + currentObject.getHeight();

    if (null !== this._options.ratio) {
      if (minX < 0 || maxX > canvas.getWidth() || minY < 0 || maxY > canvas.getHeight()) {
        preventScaling = true;
      }
    }

    if (minX < 0 || maxX > canvas.getWidth() || preventScaling) {
      currentObject.setScaleX(this.lastScaleX || 1);
    }
    if (minX < 0) {
      currentObject.setLeft(0);
    }

    if (minY < 0 || maxY > canvas.getHeight() || preventScaling) {
      currentObject.setScaleY(this.lastScaleY || 1);
    }
    if (minY < 0) {
      currentObject.setTop(0);
    }

    if (currentObject.getWidth() < this._options.minWidth) {
      currentObject.scaleToWidth(this._options.minWidth);
    }
    if (currentObject.getHeight() < this._options.minHeight) {
      currentObject.scaleToHeight(this._options.minHeight);
    }

    this.lastScaleX = currentObject.getScaleX();
    this.lastScaleY = currentObject.getScaleY();
  }

  // Init crop zone
  _onMouseDown(event) {
    if (!this.hasFocus()) {
      return;
    }

    let canvas = this._drawer.canvas;

    // recalculate offset, in case canvas was manipulated since last `calcOffset`
    canvas.calcOffset();

    let pointer = canvas.getPointer(event.e);
    let x = pointer.x;
    let y = pointer.y;
    let point = new fabric.Point(x, y);

    // Check if user want to scale or drag the crop zone.
    let activeObject = canvas.getActiveObject();

    if (activeObject === this._cropZone || this._cropZone.containsPoint(point)) {
      return;
    }

    canvas.discardActiveObject();
    this._cropZone.setWidth(0);
    this._cropZone.setHeight(0);
    this._cropZone.setScaleX(1);
    this._cropZone.setScaleY(1);

    this._startX = x;
    this._startY = y;
  }

  // Extend crop zone
  _onMouseMove(event) {
    // Quick crop feature
    if (this._isKeyCroping) {
      this._onMouseMoveKeyCrop(event);
      return;
    }

    if (null === this._startX || null === this._startY) {
      return;
    }

    let canvas = this._drawer.canvas;
    let pointer = canvas.getPointer(event.e);
    let x = pointer.x;
    let y = pointer.y;

    this._renderCropZone(this._startX, this._startY, x, y);
  }

  _onMouseMoveKeyCrop(event) {
    let canvas = this._drawer.canvas;
    let zone = this._cropZone;

    let pointer = canvas.getPointer(event.e);
    let x = pointer.x;
    let y = pointer.y;

    if (!zone.left || !zone.top) {
      zone.setTop(y);
      zone.setLeft(x);
    }

    this._isKeyLeft = x < zone.left + zone.width / 2 ;
    this._isKeyUp = y < zone.top + zone.height / 2 ;

    this._renderCropZone(
      Math.min(zone.left, x),
      Math.min(zone.top, y),
      Math.max(zone.left + zone.width, x),
      Math.max(zone.top + zone.height, y)
    );
  }

  // Finish crop zone
  _onMouseUp(event) {
    if (null === this._startX || null === this._startY) {
      return;
    }

    // TODO
    // if (this._cropZone.width < 1 || this._cropZone.height < 1) {
    //   this.releaseFocus();
    // }

    let canvas = this._drawer.canvas;

    this._cropZone.setCoords();
    canvas.setActiveObject(this._cropZone);
    canvas.calcOffset();

    this._startX = null;
    this._startY = null;
  }

  _onKeyDown(event) {
    if (false === this._options.quickCropKey || event.keyCode !== this._options.quickCropKey || this._isKeyCroping) {
      return;
    }

    // Active quick crop flow
    this._isKeyCroping = true ;
    this._drawer.canvas.discardActiveObject();
    this._cropZone.setWidth(0);
    this._cropZone.setHeight(0);
    this._cropZone.setScaleX(1);
    this._cropZone.setScaleY(1);
    this._cropZone.setTop(0);
    this._cropZone.setLeft(0);
  }

  _onKeyUp(event) {
    if (false === this._options.quickCropKey || event.keyCode !== this._options.quickCropKey || !this._isKeyCroping) {
      return;
    }

    // Unactive quick crop flow
    this._isKeyCroping = false;
    this._startX = 1;
    this._startY = 1;
    this._onMouseUp();
  }

  _renderCropZone(fromX, fromY, toX, toY) {
    let canvas = this._drawer.canvas;

    let isRight = (toX > fromX);
    let isLeft = !isRight;
    let isDown = (toY > fromY);
    let isUp = !isDown;

    let minWidth = Math.min(+this._options.minWidth, canvas.getWidth());
    let minHeight = Math.min(+this._options.minHeight, canvas.getHeight());

    // Define corner coordinates
    let leftX = Math.min(fromX, toX);
    let rightX = Math.max(fromX, toX);
    let topY = Math.min(fromY, toY);
    let bottomY = Math.max(fromY, toY);

    // Replace current point into the canvas
    leftX = Math.max(0, leftX);
    rightX = Math.min(canvas.getWidth(), rightX);
    topY = Math.max(0, topY);
    bottomY = Math.min(canvas.getHeight(), bottomY);

    // Recalibrate coordinates according to given options
    if (rightX - leftX < minWidth) {
      if (isRight) {
        rightX = leftX + minWidth;
      } else {
        leftX = rightX - minWidth;
      }
    }
    if (bottomY - topY < minHeight) {
      if (isDown) {
        bottomY = topY + minHeight;
      } else {
        topY = bottomY - minHeight;
      }
    }

    // Truncate truncate according to canvas dimensions
    if (leftX < 0) {
      // Translate to the left
      rightX += Math.abs(leftX);
      leftX = 0;
    }
    if (rightX > canvas.getWidth()) {
      // Translate to the right
      leftX -= (rightX - canvas.getWidth());
      rightX = canvas.getWidth();
    }
    if (topY < 0) {
      // Translate to the bottom
      bottomY += Math.abs(topY);
      topY = 0;
    }
    if (bottomY > canvas.getHeight()) {
      // Translate to the right
      topY -= (bottomY - canvas.getHeight());
      bottomY = canvas.getHeight();
    }

    let width = rightX - leftX;
    let height = bottomY - topY;
    let currentRatio = width / height;

    if (this._options.ratio && +this._options.ratio !== currentRatio) {
      let ratio = +this._options.ratio;

      if (this._isKeyCroping) {
        isLeft = this._isKeyLeft;
        isUp = this._isKeyUp;
      }

      if (currentRatio < ratio) {
        let newWidth = height * ratio;

        if (isLeft) {
          leftX -= (newWidth - width);
        }
        width = newWidth;
      } else if (currentRatio > ratio) {
        let newHeight = height / (ratio * height / width);

        if (isUp) {
          topY -= (newHeight - height);
        }
        height = newHeight;
      }

      if (leftX < 0) {
        leftX = 0;
      }
      if (topY < 0) {
        topY = 0;
      }
      if (leftX + width > canvas.getWidth()) {
        let newWidth = canvas.getWidth() - leftX;

        height = newWidth * height / width;
        width = newWidth;
        if (isUp) {
          topY = fromY - height;
        }
      }
      if (topY + height > canvas.getHeight()) {
        let newHeight = canvas.getHeight() - topY;

        width = width * newHeight / height;
        height = newHeight;
        if (isLeft) {
          leftX = fromX - width;
        }
      }
    }

    // Apply coordinates
    this._cropZone.left = leftX;
    this._cropZone.top = topY;
    this._cropZone.width = width;
    this._cropZone.height = height;

    this._drawer.canvas.bringToFront(this._cropZone);

  }
}
