export class HistoryHandler {
  constructor(darkroom, buttons) {
    this._darkroom = darkroom;
    this._buttons = buttons;

    // this.originalImage = originalImage;
    this._darkroom.sourceDrawer.image.clone((clone) => {
      this.originalImage = clone;
    });

    this._doneTransformations = [];
    this._undoneTransformations = [];

    // Subscribe to the transformation events
    this._darkroom.events.subscribe('transformation', (payload) => {
      // Stack the transformation
      this._doneTransformations.push(payload.transformation);

      // Empty the undone transformations
      this._undoneTransformations = [];

      // Update the buttons
      this._refreshButtons();
    });
  }

  undo() {
    if (0 === this._doneTransformations.length) {
      return Promise.resolve(null);
    }

    this._undoneTransformations.unshift(
      this._doneTransformations.pop()
    );

    return this._resetOriginalImage()
      .then(() => this._applyTransformations(this._doneTransformations))
      .then(() => this._refreshButtons())
      .then(() => {
        this._darkroom.sourceDrawer.image.cloneAsImage((clone) => {
          this._darkroom.workingDrawer.setFabricImage(clone);
          this._darkroom.workingDrawer.render();
        });
      })
    ;
  }

  redo() {
    if (0 === this._undoneTransformations.length) {
      return Promise.resolve(null);
    }

    let transformation = this._undoneTransformations.shift();

    // Apply transformation
    let action = transformation(this._darkroom.sourceDrawer);

    // If action did not returned Promise then create empty one
    if (!action || typeof action.then !== 'function') {
      action = Promise.resolve(null);
    }

    return action.then(() => {
      this._darkroom.sourceDrawer.image.cloneAsImage((clone) => {
        this._darkroom.workingDrawer.setFabricImage(clone);
        this._darkroom.workingDrawer.render();
      });
    }).then(() => {
      this._doneTransformations.push(transformation);
      this._refreshButtons();
    });
  }

  _refreshButtons() {
    this._buttons.undo.disabled = (0 === this._doneTransformations.length);
    this._buttons.redo.disabled = (0 === this._undoneTransformations.length);
  }

  _resetOriginalImage() {
    return new Promise((resolve, reject) => {
      this.originalImage.clone((clone) => {
        this._darkroom.sourceDrawer.setFabricImage(clone);
        this._darkroom.sourceDrawer.render();
        resolve();
      });
    });
  }

  _applyTransformations(transformations) {
    if (0 === transformations.length) {
      return Promise.resolve(null);
    }

    let transformation = transformations[0];
    let action = transformation(this._darkroom.sourceDrawer);

    // If action did not returned Promise then create empty one
    if (!action || typeof action.then !== 'function') {
      action = Promise.resolve(null);
    }

    return action.then(() => this._applyTransformations(transformations.slice(1)));
  }
}
