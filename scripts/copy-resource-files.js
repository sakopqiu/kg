const copy = require('recursive-copy');
const path = require('path');

var options = {
    overwrite: false,
    expand: true, // Whether to expand symbolic links
    dot: true, // 隐藏文件也要
    junk: true, //Whether to copy OS junk files (e.g. .DS_Store, Thumbs.db)
    filter: [
        '**/*',
        '!fonts/**',
        '!**/*.{tsx,ts}',
    ]
};

copy(path.resolve('src/'), path.resolve('lib'), options)
    .on(copy.events.COPY_FILE_START, function(copyOperation) {
        console.info('Copying file ' + copyOperation.src + '...');
    })
    .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
        console.info('Copied to ' + copyOperation.dest);
    })
    .on(copy.events.ERROR, function(error, copyOperation) {
        console.error('Unable to copy ' + copyOperation.dest);
    })
    .then(function(results) {
        console.info(results.length + ' file(s) copied');
    })
    .catch(function(error) {
        return console.error('Copy failed: ' + error);
    });
