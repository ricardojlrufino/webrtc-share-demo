const fs = require('fs');
const path = require('path');
const url = require('url');
var httpServer = require('http');

const socketio = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
// require('rtcmulticonnection-server').addSocket(socketio);


function serverHandler(request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        "Access-Control-Allow-Origin": "*"
    });
    response.write('Server is active');
    response.end();
}

var config = {
    "socketURL": "/",
    "dirPath": "",
    "homePage": "/demos/index.html",
    "socketMessageEvent": "RTCMultiConnection-Message",
    "socketCustomEvent": "RTCMultiConnection-Custom-Message",
    "port": "9001",
    "enableLogs": "true",
    "autoRebootServerOnFailure": "false",
    "isUseHTTPs": "false",
    "sslKey": "./fake-keys/privatekey.pem",
    "sslCert": "./fake-keys/certificate.pem",
    "sslCabundle": "",
    "enableAdmin": "false",
    "adminUserName": "username",
    "adminPassword": "password"
};

var httpApp = httpServer.createServer(serverHandler);

httpApp = httpApp.listen(config.port, process.env.IP || "0.0.0.0", function() {
    RTCMultiConnectionServer.afterHttpListen(httpApp, config);
});


const sio = socketio(httpApp,  {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

sio.on('connection', function(socket) {
    
    console.log('Connected');

    RTCMultiConnectionServer.addSocket(socket, config);

    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
        
        console.log(params.socketCustomEvent, message);

        socket.broadcast.emit(params.socketCustomEvent, message);
    });
});