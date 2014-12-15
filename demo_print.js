//var app = require('http').createServer(handler)
 //, io = require('socket.io').listen(app);
 //app.listen('8001');

var legacy = require('legacy-encoding');
var base64 = require('base64-js');
var base64decode = require('base64-arraybuffer');
var mime = require('mime');
var util = require("util");
var image = "\n\nANESTIS DOMVRIS\x1B\x2A\x00\x10\x00\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\n\nAnestis Domvris\n\n\n\n\n\n\x1B\x69";

//console.log(base64decode.decode(imageBase64));

var bmp = require("bmp-js");
var fs = require("fs");
//var data_test = base64Image("img.jpg");//fs.readFileSync("img.jpg").toString("base64");
//console.log(data_test);
var bmpBuffer = fs.readFileSync('cloud3.bmp');
//console.dir(bmpBuffer);
var bmpData = bmp.decode(bmpBuffer);

//bmpData={data:Buffer,width:Number,height:Height}
//console.log(bmpData);
var offset = 0;

//var str = "\x1B\x33\x18";
//var bmps = GetBitmapData(bmpData);//setBitmapData
var bmps = setBitmapData(bmpData);//setBitmapData
var widths = GetBytes(bmps.width);
var dots = bmps.dots;
var str ="";
//TO initialize the printer
str+= String.fromCharCode(27); //1B // ESC
str+= String.fromCharCode(64); //40 // @
//Feeding lines just to test the printer communication
str+= String.fromCharCode(10);
str+= String.fromCharCode(10);
str+= String.fromCharCode(10);
str+= String.fromCharCode(10);

//Set line spacing
str+= String.fromCharCode(27); //1B // ESC
str+= String.fromCharCode(51); //33 // 3
str+= String.fromCharCode(24); //18

while(offset < bmps.height){
	str+= String.fromCharCode(27); //1B // ESC  it is a space
	str+= String.fromCharCode(42); //2A // *
	str+= String.fromCharCode(33); // 24-dot double-density, //32 is 24-dot single-density, //1 is 8-dot double-density, //0 is 8-dot single-density
	//I think the problem is here.... setting those two values.
	str+= String.fromCharCode(widths[0]); // nL: 
	str+= String.fromCharCode(widths[1]); // nH: 
	for (var x = 0; x < bmps.width; ++x){
		for (var k = 0; k < 3; ++k){
			var slice = 0;
			for (var b = 0; b < 8; ++b){
				var offsetK = parseInt(offset / 8,10) + k;
				var y = (offsetK * 8) + b;
				var i = (y * bmps.width) + x;
				var v = false;
				if(i < dots.length){
					v = dots[i];
				}
				slice |=( v == true ? 1 : 0) << (7 - b);//slice |=( v == 255 ? 1 : 0) << (7 - b);
			}
			str+= String.fromCharCode(slice);//"\\x" + slice;
		}
	}
	offset += 24;	
	//Feed one line
	str+= String.fromCharCode(10);//"\\x" + slice;
}
str+= String.fromCharCode(27);
str+= String.fromCharCode(51);
str+= String.fromCharCode(30);
//var str = "\x1B\x40\x1C\x2E\x1B\x74\x18Lets see Greek: φψΩ Ελληνικά Γράμματα ΕΠΙΤΕΛΟΥΣ!!! \n\n\n\nThis Awsome Tool!!!\r\n\x1B\x61\x01\x1D\x48\x00\x1D\x68\x60\x1D\x6B\x04 9000002345.\x00***90000002345****\n\n\n\x1B\x2A\x00\x30\x00\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\x01\x02\x04\x08\x10\x20\x40\x80\x80\x40\x20\x10\x08\x04\x02\x01\n\n\x1D\x56\x42\x18";


