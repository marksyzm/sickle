"use strict";

var http = require("http"),
    fs = require("fs"),
    url = require('url'),
    png = fs.readFileSync("./test/fixtures/test.png"),
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
    else {
        res.writeHead(500);
        res.end(path);
    }
}

module.exports = {
    getServer: function () {
        return http.createServer(server).listen(port);
    },
    port: port
};