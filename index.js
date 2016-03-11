"use strict";

var _ = require("lodash"),
    md5 = require("MD5"),
    request = require("request"),
    fs = require("fs"),
    gm = require("gm"),
    async = require("async"),
    mkdirp = require("mkdirp"),
    path = require("path");

var defaultOptions = {
        scaleUp: false,
        quality: 90,
        cacheDirectory: process.cwd() + "/cache"/*,
         cacheMaxAge: 1000 * 60 * 60 * 24 * 100*/
    },
    defaultRequestData = {
        url: null, /*width: 800, height: 800,*/ crop: false
    },
    contentTypes = [ "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    userAgent = "Sickle.js by marksyzm (ignore; Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36)";

function Sickle (options) {
    this.options = _.extend({}, defaultOptions, options);
}

Sickle.prototype.get = function (requestData, cb) {
    requestData = _.extend({}, defaultRequestData, requestData);

    var filePath = getFilePath(requestData, this.options);
    var options = this.options;

    fs.stat(filePath, function (err) {
        if (err) {
            getRemoteImage(requestData, filePath, options, function (err, imageData) {
                if (err) { return cb(err, null); }
                cb(null, imageData);
            });
            return;
        }

        fs.readFile(filePath, function (err, data) {
            getImageData(data, requestData, filePath, true, options, function (err, imageData) {
                if (err) { return cb(err, null); }
                cb(null, imageData);
            });
        });
    });
};

function getRemoteImage (requestData, filePath, options, cb) {
    // get the file from the URL
    request.get({
        uri: requestData.url, encoding: null, headers: { "user-agent": userAgent }
    }, function (err, response, data) {
        if (err) { return cb(new Error("Broken request")); }
        // check status codes
        if ([200,301,302].indexOf(response.statusCode) === -1) { return cb(new Error("Broken URL")); }
        // check if in range of valid content types
        if (contentTypes.indexOf(response.headers["content-type"]) === -1) {
            return cb(new Error("Wrong content type"), null);
        }
        // check if data exists or is valid
        if (!data || !data.toString("base64")) {
            return cb(new Error("No data"), null);
        }

        getImageData(data, requestData, filePath, false, options, function (err, imageData) {
            if (err) { return cb(err, null); }
            cb(null, imageData);
        });
    });
}

function getImageData (data, requestData, filePath, isCached, options, cb) {
    var seriesCalls;
    if (isCached) {
        seriesCalls = [
            getImageMetadataAndBuffer(filePath, cb)
        ];
    } else {
        seriesCalls = [
            createDirectory(filePath, cb),
            resizeImage(filePath, requestData, data, options, cb),
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

function resizeImage (filePath, requestData, data, options, cb) {
    return function (asyncCallback) {
        gm(data)
            .identify(function (err, metadata) {
                if (err) { return (err), asyncCallback(null); }

                var width, height;
                var size = metadata.size;


                // This lets us use just a width or height if desired
                if("height" in requestData){
                    requestData.height = parseInt(requestData.height)
                }

                if("width" in requestData){
                    requestData.width = parseInt(requestData.width)
                }

                if(typeof(requestData.height) !== "undefined" && typeof(requestData.width) === "undefined" ){
                    var aspect = size.width / size.height;
                    requestData.width = aspect * requestData.height;
                }

                if(typeof(requestData.width) !== "undefined" && typeof(requestData.height) === "undefined" ){
                    var aspect = size.height / size.width;
                    requestData.height = aspect * requestData.width;
                }
                    // might be a good idea to add a maximum size param? Don't want to store people's 24mp images.

                if (requestData.originalSize){
                    // No need to resize at all
                } else if (options.scaleUp || (!options.scaleUp && ( size.width > requestData.width || size.height > requestData.height)) ) {
                    this.quality(options.quality);
                    if (requestData.crop) {
                        width = requestData.width;
                        height = requestData.height;
                        this.resize(width, height, "^").gravity("Center").crop(width, height);
                    } else if (size.height > size.width) {
                        height = requestData.height;
                    } else {
                        width = requestData.width;
                    }

                    if (!requestData.crop) {
                        this.resize(width, height);
                    }
                }

                this.write(filePath, function (err) {
                    if (err) { cb(err); }
                    asyncCallback(null);
                });
            });
    };
}

function getImageMetadataAndBuffer (filePath, cb) {
    return function (asyncCallback) {
        gm(filePath)
            .identify(function (err, metadata) {
                if (err) {return cb(err, null), asyncCallback(err);}

                this.toBuffer(function (err, outputBuffer) {
                    if (err) { return cb(err, null), asyncCallback(err);}
                    cb(null, _.extend({}, metadata, {
                        data: outputBuffer
                    }));
                    asyncCallback(null);
                });
            });
    };
}


function getFilePath (requestData, options) {
    if(requestData.originalSize){
        var cacheSubDirectory = "originalSize";
    } else {
        var cacheSubDirectory = requestData.width + "-" + requestData.height;
    }

    cacheSubDirectory += requestData.crop ? "-crop" : "-nocrop";

    return options.cacheDirectory + "/" + cacheSubDirectory + "/" + md5(requestData.url);
}

module.exports = Sickle;