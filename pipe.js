// Uplink Connect to theforth.net by websocket
// (c)copyright 2014 by Gerald Wodni <gerald.wodni@gmail.com>

var child_process = require("child_process");
require("colors");

var forth = child_process.spawn( "sf", ["fake-terminal.fs"] );

forth.on( "exit", function( code ) {
    console.log( "Forth has exited ", code );
    process.exit( code );
});

forth.stdout.on( "data", function( data ) {
    console.log( "out>" + data + "<" );
});

forth.stderr.on( "data", function( data ) {
    console.log( "err>" + data + "<" ); }
);

process.stdin.on( "data", function( data ) {
    console.log( "in>" + data + "<" );
    forth.stdin.write( data );
});

