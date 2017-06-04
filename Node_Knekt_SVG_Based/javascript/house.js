/* Settings for Simon's websocketed home automation project */

// html classes and ids can't have spaces.  to define multiple classes use a space.
var Socket = io();
var Settings;
var Current_Room_ID = -1;
//var event;
//var attendQuery;  
var Room_Count;
var Init_Done;
// Y move 115 moved down 2 levels
// Y move 57 moves down 1 level
// X move right 1/2 position is 50
// X move right 1 whole position is 90
var Room_Button_Positions = [
    /* 1 */ [ 90, 115],
    /* 2 */ [ 50, 115,  50, 115],
    /* 3 */ [  0, 115,   0, 115,   0, 115],
    /* 4 */ [  0,  57,   0,  57,   0,  57, 90,  57],
    /* 5 */ [  0,  57,   0,  57,   0,  57, 50,  57,  50,  57],
    /* 6 */ [  0,  57,   0,  57,   0,  57,  0,  57,   0,  57,    0,  57],
    /* 7 */ [  0,  57,   0,  57,   0,  57,  0,  57,   0,  57,    0,  57,  90,  57],
    /* 8 */ [  0,  57,   0,  57,   0,  57,  0,  57,   0,  57,    0,  57,  50,  57,  50,  57],
    /* 9 */ [  0,  57,   0,  57,   0,  57,  0,  57,   0,  57,    0,  57,   0,  57,   0,  57,   0,  57],
    /*10 */[   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  90,   0],
    /*11 */[   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  50,   0,  50,  0],
    /*12 */[   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  90,   0,  0,   0,    0,  0]
    /*        x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4,  x5,  y5,  x6,  y6,  x7,  y7,  x8,  y8,  x9,  y9, x10, y10, x11, y11, x12, y12 */
];



$(document).ready(function()
{
	console.log("starting house.js");

    $("#everything").hide();

	// Loads data from the server to dynamically populate the page.
	Socket.emit('settings_get');

    var s = Snap("#remote");
    Snap.load("images/remote_v2_step_1.svg", function (f) {

        var room = f.select('#group_room_1');
        room.click(click_room);

        room = f.select('#group_room_2');
        room.click(click_room);

        room = f.select('#group_room_3');
        room.click(click_room);

        room = f.select('#group_room_4');
        room.click(click_room);

        room = f.select('#group_room_5');
        room.click(click_room);

        room = f.select('#group_room_6');
        room.click(click_room);

        room = f.select('#group_room_7');
        room.click(click_room);

        room = f.select('#group_room_8');
        room.click(click_room);

        room = f.select('#group_room_9');
        room.click(click_room);

        room = f.select('#group_room_10');
        room.click(click_room);

        room = f.select('#group_room_11');
        room.click(click_room);

        room = f.select('#group_room_12');
        room.click(click_room);

        var source = f.select('#group_source_1');
        source.click(click_source);

        source = f.select('#group_source_2');
        source.click(click_source);

        source = f.select('#group_source_3');
        source.click(click_source);

        source = f.select('#group_source_4');
        source.click(click_source);

        source = f.select('#group_source_5');
        source.click(click_source);

        source = f.select('#group_source_6');
        source.click(click_source);

        source = f.select('#group_source_7');
        source.click(click_source);

        var volume = f.select('#group_volume_up');
        volume.click(click_volume_up);

        volume = f.select('#group_volume_down');
        volume.click(click_volume_down);

     //   volume = f.select('#group_volume_mute');
     //   volume.click(click_volume_mute);

        s.append(f);
       
    });

    Init_Done = false;
});

// Tell server we're still connected and running.  If no clients and no amps on system will power off.
// Removed for testing tosimplify testing.
/*
setInterval(function () {
    console.log("send ping");	
    Socket.emit("ping");
}, 2000);

var show = true;
Socket.on('pong', function () {
    var pause = Snap.select("#pause");

    console.log("Got pong replay");
    if (show == true) {
        pause.attr('display', '');
        show = false;
    }
    else {
        pause.attr('display', 'none');
        show = true;
    }
});
*/

