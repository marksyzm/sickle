"use strict";

var expect = require("chai").expect,
    md5 = require("md5");

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
        it("should return file missing error on anything with HTTP != 200/30*", function () {
            sickle.get({ url: "http://localhost:"+support.port+"/404" }, function (err, imageData) {
                expect(err).to.be.an("object");
                expect(err.message).to.equal("Broken URL");
                expect(imageData).to.be.null;
            });
        });

        it("should return error on wrong content type", function () {
            sickle.get({ url: "http://localhost:"+support.port+"/content-type-invalid" }, function (err, imageData) {
                expect(err).to.be.an("object");
                expect(err.message).to.equal("Wrong content type");
                expect(imageData).to.be.null;
            });
        });

        it("should not contain data", function () {
            sickle.get({ url: "http://localhost:"+support.port+"/test-empty.png" }, function (err, imageData) {
                expect(err).to.be.an("object");
                expect(err.message).to.equal("No data");
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
                expect(imageData.path).to.equal(expectedPath);
                expect(support.fileExists(imageData.path)).to.be.true;

                // check file data
                expect(imageData.data).to.be.instanceOf(Buffer);
                expect(!!imageData.data.toString("base64")).to.be.true;

                // check image contains the correct dimensions compared to the data
                expect(imageData.size.width).to.be.at.most(300);
                expect(imageData.size.height).to.be.at.most(300);
                expect(imageData.format).to.equal("PNG");

                done();
            });
        });

        it("should get cached file and return a resized image from a remote source", function (done) {
            var url = "http://localhost:"+support.port+"/test.png",
                expectedPath = cachePath + "/300-300-nocrop/" + md5(url);

            expect(support.fileExists(expectedPath)).to.be.true;

            sickle.get({ url: url }, function (err, imageData) {
                expect(err).to.be.null;
                expect(imageData).to.be.an("object");
                expect(imageData.path).to.equal(expectedPath);
                expect(support.fileExists(imageData.path)).to.be.true;
                expect(imageData.data).to.be.instanceOf(Buffer);
                expect(!!imageData.data.toString("base64")).to.be.true;
                expect(imageData.size.width).to.be.at.most(300);
                expect(imageData.size.height).to.be.at.most(300);
                expect(imageData.format).to.equal("PNG");

                done();
            });
        });

        it("should work with a gif", function (done) {
            var url = "http://localhost:"+support.port+"/test.gif",
                expectedPath = cachePath + "/300-300-nocrop/" + md5(url);

            expect(support.fileExists(expectedPath)).to.be.false;

            sickle.get({ url: url }, function (err, imageData) {
                expect(err).to.be.null;
                expect(imageData).to.be.an("object");
                expect(imageData.path).to.equal(expectedPath);
                expect(support.fileExists(imageData.path)).to.be.true;
                expect(!!imageData.data.toString("base64")).to.be.true;
                expect(imageData.size.width).to.be.at.most(300);
                expect(imageData.size.height).to.be.at.most(300);

                expect(imageData.format).to.equal("GIF");

                done();
            });
        });

        it("should work with a jpg", function (done) {
            var url = "http://localhost:"+support.port+"/test.jpg",
                expectedPath = cachePath + "/300-300-nocrop/" + md5(url);

            expect(support.fileExists(expectedPath)).to.be.false;

            sickle.get({ url: url }, function (err, imageData) {
                expect(err).to.be.null;
                expect(imageData).to.be.an("object");
                expect(imageData.path).to.equal(expectedPath);
                expect(support.fileExists(imageData.path)).to.be.true;
                expect(imageData.data).to.be.instanceOf(Buffer);
                expect(!!imageData.data.toString("base64")).to.be.true;
                expect(imageData.size.width).to.be.at.most(300);
                expect(imageData.size.height).to.be.at.most(300);
                expect(imageData.format).to.equal("JPEG");

                done();
            });
        });

        it("should crop and match dimensions", function (done) {
            var url = "http://localhost:"+support.port+"/test.jpg",
                expectedPath = cachePath + "/300-300-crop/" + md5(url);

            expect(support.fileExists(expectedPath)).to.be.false;

            sickle.get({ url: url, crop: true }, function (err, imageData) {
                expect(err).to.be.null;
                expect(imageData).to.be.an("object");
                expect(imageData.path).to.equal(expectedPath);
                expect(support.fileExists(imageData.path)).to.be.true;
                expect(imageData.data).to.be.instanceOf(Buffer);
                expect(!!imageData.data.toString("base64")).to.be.true;
                expect(imageData.size.width).to.equal(300);
                expect(imageData.size.height).to.equal(300);
                expect(imageData.format).to.equal("JPEG");

                done();
            });
        });
    });

    after(function(done){
        support.clearDirectory("./test/cache", [ ".gitignore" ]);
        testServer.close(function () {
            done();
        });
    });
});
