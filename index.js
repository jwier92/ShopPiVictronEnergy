const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
var mqtt = require('mqtt')


var client  = mqtt.connect('mqtt://192.168.2.20')
const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 19200
})

var fwCounter = 0;
var vCounter = 0;
var serCounter = 0;
var vpvCounter = 0;
var ppvCounter = 0;
var h20Counter = 0;
var h22Counter = 0;
var h21Counter = 0;
var h23Counter = 0;
var CSCounter = 0;


const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
// port.on('readable', function () {
//     console.log('Data:', port.read())
// })

parser.on('data', function (data) {
    let d2 = data.trim();
    // console.log('Data:', d2);
    // console.log(typeof d2)

    try {
        var parts = d2.split('\t')
        // console.log("Topic is ", parts[0]);
        switch (parts[0]) {
            case "FW": // Firmware Version
                if (fwCounter++ > 60) {
                    let fw = parts[1].substring(0,1) + "." + parts[1].substring(1,2) + "." + parts[1].substring(2,3);
                    fwCounter = 0;
                    client.publish("solar/shop/CC/firmware", fw);
                }
                break;
            case "SER#":
                if (serCounter++ > 60) {
                    client.publish("solar/shop/CC/serialNumber", parts[1]);
                    serCounter = 0;
                }
                break;
            case "V":
                if (vCounter++ > 3) {
                    let volts = (parts[1] / 1000).toString();
                    client.publish("solar/shop/battery/voltage", volts);
                    vCounter = 0;
                }
                break;
            case "VPV":
                if (vpvCounter++ > 3) {
                    let volts = (parts[1] / 1000).toString();
                    client.publish("solar/shop/PV/voltage", volts);
                    vpvCounter = 0;
                }
                break;
            case "PPV":
                if (ppvCounter++ > 3) {
                    client.publish("solar/shop/PV/power", parts[1]);
                    ppvCounter = 0;
                }
                break;
            case "H20":
                if (h20Counter++ > 20) {
                    client.publish("solar/shop/yield/today", parts[1]);
                    h20Counter = 0;
                }
                break;
            case "H22":
                if (h22Counter++ > 60) {
                    client.publish("solar/shop/yield/yesterday", parts[1]);
                    h22Counter = 0;
                }
                break;
            case "H21":
                if (h21Counter++ > 60) {
                    client.publish("solar/shop/maxpower/today", parts[1]);
                    h21Counter = 0;
                }
                break;
            case "H23":
                if (h23Counter++ > 60) {
                    client.publish("solar/shop/maxpower/yesterday", parts[1]);
                    h23Counter = 0;
                }
                break;
            case "CS":
                if (CSCounter++ > 60) {
                    client.publish("solar/shop/CC/status", parts[1]);
                    CSCounter = 0;
                }
                break;
                        // default: 
                //console.log(parts[0] + ": " + parts[1]);
                // break;
            }
        
    } 
    catch (e) {
        console.log(e)
    }
})