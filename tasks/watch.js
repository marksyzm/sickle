"use strict";

module.exports = function watch(grunt) {
	grunt.loadNpmTasks("grunt-contrib-watch");

	return {
        jshint: {
            files: [
                "public/js/src/**/*.js",
                "public/js/test/**/*.js",
                "lib/**/*.js",
                "index.js"
            ],
            tasks: ["jshint"]
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