Socket.on('settings_reply', function (data) {
  
    console.log("Got new settings reply from server.");

    Settings = data;

    if (Init_Done == false) {

        // First set the room buttons up depending on the data.
        Room_Count = 0;
        $.each(Settings.rooms, function (i, item) {
            Room_Count++;
        });
        console.log("Got " + Room_Count + " number of rooms");
        
        // Hide the rooms not in the settings
        for (var n = Room_Count + 1; n <= 12; n++) {
            var name = "#group_room_" + n;
            var r = Snap.select(name);
            r.attr('display', 'none');
        }


        var pairs = Room_Button_Positions[Room_Count - 1];
        n = 0;
        jQuery.each(Settings.rooms, function () {
            // Move the buttons to the correct location
            var name = "#group_room_" + (n + 1);
            var r = Snap.select(name);
            var move = 't' + pairs[2 * n] + ', ' + pairs[2 * n + 1];
            console.log("moving room " + name + " to positon " + move);
            r.transform(move);

            var name = "#text_room_" + (n + 1);
            var r = Snap.select(name);
            console.log("Room's name is " + this.name);
            r.attr({ text: this.name });
            n++;
        });

        $("#everything").show();

        Init_Done = true;
        //setInterval(Update_From_Settings, 100);
    }
    else
    {
        // Update power etc. Power of source could be set by another client, so update to settings to stay in synch.
        Populate_Rooms();
        // Update current room's volume and mute if current room is set.  	
        //Set_Volume();
        //Set_Mute();
        //Set_Source();
    }
});


function click_room() {
    var number = this.attr('id');
    index = number.lastIndexOf("_");
    number = number.substring(index + 1);

    console.log("got click room ID:" + this.attr('id') + " number " + number);
    //alert("Clicked room number " + number);

    var name = "#text_room_" + number;
    var r = Snap.select(name);
        
    if (number-1 != Current_Room_ID) {
            //alert("Current room changed");
            console.log("Current room changed");
            Current_Room_ID = number - 1;

        // Now room change is registered, update the page to match.
            //Set_Volume();
            //Set_Mute();
            //Set_Source();
    }
    else
        alert("setting current room - shouldn't have got here!");
}

function click_source()
{
    var number = this.attr('id');
    index = number.lastIndexOf("_");
    number = number.substring(index + 1);

    console.log("got click source ID:" + this.attr('id') + " number " + number);
    alert("Clicked source number " + number);
}

function click_volume_up() {
    console.log("got click volume up " + this.attr('id'));
    alert("Clicked volume up " + this.attr('id'));
}

function click_volume_down() {
    console.log("got click volume down " + this.attr('id'));
    alert("Clicked volume down " + this.attr('id'));
}

