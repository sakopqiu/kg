const scanner = require('i18next-scanner');
const vfs = require('vinyl-fs');
const through2 = require('through2');
const fs = require('fs');
const Transform = require('stream').Transform;
const _ = require('lodash');
const _path = require('path');
const moment = require('moment');

let taskId = 0;
let logFile = null;
if (process.env.DEBUG_MODE) {
    logFile = fs.createWriteStream('./i18n.log');
}

function debug(info) {
    if (process.env.DEBUG_MODE) {
        logFile.write(info + '\n');
    }
}

class MyTransform extends Transform {
    constructor(options, chunk, dest) {
        super(options);
        this.chunk = chunk;
        this.dest = dest;
    }

    _transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
    }

    updateOrNot(firstTime) {
        let oldChunk = null;
        let oldKeys = null;
        try {
            oldChunk = fs.readFileSync('./src/translations/' + this.chunk.path).toString();
            oldKeys = Object.keys(JSON.parse(oldChunk)).sort();
        } catch (err) {
        }

        let newKeys = Object.keys(JSON.parse(this.chunk.contents)).sort();
        if (_.isEqual(oldKeys, newKeys)) {
            // the keys in the past were not sorted, sort them explicitly when a new webpack task is launched
            if (firstTime) {
                this.pipe(vfs.dest(this.dest));
            }
            //  debug("no new keys for " + this.chunk.path + ",skipping");
        } else {
            let diff = _.difference(newKeys, oldKeys);
            //if newKeys is an empty array while oldKeys is undefined, this if wont  be triggered
            if (diff.length > 0) {
                let path = this.chunk.path;
                let namespace = path.substring(path.lastIndexOf(_path.sep) + 1, path.lastIndexOf('.'));
                console.log(`Added key(s):${diff} to ${namespace}`);
            }
            this.pipe(vfs.dest(this.dest));
        }
    }

}

//key and value shares the same value
function sameKeyValueTransform(pluginInstance, taskId) {
    return function (file, enc, done) {
        'use strict';
        const parser = this.parser;
        const content = fs.readFileSync(file.path, enc);

        parser.parseFuncFromString(content, (key) => {
            debug(taskId + ':' + key + ' found in ' + _path.basename(file.path));
            if (key.startsWith(pluginInstance.defaultNS + ':')) {
                key = key.substring(key.indexOf(':') + 1);
            }
            pluginInstance.entries[taskId].add(key);
            let namespaceIndex = key.indexOf(pluginInstance.nsSeparator);
            let value = key;
            if (namespaceIndex !== -1) {
                value = key.substring(namespaceIndex + 1);
            }
            parser.set(key, value);
        });

        done();
    };
}

class I18nTranslationDetectorPlugin {
    constructor(src, dest, options) {
        this.src = src;
        this.dest = dest;
        this.options = options;
        this.nsSeparator = options.nsSeparator || ':';
        this.defaultNS = options.defaultNS;
        this.jsonIndent = _.get(options, 'resource.jsonIndent') || 2;
        this.entries = {};
        //some operation only runs for the first time
        this.firstTime = false;
    }

    removeUnusedKeys(chunk, taskId) {
        let path = chunk.path;
        let namespace = path.substring(path.lastIndexOf(_path.sep) + 1, path.lastIndexOf('.'));
        let obj = JSON.parse(chunk.contents);
        let forceUpdate = false;
        for (let key in obj) {
            let canonicalKeyName = namespace === this.defaultNS ? key : namespace + this.nsSeparator + key;
            if (!this.entries[taskId].has(canonicalKeyName)) {
                delete obj[key];
                // i18n scanner
                if (chunk.path.indexOf('translation.json') === -1) {
                    const str = 'Unused key ' + canonicalKeyName + ' found in ' + chunk.path + ',will remove it';
                    console.log(str);
                    debug(taskId + ':' + str);
                }
                forceUpdate = true;
            }
        }

        if (forceUpdate) {
            if (Object.keys(obj).length > 0) {
                return new Buffer(JSON.stringify(obj, Object.keys(obj).sort(), this.jsonIndent));
            }
            else {
                return new Buffer(JSON.stringify(obj));
            }
        } else {
            return new Buffer(JSON.stringify(obj, Object.keys(obj).sort(), this.jsonIndent));
        }
    }

    apply(compiler) {
        compiler.hooks.compile.tap('i18nTranslationDetector', compilation => {
            debug('New task starts at ' + moment().format('HH:mm:ss') + ' with taskId ' + taskId);
            var plugin = this;
            (function (__taskId) {
                plugin.entries[taskId] = new Set();
                vfs.src(plugin.src)
                    .pipe(scanner(plugin.options, sameKeyValueTransform(plugin, __taskId)))
                    //transform first arguments accumulates all thunks
                    // the 2nd flush argument remove unused keys basing on the information
                    // collected from the previous steps
                    .pipe(through2.obj(
                        function (chunk, encoding, callback) {
                            if (this.chunks == null) {
                                this.chunks = [];
                            }
                            this.chunks.push(chunk);

                            callback();
                        },
                        function (cb) {
                            for (let chunk of this.chunks) {
                                chunk.contents = plugin.removeUnusedKeys(chunk, __taskId);
                                let transform = new MyTransform({objectMode: true}, chunk, plugin.dest);
                                transform.updateOrNot(plugin.firstTime);
                                transform.write(chunk);
                            }
                            plugin.firstTime = false;
                            delete plugin.entries[__taskId];
                            if (logFile) {
                                logFile.write('task ' + __taskId + ' terminates=======================\n\n\n');
                            }
                            cb();
                        },
                    ));
            })(taskId);
            taskId++;
        });

    }
}

module.exports = I18nTranslationDetectorPlugin;
