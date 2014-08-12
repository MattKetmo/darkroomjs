'use strict';

module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    watch: {
      scripts: {
        files: 'lib/js/**/*.js',
        tasks: [ 'copy:main', 'uglify:main', 'clean:scripts' ]
      },
      stylesheets: {
        files: 'lib/css/**/*.scss',
        tasks: [ 'copy:main', 'webfont', 'sass', 'clean:stylesheets' ]
      }
    },

    copy: {
      main: {
        cwd: 'lib',
        src: [ '**' ],
        dest: 'build/lib',
        expand: true
      }
    },

    clean: {
      build: {
        src: [ 'build' ]
      },
      lib: {
        src: [ 'build/lib' ]
      },
      scripts: {
        src: [ 'build/lib/js' ]
      },
      stylesheets: {
        src: [ 'build/lib/css' ]
      },
      docco: {
        src: [ 'docs' ]
      }
    },

    uglify: {
      main: {
        options: {
          mangle: false,
          sourceMap: 'build/js/darkroom.min.js.map',
          sourceMappingURL: 'darkroom.min.js.map'
        },
        files: {
          'build/js/darkroom.min.js': [
            'build/lib/js/darkroom.js',
            'build/lib/js/plugins/darkroom.history.js',
            'build/lib/js/plugins/darkroom.rotate.js',
            'build/lib/js/plugins/darkroom.crop.js',
            'build/lib/js/plugins/darkroom.save.js',
            'build/lib/js/**/*.js'
          ]
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed',
          sourcemap: true
        },
        files: {
          'build/css/darkroom.min.css': 'build/lib/css/darkroom.scss'
        }
      }
    },

    webfont: {
      icons: {
        src: 'build/lib/icons/*.svg',
        dest: 'build/fonts',
        destCss: 'build/lib/css/webfont',
        options: {
          font: 'darkroom',
          //types: 'ttf',
          embed: 'woff,ttf',
          stylesheet: 'scss',
          relativeFontPath: '../fonts',
          htmlDemo: false,
          syntax: 'bootstrap',
          templateOptions: {
            classPrefix: 'darkroom-icon-'
          }
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 4000,
          base: '.',
          hostname: '*'
        }
      }
    },

    docco: {
      docs: {
        src: ['lib/js/**/*.js'],
        options: {
          output: 'docs/'
        }
      }
    }

  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-webfont');

  // define the tasks
  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    [ 'clean:build', 'copy', 'webfont', 'sass', 'uglify:main', 'clean:lib' ]
  );

  grunt.registerTask(
    'docs',
    'Compiles all of the assets and copies the files to the build directory.',
    [ 'clean:docco', 'docco']
  );

  grunt.registerTask(
    'default',
    'Build, watch and launch server.',
    [ 'build', 'connect', 'watch' ]
  );
};
