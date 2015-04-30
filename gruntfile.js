
module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower_concat: {
      all: {
        dest: 'client/static/_bower.js',
        cssDest: 'client/static/_bower.css',
      }
    }
  })

  // Load the plugin that provides the "coffee" task.
  grunt.loadNpmTasks('grunt-bower-concat');

  // Default task(s).
  grunt.registerTask('default', ['bower_concat']);

};
