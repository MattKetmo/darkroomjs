;(function(window, document) {

  window.DarkroomPlugins['save'] = Darkroom.Plugin.extend({
    initialize: function InitDarkroomSavePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.destroyButton = buttonGroup.createButton({
        image: 'content-save'
      });

      this.destroyButton.addEventListener('click', this.darkroom.selfDestroy.bind(this.darkroom));
    },
  });
})(window, document);
