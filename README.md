# DarkroomJS

![License MIT](http://img.shields.io/badge/license-MIT-blue.svg)

DarkroomJS is a JavaScript library which provides basic image editing tools in
your browser, such as **rotation** or **cropping**. It is based on the awesome
[FabricJS](http://fabricjs.com/) library to handle images in HTML5 canvas.


## ⚠️ IMPORTANT UPDATE

This library has been discontinued and is **no longer maintained**.

If you're looking for an alternative, you should have a look at **[Pintura Image Editor](https://www.ktm.sh/pintura)**.

- framework agnostic
- intuitive UI and mobile touch friendly
- resizing / free rotating
- color adjustment / photo filters
- annotating support
- and much more, [try the online demo](https://www.ktm.sh/pintura):

[![Pintura Image Editor demo](demo/images/doka-image-editor-gh.gif?raw=true "Pintura Image Editor (click on the image to view)")](https://www.ktm.sh/pintura)

[**[Demo] Try Pintura Image Editor →**](https://www.ktm.sh/pintura)

## Building

- Install [Node](http://nodejs.org/) & `npm`.
- Run `npm install` to build dependencies.
- Run `npm start` to build the assets and start the demo webserver.

## Usage

Simply instanciate a new Darkroom object with a reference to the image element:

```html
<img src="some-image.jpg" id="target">
<script>
  new Darkroom('#target');
</script>
```

You can also pass some options:

```javascript
new Darkroom('#target', {
  // Canvas initialization size
  minWidth: 100,
  minHeight: 100,
  maxWidth: 500,
  maxHeight: 500,

  // Plugins options
  plugins: {
    crop: {
      minHeight: 50,
      minWidth: 50,
      maxHeight: 500,
      maxWidth: 500,
      ratio: 1
    },
    save: false // disable plugin
  },

  // Post initialization method
  initialize: function() {
    // Active crop selection
    this.plugins['crop'].requireFocus();

    // Add custom listener
    this.addEventListener('core:transformation', function() { /* ... */ });
  }
});
```

## Why?

It's easy to get a javascript script to crop an image in a web page.
But if your want more features like rotation or brightness adjustment, then you
will have to do it yourself. No more jQuery plugins here.
It only uses the power of HTML5 canvas to make what ever you want with your image.

## The concept

The library is designed to be easily extendable. The core script only transforms
the target image to a canvas with a FabricJS instance, and creates an empty toolbar.
All the features are then implemented in separate plugins.

Each plugin is responsible for creating its own functionality.
Buttons can easily be added to the toolbar and binded with those features.

## Contributing

Run `npm develop` to build and watch the files while developing.

## FAQ

How can I access the edited image?

In order to get the edited image data, you must ask the canvas for it. By doing so inside the callback of your choice (in this case save), you can assign the edited image data to wherever you please.

```javascript
save: {
      callback: function() {
          this.darkroom.selfDestroy(); // Cleanup
          var newImage = dkrm.canvas.toDataURL();
          fileStorageLocation = newImage;
      }
  }
```

## License

DarkroomJS is released under the MIT License. See the [bundled LICENSE file](LICENSE)
for details.

