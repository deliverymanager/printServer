/*jslint node: true*/
'use strict';

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag");
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");

//Here I am creating the singleton connection to the MongoDb server.
//This connection will be used in all the controllers and middleware in the app.
//mongoDbConnection(function(db) {});

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
