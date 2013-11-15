'use strict';

module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    watch: {
      scripts: {
        files: 'lib/js/**/*.js',
        tasks: [ 'copy:main', 'uglify:main', 'clean:scripts' ]
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
          sourceMap: 'build/js/darkroom.js.map',
          sourceMappingURL: 'darkroom.js.map'
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

    cssmin: {
      combine: {
        files: {
          'build/css/darkroom.min.css': [
            'build/lib/css/**/*.css',
          ]
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-docco');

  // define the tasks
  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    [ 'clean:build', 'copy', 'cssmin', 'uglify:main', 'clean:scripts', 'clean:stylesheets']
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
