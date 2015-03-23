"use strict";

var expect = require("chai").expect,
    md5 = require("MD5");

var Sickle = require("../"),
    support = require("./support");

describe("Sickle", function () {
    var cachePath = process.cwd() + "/test/cache",
        testServer,
        sickle;

    before(function (done) {
        testServer = support.getServer();
        sickle = new Sickle({ cacheDirectory: cachePath });
        support.clearDirectory("./test/cache", [ ".gitignore" ]);

        done();
    });

    describe("when requesting an invalid link", function () {
        it.skip("should return file missing error on anything with HTTP != 200/30*", function () {

        });

        it.skip("should return error on wrong content type", function () {
            sickle.get({ url: "http://localhost:"+support.port+"/content-type-invalid" }, function (err, imageData) {
                expect(err).to.be.an("object");
                expect(err.message).to.equal("Wrong content type");
                expect(imageData).to.be.null;
            });
        });
    });

    describe("when requesting a real resized image", function () {
        it("should cache file and return a resized image from a remote source", function (done) {
            var url = "http://localhost:"+support.port+"/test.png",
                expectedPath = cachePath + "/300-300-nocrop/" + md5(url);

            expect(support.fileExists(expectedPath)).to.be.false;

            sickle.get({ url: url }, function (err, imageData) {
                expect(err).to.be.null;
                expect(imageData).to.be.an("object");

                // check cache exists based on returned image
                expect(imageData.filePath).to.equal(expectedPath);
                expect(support.fileExists(imageData.filePath)).to.be.true;

                // check file data
                expect(imageData.data).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);

                // check image contains the correct dimensions compared to the data
                expect(imageData.width).to.be.at.most(300);
                expect(imageData.height).to.be.at.most(300);
                expect(imageData.format).to.equal("png");

                done();
            });
        });

        it("should get cached file and return a resized image from a remote source", function () {
            var url = "http://localhost:"+support.port+"/test.png",
                expectedPath = cachePath + "/300-300-nocrop/" + md5(url);

            expect(support.fileExists(expectedPath)).to.be.true;

            sickle.get({ url: url }, function (err, imageData) {
                expect(err).to.be.null;
                expect(imageData).to.be.an("object");

                // check cache exists based on returned image
                expect(imageData.filePath).to.equal(expectedPath);
                expect(support.fileExists(imageData.filePath)).to.be.true;

                // check file data
                expect(imageData.data).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);

                // check image contains the correct dimensions compared to the data
                expect(imageData.width).to.be.at.most(300);
                expect(imageData.height).to.be.at.most(300);
                expect(imageData.format).to.equal("png");

                done();
            });
        });

        it.skip("should cache file and return a resized image from a local source", function () {

        });

        it.skip("should get cached file and return a resized image from a local source", function () {

        });
    });

    after(function(done){
        testServer.close(function () {
            done();
        });
    });
});