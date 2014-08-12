# DarkroomJS

DarkroomJS is a JavaScript library which provides basic image editing tools in
your browser, such as **rotation** or **cropping**. It is based on the awesome
[FabricJS](http://fabricjs.com/) library to handle images in HTML5 canvas.

## Demo

Try the online demo at [http://mattketmo.github.io/darkroomjs](http://mattketmo.github.io/darkroomjs/)

The library is currently *work in progress*.
I know there is some bug especially when resizing the crop zone.
Feel free to fork the project or report issues on GitHub.
All ideas are also welcome.

## Building

- Install [Node](http://nodejs.org/)
- Install [Grunt](http://gruntjs.com/)
- The webfont is auto generated from SVG icons.
  This uses the [grunt-webfont](https://github.com/sapegin/grunt-webfont) task which
  requires `fontforge` and `ttfautohint`. See [the readme](https://github.com/sapegin/grunt-webfont#installation)
  for more details.
- Run `npm install`
- Run `grunt build`

Every assets will be generated into the `build/` directory.

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
      ratio: 1
    },
    save: false // disable plugin
  },
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

## License

DarkroomJS is released under the MIT License. See the [bundled LICENSE file](LICENSE)
for details.

