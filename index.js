"use strict";

/*var Promise = require("bluebird"),
    gm = require("gm"),
    util = require("../util"),
    fs = require("fs"),
    path = require("path"),
    moment = require("moment"),
    request = require("request"),
    urlLib = require("url");*/

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
    var self = this;
    requestData = _.extend({}, defaultRequestData, requestData);

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

        getImageData(requestData.url, data, requestData, self.options, function (err, imageData) {
            if (err) { return cb(err, null); }
            cb(null, imageData);
        });
    });
};

function getImageData (url, data, requestData, options, cb) {
    var filePath = getFilePath(url, requestData, options);

    async.series([
        function (callback) {
            mkdirp(path.dirname(filePath), function (err) {
                if (err) { cb(err, null); }
                callback(err);
            });
        },
        function (callback) {
            fs.stat(filePath, function (err, stat) {
                if (err || !stat.fileExists()) {
                    resizeImage ( data, requestData, filePath, function (err/*, imageData*/) {
                        if (err) {
                            cb(err, null);
                            return callback(err);
                        }
                        cb(null, { filePath: filePath });
                        callback(null);
                    });
                    return;
                }
                cb(null, { filePath: filePath });
                callback(null);
            });
        }
    ]);
}

function resizeImage (data, requestData, filePath, cb) {
    var imageResize = sharp(new Buffer(data, "base64"))
        .metadata(function (err, metadata) {
            if (err) { return cb(err, null); }

            var width,
                height;

            if (requestData.crop) {
                width = requestData.width;
                height = requestData.height;
            } else {
                if (metadata.height > metadata.width) {
                    height = requestData.height;
                } else {
                    width = requestData.width;
                }
            }

            imageResize
                .resize(width, height)
                .toFile(filePath, function(err) {
                    if (err) { return cb(err, null); }
                    cb(null, {
                        filePath: filePath
                    });
                });
        });
}

function getFilePath (url, requestData, options) {
    var cacheSubDirectory = requestData.width + "-" + requestData.height;
    cacheSubDirectory += requestData.crop ? "-crop" : "-nocrop";

    return options.cacheDirectory + "/" + cacheSubDirectory + "/" + md5(url);
}

/*var ref, ref1, ref2, ref3, url;

var cacheTimeout = 5 * 60,
    cacheDirectory = "cache",
    userAgent = "AnonNews v3 Image Proxy (ignore; Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36)";

if (req.query.url == null) {
    throw util.InputError("No URL specified.");
}

var minWidth = (ref = req.query.min_width) != null ? ref : "x",
    minHeight = (ref1 = req.query.min_height) != null ? ref1 : "x",
    maxWidth = (ref2 = req.query.max_width) != null ? ref2 : "x",
    maxHeight = (ref3 = req.query.max_height) != null ? ref3 : "x";

url = req.query.url;

var cacheHash = util.md5sum(url),
    cacheFile = cacheHash + "-" + minWidth + "-" + minHeight + "-" + maxWidth + "-" + maxHeight + ".dat",
    cachePath = path.join(cacheDirectory, cacheFile);

return fs.stat(cachePath, function(err, stat) {
    var cacheExists, remoteSource, useCache;
    if (err != null) {
        cacheExists = false;
        useCache = false;
    } else {
        cacheExists = true;
        if (Math.abs(moment(stat.mtime).diff(moment(), "seconds")) > cacheTimeout) {
            useCache = false;
        } else {
            useCache = true;
        }
    }
    remoteSource = null;
    return new Promise(function(resolve, reject) {
        if (useCache === false) {
            remoteSource = request.get(url, {
                headers: {
                    "user-agent": userAgent
                }
            });
            remoteSource.on("response", function(response) {
                if (response.statusCode === 200) {
                    return resolve();
                } else {
                    return reject(new Error("Status code " + response.statusCode + " received from source."));
                }
            });
            return remoteSource.on("error", function(err) {
                return reject(err);
            });
        } else {
            return resolve();
        }
    }).catch(function(error) {
            return useCache = true;
        }).then(function() {
            var resizePromise, source;
            if (useCache) {
                if (cacheExists) {
                    res.set({
                        "x-proxydiag-source": "cache",
                        "x-proxydiag-path": cachePath
                    });
                    source = fs.createReadStream(cachePath);
                } else {
                    res.status(502);
                    res.send("HTTP 502 Bad Gateway; The remote source is unavailable.");
                    return;
                }
            } else {
                res.set({
                    "x-proxydiag-source": "remote",
                    "x-proxydiag-path": url
                });
                source = remoteSource;
            }
            minWidth = minWidth === "x" ? null : minWidth;
            minHeight = minHeight === "x" ? null : minHeight;
            maxWidth = maxWidth === "x" ? null : maxWidth;
            maxHeight = maxHeight === "x" ? null : maxHeight;
            if (!useCache && ((minWidth != null) || (minHeight != null) || (maxWidth != null) || (maxHeight != null))) {
                resizePromise = new Promise(function(resolve, reject) {
                    var extension, image;
                    extension = urlLib.parse(url).path.split("/").pop().split(".").pop();
                    image = gm(source, "image." + extension);
                    return new Promise(function(resolve2, reject2) {
                        return image.size({
                            bufferStream: true
                        }, function(err, result) {
                            if (err != null) {
                                return reject2(err);
                            } else if (result == null) {
                                return reject2("No result.");
                            } else {
                                return resolve2(result);
                            }
                        });
                    }).then(function(size) {
                            var imageRatio, targetRatio;
                            imageRatio = size.height / size.width;
                            if ((minWidth != null) || (minHeight != null)) {
                                targetRatio = minHeight / minWidth;
                                if (!minWidth || ((minHeight != null) && imageRatio < targetRatio)) {
                                    image.resize(null, minHeight);
                                } else {
                                    image.resize(minWidth);
                                }
                            } else if ((maxWidth != null) || (maxHeight != null)) {
                                targetRatio = maxHeight / maxWidth;
                                if ((maxWidth == null) || ((maxHeight != null) && imageRatio > targetRatio)) {
                                    image.resize(null, maxHeight);
                                } else {
                                    image.resize(maxWidth);
                                }
                            }
                            source = image.stream();
                            res.set({
                                "x-proxydiag-resized": 1
                            });
                            return resolve();
                        });
                });
            } else {
                resizePromise = new Promise(function(resolve, reject) {
                    res.set("x-proxydiag-resized", 0);
                    return resolve();
                });
            }
            return resizePromise.then(function() {
                var cacheStream;
                source.pipe(res);
                if (!useCache) {
                    cacheStream = fs.createWriteStream(cachePath);
                    return source.pipe(cacheStream);
                }
            });
        });
});*/

module.exports = Sickle;

