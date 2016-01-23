import {RotateHandler} from './rotate-handler';

export function RotatePlugin(options) {
  return (darkroom) => {
    var buttonLeft, buttonRight;

    this.handler = new RotateHandler(darkroom);

    buttonLeft = document.createElement('button');
    buttonLeft.innerHTML = require('./rotate-left.svg');
    // buttonLeft.textContent = 'Rotate left';
    buttonLeft.addEventListener('click', (event) => this.handler.rotateLeft());

    buttonRight = document.createElement('button');
    buttonRight.innerHTML = require('./rotate-right.svg');
    // buttonRight.textContent = 'Rotate right';
    buttonRight.addEventListener('click', (event) => this.handler.rotateRight());

    darkroom.toolbarElement.appendChild(buttonLeft);
    darkroom.toolbarElement.appendChild(buttonRight);

    return this.handler;
  };
}
