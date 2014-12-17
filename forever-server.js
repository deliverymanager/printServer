// one parent can have multiple child processes but each child can have only one parent!
var forever = require('forever-monitor');
var Log = require('log'),
    fs = require('fs'),
    log = new Log('debug', fs.createWriteStream('fileForeverServer.log'));


var child = new(forever.Monitor)('server.js', {
    silent: true,
    sourceDir: 'c:/printServer'
});

child.on('exit', function() {});
//The server process is not dependent on the git pull process
child.start();

console.log(process.env.STOREID);

var sys = require('sys');
var exec = require('child_process').exec;
var options = {
    cwd: "C:\\printServer"
};
var isOnline = require('is-online');

var CronJob = require('cron').CronJob;
new CronJob('00 * * * * *', function() {

    //The problem with this script is the fact that the script will not run but in the start of the computer when it will not have internet connection!
    //So I need to execute the process when there is internet connection. Probably using a cron or something else
    //This process cannot be placed inside the server.js script because it is already a child process.

    function puts(error, stdout, stderr) {

        sys.puts(stdout);
        log.info("stdout:" + stdout);
        log.info("stderr:" + stderr);
        if (error === null && stdout.replace(/^\s*\n/gm, '').indexOf('Already up-to-date') !== -1) { // The error might be for example that the user has no internet connection.
            //Here I restart the server.js child process because the git pull was just called.
            log.info("Restarting server.js ");
            child.restart();
        }

    }

    isOnline(function(err, online) {
        console.log(online);
        if (online) {
            exec("git status && git reset --hard FETCH_HEAD && git pull", options, puts);
        }
    });

}, null, true, "Europe/Athens");
