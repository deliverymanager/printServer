var Service = require('node-windows').Service;

// Create a new service object
// Create a new service object
var svc = new Service({
  name:'Delivery Manager Print Server',
  description:'deliverymanager.gr',
  script: require('path').join(__dirname,'index.js'),
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

// Just in case this file is run twice.
svc.on('alreadyinstalled',function(){
  console.log('This service is already installed.');
});

// Listen for the "start" event and let us know when the
// process has actually started working.
svc.on('start',function(){
  console.log(svc.name);
});
/*
The Service object emits the following events:

install - Fired when the script is installed as a service.
alreadyinstalled - Fired if the script is already known to be a service.
invalidinstallation - Fired if an installation is detected but missing required files.
uninstall - Fired when an uninstallation is complete.
start - Fired when the new service is started.
stop - Fired when the service is stopped.
error - Fired in some instances when an error occurs
*/
svc.on('install',function(){
  console.log(svc.name);
});
svc.on('alreadyinstalled',function(){
  console.log("alreadyinstalled"+svc.name);
});
svc.on('invalidinstallation',function(){
  console.log("invalidinstallation"+svc.name);
});
svc.on('error',function(){
 console.log("error"+svc.name);
});
svc.on('start',function(){
  console.log("start"+svc.name);
});
svc.on('stop',function(){
  console.log("stop"+svc.name);
});

// Install the script as a service.
svc.install();