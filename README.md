# DarkroomJS

DarkroomJS is a JavaScript library which provides basic image editing tools in
your browser, such as **rotation** or **cropping**. It is based on the awesome
[FabricJS](http://fabricjs.com/) library to handle images in HTML5 canvas.

## Demo

Try the online demo at [http://mattketmo.github.io/darkroomjs](http://mattketmo.github.io/darkroomjs/)

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

DarkroomJS is released under the MIT License. See the bundled LICENSE file for details.

