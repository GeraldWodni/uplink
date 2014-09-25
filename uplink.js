// Uplink Connect to theforth.net by websocket
// (c)copyright 2014 by Gerald Wodni <gerald.wodni@gmail.com>

var child_process = require("child_process");
var WebSocket = require("ws");
require("colors");

module.exports = function( opts ){

    /* connect to theforth.net */
    var websocketHostname = opts.hostname || "flink.theforth.net";
    var forth;
    console.log( ("Connecting to " + websocketHostname + "...").red.bold );
    var ws = new WebSocket( "ws://" + websocketHostname + ":8000/uplink" );
    ws.on( "open", function() {

        var lastInput = "";

        /* spawn forth and connect to websocket */
        var forthName = opts.forth || "gforth";
        forth = child_process.spawn( forthName, opts.args || [] );

	console.log( ( "Start Forth: " + forthName + "..." ).red.bold );
        ws.send( "header:Forth Started\n" );

        /* forth -> server */
        forth.stdout.on( "data", function( data ) {
            var text = data.toString();

            /* keep prefix if not gforth */
            if( opts.keepPrefix == undefined || opts.keepPrefix )
                lastInput = "";
            else
                console.log( "lastInput>", lastInput, "< data>", text, "< index:", text.indexOf( lastInput ) );

            if( text.indexOf( lastInput ) == 0 ) {
                text = text.substring( lastInput.length );
                lastInput = "";
            }

            if( opts.removeVt100 || false ) {
                text = text.replace( String.fromCharCode(27) + "[4h", "" );
                text = text.replace( String.fromCharCode(27) + "[4l", "" );
                text = text.replace( String.fromCharCode(27) + "[2J", "" );
                text = text.replace( String.fromCharCode(27) + "[H", "" );
            }

            console.log( text.bold.blue );
            ws.send( "output:" + text );
        });

        forth.stderr.on( "data", function( data ) {
            console.log( data.toString().bold.yellow );
            ws.send( "error:" + data );
        });

        forth.on( "error", function( err ) {
            console.log( "Forth-Error: ", err );
	});

        /* server -> forth */
        ws.on( "message", function( message ) {
            var text = message.toString();
            var border = text.indexOf( ":" );
            var command;
            var data;
            
            if( border === -1 ) {
                command = data;
                data = "";
            }
            else {
                command = text.substring( 0, border );
                data = text.substring( border + 1 );
            }

            if( command === "input" ) {
                console.log( data.toString().bold.green );
                forth.stdin.write( data );
                lastInput = data.replace( /\n$/g, "" );
            }
            else
                console.log( "Unknown command".bold.red + command + "//" + data );
        });

    });

    ws.on( "close", function() { forth.kill() } );

    ws.on( "error", function( error ) {
        console.error( "Error: ", error );

        if( forth && forth.kill )
            forth.kill();
    });
};
