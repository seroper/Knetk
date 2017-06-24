// html buttons designed here: http://onlinehtmltools.com/button-genaretor/#sthash.aClLiKdg.dpbs
// Use this validator: http://jsonlint.com/

// Setup logging
var winston = require('winston');
var log_levels = {
    levels: {
        'error': 5,
        'server_debug': 4,
        'brower_info': 3,
        'server_info': 2,
        'wemo_info': 1,
        'info': 0
    },
    colors: {
        'error': 'red',
        'server_debug': 'blue',
        'brower_info': 'green',
        'server_info': 'yellow',
        'wemo_info': 'grey',
        'info': 'yellow'
    }
};

var logger = new (winston.Logger)({
    levels: log_levels,
    transports: [
        // new winston.transports.DailyRotateFile({
        new winston.transports.File({
            level: 'info',
            filename: './logs/knekt_kontrol-logs.log',
            //datePattern: '.yyyy-MM-dd.log',   //Use with DailyRotateFiles
            handleExceptions: true,
            json: true,
            maxsize: 2048, //2k
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: true,
            json: true,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.setLevels(log_levels.levels);
winston.addColors(log_levels.colors);
winston.level = 'wemo_info';

logger.error("logger testing error level");
logger.server_debug("logger testing server_debug level");
logger.brower_info("logger testing brower_info level");
logger.server_info("logger testing server_info level");
logger.wemo_info("logger testing wemo_info level");
logger.info("logger testing info level");

var express = require('express');
var app = express();

// Add the path and sub directories for the static web content.
app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

// Load a settings files in json format
// When a value changes, from a browser request or feedback from devices, do "io.sockets.emit("settings_reply", Settings);" at the server to push the update to the pages!
// Pages don't get status on periodic request, pushed only.'
var Settings = require('./Settings.json');
/*var Settings;
var jsonfile = require('jsonfile');
var filename = './Settings.json';
jsonfile.readFile(filename, function (err, obj) {
    if (err == true)
    {
        console.log('Error reading settings');
        logger.error('Error reading settings');
    }
    else {
        logger.server_info('new way of reading settings')
        //console.dir(obj);
        Settings = obj;
    }
})
*/

// Wemo for Belkin switch and lights interface.
var Wemo = require('wemo-client');
var wemo = new Wemo();
var Wemo_Discover_Count = 0;
var Wemo_Discover_Limit = 10;

var Bella_Switch_Amp;
var Olivia_Swtich_Amp;
var Bathroom_Switch_Amp;
var Kitchen_Switch_Amp;
var Sonia_Switch_Amp;
var Simon_Switch_Amp;
var Light_Bridge;

logger.wemo_info('About to look for devices');
logger.wemo_info('');
Wemo_Load_Devices();
Wemo_Discover();

function Wemo_Discover() {
    wemo.discover(function (err, deviceInfo) {
        console.log('Wemo device found named: %s', deviceInfo.friendlyName);
        console.log('');

        if (deviceInfo.friendlyName == "Bella Amp") {    // Get the client for the found device
            var Bella_Switch_Amp = wemo.client(deviceInfo);
        }
        else if (deviceInfo.friendlyName == "Olivia Amp") {    // Get the client for the found device
            var Olivia_Switch_Amp = wemo.client(deviceInfo);
        }
        else if (deviceInfo.friendlyName == "Bathroom Amp") {    // Get the client for the found device
            var Bathroom_Switch_Amp = wemo.client(deviceInfo);
        }
        else if (deviceInfo.friendlyName == "Kitchen Amp") {    // Get the client for the found device
            var Kitchen_Switch_Amp = wemo.client(deviceInfo);
        }
        else if (deviceInfo.friendlyName == "Sonia Amp") {    // Get the client for the found device
            var Sonia_Switch_Amp = wemo.client(deviceInfo);
        }
        else if (deviceInfo.friendlyName == "Simon Amp") {    // Get the client for the found device
            var Sonia_Switch_Amp = wemo.client(deviceInfo);
        }
        else if (deviceInfo.friendlyName == "WeMo Link") {    // Get the client for the found device
            var Light_Bridge = wemo.client(deviceInfo);
        }
        else {
            console.log('Error, WeMo device not recognised.')
        }
    });

    Wemo_Discover_Count++;
    if (Wemo_Discover_Count < Wemo_Discover_Limit) {
        setTimeout(Wemo_Discover, 500);
    }
    else if (Wemo_Discover_Count == Wemo_Discover_Limit) {
        Wemo_Discover_Complete();
    }
}

function Wemo_Discover_Complete() {
    console.log('Wemo discover completed, count = ' + Wemo_Discover_Count);
}
logger.info("logger testing info level2");

// websocket acations
io.on('connection', function (socket) {
    logger.info("A user connected to the websocket");

    // Commands to implement:
    // ping
    // get settings
    // disconnect
    // room power
    // music on
    // volume up and down
    // mute
    // source select, local and knekt
    // radio preset
    //
    // Need to add unsolisited Rx for DEBUG: or UPDATE: tags.

    socket.on("ping", function () {
        socket.emit("pong");
        logger.info("Got ping");
    });

    socket.on("settings_get", function (message) {
        console.log('Settings requested');

        logger.info("Settings_get: " + Settings);
        io.sockets.emit("settings_reply", Settings);
    });

    socket.on("disconnect", function () {
        logger.info("A user disconnected the websocket");
    });
});

http.listen(3000, function () {
    logger.info("HTTP server listening on port:3000");
});

var Count = 0;
function Test() {
    console.log('Testing timer expired. Bathroom power = ' + Settings.rooms.bathroom.power);

    if (Count % 2) {
        Settings.rooms.bathroom.power = "off";
        Swtich_Set(Bathroom_Switch_Amp, 1);
    }
    else {
        Settings.rooms.bathroom.power = "standby";
        Swtich_Set(Bathroom_Switch_Amp, 0);
    }
    Count++;

    // When a value changes, from a browser request or feedback from devices, do "io.sockets.emit("settings_reply", Settings);" at the server to push the update to the pages!
    // Pages don't get status on periodic request, pushed only.'
    io.sockets.emit("settings_reply", Settings);
}

function Switch_Error(error, sw) {
    var state = error != null;
    if (state) {
        logger.error('Switch ' + sw.device.friendlyName + ' error ' + error.code);
    }
}

function Switch_State_Changed(state, sw) {
    logger.wemo_info('Switch ' + sw.device.friendlyName + ' state now ' + state);
    console.log('Switch ' + sw.device.friendlyName + ' state now ' + state);
}

// Set switches functions
function Swtich_Set(state, sw) {
    // Turn the switch on
    logger.wemo_info('About to change ' + sw.friendlyName + ' switch state');
    logger.wemo_info('');
    sw.setBinaryState(1);
    logger.wemo_info('Now set on');
    logger.wemo_info('');
}

// Light interfaces
function Light_Bridge_Error(err) {
    logger.error('Light ' + light.friendlyName + ' error ' + error.code);
}

function Light_State_Changed(state) {
    logger.wemo_info('Light ' + Light_Bridge.friendlyName + ' state now ' + state);
}

function Wemo_Load_Devices() {
    wemo.load('http://' + Settings.rooms.bella.power_switch_ip + ':' + Settings.rooms.bella.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Bella Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Bella Amp") {
                Bella_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Bella_Switch_Amp.on('error', function (err) {
                    Switch_Error(error, Bella_Switch_Amp);
                });

                Bella_Switch_Amp.on('binaryState', function (value) {
                    Switch_State_Changed(value, Bella_Switch_Amp);
                });

                logger.wemo_info('Bella amp loaded sucessfully');
            }
            else {
                logger.error('Bella amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Bella amp not loaded sucessfully');
        }
    });

    wemo.load('http://' + Settings.rooms.olivia.power_switch_ip + ':' + Settings.rooms.olivia.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Olivia Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Olivia Amp") {
                Olivia_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Olivia_Switch_Amp.on('error', function (err) {
                    Switch_Error(error, Olivia_Switch_Amp);
                });

                Olivia_Switch_Amp.on('binaryState', function (value) {
                    Switch_State_Changed(value, Olivia_Switch_Amp);
                });

                logger.wemo_info('Olivia amp loaded sucessfully');
            }
            else {
                logger.error('Olivia amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Olivia amp not loaded sucessfully');
        }
    });

    wemo.load('http://' + Settings.rooms.bathroom.power_switch_ip + ':' + Settings.rooms.bathroom.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Bathroom Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Bathroom Amp") {
                Bathroom_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Bathroom_Switch_Amp.on('error', function (err) {
                    Switch_Error(error, Bathroom_Switch_Amp);
                });

                Bathroom_Switch_Amp.on('binaryState', function (value) {
                    Switch_State_Changed(value, Bathroom_Switch_Amp);
                });

                logger.wemo_info('Bathroom amp loaded sucessfully');
            }
            else {
                logger.error('Bathroom amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Bathroom amp not loaded sucessfully');
        }
    });

    wemo.load('http://' + Settings.rooms.kitchen.power_switch_ip + ':' + Settings.rooms.kitchen.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Kitchen Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Kitchen Amp") {
                Kitchen_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Kitchen_Switch_Amp.on('error', function (err) {
                    Switch_Error(error, Kitchen_Switch_Amp);
                });

                Kitchen_Switch_Amp.on('binaryState', function (value) {
                    Switch_State_Changed(value, Kitchen_Switch_Amp);
                });

                logger.wemo_info('Kitchen amp loaded sucessfully');
            }
            else {
                logger.error('Kitchen amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Olivia amp not loaded sucessfully');
        }
    });

    wemo.load('http://' + Settings.rooms.sonia.power_switch_ip + ':' + Settings.rooms.sonia.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Sonia Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Sonia Amp") {
                Sonia_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Sonia_Switch_Amp.on('error', function (err) {
                    Switch_Error(error, Sonia_Switch_Amp);
                });

                Sonia_Switch_Amp.on('binaryState', function (value) {
                    Switch_State_Changed(value, Sonia_Switch_Amp);
                });

                logger.wemo_info('Sonia amp loaded sucessfully');
            }
            else {
                logger.error('Sonia amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Olivia amp not loaded sucessfully');
        }
    });

    wemo.load('http://' + Settings.rooms.simon.power_switch_ip + ':' + Settings.rooms.simon.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Simon Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Simon Amp") {
                Simon_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Simon_Switch_Amp.on('error', function (err) {
                    Switch_Error(error, Simon_Switch_Amp);
                });

                Simon_Switch_Amp.on('binaryState', function (value) {
                    Switch_State_Changed(value, Simon_Switch_Amp);
                });

                logger.wemo_info('Simon amp loaded sucessfully');
            }
            else {
                logger.error('Simon amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Olivia amp not loaded sucessfully');
        }
    });

    wemo.load('http://' + Settings.wemo_lights.link_ip + ':' + Settings.wemo_lights.link_port + '/setup.xml', function (err, deviceInfo) {
        logger.server_info('loaded Simon Amp from saved data');
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Simon Amp") {
                Light_Bridge = wemo.client(deviceInfo);

                // Register event changes
                Light_Bridge.on('error', function (err) {
  //                  Light_Error(error, Light_Bridge);
                });

                Light_Bridge.on('binaryState', function (value) {
//                    Light_State_Changed(value, Light_Bridge);
                });

                logger.wemo_info('Simon amp loaded sucessfully');
            }
            else {
                logger.error('Simon amp not loaded sucessfully');
            }
        }
        else {
            logger.error('Olivia amp not loaded sucessfully');
        }
    });

}


