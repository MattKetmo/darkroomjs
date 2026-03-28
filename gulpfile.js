const concat = require('gulp-concat')
const connect = require('gulp-connect')
const gulp = require('gulp')
const { series, parallel } = require('gulp')
const inject = require('gulp-inject')
const plumber = require('gulp-plumber')
const rimraf = require('rimraf')
const gulpSass = require('gulp-sass')
const dartSass = require('sass')
const sass = gulpSass(dartSass)
const sourcemaps = require('gulp-sourcemaps')
const svgmin = require('gulp-svgmin')
const svgstore = require('gulp-svgstore')
const uglify = require('gulp-uglify')
const { PassThrough } = require('stream')

const srcDir = './lib'
const distDir = './build'

function debugMode() {
  return process.env.NODE_ENV !== 'production' && !process.argv.includes('--prod')
}

function noop() {
  return new PassThrough({ objectMode: true })
}

function clean(cb) {
  rimraf(distDir, cb)
}

function scripts() {
  const isDebug = debugMode()
  const svgs = gulp.src(`${srcDir}/icons/*.svg`)
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))

  function fileContents(filePath, file) {
    return file.contents.toString()
  }

  const files = [
    `${srcDir}/js/core/bootstrap.js`,
    `${srcDir}/js/core/darkroom.js`,
    `${srcDir}/js/core/*.js`,
    `${srcDir}/js/plugins/darkroom.history.js`,
    `${srcDir}/js/plugins/darkroom.rotate.js`,
    `${srcDir}/js/plugins/darkroom.crop.js`,
    `${srcDir}/js/plugins/darkroom.save.js`,
  ]

  return gulp.src(files)
    .pipe(plumber())
    .pipe(isDebug ? sourcemaps.init() : noop())
    .pipe(concat('darkroom.js', { newLine: ';' }))
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(isDebug ? noop() : uglify({ mangle: false }))
    .pipe(isDebug ? sourcemaps.write() : noop())
    .pipe(gulp.dest(distDir))
}

function styles() {
  const isDebug = debugMode()
  return gulp.src(`${srcDir}/css/darkroom.scss`)
    .pipe(plumber())
    .pipe(isDebug ? sourcemaps.init() : noop())
    .pipe(sass({
      style: isDebug ? 'expanded' : 'compressed',
      silenceDeprecations: ['legacy-js-api'],
    }).on('error', sass.logError))
    .pipe(isDebug ? sourcemaps.write() : noop())
    .pipe(gulp.dest(distDir))
}

function server(done) {
  connect.server({
    root: './demo',
    port: 2222,
    livereload: false,
  })
  done()
}

function watchFiles() {
  gulp.watch(`${srcDir}/js/**/*.js`, scripts)
  gulp.watch(`${srcDir}/css/**/*.scss`, styles)
  return Promise.resolve()
}

const build = series(clean, parallel(scripts, styles))

exports.scripts = scripts
exports.styles = styles
exports.clean = clean
exports.build = build
exports.server = server
exports.watch = series(server, watchFiles)
exports.default = series(build, exports.watch)
