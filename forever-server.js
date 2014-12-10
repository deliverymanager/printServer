// one parent can have multiple child processes but each child can have only one parent!

var forever = require('forever-monitor');

var child = new(forever.Monitor)('server.js', {
    silent: true,
    sourceDir: 'c:/printServer'
});

child.on('exit', function() {});

child.start();

var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { 

	sys.puts(stdout);
	//Here I restart the server because the git pull was just called.
	child.restart();
}

var options = {cwd:"C:\\printServer"};

exec("git status && git reset --hard && git pull", options, puts);