"use strict";

var Sickle = require("../"),
    expect = require("chai").expect;

describe("Sickle", function () {
    describe("when configuring", function () {
        it("should be constructable", function () {
            expect(Sickle).to.be.a("function");
            var sickle = new Sickle();

            expect(sickle).to.be.an("object");
            expect(sickle.options).to.be.an("object");
            expect(sickle.options.cacheDirectory).to.be.a("string");

            /*expect(sickle.options.cacheMaxAge).to.be.a("number");
            expect(sickle.options.cacheMaxAge).to.be.at.least(-1);*/

            expect(sickle.get).to.be.a("function");
        });

        it.skip("should return an image object", function () {

        });
    });
});