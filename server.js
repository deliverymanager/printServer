/*jslint node: true*/

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag"); 
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");

//Here I am creating the singleton connection to the MongoDb server.
//This connection will be used in all the controllers and middleware in the app.
//mongoDbConnection(function(db) {});

var os = require('os');
console.log(os.platform());
console.log(os.type());

console.log(os.hostname());
console.log(os.arch());
console.log(os.release());

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
        message: 'Live'
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


//API to check the version of the server.

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
