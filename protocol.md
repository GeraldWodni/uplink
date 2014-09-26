Uplink Protocol
===============

Introduction
------------
Uplink bases on a Websocket connection, see [RFC6455](http://tools.ietf.org/html/rfc6455).
The Websocket protocol supports packaging, so synchronization needs to be programmed explicitly.

Connect
-------
Connection is done to a specific URI, i.e. ws://flink.theforth.net:8000/uplink
Once the connection is established, packets are sent and received by the Server and the Uplink.

Packets
-------
Format: <command>:<data>
Commands are allowed the following characters: a-z, A-Z, 0-9 and minus '-'

Commands
--------
### Uplink (client) commands received from server
#### input:<data>
Interpret data as input, example:
`input:.( hallo world)`
#### other
Commands unknown to the Uplink must be discarded silently.

### Uplink (client) commands sent to server
#### output:<data>
Output data on the Server/Browser end, example:
`output:ok\n` Note: '\n' represents a newline
#### error:<data>
Output data on the Server/Browser end formatted as error, example:
`error:Stack underflow\n` Note: '\n' represents a newline
#### header:<data>
Output data on the Server/Browser end formatted as header, example:
`header:Forth ready\n`
