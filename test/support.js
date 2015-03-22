"use strict";

var http = require("http"),
    fs = require("fs"),
    url = require("url"),
    path = require("path"),
    png = fs.readFileSync("./test/fixtures/test.png"),
    gif = fs.readFileSync("./test/fixtures/test.gif"),
    jpg = fs.readFileSync("./test/fixtures/test.jpg"),
    port = 8080;

function server (req, res) {
    var path = url.parse(req.url).pathname;
    if (path === "/301") {
        res.writeHead(301, {
            Location: "http://localhost:"+port+"/test.png"
        });
        res.end();
    }
    else if (path === "/302") {
        res.writeHead(302, {
            "Location": "http://localhost:"+port+"/test.png"
        });
        res.end();
    }
    else if (path === "/location-relative") {
        res.writeHead(302, {
            "Location": "/test.png"
        });
        res.end();
    }
    else if (path === "/location-empty") {
        res.writeHead(302, {
            "Location": ""
        });
        res.end();
    }
    else if (path === "/location-missing") {
        res.writeHead(302);
        res.end();
    }
    else if (path === "/404") {
        res.writeHead(404);
        res.end();
    }
    else if (path === "/content-type-invalid") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });
        res.end();
    }
    else if (path === "/content-type-empty") {
        res.writeHead(200, {
            "Content-Type": ""
        });
        res.end();
    }
    else if (path === "/content-type-missing") {
        res.writeHead(200);
        res.end();
    }
    else if (path === "/timeout") {
        res.writeHead(200, {
            "Content-Type": "image/png"
        });
        setTimeout(function () {
            res.end(png, "binary");
        }, 1000);
    }
    else if (path === "/complex.png") {
        res.writeHead(200, {
            "Content-Type": "image/png; charset=utf-8"
        });
        res.end(png, "binary");
    }
    else if (path === "/test.png") {
        res.writeHead(200, {
            "Content-Type": "image/png"
        });
        res.end(png, "binary");
    }
    else if (path === "/test.gif") {
        res.writeHead(200, {
            "Content-Type": "image/gif"
        });
        res.end(gif, "binary");
    }
    else if (path === "/test.jpg") {
        res.writeHead(200, {
            "Content-Type": "image/jpeg"
        });
        res.end(jpg, "binary");
    }
    else {
        res.writeHead(500);
        res.end(path);
    }
}

function clearDirectory (dirPath, notFiles) {
    var files;
    try { files = fs.readdirSync(dirPath); }
    catch(e) { return; }

    if (files.length) {
        files.forEach(function (file) {
            if (notFiles.length && notFiles.indexOf(file) !== -1) { return false; }
            var filePath = path.join(dirPath, file);

            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            } else {
                clearDirectory(filePath, notFiles);
            }
        });
    }
}

function fileExists(filePath) {
    var exists = false;
    try {
        var stat = fs.statSync(filePath);
        exists = stat.isFile();
    } catch (e) {}
    return exists;
}

function check (done, f) {
    try {
        f();
        done();
    } catch (e) {
        done( e );
    }
}

module.exports = {
    getServer: function () {
        return http.createServer(server).listen(port);
    },
    clearDirectory: clearDirectory,
    fileExists: fileExists,
    check: check,
    port: port
};