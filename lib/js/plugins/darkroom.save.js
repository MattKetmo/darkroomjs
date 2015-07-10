;(function(window, document, Darkroom) {
  'use strict';

  Darkroom.plugins['save'] = Darkroom.Plugin.extend({
    defaults: {
      callback: function() {
        this.darkroom.selfDestroy();
      }
    },

    initialize: function InitDarkroomSavePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.destroyButton = buttonGroup.createButton({
        image: 'save',
        label: 'Save'
      });

      this.destroyButton.addEventListener('click', this.options.callback.bind(this));
    }
  });
})(window, document, Darkroom);
