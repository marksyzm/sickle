"use strict";

module.exports = function watch(grunt) {
	grunt.loadNpmTasks("grunt-contrib-watch");

	return {
        jshint: {
            files: [
                "public/js/src/**/*.js",
                "public/js/test/**/*.js",
                "lib/**/*.js",
                "test/**/*.js",
                "index.js"
            ],
            tasks: ["jshint"]
        },
        mochacli: {
            files: [
                "test/**/*.js"
            ],
            tasks: ["mochacli:tests"]
        },
        server: {
            files: [
                "index.js",
                "app/**"
            ],
            options: {
                autoreload: true,
                ignore: [
                    "node_modules/**/*.js"
                ]
            }
        }
    };
};