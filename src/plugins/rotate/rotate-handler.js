import {RotateTransformation} from './rotate-transformation';

export class RotateHandler {
  constructor(darkroom) {
    this._darkroom = darkroom;
  }

  rotate(angle) {
    return this._darkroom.applyTransformation(
      RotateTransformation(angle)
    );
  }

  rotateLeft() {
    return this.rotate(-90);
  }

  rotateRight() {
    return this.rotate(90);
  }
}
