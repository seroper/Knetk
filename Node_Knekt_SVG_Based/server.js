// html buttons designed here: http://onlinehtmltools.com/button-genaretor/#sthash.aClLiKdg.dpbs
// Use this validator: http://jsonlint.com/

var winston = require('winston');

var log_levels = {
    levels: {
        'error': 6,
        'server_debug': 5,
        'arduino_debug': 4,
        'brower_info': 3,
        'arduino_info': 2,
        'server_info': 1,
        'info': 0
    },
    colors: {
        'error': 'red',
        'server_debug': 'red',
        'arduino_debug': 'grey',
        'brower_info': 'green',
        'arduino_info': 'blue',
        'server_info': 'yellow',
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
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.setLevels(log_levels.levels);
winston.addColors(log_levels.colors);

logger.error("logger testing error level");
logger.server_debug("logger testing server_debug level");
logger.arduino_debug("logger testing arduino_debug level");
logger.brower_info("logger testing brower_info level");
logger.arduino_info("logger testing arduino_info level");
logger.server_info("logger testing server_info level");
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
// Keep power and Rooms separate, needed so can have a for loop search of room's power and access the rest via current room ids.
// Server needs to keeps both in synch.
// When a value changes, from a browser request or feedback from devices, do "io.sockets.emit("settings_reply", Settings);" at the server to push the update to the pages!
// Pages don't get status on periodic request, pushed only.'
var Settings = require('./Settings.json');

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

    if (Count % 2)
        Settings.rooms.bathroom.power = "off";
    else
        Settings.rooms.bathroom.power = "standby";
    Count++;

    // When a value changes, from a browser request or feedback from devices, do "io.sockets.emit("settings_reply", Settings);" at the server to push the update to the pages!
    // Pages don't get status on periodic request, pushed only.'
    io.sockets.emit("settings_reply", Settings);
}

setInterval(Test, 1500);