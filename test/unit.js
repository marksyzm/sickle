"use strict";

var sinon = require("sinon"),
    request = require("request"),
    Sickle = require("../"),
    expect = require("chai").expect;

describe("Sickle", function () {
    before(function(done){
        /*sinon
            .stub(request, "get")
            .yields(null, null, {  });*/

        done();
    });

    var sickle;
    describe("when configuring", function () {
        it("should be constructable", function () {
            expect(Sickle).to.be.a("function");
            sickle = new Sickle();
            expect(sickle).to.be.an("object");
            expect(sickle.options.cacheDirectory).to.be.a("string");
            expect(sickle.options.cacheMaxAge).to.be.a("number");
            expect(sickle.options.cacheMaxAge).to.be.at.least(-1);
            expect(sickle.get).to.be.a("function");
        });
    });

    describe.skip("when requesting a real resized image", function () {
        it("should return a real resized image", function () {

        });
    });

    describe.skip("when requesting a broken link", function () {
        it("should return an error", function () {

        });
    });

    after(function(done){
        //request.get.restore();
        done();
    });
});