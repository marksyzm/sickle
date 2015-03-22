"use strict";

module.exports = function (grunt) {

    require("grunt-config-dir")(grunt, {
        configDir: require("path").resolve("tasks")
    });

    grunt.loadNpmTasks('grunt-force-task');

    grunt.registerTask("test-cov",    [ "env:test", "lint", "mochacli:tests", "mocha_istanbul:coverage"]);
    grunt.registerTask("test",        [ "env:test", "lint", "mochacli:tests" ]);
    grunt.registerTask("coverage",    [ "env:test", "lint", "mocha_istanbul:coverage" ]);
    grunt.registerTask("coveralls",   [ "env:test", "lint", "mocha_istanbul:coveralls" ]);
    grunt.registerTask("dev",         [ "env:test", "force:mochacli:tests", "force:jshint", "watch" ]);
    grunt.registerTask("default",     [ "env:test" ]);
    grunt.registerTask("package",     [ "default"]);
    grunt.registerTask("lint",        [ "jshint" ]);
};