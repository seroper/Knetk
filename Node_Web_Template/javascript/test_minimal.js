
//var Socket = io();
var Settings;

$(document).ready(function()
{
	console.log("starting test_minimal.js");
});


// Tell server we're still connected and running.  If no clients and no amps on system will power off.
setInterval(function () {
  //  Socket.emit("ping");
}, 2000);

//Socket.on('pong', function () {
    console.log("Got pong replay");	
