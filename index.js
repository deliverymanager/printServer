/*jslint node: true*/

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag");
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");


var autoupdater = require('./lib/auto-updater.js')({
    pathToJson: '',
    async: true,
    silent: false,
    autoupdate: false,
    check_git: true
});

// State the events
autoupdater.on('git-clone', function() {
    console.log("You have a clone of the repository. Use 'git pull' to be up-to-date");
});
autoupdater.on('check-up-to-date', function(v) {
    console.log("You have the latest version: " + v);
});
autoupdater.on('check-out-dated', function(v_old, v) {
    console.log("Your version is outdated. " + v_old + " of " + v);
    autoupdater.forceDownloadUpdate(); // If autoupdate: false, you'll have to do this manually.
    // Maybe ask if the'd like to download the update.
});
autoupdater.on('update-downloaded', function() {
    console.log("Update downloaded and ready for install");
    autoupdater.forceExtract(); // If autoupdate: false, you'll have to do this manually.
});
autoupdater.on('update-not-installed', function() {
    console.log("The Update was already in your folder! It's read for install");
    autoupdater.forceExtract(); // If autoupdate: false, you'll have to do this manually.
});
autoupdater.on('extracted', function() {
    console.log("Update extracted successfully!");
    console.log("RESTART THE APP!");
});
autoupdater.on('download-start', function(name) {
    console.log("Starting downloading: " + name);
});
autoupdater.on('download-update', function(name, perc) {
    process.stdout.write("Downloading " + perc + "% \033[0G");
});
autoupdater.on('download-end', function(name) {
    console.log("Downloaded " + name);
});
autoupdater.on('download-error', function(err) {
    console.log("Error when downloading: " + err);
});
autoupdater.on('end', function() {
    console.log("The app is ready to function");
});

// Start checking
autoupdater.forceCheck();

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

console.log(addresses);

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
app.post('/printServer', function(req, res) {
    console.log("/printServer was just called");
    //res.json is used usually when I want to return data from an API
    res.json({
        message: 'Hoorey!! Api works!'
    });
});

var port = 1337;
app.listen(port, function() {
    console.log("Node app is running at localhost:" + port);
});
