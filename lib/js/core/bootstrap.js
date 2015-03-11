(function() {
'use strict';

// Inject SVG icons into the DOM
var element = document.createElement('div');
element.id = 'darkroom-icons';
element.style = 'height: 0; width: 0; position: absolute; visibility: hidden';
element.innerHTML = '<!-- inject:svg --><!-- endinject -->';
document.body.appendChild(element);


})();
