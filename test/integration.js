"use strict";

var Sickle = require("../"),
    expect = require("chai").expect,
    support = require("./support");

describe("Sickle", function () {
    var testServer,
        sickle;

    before(function (done) {
        testServer = support.getServer();
        sickle = new Sickle({ cacheDirectory: "./test/cache" });
        done();
    });

    describe("when requesting an invalid link", function () {
        it.skip("should return file missing error on anything with HTTP != 200/30*", function () {

        });

        it("should return error on wrong content type", function () {
            sickle.get({ url: "http://localhost:"+support.port+"/content-type-invalid" }, function (err, imageData) {
                expect(err).to.be.an("object");
                expect(err.message).to.equal("Wrong content type");
                expect(imageData).to.be.null;
            });
        });
    });

    describe("when requesting a real resized image", function () {
        it("should cache file and return a resized image from a remote source", function (done) {
            sickle.get({ url: "http://localhost:"+support.port+"/test.png" }, function (err, imageData) {
                expect(imageData).to.be.an("object");
                expect(err).to.be.null;
                // check cache exists based on returned image
                expect(imageData.path).to.be.a("string");
                // expect(fs.existsSync(imageData.path)).to.be.true;
                // check cached image contains the correct dimensions

                done();
            });
        });

        it("should get cached file and return a resized image from a remote source", function () {

        });

        it("should cache file and return a resized image from a local source", function () {

        });

        it("should get cached file and return a resized image from a local source", function () {

        });
    });

    after(function(done){
        testServer.close(function () {
            done();
        });
    });
});