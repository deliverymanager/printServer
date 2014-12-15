/*jslint node: true*/

//First we call the packages we need.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bugsnag = require("bugsnag");
bugsnag.register("9d5907a30dcfaf8806e542fbf61cf623");
var legacy = require('legacy-encoding');

var Log = require('log'),
    fs = require('fs'),
    log = new Log('debug', fs.createWriteStream('file.log'));

log.on('line', function(line) {
    console.log(line);
});

//Here I am creating the singleton connection to the MongoDb server.
//This connection will be used in all the controllers and middleware in the app.
//mongoDbConnection(function(db) {});

var os = require('os');
log.info(os.platform());
log.info(os.type());

log.info(os.hostname());
log.info(os.arch());
log.info(os.release());

var interfaces = os.networkInterfaces();
log.info(interfaces);
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
log.info(addresses[0]);

app.use(bodyParser.json());
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
//The STOREID environment variable should be declared with the nssm GUI STOREID=10 without empty spaces!!!!
log.info(process.env.STOREID);
var store_id = process.env.STOREID;
app.get('/printServer', function(req, res) {
    log.info("/printServer was just called");
    //res.json is used usually when I want to return data from an API
    res.json({
        message: "success",
        store_id: store_id
    });
});

app.get('/getPrinters', function(req, res) {
    log.info("/printServer was just called");
    //res.json is used usually when I want to return data from an API
    var printer = require("printer");
    var util = require('util');
    log.info("installed printers:\n" + util.inspect(printer.getPrinters(), {
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
    log.info("/print was just called");

    String.prototype.replaceAt = function(index, character) {
        return this.substr(0, index) + character + this.substr(index + character.length);
    };

    var greek_to_greeklish = function(toBeConverted) {
        var charConvert = {
            'Α': 'A',
            'Β': 'B',
            'Γ': 'G',
            'Δ': 'D',
            'Ε': 'E',
            'Ζ': 'Z',
            'Η': 'I',
            'Θ': 'TH',
            'Ι': 'I',
            'Κ': 'K',
            'Λ': 'L',
            'Μ': 'M',
            'Ν': 'N',
            'Ξ': 'KS',
            'Ο': 'O',
            'Π': 'P',
            'Ρ': 'R',
            'Σ': 'S',
            'Τ': 'T',
            'Υ': 'Y',
            'Φ': 'F',
            'Χ': 'X',
            'Ψ': 'PS',
            'Ω': 'O',
            'α': 'A',
            'β': 'B',
            'γ': 'G',
            'δ': 'D',
            'ε': 'E',
            'ζ': 'Z',
            'η': 'I',
            'θ': 'TH',
            'ι': 'I',
            'κ': 'K',
            'λ': 'L',
            'μ': 'M',
            'ν': 'N',
            'ξ': 'KS',
            'ο': 'O',
            'π': 'P',
            'ρ': 'R',
            'σ': 'S',
            'τ': 'T',
            'υ': 'Y',
            'φ': 'F',
            'χ': 'X',
            'ψ': 'PS',
            'ω': 'O',
            'ς': 'S',
            'ά': 'A',
            'έ': 'E',
            'ή': 'I',
            'ί': 'I',
            'ό': 'O',
            'ύ': 'Y',
            'ώ': 'O',
            'ϊ': 'I',
            'ϋ': 'Y',
            'ΐ': 'I',
            'ΰ': 'Y'
        };

        for (var i = 0; i < toBeConverted.length; i++) {
            var tempConverted = charConvert[toBeConverted.charAt(i)];
            if (tempConverted !== "") {
                toBeConverted.replaceAt(i, tempConverted);
            }
        }
        return toBeConverted;
    };

    var printBarcode = function(print_barcode, barcodeTopBottom, order_id, store_id, printerBrand) {
        var str = "";
        var tempOrderId = "";
        var tempCount = "";
        var tempRes = "";
        var i = 0;
        if (printerBrand == "Star TSP-100 Series") {
            str += "\r\n"; //New line command! Important otherwise barcode after that will not work!
            str += "\x1B\x1D\x61\x01"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
            str += "\x1B\x62\x04\x01\x05\x60";
            tempOrderId = order_id;
            tempCount = store_id;
            tempRes = tempOrderId.substr(tempCount.length);
            i = 0;
            while (tempRes.charAt(i) === 0) {
                i++;
            }
            tempRes = tempRes.substr(i);
            //applet.append("-W00000159Q");
            str += "--" + tempRes + ".";
            str += "\x1E";
            str += "*** " + order_id + " ***\r\n";
            str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
        } else if (printerBrand == "OCOM") { //The ESCP commands do not work!
            str += "\r\n"; //New line command! Important otherwise barcode after that will not work!
            str += "\x1B\x61\x01"; // Centering
            str += "\x1D\x66\x00"; //Selects a font for the HRI characters used when printing a bar code.
            str += "\x1D\x48\x00"; //Selects the printing position of HRI characters when printing a bar code.
            str += "\x1D\x68\x60"; //Barcode height to 70 dots default is 165. The value must not ralate to other actions
            str += "\x1D\x6B\x04";
            tempOrderId = order_id;
            tempCount = store_id;
            tempRes = tempOrderId.substr(tempCount.length);
            i = 0;
            while (tempRes.charAt(i) === 0) {
                i++;
            }
            tempRes = tempRes.substr(i);
            //applet.append("-W00000159Q");
            str += tempRes;
            str += "\x00";
            str += "*** " + order_id + " ***\r\n";

            str += "\x1B\x21\x00";
        } else {
            str += "\r\n"; //New line command! Important otherwise barcode after that will not work!
            str += "\x1B\x61\x01"; // Centering
            str += "\x1D\x48\x00";
            str += "\x1D\x68\x60"; //Barcode height to 70 dots default is 165. The value must not ralate to other actions
            str += "\x1D\x6B\x04";
            tempOrderId = order_id;
            tempCount = store_id;
            tempRes = tempOrderId.substr(tempCount.length);
            i = 0;
            while (tempRes.charAt(i) === 0) {
                i++;
            }
            tempRes = tempRes.substr(i);
            //applet.append("-W00000159Q");
            str += "--" + tempRes + ".";
            str += "\x00";
            str += "*** " + order_id + " ***\r\n";
            str += "\x1B\x21\x00";
        }

        //Resettinh styling!
        if (printerBrand == "Star TSP-100 Series") {
            str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
        } else {
            str += "\x1B\x21\x00"; // Commands to reset the styling.
        }
        return str;
    };


    //It should accept more than one printers as input.
    var str = "\x1B\x40";

    if (data.printerBrand == "Star TSP-100 Series" && data.printerCodepage == "CP869") {
        str += "\x1B\x1D\x74\x11"; // This sets the code page to CP869
    } else if (data.printerBrand == "Star TSP-100 Series" && data.printerCodepage == "CP737") {
        str += "\x1B\x1D\x74\x0F"; // This sets the code page to CP737
    } else if (data.printerBrand == "Casio" && data.printerCodepage == "CP737") {
        //This is a hardware dependent command to "Cancel Kanji character mode".
        //This command can be used only for the Japanese, Simplified Chinese, Traditional Chinese, and Korean models.
        //My model is usung as default Simplified Chinese.
        //This command should be executed again after printer resets or powers down.
        //If Kanji mode is canceled, the printer processes a character code as a 1-byte code of alphanumeric Katakana characters.
        str += "\x1B\x74\x18"; // This sets the code page to CP737 Decimal (27 64 27 116 24)
    } else if ((data.printerBrand == "Xprinter" || data.printerBrand == "OCOM") && data.printerCodepage == "CP737") {
        //This is a hardware dependent command to "Cancel Kanji character mode".
        //This command can be used only for the Japanese, Simplified Chinese, Traditional Chinese, and Korean models.
        //My model is usung as default Simplified Chinese.
        //This command should be executed again after printer resets or powers down.
        //If Kanji mode is canceled, the printer processes a character code as a 1-byte code of alphanumeric Katakana characters.
        str += "\x1C\x2E";
        str += "\x1B\x74\x18"; // This sets the code page to CP737 Decimal (27 64 27 116 24)
    }

    //Resettinh styling!
    if (data.printerBrand == "Star TSP-100 Series") {
        str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
    } else {
        str += "\x1B\x21\x00"; // Commands to reset the styling.
    }

    //Checking to see if there is a barcode to print at the top
    if ((data.print_barcode == "1") && (data.barcodeTopBottom == "0")) {
        str += printBarcode(data.print_barcode, data.barcodeTopBottom, data.order_id, data.store_id, data.printerBrand);
    }

    if (data.greeklish == "true") {
        str += greek_to_greeklish(data.order_details);
    } else {
        str += data.order_details;
    }

    //str += "Anestis Domvris τεσταρω τα Ελληνικά γράμματα!";

    //Checking to see if there is a barcode to print at the bottom
    if ((data.print_barcode == "1") && (data.barcodeTopBottom == "1")) {
        str += printBarcode(data.print_barcode, data.barcodeTopBottom, data.order_id, data.store_id, data.printerBrand);
    }

    //Resettinh styling!
    if (data.printerBrand == "Star TSP-100 Series") {
        str += "\x1B\x1D\x61\x00"; // Centering 1B 1D 61 01 for STAR center 00 for left and 02 for right
    } else {
        str += "\x1B\x21\x00"; // Commands to reset the styling.
    }

    //Preparing for cut!
    str += "\r\n";
    str += "\r\n";
    str += "\r\n";
    str += "\r\n";

    str += "\x1B\x40";
    if (data.auto_cutter == "1") {
        // Cut receipt
        if (data.printerBrand == "Star TSP-100 Series") {
            str += "\x1B\x64\x00";
        } else if (data.printerBrand == "OCOM" || data.printerBrand == "Xprinter") {
            str += "\x1D\x56\x42\x18";
        } else {
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

    printer.printDirect({
        data: buffer,
        printer: data.printer, // printer name
        type: 'RAW', // type: RAW, TEXT, PDF, JPEG, .. depends on platform
        success: function(jobID) {
            log.info("sent to printer with ID: " + jobID);
            var status = printer.getJob(data.printer, jobID);
            if (status.status[0] == "PRINTING") {
                res.json({
                    //message: status.status[0]
                    message: "success" //Η εντολή εκτύπωσης εστάλει στον εκτυπωτή
                });
            } else {
                res.json({
                    //message: status.status[0]
                    message: "sentButNotPrinting"
                    //Η εντολή εκτύπωσης εστάλει στον εκτυπωτή αλλά για κάποιο λόγο
                    //Πολύ πιθανό να είναι κλειστός ο υπολογιστής.
                    //Βέβαια θα έχει γίνει ένας έλεγχος
                });
            }

        },
        error: function(err) {
            res.json({
                message: err
            });
        }
    });
});


//API to check the version of the server.

app.get('/testError', function(req, res) {
    log.info("/testError was just called");
    //res.json is used usually when I want to return data from an API
    //throw new Error('something bad happened');
    var fs = require('fs');

    fs.readFile('somefile.txt', function(err, data) {
        if (err) throw err;
        log.info(data);
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
        log.info("Node app is running at localhost:" + port);
    });

    var request = require("request");
    //The script must be after the port is set.
    var localIp = ""; //Here I initialize the localIp variable, so that when the script runs for the first time, it will send the local IP.
    var CronJob = require('cron').CronJob;
    new CronJob('*/3 * * * * *', function() {
        if (store_id !== "undefined" && store_id && port && addresses[0] && (localIp === "" || localIp != addresses[0])) {
            var isOnline = require('is-online');
            isOnline(function(err, online) {
                log.info("online: " + online);
                log.info("ip: " + addresses[0]);
                log.info("store_id: " + store_id);
                log.info("port: " + port);
                //This doesn't need to be JSON.stringified because the json tag is set to true!
                var bodyTag = {
                    "store_id": store_id,
                    "ip": addresses[0],
                    "port": port
                };
                if (online) {
                    request({
                        uri: "https://eudeliveryapp.herokuapp.com/printserver/savelocalip",
                        method: "POST",
                        timeout: 3000,
                        followRedirect: true,
                        maxRedirects: 10,
                        gzip: true,
                        json: true,
                        body: bodyTag
                    }, function(error, response, body) {
                        //log.info(body);
                        //var rows = JSON.parse(body);
                        if (!error && response.statusCode == 200) {
                            //log.info(body);
                            //log.info(rows);
                            if (body.ip.ok == 1) {
                                localIp = body.ip.value.ip;
                                log.info("localIp: " + localIp);
                            } else {
                                log.info(body);
                            }
                        } else {
                            log.info(error);
                        }

                    });
                }
            });
        } else {
            log.info("The IP remains the same: " + localIp);
        }
    }, null, true, "Europe/Athens");


});
