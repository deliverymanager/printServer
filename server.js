/*jslint node: true*/

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag");
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");

var autoupdater = require('auto-updater')({
        pathToJson: '',
        async: true,
        silent: false,
        autoupdate: true,
        check_git: true
    });

    // State the events
    autoupdater.on('git-clone',function(){
      console.log("You have a clone of the repository. Use 'git pull' to be up-to-date");
    });
    autoupdater.on('check-up-to-date',function(v){
      console.log("You have the latest version: " + v);
    });
    autoupdater.on('check-out-dated',function(v_old , v){
      console.log("Your version is outdated. "+v_old+ " of "+v);
      autoupdater.forceDownloadUpdate(); // If autoupdate: false, you'll have to do this manually.
      // Maybe ask if the'd like to download the update.
    });
    autoupdater.on('update-downloaded',function(){
      console.log("Update downloaded and ready for install");
      autoupdater.forceExtract(); // If autoupdate: false, you'll have to do this manually.
    });
    autoupdater.on('update-not-installed',function(){
      console.log("The Update was already in your folder! It's read for install");
      autoupdater.forceExtract(); // If autoupdate: false, you'll have to do this manually.
    });
    autoupdater.on('extracted',function(){
      console.log("Update extracted successfully!");
      console.log("RESTART THE APP!");
    });
    autoupdater.on('download-start',function(name){
      console.log("Starting downloading: " + name);
    });
    autoupdater.on('download-update',function(name,perc){
      process.stdout.write("Downloading " + perc + "% \033[0G");
    });
    autoupdater.on('download-end',function(name){
      console.log("Downloaded " + name);
    });
    autoupdater.on('download-error',function(err){
      console.log("Error when downloading: " + err);
    });
    autoupdater.on('end',function(){
      console.log("The app is ready to function");
    });

    // Start checking
    //autoupdater.forceCheck();

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
if (os.type() == "Windows_NT") {

    //First we need to check if the service is already installed


    //If no then we check if the user has administrative priviledges
    //On windows XP nothing with happen as most of the times the user is admin
    //On Windows 7 etc, the pop prompt will appear asking for administrative priviledges
    /*
    var wincmd = require('node-windows');

    wincmd.isAdminUser(function(isAdmin) {
        if (isAdmin) {
            console.log('The user has administrative privileges.');
            //Then we need to install and start the service!
            var Service = require('node-windows').Service;

            // Create a new service object
            var svc = new Service({
                name: 'Delivery Manager Print Server',
                description: 'deliverymanager.gr',
                script: 'C:\\printServer\\index.js'
            });

            // Listen for the "install" event, which indicates the
            // process is available as a service.
            svc.on('install', function() {
                svc.start();
            });

            svc.install();

        } else {
            console.log('NOT AN ADMIN');
        }
    });
    */
}

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
        message: 'Live v5'
    });
});

app.get('/getPrinters', function(req, res) {
    console.log("/printServer was just called");
    //res.json is used usually when I want to return data from an API
    var printer = require("printer");
    var util = require('util');
    console.log("installed printers:\n" + util.inspect(printer.getPrinters(), {
        colors: true,
        depth: 10
    }));


    res.json({
        message: printer.getPrinters()
    });
});

app.get('/testError', function(req, res) {
    console.log("/testError was just called");
    //res.json is used usually when I want to return data from an API
    //throw new Error('something bad happened');
    var fs = require('fs');

    fs.readFile('somefile.txt', function(err, data) {
        if (err) throw err;
        console.log(data);
    });
});




var port;
var portfinder = require('portfinder');
portfinder.basePort = 4950;
portfinder.getPort(function(err, cleanPort) {
    //
    // `port` is guarenteed to be a free port
    // in this scope.
    //
    port = cleanPort;
    app.listen(port, function() {
        console.log("Node app is running at localhost:" + port);
    });

});
