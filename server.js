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

app.post('/printOrder', function(req, res) {
	var data = req.body;
	//json parameters: printer, printerBrand, printerCodepage, print_barcode, barcodeTopBottom, order_id, store_id, order_details, auto_cutter
    console.log("/print was just called");
	
	var printBarcode = function(print_barcode, barcodeTopBottom, order_id, store_id, printerBrand) {
		var str = "";
		var tempOrderId = "";
		var tempCount = "";
		var tempRes = "";
		var i = 0;
		if(printerBrand == "Star TSP-100 Series"){
			str += "\r\n" ;	//New line command! Important otherwise barcode after that will not work!
			str += "\x1B\x1D\x61\x01"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
			str += "\x1B\x62\x04\x01\x05\x60";
			tempOrderId = order_id;
			tempCount = store_id;
			tempRes = tempOrderId.substr(tempCount.length);
			i=0;
			while(tempRes.charAt(i)==0){
				i++
			}
			tempRes = tempRes.substr(i);
			//applet.append("-W00000159Q");
			str += "--"+tempRes+".";
			str +=  "\x1E";
			str += "*** "+order_id+" ***\r\n";
			str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
		}else{
			str += "\r\n";	//New line command! Important otherwise barcode after that will not work!
			str += "\x1B\x61\x01"; // Centering
			str += "\x1D\x48\x00";
			str += "\x1D\x68\x60";//Barcode height to 70 dots default is 165. The value must not ralate to other actions
			str += "\x1D\x6B\x04";
			tempOrderId = order_id;
			tempCount = store_id;
			tempRes = tempOrderId.substr(tempCount.length);
			i=0;
			while(tempRes.charAt(i)==0){
				i++
			}
			tempRes = tempRes.substr(i);
			//applet.append("-W00000159Q");
			str += "--"+tempRes+".";
			str += "\x00";
			str += "*** "+order_id+" ***\r\n";
			str += '\x1B\x21\x00';
		}
		
		//Resettinh styling!
		if(printerBrand == "Star TSP-100 Series"){
			str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
		}else{
			str += "\x1B\x21\x00"; // Commands to reset the styling.
		}
		return str;
	}
	

	//It should accept more than one printers as input.
	var str = "\x1B\x40";
	
	if(data.printerBrand == "Star TSP-100 Series" && data.printerCodepage == 'CP869'){
		str += "\x1B\x1D\x74\x11"; // This sets the code page to CP869
	}else if(data.printerBrand == "Star TSP-100 Series" && data.printerCodepage == 'CP737'){
		str += "\x1B\x1D\x74\x0F"; // This sets the code page to CP737
	}else if(data.printerBrand == "Casio" && data.printerCodepage == 'CP737'){
		//This is a hardware dependent command to "Cancel Kanji character mode".
		//This command can be used only for the Japanese, Simplified Chinese, Traditional Chinese, and Korean models.
		//My model is usung as default Simplified Chinese.
		//This command should be executed again after printer resets or powers down.
		//If Kanji mode is canceled, the printer processes a character code as a 1-byte code of alphanumeric Katakana characters.
		str += "\x1B\x74\x18"; // This sets the code page to CP737 Decimal (27 64 27 116 24)
	}else if((data.printerBrand == "Xprinter" || data.printerBrand == "OCOM")&& data.printerCodepage == 'CP737'){
		//This is a hardware dependent command to "Cancel Kanji character mode".
		//This command can be used only for the Japanese, Simplified Chinese, Traditional Chinese, and Korean models.
		//My model is usung as default Simplified Chinese.
		//This command should be executed again after printer resets or powers down.
		//If Kanji mode is canceled, the printer processes a character code as a 1-byte code of alphanumeric Katakana characters.
		str += "\x1C\x2E";
		str += "\x1B\x74\x18"; // This sets the code page to CP737 Decimal (27 64 27 116 24)
	}
	//Resettinh styling!
	if(data.printerBrand == "Star TSP-100 Series"){
		str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
	}else{
		str += "\x1B\x21\x00"; // Commands to reset the styling.
	}
	
	//Checking to see if there is a barcode to print at the top
	if((data.print_barcode==1)&&(data.barcodeTopBottom == 0)){
		str += printBarcode(data.print_barcode, data.barcodeTopBottom, data.order_id, data.store_id, data.printerBrand);
	}
	
	//str += data.order_details.toString();
	str += "Anestis Domvris τεσταρω τα Ελληνικά γράμματα!";
	
	//Checking to see if there is a barcode to print at the bottom
	if((data.print_barcode==1)&&(data.barcodeTopBottom == 1)){
		str += printBarcode(data.print_barcode, data.barcodeTopBottom, data.order_id, data.store_id, data.printerBrand);
	}
	
	//Resettinh styling!
	if(data.printerBrand == "Star TSP-100 Series"){
		str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
	}else{
		str += "\x1B\x21\x00"; // Commands to reset the styling.
	}
	
	//Preparing for cut!
	str += "\r\n";
	str += "\r\n";
	str += "\r\n";
	str += "\r\n";

	str += "\x1B\x40";
	if(data.auto_cutter==1){
		// Cut receipt
		if(data.printerBrand == "Star TSP-100 Series"){
			str += "\x1B\x64\x00";
		}else if(data.printerBrand == "OCOM"){
			str += "\x1D\x56\x42\x18";
		}else{
			str += "\x1B\x69";
		}
	}
	
	
	//str += "Lets see Greek: φψΩ Ελληνικά Γράμματα ΕΠΙΤΕΛΟΥΣ περισσότερα πολλά πολλά!!!!!! \n\n\n\nThis Awsome Tool!!!\r\n\x1B\x61\x01\x1D\x48\x00\x1D\x68\x60\x1D\x6B\x04 9000002345.\x00***90000002345****\n\n\n\x1B\x2A\x00\x30\x00\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\n\n\x1D\x56\x42\x18";
	
	//The barcode doesn't accept --
	var buffer = legacy.encode(str, 'cp737', {
	  'mode': 'html'
	});
	
    //res.json is used usually when I want to return data from an API
    var printer = require("printer");
	
	printer.printDirect({data:buffer
		, printer: data.printer // printer name
		, type: 'RAW' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
		, success:function(jobID){
			console.log("sent to printer with ID: "+jobID);
			res.json({
				message: str
			});
		}
		, error:function(err){
			throw err;
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
