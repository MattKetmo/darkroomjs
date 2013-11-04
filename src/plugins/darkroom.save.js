;(function(window, document) {

  window.DarkroomPlugins['save'] = Darkroom.Plugin.extend({
    defaults: {

    },

    initialize: function InitDarkroomSavePlugin(darkroom, options) {
      this.darkroom = darkroom;
      this.options = Darkroom.extend(options, this.defaults);

      var buttonGroup = darkroom.toolbar.createButtonGroup();

      this.destroyButton = buttonGroup.createButton({
        image: 'content-save'
      });

      this.destroyButton.addEventListener('click', darkroom.selfDestroy.bind(darkroom));
    },
  });
})(window, document);
