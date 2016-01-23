import {CropHandler} from './crop-handler';

export function CropPlugin(options) {
  return (darkroom) => {
    var cropButton = document.createElement('button');
    var acceptButton = document.createElement('button');
    var cancelButton = document.createElement('button');

    var buttons = {
      crop: cropButton,
      accept: acceptButton,
      cancel: cancelButton,
    };

    var handler = new CropHandler(darkroom, buttons, options);

    cropButton.innerHTML = require('./crop.svg');
    // cropButton.textContent = 'Crop';

    acceptButton.innerHTML = require('./done.svg');
    // acceptButton.textContent = 'Accept crop';
    acceptButton.className = 'darkroom-button--hide';
    acceptButton.disabled = true;

    cancelButton.innerHTML = require('./close.svg');
    // cancelButton.textContent = 'Cancel crop';
    cancelButton.className = 'darkroom-button--hide';
    cancelButton.disabled = true;

    darkroom.toolbarElement.appendChild(cropButton);
    darkroom.toolbarElement.appendChild(acceptButton);
    darkroom.toolbarElement.appendChild(cancelButton);

    // Buttons click
    cropButton.addEventListener('click', (event) => handler.toggleCrop());
    acceptButton.addEventListener('click', (event) => handler.crop());
    cancelButton.addEventListener('click', (event) => handler.releaseFocus());

    return handler;
  };
}
