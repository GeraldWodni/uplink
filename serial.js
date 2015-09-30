#!/usr/bin/env node

var serialport = require("serialport");
var readline = require("readline");

var argv = process.argv.slice(2);

if( argv[0] == "list" ) {
    serialport.list(function (err, ports) {
      ports.forEach(function(port) {
        console.log(port.comName);
      });
    });
}
else if( argv.length == 2 ) {
    function resumeOnError( err, speed, port ) {
        console.error( err );

        setTimeout( function() {
            openSerial( speed, port );
        }, 5000 );

    };

    function runSerial( speed, port ) {
        var sPort = new serialport.SerialPort( port, {
            baudrate: speed,
            parser: serialport.parsers.readline("\n")
        } );
        sPort.on( "open", function( error ) {
            if( error )
                return resumeOnError( "Unable to open port " + port, speed, "ANY" );

            console.error( "Opened port", port, "on", speed, "Baud" );

            sPort.on( "data", function( data ) {
                console.log( data.toString() );
            });

            sPort.on( "error", function( err ) {
                resumeOnError( err, speed, "ANY" );
            });

            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.on( "line", function( line ) {
                sPort.write( line + "\n" );
            });
        });
    };

    function openSerial( speed, port ) {
        if( port == "ANY" )
            serialport.list(function (err, ports) {
                if( !ports.length )
                    resumeOnError( "No serial ports found", speed, port );
                else
                    runSerial( speed, ports[0].comName );
            });
        else
            runSerial( speed, port );
    };

    openSerial( argv[0], argv[1] );
}
else {
    console.error( "usage: ", process.argv[1], " <speed> <port>" );
}

