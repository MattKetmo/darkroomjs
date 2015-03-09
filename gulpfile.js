var concat = require('gulp-concat')
var connect = require('gulp-connect')
var gulp = require('gulp')
var gutil = require('gulp-util')
var htmlJsStr = require('js-string-escape')
var inject = require('gulp-inject')
var plumber = require('gulp-plumber')
var rimraf = require('rimraf')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var spawn = require("child_process").spawn
var streamqueue = require('streamqueue')
var svgmin = require('gulp-svgmin')
var svgstore = require('gulp-svgstore')
var uglify = require('gulp-uglify')


//
// Variables
//
var srcDir = './lib';
var distDir = './build';
var isDebug = !gutil.env.prod;

//
// Default
//
gulp.task('default', ['build'], function() {
  gulp.start('watch');
});

//
// Clean
//
gulp.task('clean', function(cb) {
  rimraf(distDir, cb);
});

//
// Build
//
gulp.task('build', ['clean'], function() {
  gulp.start('scripts', 'styles');
});

//
// Watch
//
gulp.task('watch', ['server'], function() {
  gulp.watch(srcDir + '/js/**/*.js', ['scripts']);

  gulp.watch(srcDir + '/css/**/*.scss', ['styles']);
});

//
// Server
//
gulp.task('server', function() {
  connect.server({
    root: './demo',
    port: 2222,
    livereload: false
  });
});

//
// Javascript
//
gulp.task('scripts', function () {
  var svgs = gulp.src(srcDir + '/icons/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({inlineSvg: true}))
    // .pipe(gulp.dest(distDir));

  function fileContents (filePath, file) {
    return file.contents.toString();
  }

  gulp
    .src(srcDir + '/js/bootstrap.js')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest(distDir + '/js'))


  var files = [
    srcDir + '/js/darkroom.js',
    srcDir + '/js/plugins/darkroom.history.js',
    srcDir + '/js/plugins/darkroom.rotate.js',
    srcDir + '/js/plugins/darkroom.crop.js',
    srcDir + '/js/plugins/darkroom.save.js',
    srcDir + '/js/**/*.js',
    '!' + srcDir + '/js/bootstrap.js'
  ];

  gulp.src(files)
    .pipe(plumber())
    .pipe(isDebug ? sourcemaps.init() : gutil.noop())
      .pipe(concat('darkroom.js', {newLine: ';'}))
      .pipe(isDebug ? gutil.noop() : uglify({mangle: false}))
    .pipe(isDebug ? sourcemaps.write() : gutil.noop())
    .pipe(gulp.dest(distDir + '/js'))
})

//
// Stylesheet
//
gulp.task('styles', function () {
  gulp.src(srcDir + '/css/darkroom.scss')
    .pipe(plumber())
    .pipe(isDebug ? sourcemaps.init() : gutil.noop())
      .pipe(sass({
        outputStyle: isDebug ? 'nested' : 'compressed'
      }))
    .pipe(isDebug ? sourcemaps.write() : gutil.noop())
    .pipe(gulp.dest(distDir + '/css'))
})
