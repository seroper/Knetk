/* Settings for Simon's websocketed home automation project */

// html classes and ids can't have spaces.  to define multiple classes use a space.
var Socket = io();
var Settings;

$(document).ready(function()
{
	console.log("starting house.js");

	// Loads data from the server to dynamically populate the page.
	Socket.emit('settings_get');
});

