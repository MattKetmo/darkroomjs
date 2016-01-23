import {HistoryHandler} from './history-handler';

export function HistoryPlugin() {
  return (darkroom) => {
    var undoButton = document.createElement('button');
    var redoButton = document.createElement('button');

    var handler = new HistoryHandler(darkroom, {
      undo: undoButton,
      redo: redoButton,
    });

    undoButton.innerHTML = require('./undo.svg');
    // undoButton.textContent = 'Undo';
    undoButton.disabled = true;
    undoButton.addEventListener('click', (event) => handler.undo());

    redoButton.innerHTML = require('./redo.svg');
    // redoButton.textContent = 'Redo';
    redoButton.disabled = true;
    redoButton.addEventListener('click', (event) => handler.redo());

    darkroom.toolbarElement.appendChild(undoButton);
    darkroom.toolbarElement.appendChild(redoButton);

    return handler;
  };
}
