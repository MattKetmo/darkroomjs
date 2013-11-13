'use strict';

module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    copy: {
      main: {
        cwd: 'src',
        src: [ '**' ],
        dest: 'build/src',
        expand: true
      }
    },

    clean: {
      build: {
        src: [ 'build' ]
      },
      scripts: {
        src: [ 'build/src' ]
      }
    },

    uglify: {
      main: {
        options: {
          mangle: false,
          sourceMap: 'build/darkroom.map.js',
          sourceMappingURL: 'darkroom.map.js'
        },
        files: {
          'build/darkroom.min.js': [
            'build/src/darkroom.js',
            'build/src/plugins/darkroom.history.js',
            'build/src/plugins/darkroom.crop.js',
            'build/src/plugins/darkroom.rotate.js',
            'build/src/plugins/darkroom.save.js',
            'build/src/**/*.js'
          ]
        }
      }
    }

  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // define the tasks
  grunt.registerTask(
    'default',
    'Compiles all of the assets and copies the files to the build directory.',
    [ 'clean:build', 'copy', 'uglify:main', 'clean:scripts' ]
  );
};
