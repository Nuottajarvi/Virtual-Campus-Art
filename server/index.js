var express = require('express');
var http = require('http');
var fs = require('fs');

var app = express();
var server = http.createServer(app);
require('./config/express')(app);

var port = +process.env.PORT || 3000;

var db = require('./db');

// Test db connection and init if does not exists.
db.initialize(function () {
    // quick-n-dirty-dot-com for database cleanup.
    var args = process.argv.slice(2);
    if (args.find(function (arg) { return arg === 'clean'; })) {
        db.clean();
    }
});

// bootstrap routes
fs.readdirSync(__dirname + '/routes').forEach(function (file) {
    if (file.match(/\.js$/) && !file.match(/error\.js$/)) {
        require(__dirname + '/routes/' + file)(app);
    }
});
require('./routes/error')(app);

function onListening() {
    console.log(`Server started on port: ${port}!`);
}

function onError(error) {
    console.log(error);
    process.exit(1);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
