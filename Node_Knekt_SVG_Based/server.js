// html buttons designed here: http://onlinehtmltools.com/button-genaretor/#sthash.aClLiKdg.dpbs
// Use this validator: http://jsonlint.com/

// Setup logging
var winston = require('winston');
var log_levels = {
    levels: {
        'error': 0,
        'server_debug': 1,
        'brower_info': 2,
        'server_info': 3,
        'wemo_info': 4,
        'info': 5
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
            humanReadableUnhandledException: true,
            json: true,
            maxsize: 2048, //2k
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: false,
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
logger.info(" ");

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
var Wemo_Discover_Limit = 0;    //Don't keep looking currently

var Bella_Switch_Amp = 'Loading';
var Olivia_Switch_Amp = 'Loading';
var Bathroom_Switch_Amp = 'Loading';
var Kitchen_Switch_Amp = 'Loading';
var Sonia_Switch_Amp = 'Loading';
var Simon_Switch_Amp = 'Loading';
var Light_Bridge = 'Loading';

var Bella_Switch_Amp_Count = 0;
var Olivia_Switch_Amp_Count = 0;
var Bathroom_Switch_Amp_Count = 0;
var Kitchen_Switch_Amp_Count = 0;
var Sonia_Switch_Amp_Count = 0;
var Simon_Switch_Amp_Count = 0;
var Light_Bridge_Count = 0;

Wemo_Search();

function Wemo_Search() {
    logger.wemo_info('');
    logger.wemo_info('About to load devices');
    Wemo_Load_Devices();
    setTimeout(Wemo_Poll_Start, 5000);
}

function Wemo_Poll_Start()
{
    setInterval(Wemo_Poll, 1000);
}

function Wemo_Poll()
{
    var limit = 10;

    Wemo_Get_Binary_State();

    if (Bella_Switch_Amp_Count == limit) {
        logger.wemo_info('Bella switch not available now, searching again');
        Bella_Switch_Amp_Count = 0;
        Bella_Switch_Amp = 'Not detected';
        Wemo_Discover();
    }
    if (Olivia_Switch_Amp_Count == limit) {
        logger.wemo_info('Olivia switch not available now, searching again');
        Olivia_Switch_Amp_Count = 0;
        Olivia_Switch_Amp = 'Not detected';
        Wemo_Discover();
    }
    if (Bathroom_Switch_Amp_Count == limit) {
        logger.wemo_info('Bathroom switch not available now, searching again');
        Bathroom_Switch_Amp_Count = 0;
        Bathroom_Switch_Amp = 'Not detected';
        Wemo_Discover();
    }
    if (Kitchen_Switch_Amp_Count == limit) {
        logger.wemo_info('Kitchen switch not available now, searching again');
        Kitchen_Switch_Amp_Count = 0;
        Kitchen_Switch_Amp = 'Not detected';
        Wemo_Discover();
    }
    if (Sonia_Switch_Amp_Count == limit) {
        logger.wemo_info('Sonia switch not available now, searching again');
        Sonia_Switch_Amp_Count = 0;
        Sonia_Switch_Amp = 'Not detected';
        Wemo_Discover();
    }
    if (Simon_Switch_Amp_Count == limit) {
        logger.wemo_info('Simon switch not available now, searching again');
        Simon_Switch_Amp_Count = 0;
        Simon_Switch_Amp = 'Not detected';
        Wemo_Discover();
    }
    if (Light_Bridge_Count == limit) {
        logger.wemo_info('Light bridge not available now, searching again');
        Light_Bridge_Count = 0;
        Light_Bridge = 'Not detected';
        Wemo_Discover();
    }

}

function Wemo_Get_Binary_State() {

    if (Bella_Switch_Amp != 'Not detected' && Bella_Switch_Amp != 'Loading') {
        Bella_Switch_Amp.getBinaryState(function (err, state) {
            if (err == null) {
                Bella_Switch_Amp.device.binaryState = state;
                //logger.wemo_info('Bella switch state now ' + state);
                Bella_Switch_Amp_Count = 0;
            }
            else {
                Bella_Switch_Amp_Count++;
            }
        });
    }
    else {
        Bella_Switch_Amp_Count++;
    }

    if (Olivia_Switch_Amp != 'Not detected' && Olivia_Switch_Amp != 'Loading') {
        Olivia_Switch_Amp.getBinaryState(function (err, state) {
            if (err == null) {
                Olivia_Switch_Amp.device.binaryState = state;
                //logger.wemo_info('Olivia switch state now ' + state);
                Olivia_Switch_Amp_Count = 0;
            }
            else {
                Olivia_Switch_Amp_Count++;
            }
        });
    }
    else {
        Olivia_Switch_Amp_Count++;
    }

    if (Bathroom_Switch_Amp != 'Not detected' && Bathroom_Switch_Amp != 'Loading') {
        Bathroom_Switch_Amp.getBinaryState(function (err, state) {
            if (err == null) {
                Bathroom_Switch_Amp.device.binaryState = state;
                //logger.wemo_info('Bathroom switch state now ' + state);
                Bathroom_Switch_Amp_Count = 0;
            }
            else {
                Bathroom_Switch_Amp_Count++;
            }
        });
    }
    else {
        Bathroom_Switch_Amp_Count++;
    }

    if (Kitchen_Switch_Amp != 'Not detected' && Kitchen_Switch_Amp != 'Loading') {
        Kitchen_Switch_Amp.getBinaryState(function (err, state) {
            if (err == null) {
                Kitchen_Switch_Amp.device.binaryState = state;
                //logger.wemo_info('Kitchen switch state now ' + state);
                Kitchen_Switch_Amp_Count = 0;
            }
            else {
                Kitchen_Switch_Amp_Count++;
            }
        });
    }
    else {
        Kitchen_Switch_Amp_Count++;
    }

    if (Sonia_Switch_Amp != 'Not detected' && Sonia_Switch_Amp != 'Loading') {
        Sonia_Switch_Amp.getBinaryState(function (err, state) {
            if (err == null) {
                Sonia_Switch_Amp.device.binaryState = state;
                //logger.wemo_info('Sonia switch state now ' + state);
                Sonia_Switch_Amp_Count = 0;
            }
            else {
                Sonia_Switch_Amp_Count++;
            }
        });
    }
    else {
        Sonia_Switch_Amp_Count++;
    }

    if (Simon_Switch_Amp != 'Not detected' && Simon_Switch_Amp != 'Loading') {
        Simon_Switch_Amp.getBinaryState(function (err, state) {
            if (err == null) {
                Simon_Switch_Amp.device.binaryState = state;
                //logger.wemo_info('Simon switch state now ' + state);
                Simon_Switch_Amp_Count = 0;
            }
            else {
                Simon_Switch_Amp_Count++;
            }
        });
    }
    else {
        Simon_Switch_Amp_Count++;
    }
    // Need something for the lights but can't dop that yet.
}

function Wemo_Discover() {
    logger.wemo_info('Wemo discovery starting');

    wemo.discover(function (err, deviceInfo) {
        if (!null) {
            logger.wemo_info('Wemo device found named: %s', deviceInfo.friendlyName);

            if (deviceInfo.friendlyName == "Bella Amp" && Bella_Switch_Amp == 'Not detected') {    // Get the client for the found device
                Bella_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Bella_Switch_Amp.on('error', function (err) {
                    Bella_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Bella amp: Error ' + err.code);
                });

                Bella_Switch_Amp.on('binaryState', function (state) {
                    Bella_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Bella amp state now ' + state);
                });

                logger.wemo_info('Bella amp discovered sucessfully');
            }
            else if (deviceInfo.friendlyName == "Olivia Amp" && Olivia_Switch_Amp == 'Not detected') {    // Get the client for the found device
                Olivia_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Olivia_Switch_Amp.on('error', function (err) {
                    Olivia_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Olivia amp: Error ' + err.code);
                });

                Olivia_Switch_Amp.on('binaryState', function (state) {
                    Olivia_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Olivia amp state now ' + state);
                });

                logger.wemo_info('Olivia amp discovered sucessfully');
            }
            else if (deviceInfo.friendlyName == "Bathroom Amp" && Bathroom_Switch_Amp == 'Not detected') {    // Get the client for the found device
                Bathroom_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Bathroom_Switch_Amp.on('error', function (err) {
                    Bathroom_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Bathroom amp: Error ' + err.code);
                });

                Bathroom_Switch_Amp.on('binaryState', function (state) {
                    Bathroom_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Bathroom amp state now ' + state);
                });

                logger.wemo_info('Bathroom amp discovered sucessfully');
            }
            else if (deviceInfo.friendlyName == "Kitchen Amp" && Kitchen_Switch_Amp == 'Not detected') {    // Get the client for the found device
                Kitchen_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Kitchen_Switch_Amp.on('error', function (err) {
                    Kitchen_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Kitchen amp: Error ' + err.code);
                });

                Kitchen_Switch_Amp.on('binaryState', function (state) {
                    Kitchen_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Kitchen amp state now ' + state);
                });

                logger.wemo_info('Kitchen amp discovered sucessfully');
            }
            else if (deviceInfo.friendlyName == "Sonia Amp" && Sonia_Switch_Amp == 'Not detected') {    // Get the client for the found device
                Sonia_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Sonia_Switch_Amp.on('error', function (err) {
                    Sonia_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Sonia amp: Error ' + err.code);
                });

                Sonia_Switch_Amp.on('binaryState', function (state) {
                    // Misght need something like that for when devices come back online.
                    // if (typeof Sonia_Switch_Amp.device.binaryState != "undefined") {
                    Sonia_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Sonia amp state now ' + state);
                });

                logger.wemo_info('Sonia amp discovered sucessfully');
            }
            else if (deviceInfo.friendlyName == "Simon Amp" && Simon_Switch_Amp == 'Not detected') {    // Get the client for the found device
                Simon_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Simon_Switch_Amp.on('error', function (err) {
                    Simon_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Simon amp: Error ' + err.code);
                });

                Simon_Switch_Amp.on('binaryState', function (state) {
                    Simon_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Simon amp state now ' + state);
                });

                logger.wemo_info('Simon amp discovered sucessfully');
            }
            else if (deviceInfo.friendlyName == "WeMo Link" && Light_Bridge == 'Not detected') {    // Get the client for the found device
                Light_Bridge = wemo.client(deviceInfo);

                // Register event changes
                Light_Bridge.on('error', function (err) {
                    //                  Light_Error(err, Light_Bridge);
                });

                Light_Bridge.on('binaryState', function (value) {
                    //                    Light_State_Changed(value, Light_Bridge);
                });

                logger.wemo_info('Lights link loaded sucessfully');
            }
            else {
                // unknown device or it's already found.
            }
        }
        else
        {
            logger.error('Wemo discover error:' + err.code);
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
    logger.wemo_info('Wemo discover completed, count = ' + Wemo_Discover_Count);
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

setInterval(Test, 5000);

function Test() {
    var state = 0;

    //console.log('Testing timer expired.');

    if (   (Bella_Switch_Amp != 'Not detected')  && (Bella_Switch_Amp != 'Loading')
        && (Olivia_Switch_Amp != 'Not detected') && (Olivia_Switch_Amp != 'Loading')
        && (Bathroom_Switch_Amp != 'Not detected') && (Bathroom_Switch_Amp != 'Loading')
        && (Kitchen_Switch_Amp != 'Not detected') && (Kitchen_Switch_Amp != 'Loading')
        && (Sonia_Switch_Amp != 'Not detected') && (Sonia_Switch_Amp != 'Loading')
        && (Simon_Switch_Amp != 'Not detected') && (Simon_Switch_Amp != 'Loading')
        && (Light_Bridge != 'Not detected') && (Light_Bridge != 'Loading')) 
    {
        
        if (Sonia_Switch_Amp.device.binaryState == 0) {
            state = 1;
        }
        else {
            state = 0;
        }
        logger.wemo_info('Sonia_Switch_Amp changed switch state to ' + state);
        Sonia_Switch_Amp.setBinaryState(state);
        Sonia_Switch_Amp.device.binaryState = state;
    }

    // When a value changes, from a browser request or feedback from devices, do "io.sockets.emit("settings_reply", Settings);" at the server to push the update to the pages!
    // Pages don't get status on periodic request, pushed only.'
    io.sockets.emit("settings_reply", Settings);
}

// Light interfaces
function Light_Bridge_Error(err) {
    logger.error('Light ' + light.device.friendlyName + ' error ' + err.code);
}

function Light_State_Changed(state) {
    logger.wemo_info('Light ' + Light_Bridge.device.friendlyName + ' state now ' + state);
}

function Wemo_Load_Devices() {

    var discovery_delay = 1000;

    logger.wemo_info('Bella amp loading from saved data');
    wemo.load('http://' + Settings.rooms.bella.power_switch_ip + ':' + Settings.rooms.bella.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Bella Amp") {
                Bella_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Bella_Switch_Amp.on('error', function (err) {
                    Bella_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Bella amp: Error ' + err.code);
                });

                Bella_Switch_Amp.on('binaryState', function (state) {
                    Bella_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Bella amp state now ' + state);
                });

                logger.wemo_info('Bella amp loaded sucessfully');
            }
            else {
                Bella_Switch_Amp = 'Not detected';
                logger.error('Bella amp NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Bella_Switch_Amp = 'Not detected';
            logger.error('Bella amp NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

    logger.wemo_info('Olivia amp loading from saved data');
    wemo.load('http://' + Settings.rooms.olivia.power_switch_ip + ':' + Settings.rooms.olivia.power_switch_port + '/setup.xml', function (err, deviceInfo) {        
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Olivia Amp") {
                Olivia_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Olivia_Switch_Amp.on('error', function (err) {
                    Olivia_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Olivia amp: Error ' + err.code);
                });

                Olivia_Switch_Amp.on('binaryState', function (state) {
                    Olivia_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Olivia amp state now ' + state);
                });

                logger.wemo_info('Olivia amp loaded sucessfully');
            }
            else {
                Olivia_Switch_Amp = 'Not detected';
                logger.error('Olivia amp NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Olivia_Switch_Amp = 'Not detected';
            logger.error('Olivia amp NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

    logger.wemo_info('Bathroom amp loading from saved data');
    wemo.load('http://' + Settings.rooms.bathroom.power_switch_ip + ':' + Settings.rooms.bathroom.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Bathroom Amp") {
                Bathroom_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Bathroom_Switch_Amp.on('error', function (err) {
                    Bathroom_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Bathroom amp: Error ' + err.code);
                });

                Bathroom_Switch_Amp.on('binaryState', function (state) {
                    Bathroom_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Bathroom amp state now ' + state);
                });

                logger.wemo_info('Bathroom amp loaded sucessfully');
            }
            else {
                Bathroom_Switch_Amp = 'Not detected';
                logger.error('Bathroom amp NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Bathroom_Switch_Amp = 'Not detected';
            logger.error('Bathroom amp NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

    logger.wemo_info('Kitchen amp loading from saved data');
    wemo.load('http://' + Settings.rooms.kitchen.power_switch_ip + ':' + Settings.rooms.kitchen.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Kitchen Amp") {
                Kitchen_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Kitchen_Switch_Amp.on('error', function (err) {
                    Kitchen_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Kitchen amp: Error ' + err.code);
                });

                Kitchen_Switch_Amp.on('binaryState', function (state) {
                    Kitchen_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Kitchen amp state now ' + state);
                });

                logger.wemo_info('Kitchen amp loaded sucessfully');
            }
            else {
                Kitchen_Switch_Amp = 'Not detected';
                logger.error('Kitchen amp NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Kitchen_Switch_Amp = 'Not detected';
            logger.error('Kitchen amp NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

    logger.wemo_info('Sonia amp loading from saved data');
    wemo.load('http://' + Settings.rooms.sonia.power_switch_ip + ':' + Settings.rooms.sonia.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Sonia Amp") {
                Sonia_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Sonia_Switch_Amp.on('error', function (err) {
                    Sonia_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Sonia amp: Error ' + err.code);
                });

                Sonia_Switch_Amp.on('binaryState', function (state) {
                    Sonia_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Simon amp state now ' + state);
                });

                logger.wemo_info('Sonia amp loaded sucessfully');
            }
            else {
                Sonia_Switch_Amp = 'Not detected';
                logger.error('Sonia amp NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Sonia_Switch_Amp = 'Not detected';
            logger.error('Sonia amp NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

    logger.wemo_info('Simon amp loading from saved data');
    wemo.load('http://' + Settings.rooms.simon.power_switch_ip + ':' + Settings.rooms.simon.power_switch_port + '/setup.xml', function (err, deviceInfo) {
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "Simon Amp") {
                Simon_Switch_Amp = wemo.client(deviceInfo);

                // Register event changes
                Simon_Switch_Amp.on('error', function (err) {
                    Simon_Switch_Amp = 'Not detected';
                    setTimeout(Wemo_Discover, 1000);
                    logger.error('Simon amp: Error ' + err.code);
                });

                // update discover to check if amp already define before overwritting it, that might be the cause of lots of problems.
                // update all on binary state changed to this:
                Simon_Switch_Amp.on('binaryState', function (state) {
                    Simon_Switch_Amp.device.binaryState = state;
                    logger.wemo_info('Simon amp state now ' + state);
                });

                logger.wemo_info('Simon amp loaded sucessfully');
            }
            else {
                Simon_Switch_Amp = 'Not detected';
                logger.error('Simon amp NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Simon_Switch_Amp = 'Not detected';
            logger.error('Simon amp NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

    logger.wemo_info('Light bridge loading from saved data');
    wemo.load('http://' + Settings.wemo_lights.link_ip + ':' + Settings.wemo_lights.link_port + '/setup.xml', function (err, deviceInfo) {
        if (deviceInfo != null) {
            if (deviceInfo.friendlyName == "WeMo Link") {
                Light_Bridge = wemo.client(deviceInfo);

                // Register event changes
                Light_Bridge.on('error', function (err) {
  //                  Light_Error(err, Light_Bridge);
                });

                Light_Bridge.on('binaryState', function (value) {
//                    Light_State_Changed(value, Light_Bridge);
                });

                logger.wemo_info('Lights bridge loaded sucessfully');
            }
            else {
                Light_Bridge = 'Not detected';
                logger.error('Lights bridge NOT loaded sucessfully');
                setTimeout(Wemo_Discover, discovery_delay);
            }
        }
        else {
            Light_Bridge = 'Not detected';
            logger.error('Lights bridge NOT loaded sucessfully');
            setTimeout(Wemo_Discover, discovery_delay);
        }
    });

}


