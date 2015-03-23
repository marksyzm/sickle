"use strict";

var _ = require("lodash"),
    md5 = require("MD5"),
    request = require("request"),
    fs = require("fs"),
    sharp = require("sharp"),
    async = require("async"),
    mkdirp = require("mkdirp"),
    path = require("path");

var defaultOptions = {
        cacheDirectory: process.cwd() + "/cache",
        cacheMaxAge: 1000 * 60 * 60 * 24 * 100
    },
    defaultRequestData = {
        url: null,
        width: 300,
        height: 300,
        crop: false
    },
    contentTypes = [ "image/jpeg", "image/jpg", "image/png", "image/gif"],
    userAgent = "Sickle.js by marksyzm (ignore; Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36)";

function Sickle (options) {
    this.options = _.extend({}, defaultOptions, options);
}

Sickle.prototype.get = function (requestData, cb) {
    requestData = _.extend({}, defaultRequestData, requestData);

    var filePath = getFilePath(requestData, this.options);

    fs.stat(filePath, function (err) {
        if (err) {
            getRemoteImage(requestData, filePath, function (err, imageData) {
                if (err) { return cb(err, null); }
                cb(null, imageData);
            });
            return;
        }

        fs.readFile(filePath, function (err, data) {
            getImageData(new Buffer(data).toString("base64"), requestData, filePath, true, function (err, imageData) {
                if (err) { return cb(err, null); }
                cb(null, imageData);
            });
        });
    });
};

function getRemoteImage (requestData, filePath, cb) {
    // get the file from the URL
    request.get({
        uri: requestData.url,
        encoding: "base64",
        headers: { "user-agent": userAgent }
    }, function (err, response, data) {
        //check if in range of valid content types
        if (contentTypes.indexOf(response.headers["content-type"]) === -1) {
            return cb(new Error("Wrong content type"), null);
        }

        getImageData(data, requestData, filePath, false, function (err, imageData) {
            if (err) { return cb(err, null); }
            cb(null, imageData);
        });
    });
}

function getImageData (data, requestData, filePath, isCached, cb) {
    var seriesCalls;
    if (isCached) {
        seriesCalls = [
            getImageMetadataAndBuffer(filePath, cb)
        ];
    } else {
        seriesCalls = [
            createDirectory(filePath, cb),
            resizeImage(filePath, requestData, data, cb),
            getImageMetadataAndBuffer(filePath, cb)
        ];
    }

    async.series(seriesCalls);
}

function createDirectory (filePath, cb) {
    return function (asyncCallback) {
        mkdirp(path.dirname(filePath), function (err) {
            if (err) { cb(err, null); }
            asyncCallback(err);
        });
    };
}

function resizeImage (filePath, requestData, data, cb) {
    return function (asyncCallback) {
        var imageResize = sharp(new Buffer(data, "base64"))
            .metadata(function (err, metadata) {
                if (err) {
                    cb(err);
                    return asyncCallback(null);
                }

                var width, height;

                if (requestData.crop) {
                    width = requestData.width;
                    height = requestData.height;
                } else if (metadata.height > metadata.width) {
                    height = requestData.height;
                } else {
                    width = requestData.width;
                }

                imageResize
                    .resize(width, height)
                    .withMetadata()
                    .toFile(filePath, function (err) {
                        if (err) { cb(err); }
                        asyncCallback(null);
                    });
            });
    };
}

function getImageMetadataAndBuffer (filePath, cb) {
    return function (asyncCallback) {
        var image = sharp(filePath)
            .metadata(function (err, metadata) {
                if (err) {
                    cb(err, null);
                    return asyncCallback(err);
                }

                image.toBuffer().then(function (outputBuffer) {
                    cb(null, _.extend({}, metadata, {
                        data: outputBuffer.toString("base64"),
                        filePath: filePath
                    }));
                    asyncCallback(null);
                });
            });
    };
}


function getFilePath (requestData, options) {
    var cacheSubDirectory = requestData.width + "-" + requestData.height;
    cacheSubDirectory += requestData.crop ? "-crop" : "-nocrop";

    return options.cacheDirectory + "/" + cacheSubDirectory + "/" + md5(requestData.url);
}

module.exports = Sickle;

