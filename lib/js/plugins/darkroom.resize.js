;(function(window, document, Darkroom) {
  'use strict';

  var buttons = {};

  var states = {
    resizeNotClicked: function() {
      buttons.resize.removeEventListener('click', actions.buttonClicked.click);
      buttons.resize.addEventListener('click', actions.buttonNotClicked.click);
    },
    resizeClicked: function() {
      buttons.resize.removeEventListener('click', actions.buttonNotClicked.click);
      buttons.resize.addEventListener('click', actions.buttonClicked.click);
    }
  };

  var actions = {
    buttonNotClicked: {
      click: function() {
        buttons.resize.active(true);
        buttons.cancel.hide(false);
        buttons.ok.hide(false);
        states.resizeClicked();
      }
    },
    buttonClicked: {
      click: function() {
        buttons.resize.active(false);
        buttons.cancel.hide(true);
        buttons.ok.hide(true);
        states.resizeNotClicked();
      }
    }
  };

  Darkroom.plugins['resize'] = Darkroom.Plugin.extend({
    defaults: {},
    initialize: function initDarkroomResizePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      buttons.resize = buttonGroup.createButton({
        image: 'resize',
        active: false
      });
      buttons.ok = buttonGroup.createButton({
        image: 'accept',
        type:  'success',
        hide:  true
      });
      buttons.cancel = buttonGroup.createButton({
        image: 'cancel',
        type:  'danger',
        hide:  true
      });

      buttons.cancel.addEventListener('click', actions.buttonClicked.click);
      states.resizeNotClicked();
    }
  });
})(window, document, Darkroom)
