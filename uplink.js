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

        /* forth -> server */
        forth.stdout.on( "data", function( data ) {
            console.log( data.toString().bold.blue );
            ws.send( "stdout:" + data );
        });

        forth.stderr.on( "data", function( data ) {
            console.log( data.toString().bold.yellow );
            ws.send( "stderr:" + data );
        });

        /* server -> forth */
        ws.on( "message", function( data ) {
            console.log( data.toString().bold.green );
            forth.stdin.write( data );
        });

        forth.on( "close", function( code, signal ) {
            console.log( code );
        });

        ws.on( "close", function() { forth.kill() } );
    });

};
