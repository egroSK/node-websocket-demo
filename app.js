/**
 * Node.js Websocket-Server Demo
 *
 * Ukážková real-time webová aplikácia pre bakalársku prácu s témou Real-time webové aplikácie.
 *
 * Aplikácia znázorňuje vytvorenie Node.js WebSocket servera v súlade s RFC 6455 bez použitia knižnice.
 *
 * Jedná sa o veľmi zjednodušenú ukážku, znázorňujúcu odchytenie upgrade eventu v Node.js,
 * priebeh handshakingu klienta so serverom, prijatie dát od klienta a odoslanie dát klientovi.
 *
 * Pozn. Dĺžka odosielaných dát zo serveru je obmedzená na 125 znakov.
 *
 * Aplikácia bola testovaná iba v prehliadači Chrome 18, v ostatných verziách a prehliadačoch 
 * nemusí fungovať korektne alebo vôbec!
 *
 * @author Matej Paulech <matej.paulech@gmail.com>
 */

// Načítanie závislostí (modulov)

var http = require('http');
var fs = require('fs');
var crypto = require('crypto');

/** @type {Array.<string>} Pole zdrojových stránok, z ktorých je akceptované WebSocket spojenie */
var acceptable_origins = [
	'http://localhost:3000'
];

// Vytvorenie HTTP serveru a obsluha HTTP požiadaviek
var server = http.createServer(function (req, res) {
	// Obsluha GET / požiadavky
	if (req.url === '/') {
		fs.readFile('index.html', function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('500 Server Error');
			}

			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(data);
		});
	} else {
		res.writeHead(404)
		res.end('404 Not Found');
	}
}).listen(3000, function () {
	console.log('Server is listening on: ' + this.address().address  + ':' + this.address().port);
});

// Obsluha zmeny na WS protokol
server.on('upgrade', function (req, socket, head) {
	// Overenie, či sa jedná o upgrade na WS protokol a či je origin zo zoznamu povolených
	if (req.headers['upgrade'] && req.headers['upgrade'].toLowerCase() === 'websocket' && 
		req.headers['connection'] && req.headers['connection'].toLowerCase() === 'upgrade' && 
		req.headers['origin'] && acceptable_origins.indexOf(req.headers['origin']) !== -1) {
	
		// Vytvorenie Handshake kľúča
		var client_key = req.headers['sec-websocket-key'];
		var shasum = crypto.createHash('sha1');
		shasum.update(client_key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
		var result_key = shasum.digest('base64');

		// Odoslanie hlavičiek, po ich prijatí klientom dôjde k zmene protokolu na WS
		socket.write(
			'HTTP/1.1 101 Switching Protocol\r\n' +
			'Upgrade: websocket\r\n' +
			'Connection: Upgrade\r\n' + 
			'Sec-WebSocket-Accept: ' + result_key + '\r\n\r\n' 
		);

		// Ondata listener vyvolaný pri príchode dát zo serveru
		socket.ondata = function(src, start, end) {
			// Odmaskuje prijaté dáta do čitatelného textového reťazca (source: http://stackoverflow.com/a/8559351)
			src = src.slice(start,end);
			var maskKeys = [src[2],src[3],src[4],src[5]];
			var dest = new Array();
			for (var i = 0; i < src.length-6; i++) {
				var mKey = maskKeys[i%4];
				dest[i] = mKey ^ src[6+i];
			}
			var data = new Buffer(dest).toString();

			// Skrátenie dát ak presahujú povolenú dĺžku
			if (data.length > 119) {
				data = data.substr(0, 116) + '...';
			}

			// Odošle prijaté dáta späť klientovi, funguje iba pre textové reťazce kratšie ako 125 znakov (Zdroj: https://github.com/LearnBoost/socket.io/blob/master/lib/transports/websocket/hybi-16.js)
			var dataBuffer = new Buffer('echo: ' + data);
			var dataLength = dataBuffer.length;
			var outputBuffer = new Buffer(dataLength + 2);
			outputBuffer[0] = 0x81;
			outputBuffer[1] = dataLength;
			dataBuffer.copy(outputBuffer, 2);
			socket.write(outputBuffer, 'binary');
		}
	} else {
		console.log('fail');
		socket.write('HTTP/1.1 500 WebSocket Protocol Version Not Supported\r\n\r\n')
	}
});