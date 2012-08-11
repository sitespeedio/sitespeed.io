var fs = require('fs'),
    events = require('events'),
    buffer = require('buffer'),
    http = require('http'),
    url = require('url'),
    path = require('path');

this.version = [0, 6, 0];

var mime = require('./node-static/mime');
var util = require('./node-static/util');

var serverInfo = 'node-static/' + this.version.join('.');

// In-memory file store
this.store = {};
this.indexStore = {};

this.Server = function (root, options) {
    if (root && (typeof(root) === 'object')) { options = root, root = null }

    this.root    = path.resolve(root || '.');
    this.options = options || {};
    this.cache   = 3600;

    this.defaultHeaders  = {};
    this.options.headers = this.options.headers || {};

    if ('cache' in this.options) {
        if (typeof(this.options.cache) === 'number') {
            this.cache = this.options.cache;
        } else if (! this.options.cache) {
            this.cache = false;
        }
    }

    if (this.cache !== false) {
        this.defaultHeaders['Cache-Control'] = 'max-age=' + this.cache;
    }
    this.defaultHeaders['Server'] = serverInfo;

    for (var k in this.defaultHeaders) {
        this.options.headers[k] = this.options.headers[k] ||
                                  this.defaultHeaders[k];
    }
};

this.Server.prototype.serveDir = function (pathname, req, res, finish) {
    var htmlIndex = path.join(pathname, 'index.html'),
        that = this;

    fs.stat(htmlIndex, function (e, stat) {
        if (!e) {
            that.respond(null, 200, {}, [htmlIndex], stat, req, res, finish);
        } else {
            if (pathname in exports.store) {
                streamFiles(exports.indexStore[pathname].files);
            } else {
                // Stream a directory of files as a single file.
                fs.readFile(path.join(pathname, 'index.json'), function (e, contents) {
                    if (e) { return finish(404, {}) }
                    var index = JSON.parse(contents);
                    exports.indexStore[pathname] = index;
                    streamFiles(index.files);
                });
            }
        }
    });
    function streamFiles(files) {
        util.mstat(pathname, files, function (e, stat) {
            that.respond(pathname, 200, {}, files, stat, req, res, finish);
        });
    }
};
this.Server.prototype.serveFile = function (pathname, status, headers, req, res) {
    var that = this;
    var promise = new(events.EventEmitter);

    pathname = this.resolve(pathname);

    fs.stat(pathname, function (e, stat) {
        if (e) {
            return promise.emit('error', e);
        }
        that.respond(null, status, headers, [pathname], stat, req, res, function (status, headers) {
            that.finish(status, headers, req, res, promise);
        });
    });
    return promise;
};
this.Server.prototype.finish = function (status, headers, req, res, promise, callback) {
    var result = {
        status:  status,
        headers: headers,
        message: http.STATUS_CODES[status]
    };

    headers['Server'] = serverInfo;

    if (!status || status >= 400) {
        if (callback) {
            callback(result);
        } else {
            if (promise.listeners('error').length > 0) {
                promise.emit('error', result);
            }
            res.writeHead(status, headers);
            res.end();
        }
    } else {
        // Don't end the request here, if we're streaming;
        // it's taken care of in `prototype.stream`.
        if (status !== 200 || req.method !== 'GET') {
            res.writeHead(status, headers);
            res.end();
        }
        callback && callback(null, result);
        promise.emit('success', result);
    }
};

this.Server.prototype.servePath = function (pathname, status, headers, req, res, finish) {
    var that = this,
        promise = new(events.EventEmitter);

    pathname = this.resolve(pathname);

    // Only allow GET and HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        finish(405, { 'Allow': 'GET, HEAD' });
        return promise;
    }

    // Make sure we're not trying to access a
    // file outside of the root.
    if (pathname.indexOf(that.root) === 0) {
        fs.stat(pathname, function (e, stat) {
            if (e) {
                finish(404, {});
            } else if (stat.isFile()) {      // Stream a single file.
                that.respond(null, status, headers, [pathname], stat, req, res, finish);
            } else if (stat.isDirectory()) { // Stream a directory of files.
                that.serveDir(pathname, req, res, finish);
            } else {
                finish(400, {});
            }
        });
    } else {
        // Forbidden
        finish(403, {});
    }
    return promise;
};
this.Server.prototype.resolve = function (pathname) {
    return path.resolve(path.join(this.root, pathname));
};
this.Server.prototype.serve = function (req, res, callback) {
    var that = this,
        promise = new(events.EventEmitter);

    var pathname = decodeURI(url.parse(req.url).pathname);

    var finish = function (status, headers) {
        that.finish(status, headers, req, res, promise, callback);
    };

    process.nextTick(function () {
        that.servePath(pathname, 200, {}, req, res, finish).on('success', function (result) {
            promise.emit('success', result);
        }).on('error', function (err) {
            promise.emit('error');
        });
    });
    if (! callback) { return promise }
};

this.Server.prototype.respond = function (pathname, status, _headers, files, stat, req, res, finish) {
    var mtime   = Date.parse(stat.mtime),
        key     = pathname || files[0],
        headers = {};

    // Copy default headers
    for (var k in this.options.headers) {  headers[k] = this.options.headers[k] }

    headers['ETag']          = JSON.stringify([stat.ino, stat.size, mtime].join('-'));
    headers['Date']          = new(Date)().toUTCString();
    headers['Last-Modified'] = new(Date)(stat.mtime).toUTCString();

    // Conditional GET
    // If the "If-Modified-Since" or "If-None-Match" headers
    // match the conditions, send a 304 Not Modified.
    if (req.headers['if-none-match'] === headers['ETag'] ||
        Date.parse(req.headers['if-modified-since']) >= mtime) {
        finish(304, headers);
    } else {
        var fileExtension = path.extname(files[0]).slice(1).toLowerCase();
        headers['Content-Length'] = stat.size;
        headers['Content-Type']   = mime.contentTypes[fileExtension] ||
                                   'application/octet-stream';

        for (var k in _headers) { headers[k] = _headers[k] }

        res.writeHead(status, headers);

        if (req.method === 'HEAD') {
            finish(200, headers);
            return;
        }

        // If the file was cached and it's not older
        // than what's on disk, serve the cached version.
        if (this.cache && (key in exports.store) &&
            exports.store[key].stat.mtime >= stat.mtime) {
            res.end(exports.store[key].buffer);
            finish(status, headers);
        } else {
            this.stream(pathname, files, new(buffer.Buffer)(stat.size), res, function (e, buffer) {
                if (e) { return finish(500, {}) }
                exports.store[key] = {
                    stat:      stat,
                    buffer:    buffer,
                    timestamp: Date.now()
                };
                finish(status, headers);
            });
        }
    }
};

this.Server.prototype.stream = function (pathname, files, buffer, res, callback) {
    (function streamFile(files, offset) {
        var file = files.shift();

        if (file) {
            file = file[0] === '/' ? file : path.join(pathname || '.', file);

            // Stream the file to the client
            fs.createReadStream(file, {
                flags: 'r',
                mode: 0666
            }).on('data', function (chunk) {
                chunk.copy(buffer, offset);
                offset += chunk.length;
            }).on('close', function () {
                streamFile(files, offset);
            }).on('error', function (err) {
                callback(err);
                console.error(err);
            }).pipe(res, { end: false });
        } else {
            res.end();
            callback(null, buffer, offset);
        }
    })(files.slice(0), 0);
};
