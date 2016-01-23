import * as _ from 'lodash';

const defaultOptions = {
  callback: (darkroom, dataUrlOptions) => new Promise((resolve, reject) => {
    // Darkroom elements
    let container = darkroom.containerElement;
    let canvas = darkroom.sourceDrawer.canvas;
    let image = darkroom.originalImageElement;

    // Remove canvas and replace the initial image
    image.onload = () => {
      image.style.display = '';
      container.parentNode.replaceChild(image, container);
      resolve();
    };

    // Export the source canvas
    image.src = canvas.toDataURL(dataUrlOptions);
  }),

  dataUrl: {
    format: 'png',
  }
};

export function SavePlugin(options = {}) {

  options = _.merge(defaultOptions, options);

  return (darkroom) => {
    let btn;
    let saveImage = () => {
      options.callback(darkroom, options.dataUrl);
    };

    btn = document.createElement('button');
    btn.innerHTML = require('./save.svg');
    // btn.textContent = 'Save';
    btn.addEventListener('click', saveImage);

    darkroom.toolbarElement.appendChild(btn);

    return {
      saveImage: saveImage,
    };
  };
}