function click_volume_mute() {
    console.log("got click volume mute " + this.attr('id'));
    alert("Clicked volume mute " + this.attr('id'));
}
/*
// Call when Current_Room_ID is set.
function Set_Volume() {
    if (Settings.rooms[Current_Room_ID].volume_current == -1) {
        $('#volume').text("unknown");
    }
    else {
        $('#volume').text(Settings.rooms[Current_Room_ID].volume_current);
    }
}

// Call when Current_Room_ID is set.
function Set_Mute() {
    var m = Settings.rooms[Current_Room_ID].mute;

    $('#mute').prop('checked', m);
}

// Call when Current_Room_ID is set.
function Set_Source() {
    var source = "";

    if (Settings.rooms[Current_Room_ID].source_current == "") {
        source = Settings.rooms[Current_Room_ID].source_startup;
    }
    else {
        source = Settings.rooms[Current_Room_ID].source_current;
    }

    if (source !== $('#select_source option:selected').val()) {
        // Set selected source
        $('#select_radio_preset').val(source).change();
        Show_Source_Controls(source);
        console.log("Source set - updated page to match server settings.");
    }
}

function Room_Button(id) {
    var room_name = $('#' + id).val();

    console.log("Room " + id + " button clicked");

    // Unselect the current room first
    if (Current_Room_ID !== "") {
        $('#' + Current_Room_ID).removeClass('room_button_current');
    }

    if (Current_Room_ID != id) {
        Current_Room_ID = id;
        $('#' + Current_Room_ID).addClass('room_button_current');

        Music_On_Changed($('#music_on').prop('checked'));   // Call music on changed with the state of the tickbox
    }
}

function Music_On_Changed(state) {
    console.log("Music on or room changed current state: " + state + ". Current room: " + Current_Room_ID);

    Settings.music_on = state;

    if (Current_Room_ID != "") {
        if ((state === true) && (Settings.rooms[Current_Room_ID].power === "off")) {

            var dt = new Date();
            var h = dt.getHours().toString();
            if (h.length == 1) {
                h = "0" + h;
            }
            var m = dt.getMinutes().toString();
            if (m.length == 1) {
                m = "0" + m;
            }
            var s = dt.getSeconds().toString();
            if (s.length == 1) {
                s = "0" + s;
            }
            var time = h + ":" + m + ":" + s;

            alert("The amplifier is off.  Please turn it on now. " + time);

            setTimeout(Music_On_Timeout, 5000);
            $('#volume_form :input').prop("disabled", true);
            $('#select_source_form :input').prop("disabled", true);
            $('.source_control').hide();
        }
        if (state === true) {
            var data = { "name": Current_Room_ID, "music_on": state };
            console.log("Music on changed sent: " + JSON.stringify(data));
            Socket.emit("music_on_changed", data);

            Set_Volume();
            $('#volume_form :input').prop("disabled", false);
            Set_Source();
            $('#select_source_form :input').prop("disabled", false);
            $('.source_control').show();
        }
        else {
            $('#volume_form :input').prop("disabled", true);
            $('#select_source_form :input').prop("disabled", true);
            $('.source_control').hide();
        }
    }
}

function Music_On_Timeout() {
    console.log("Music on timeout occurred");
    if (($('#music_on').prop('checked') === true) && (Settings.rooms[Current_Room_ID].power === "off")) {
        var dt = new Date();
        var h = dt.getHours().toString();
        if (h.length == 1) {
            h = "0" + h;
        }
        var m = dt.getMinutes().toString();
        if (m.length == 1) {
            m = "0" + m;
        }
        var s = dt.getSeconds().toString();
        if (s.length == 1) {
            s = "0" + s;
        }
        var time = h + ":" + m + ":" + s;

        alert("The amplifier is still off.  Please turn it on now." + time);
        setTimeout(Music_On_Timeout, 5000);
    }
}

function Send_Data_Volume() {
    var button_id = this.id;
    var vol, increment, max, min;
    var room_id;
    var parameter_value;

    if (Settings.rooms[Current_Room_ID].volume_current != -1) {
        increment = Settings.rooms[Current_Room_ID].volume_increment;
        max = Settings.rooms[Current_Room_ID].volume_maximum;
        min = Settings.rooms[Current_Room_ID].volume_minimum;

        if (button_id == 'volume_up') {
            vol = parseFloat($('#volume')[0].innerHTML) + increment;
        }
        else if (button_id === 'volume_down') {
            vol = parseFloat($('#volume')[0].innerHTML) - increment;
        }

        if (vol > max) {
            vol = max;
        }
        else if (vol < min) {
            vol = min;
        }
        $('#volume').html(vol);
        Settings.rooms[Current_Room_ID].volume_current = vol;
        console.log("volume changed to " + vol);

        data = { "name": Current_Room_ID, "volume": vol };
        console.log(JSON.stringify(data));
        Socket.emit("volume", data);
    }
}

function Mute_Changed(id, state) {
    console.log("Mute changed: id: " + id + " current state: " + state);

    Settings.rooms[Current_Room_ID].mute = state;
    var data = { "name": Current_Room_ID, "mute": state };
    console.log("Mute changed sent: " + JSON.stringify(data));
    Socket.emit("mute", data);
}

function Source_Changed() {
    var source = $('#select_source option:selected').val();

    //Show_Source_Controls(current_source);

    // This will be updated by the server, but do it here also so preset selection can work
    Settings.rooms[Current_Room_ID].source_current = source;
    var data = { "name": Current_Room_ID, "source": source };
    console.log("Source changed sent: " + JSON.stringify(data));
    Socket.emit("source_changed", data);
}
*/
function Populate_Rooms() {
    //var text = '';
    var n = 0;
    //var total = 0;

    $.each(Settings.rooms, function (id, room) {
        var name = "#button_room_" + (n + 1);
        var r = Snap.select(name);

        if (room.power === "on") {
            r.attr('fill', 'green');
        }
        else if (room.power === "off") {
            r.attr('fill', 'red');
        }
        else if (room.power === "standby") {
            r.attr('fill', 'yellow');
        }
        else {
            console.log("Error: room power not recognised");
        }

        if (n == Current_Room_ID)
        {
            r.attr('stroke', 'blue');
            r.attr('strokeWidth', 7); 
        }
        else
        {
            r.attr('stroke', 'black');
            r.attr('strokeWidth', 5);
        }

        n++;
    });

//    $('#volume_form :input').prop("disabled", true);
//    $('#select_source_form :input').prop("disabled", true);
//    $('.source_control').hide();
}
/*
function Populate_Sources() {
    var options = "";
    var current_source = "";
    var selected_id;

    if (Current_Room_ID !== "") {
        current_source = Settings.rooms[Current_Room_ID].source_current;
        if (jQuery.isEmptyObject(Settings.rooms[Current_Room_ID].local_sources) === false) {
            $.each(Settings.rooms[Current_Room_ID].local_sources, function (id, source) {
                if (source.enabled === true) {
                    if (current_source === id) {
                        options += '<option value=\"' + id + '\" selected>' + source.name + '</option>';
                        selected_id = id;
                    }
                    else {
                        options += '<option value=\"' + id + '\">' + source.name + '</option>';
                    }
                }
            });
        }
    }
    $.each(Settings.sources, function (id, source) {
        if (source.enabled === true) {
            // Catch for no current room selected, use the first element in the list.
            if (current_source === "") {
                current_source = id;
            }

            if (current_source === id) {
                options += '<option value=\"' + id + '\" selected>' + source.name + '</option>';
                selected_id = id;
            }
            else {
                options += '<option value=\"' + id + '\">' + source.name + '</option>';
            }
        }
    });
    $('#select_source').html(options);

    // Now radio presents:
    options = "";
    $.each(Settings.radio_presets, function (id, preset) {
        options += '<option value=\"' + id + '\">' + preset.name + '</option>';
    });
    $('#select_radio_preset').html(options);

    console.log("source controls are enabled");
    //Show_Source_Controls(selected_id);
}

function Show_Source_Controls(current_source) {

    //	source isn't updated to previous when the room is toggled.
    var source_type = "";

    if (Current_Room_ID !== "") {
        if (jQuery.isEmptyObject(Settings.rooms[Current_Room_ID].local_sources) === false) {
            $.each(Settings.rooms[Current_Room_ID].local_sources, function (id, source) {
                if (id === current_source) {
                    source_type = source.type;
                }
            });
        }
    }
    $.each(Settings.sources, function (id, source) {
        if (id === current_source) {
            source_type = source.type;
        }
    });

    console.log("Current Room: " + Current_Room_ID + " argument current_source: " + current_source + " source type selected: " + source_type);
    // Now show the needed controls
    switch (source_type) {
        case "radio":
            {
                console.log("current soure is type " + source_type);
                Radio_Preset_Update(current_source);
                $('#control_tv_form').hide();
                $('#control_squeezebox_form').hide();
                $('#control_radio_form').show();
                break;
            }
        case "tv":
            {
                console.log("current soure is type " + source_type);
                $('#control_radio_form').hide();
                $('#control_squeezebox_form').hide();
                $('#control_tv_form').show();
                break;
            }
        case "squeezebox":
            {
                console.log("current soure is type " + source_type);
                $('#control_radio_form').hide();
                $('#control_tv_form').hide();
                $('#control_squeezebox_form').show();
                break;
            }
        case "phone":
            {
                console.log("current soure is type " + source_type);
                $('#control_radio_form').hide();
                $('#control_tv_form').hide();
                $('#control_squeezebox_form').hide();
                $('#control_phone_form').show();
                break;
            }
        default:
            {
                console.log("Source type not recognised");
                //		alert("Source type not recognised");
            }
    }
}

function Radio_Preset_Update(current_source) {
    var preset = Settings.sources[current_source].current_preset;
    console.log("update current radio preset: " + preset);

    //this doesn't work - not restored when select the other radio instance, or Settings isn't correct- not checked.
    //got the current preset, now set it - but how?
    //$('#select_radio_preset option:selected').val(preset).change();
    $('#select_radio_preset').val(preset).change();
}

function Radio_Preset_Changed() {
    var preset = $('#select_radio_preset option:selected').val();
    var current_source = $('#select_source option:selected').val();
    var freq = Settings.radio_presets[preset].frequency;
    var data = '';

    // This will get called if switching between radios, so check if it's really changed before sending
    if (Settings.sources[current_source].current_preset !== preset) {
        Settings.sources[current_source].current_preset = preset;
        console.log("Radio preset changed. source:" + current_source + " preset:" + preset + " frequency:" + freq);

        data = { "source": current_source, "preset": preset, "frequency": freq };
        console.log(JSON.stringify(data));

        Socket.emit("radio_preset", data);
    }
}
*/
//need a function to get current soure from Settings, knekt and local.  Did consider using another global but that's a repeat of data so not ideal.
