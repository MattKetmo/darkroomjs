;(function(window, document, Darkroom) {
  'use strict';

  Darkroom.plugins['save'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomSavePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.destroyButton = buttonGroup.createButton({
        image: 'save'
      });

      this.destroyButton.addEventListener('click', this.darkroom.selfDestroy.bind(this.darkroom));
    },
  });
})(window, document, Darkroom);
