// nstream.js

var forever = require('forever-monitor');

var child = new(forever.Monitor)('server.js', {
    silent: true,
    sourceDir: 'c:/printServer'
});

child.on('exit', function() {});

child.start();
