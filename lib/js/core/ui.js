(function () {
  'use strict';

  Darkroom.UI = {
    Toolbar: Toolbar,
    ButtonGroup: ButtonGroup,
    Button: Button,
  };

  // Toolbar object.
  function Toolbar(element) {
    this.element = element;
  }

  Toolbar.prototype = {
    createButtonGroup: function (_options) {
      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'darkroom-button-group';
      this.element.appendChild(buttonGroup);

      return new ButtonGroup(buttonGroup);
    },
  };

  // ButtonGroup object.
  function ButtonGroup(element) {
    this.element = element;
  }

  ButtonGroup.prototype = {
    createButton: function (options) {
      const defaults = {
        image: 'help',
        type: 'default',
        group: 'default',
        hide: false,
        disabled: false,
      };

      options = Darkroom.Utils.extend(options, defaults);

      const buttonElement = document.createElement('button');
      buttonElement.type = 'button';
      buttonElement.className = 'darkroom-button darkroom-button-' + options.type;
      buttonElement.innerHTML =
        '<svg class="darkroom-icon"><use xlink:href="#' + options.image + '" /></svg>';
      this.element.appendChild(buttonElement);

      const button = new Button(buttonElement);
      button.hide(options.hide);
      button.disable(options.disabled);

      return button;
    },
  };

  // Button object.
  function Button(element) {
    this.element = element;
  }

  Button.prototype = {
    addEventListener: function (eventName, listener) {
      this.element.addEventListener(eventName, listener);
    },
    removeEventListener: function (eventName, listener) {
      this.element.removeEventListener(eventName, listener);
    },
    active: function (value) {
      if (value) this.element.classList.add('darkroom-button-active');
      else this.element.classList.remove('darkroom-button-active');
    },
    hide: function (value) {
      if (value) this.element.classList.add('darkroom-button-hidden');
      else this.element.classList.remove('darkroom-button-hidden');
    },
    disable: function (value) {
      this.element.disabled = value ? true : false;
    },
  };
})();