//CUT COMMAND FOR OCOM PRINTER AND PROPABLY OTHER PRINTERS \x1D\x56\x42\x18
//CHANGE CODE PAGE TO CP737 \x1B\x40\x1C\x2E\x1B\x74\x18 if it is a Chinese printer without having to set anything from the driver software
//
console.log(str);
//console.log("dots.length : " + dots.length);
//The barcode doesn't accept "--"
var buffer = legacy.encode(str, 'cp737', {
  'mode': 'html'
});
//console.log(buffer);

var printer = require("../lib");//node-printer npm module
printer.printDirect({data:buffer
	, printer:'POS80' // printer name
	, type: 'RAW' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
	, success:function(jobID){
		console.log("sent to printer with ID: "+jobID);
	}
	, error:function(err){console.log(err);}
});

function GetBytes(value){
	var nL = 0;
    var nH = 0;	
	nL = value % 256;
	nH = parseInt(value/256,10);			
    return [nL,nH];
}

function base64Image(src) {
    var data = fs.readFileSync(src).toString("base64");
    return util.format("data:%s;base64,%s", mime.lookup(src), data);
}
function toUnicode(theString) {
  var unicodeString = [];
  for (var i=0; i < theString.length; i++) {
    var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
    while (theUnicode.length < 4) {
      theUnicode = '0' + theUnicode;
    }
    theUnicode = '\\u' + theUnicode;
    unicodeString.push(theUnicode);
  }
  return unicodeString;
}
function handler (req, res) {
	console.log(__dirname);
  fs.readFile(__dirname + '/index1.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index1.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

function setBitmapData(bitmap){
	var width = bmpData.width;
	var xheight = bmpData.height;
	var xwidth = width;
	if(width % 8!= 0 ){
		var k = parseInt(width/8,10);
		xwidth = (k+1)*8;
	}
	var dots = new Array();
	var threshold = 127;	
	for(var y = 0;y < xheight;y++){
		for(var x = 0;x < xwidth;x++){
			var _x = x;
			var _y = y;
			var location = _y * bitmap.width * 4 + _x * 4;
			//var location = y * this.width * 4 + x * 4;	  
			var red = bitmap.data[location];
			var green = bitmap.data[location + 1];
			var blue = bitmap.data[location + 2];
			var luminance = parseInt(red * 0.3 + green * 0.59 + blue * 0.11);
			//var luminance = parseInt(((red * 299) + (green *  587) + (blue * 114))/1000,10);
			if(luminance < threshold){
				dots.push(true);
			}
			else{
				dots.push(false);
			}
		}
	}
	var obj ={
		dots :dots,
		height : xheight,
		width : xwidth
	}	
	return obj;
}

function GetBitmapData(bitmap){
	var multiplier = 576;
	var width = bmpData.width;	
	if(width % 8!= 0 ){
		var newWidth = parseInt((width/8+1),10)*8;
		multiplier = newWidth;		
	}	
	var scale = parseFloat(multiplier/parseFloat(bitmap.width));	
	var xheight = parseInt(bmpData.height * scale,10);
	var xwidth = parseInt(bmpData.width * scale,10);
	var dots = new Array();
	var threshold = 127;	
	for(var y = 0;y < xheight;y++){
		for(var x = 0;x < xwidth;x++){
			var _x = parseInt(x/scale,10);
			var _y = parseInt(y/scale,10);
			var location = _y * bitmap.width * 4 + _x * 4;
			//var location = y * this.width * 4 + x * 4;	  
			var red = bitmap.data[location];
			var green = bitmap.data[location + 1];
			var blue = bitmap.data[location + 2];
			var luminance = parseInt(red * 0.3 + green * 0.59 + blue * 0.11);
			//var luminance = parseInt(((red * 299) + (green *  587) + (blue * 114))/1000,10);
			if(luminance < threshold){
				dots.push(true);
			}
			else{
				dots.push(false);
			}
		}
	}
	var obj ={
		dots :dots,
		height : xheight,
		width : xwidth
	}	
	return obj;
}
