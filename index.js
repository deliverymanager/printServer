/*jslint node: true*/

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag");
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");
/*
var forever = require('forever-monitor');

var child = new(forever.Monitor)('index.js', {
    max: 3,
    silent: false,
    args: []
});

child.on('exit', function() {
    console.log('index.js has exited after 3 restarts');
});

child.start();
*/
/*

var gitPullCron = require('git-pull-cron');
- Clone given repo into /dev/my-repo, replacing what's already there
- Schedule cron to run every weekday (Mon-Fri) at 11:30am
- When cron task runs, a `git pull origin master` will be performed
- Once cron task has run the callback will get invoked with latest commit info
 */
/*
gitPullCron.init('https://github.com/deliverymanager/printServer', './Applications', '00 00 * * * *', function(err, commit) {
    if (err) {
        return console.error(err.stack);
    }

    console.log('Updated to commit: ' + commit.id);
});
*/

//Here I am creating the singleton connection to the MongoDb server.
//This connection will be used in all the controllers and middleware in the app.
//mongoDbConnection(function(db) {});

var os = require('os');
console.log(os.platform());
console.log(os.type());
console.log(os.hostname());
console.log(os.arch());
console.log(os.release());
console.log(os.cpus());
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log(addresses[0]);

//Here I am placing the cron jobs
//var cron = require("./cronjobs");
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//In order to disable to flags for chromium
//open /Users/anestis/Downloads Chromium.app --args –allow-file-access-from-files -disable-web-security

// configure app to use bodyParser()
// this will let us get the data from a POST
//This is an express middleware
//It handles the data sent before sending them to the routes.
app.use(bodyParser.json());
app.get('/printServer', function(req, res) {
    console.log("/printServer was just called");
    //res.json is used usually when I want to return data from an API
    res.json({
        message: 'Hoorey!! Api works!'
    });
});

var port = 3004;
app.listen(port, function() {
    console.log("Node app is running at localhost:" + port);
});
