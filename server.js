/*jslint node: true*/

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag"); 
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");
var legacy = require('legacy-encoding');

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

app.get('/print', function(req, res) {
    console.log("/print was just called");
	
	var str = "\x1B\x40\x1C\x2E\x1B\x74\x18Lets see Greek: φψΩ Ελληνικά Γράμματα ΕΠΙΤΕΛΟΥΣ!!! \n\n\n\nThis Awsome Tool!!!\r\n\x1B\x61\x01\x1D\x48\x00\x1D\x68\x60\x1D\x6B\x04 9000002345.\x00***90000002345****\n\n\n\x1B\x2A\x00\x30\x00\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\n\n\x1D\x56\x42\x18";
	
	//The barcode doesn't accept --
	var buffer = legacy.encode(str, 'cp737', {
	  'mode': 'html'
	});
	
    //res.json is used usually when I want to return data from an API
    var printer = require("printer");
	
	printer.printDirect({data:buffer
		, printer:'POS' // printer name
		, type: 'RAW' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
		, success:function(jobID){
			console.log("sent to printer with ID: "+jobID);
			res.json({
				message: 'success'
			});
		}
		, error:function(err){
			res.json({
				message: err
			});
		}
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
