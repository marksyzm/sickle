"use strict";

module.exports = function watch(grunt) {
	grunt.loadNpmTasks("grunt-contrib-watch");

    var files = [
        "public/js/src/**/*.js",
        "public/js/test/**/*.js",
        "lib/**/*.js",
        "test/**/*.js",
        "index.js"
    ];

	return {
        jshint: {
            files: files,
            tasks: ["jshint"]
        },
        mochacli: {
            files: files,
            tasks: ["mochacli:tests"]
        }
    };
};