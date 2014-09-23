// Uplink Connect to theforth.net by websocket
// (c)copyright 2014 by Gerald Wodni <gerald.wodni@gmail.com>

var child_process = require("child_process");
var WebSocket = require("ws");
require("colors");

module.exports = function( forthName ){
    console.log( "hi there ;)".red.bold );

    /* connect to theforth.net */
    var ws = new WebSocket( "ws://localhost.theforth.net:3000/uplink" );
    ws.on( "open", function() {

        /* spawn forth and connect to websocket */
        var forth = child_process.spawn( forthName || "gforth" );
        var lastInput = "";

        /* forth -> server */
        forth.stdout.on( "data", function( data ) {
            var text = data.toString();
            console.log( "lastInput", lastInput, "data:", text, "index:", text.indexOf( lastInput ) );
            if( text.indexOf( lastInput ) == 0 ) {
                data = text.substring( lastInput.length );
                lastInput = "";
            }

            console.log( data.toString().bold.blue );
            ws.send( "output:" + data );
        });

        forth.stderr.on( "data", function( data ) {
            console.log( data.toString().bold.yellow );
            ws.send( "error:" + data );
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

        ws.on( "close", function() { forth.kill() } );
    });

};
