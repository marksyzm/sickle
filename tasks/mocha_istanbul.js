"use strict";

module.exports = function mocha_istanbul(grunt) {
	grunt.loadNpmTasks("grunt-mocha-istanbul");

	return {
        coverage: {
            src: "test",
            options: {
                timeout: 6000,
                coverage:true
            }
        },
        coveralls: {
            src: "test",
            options: {
                timeout: 6000,
                coverage:true
            }
        }
	};
};
