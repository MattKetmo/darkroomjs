;(function(window, document) {

  var DarkroomDestroyPlugin = {
    name: 'destroy',

    defaults: {

    },

    init: function InitDarkroomRotatePlugin(darkroom, options) {
      this.darkroom = darkroom;
      this.options = Darkroom.extend(options, this.defaults);

      var buttonGroup = darkroom.toolbar.createButtonGroup();

      this.destroyButton = buttonGroup.createButton({
        image: 'content-save'
      });

      this.destroyButton.addEventListener('click', darkroom.selfDestroy.bind(darkroom));
    },
  }

  window.DarkroomPlugins.push(DarkroomDestroyPlugin);
})(window, document);
