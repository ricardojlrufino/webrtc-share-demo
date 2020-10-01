const fs = require('fs');
const path = require('path');
const url = require('url');
var httpServer = require('http');
    var httpstatic = require('node-static');

const socketio = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
// require('rtcmulticonnection-server').addSocket(socketio);


//
// Create a node-static server instance to serve the './public' folder
//
var fileserver = new httpstatic.Server('./public');

function serverHandler(request, response) {
    request.addListener('end', function () {
        fileserver.serve(request, response);
    }).resume();
}

var config = {
    "socketURL": "/",
    "dirPath": "",
    "homePage": "/public/index.html",
    "port": "9001",
    "socketMessageEvent": "RTCMultiConnection-Message",
    "socketCustomEvent": "RTCMultiConnection-Custom-Message",
    "enableLogs": "true",
    "autoRebootServerOnFailure": "false",
    "isUseHTTPs": "false",
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