
const RTCMultiConnection = window.RTCMultiConnection;
const DetectRTC = window.DetectRTC;

// const SERVER_URL = "http://localhost:9001/";
// const SERVER_URL = window.location.protocol +"//"+window.location.hostname+":9001/";
const SERVER_URL = "https://a63915b2bc5c.ngrok.io/";
const WIDGET_ID = "videos-container";
const BRODCAT_EVENT = "RTCMultiConnection-Custom-Message";


const EVENTS = {
    REQUEST_SHARE : "REQUEST_SHARE",
    REQUEST_SHARE_RESPONSE : "REQUEST_SHARE_RESPONSE",
    UPDATE_PARTICIPANT: "UPDATE_PARTICIPANT",
    REJOIN : "REJOIN"
}

/**
 * Interface with server with allow WebRTC signaling
 * 
 * @author Ricardo JL Rufino
 */
export default class ConferenceService {

    constructor({onParticipantUpdate, onConnectionStateUpdate}) {

        var connection = new RTCMultiConnection(); // RTCMultiConnection.js
        this.connection = connection;
        this.onParticipantUpdate = onParticipantUpdate;
        this.onConnectionStateUpdate = onConnectionStateUpdate;
        this.listeners = {};
        this.presenter = false;
        this.userid = null;

        // connection.socketURL = '/';
        connection.socketURL = SERVER_URL
        
        connection.socketMessageEvent = 'screen-sharing-demo';
        
        connection.session = {
            screen: true,
            oneway: true
        };
        
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };
        
        // ref: https://www.rtcmulticonnection.org/docs/iceServers/
        connection.iceServers = [{
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        }];

        this._setupEvents();
    }


    newRoom(roomID, onConnected) {

        if (!roomID || roomID.length === 0){
            alert("Informe o nome da sala !");
            return;
        }

        console.log("newRoom ", roomID);

        var connection = this.connection;

        connection.videosContainer = document.getElementById(WIDGET_ID);

        // add Extra data
        connection.extra = {
            'name' : 'Apresenador',
            'presenter' : true,
            'roomID' : roomID
        };

        const self = this;

        // self._testOnNewConnection("TEST ANTES");

        this.connection.open(roomID, function(isRoomOpened) {
            console.log('Sessao Iniciada: ' + connection.sessionid);
            
            if(isRoomOpened){
                if(onConnected) onConnected();
            } else{
                alert('Falha ao inciar a sessão');
            }

            self.onConnectionStateUpdate(isRoomOpened);
            self._updateMyState(connection.userid, true);
            self.presenter = true;
            self.userid = connection.userid;
            self._afterConnect.call(self);
        });
    }

    joinRoom(roomID){

        if (!roomID || roomID.length === 0){
            alert("Informe o nome da sala !");
            return;
        }

        console.log("joinRoom ", roomID);

        var connection = this.connection;

        connection.isInitiator = false; // FIX: is not updated  

        const self = this;

        connection.videosContainer = document.getElementById(WIDGET_ID);

        // add Extra data
        connection.extra = {
            'name' : 'Ouvinte',
            'presenter' : false,
            'roomID' : roomID
        };

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: true
        };
        
        connection.join(roomID, function(isRoomJoined){

            self.onConnectionStateUpdate(isRoomJoined);

            if(!isRoomJoined){
                alert("Não foi possivel acessar a Conferencia, verifique se ela foi criada");
            }else{
                self.presenter = false;
                self.userid = connection.userid;

                self._afterConnect.call(self);

                // Received only by Listeners
                self._registerListener(EVENTS.UPDATE_PARTICIPANT, function(participant) {
                    // this has changed scope in notifyListener
                    this.onParticipantUpdate(participant);
                });

            }
        });

    }

    /** Check parametrs in URL to se if is a share link */
    isNewRoom(){
        const urlParams = new URLSearchParams(window.location.search);
        return !urlParams.has('r');
    }

    getSharedRoom(){
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('r');
    }

    requestShare(){

        if(! this.connection.isInitiator){
            
            var self = this;

            debugger;

            var participant = {
                'id' : self.userid,
                'name' : self.connection.extra.name
            };

            console.log('Requesting to share as', participant.id);

            this._broadcast.call(this, EVENTS.REQUEST_SHARE, participant);

        }else{

            alert('Você já é o Apresentador !');

        }

    }

    disconnect(){

        this.connection.close();

        try {
            this.connection.stream.stop();
        } catch (error) {
            console.error(error);
        }

    }

    // TODO: REMOER...
    _updateMyState(id, presenter){
        var participant = {
            id : id,
            name : 'Você',
            presenter: presenter,
            online : true
        };
        this.onParticipantUpdate(participant);
    }

    _afterConnect(){

        var self = this;

        debugger;

        this.userid = this.connection.userid;

        console.log("Connected as ", this.userid);

        // Listener for brodcast events and fire correspondent "APP-EVENT"
        this.connection.socket.on(BRODCAT_EVENT, function(eventData) {
            console.info('<< [Received] ' + eventData['event']);
            self._notifyListener.call(self, eventData['event'], eventData['data']);
        });
        

    }

    _broadcast(eventName, data){

        var eventData = {
            'event' : eventName,
            'data' : data
        }

        console.info('>> [Broadcast] ' + eventName, data);

        this.connection.getSocket(function(socket){
            socket.emit(BRODCAT_EVENT, eventData);
        });

    }

    _notifyListener(eventName, data){

        if(this.listeners[eventName]){
            var callback = this.listeners[eventName];
            callback.call(this, data);
        };
    }

    _registerListener(eventName, listener){

        this.listeners[eventName] = listener;
        
    }

    randomID() {
        return this.connection.token();
    }

    generateLink(roomID) {
        return window.location.origin + "/?r="+roomID;
    }

    /**
     * Confgure events fired by RTCMultiConnection
     */
    _setupEvents(){

        var connection = this.connection;

        window.appRtcConnection = connection; // Only for debugging
        window.appConference = this;

        const self = this;


        // Ask to ADMIN to allow other share-screem
        this._registerListener(EVENTS.REQUEST_SHARE, function(participant){

            if(connection.isInitiator){

                debugger;

                console.log('Received request from: ', participant.id);

                var shareResponse = {
                    "participant" : participant,
                    "approved" : false
                }

                if (window.confirm("O participante " + participant.name + ", está pedido para compartilhar. Aceitar ?")) {
                    shareResponse.approved = true;

                } 

                this._broadcast(EVENTS.REQUEST_SHARE_RESPONSE, shareResponse);

                // now stop share, and disconnect alll
                if(shareResponse.approved){
                    this.connection.disconnect();
                    this.connection.stream.stop(); //FIX;: close screen-share
                }
            }

        });

        // Admin response of REQUEST
        this._registerListener(EVENTS.REQUEST_SHARE_RESPONSE, function(shareResponse){

            console.log('REQUEST_SHARE_RESPONSE: ', shareResponse);

            if (shareResponse.approved) {

                debugger;

                // Disconnect from current session
                // this.connection.disconnect();

                // user with request the share permission
                if (this.userid === shareResponse.participant.id) {

                    var self = this;

                    var roomID = this.connection.extra['roomID'] +"."+ this.connection.token(); // new room for connection

                    this.newRoom(roomID, function(connection){
                        
                        console.log('Completed request to new Share, notify others....');

                        var rejoinRequest = {
                            "roomID": roomID,
                            "participant": shareResponse.participant
                        }
    
                        self._broadcast.call(self, EVENTS.REJOIN, rejoinRequest);

                    });


                    // setTimeout(() => {
                    // }, 1000);

                } else {

                    // Wait for rejoin

                }


            }else{

                // user with request the share permission
                if(this.userid === shareResponse.participant.id){
                    alert('O Apresentador não aprovou sua solicitação');
                }

            }

        });


        this._registerListener(EVENTS.REJOIN, function(rejoinRequest){

            console.log("REJOIN on new room", rejoinRequest);

            this.joinRoom(rejoinRequest.roomID);

        });

        // event: userid, status, extra
        // Received only by Presenter 
        connection.onUserStatusChanged = function(event){
            console.log('onUserStatusChanged', event);

            var participant = {
                id : event.userid,
                name : event.extra.name,
                presenter: event.extra.presenter,
                online : (event.status === 'online' ? true : false)
            };

            self.onParticipantUpdate(participant);

            //  connection.socket.emit('extra-data-updated', connection.extra);

            // Notify listeners
            if(self.presenter){
                console.log('Notify listeners');
                self._broadcast.call(self, EVENTS.UPDATE_PARTICIPANT, participant);
            }
        }

        connection.onstream = function(event) {
            
            console.log('onstream : ', event);

            // FIX: Allow close screenshare by code.
            connection.stream = event.stream;

            var existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
              existing.parentNode.removeChild(existing);
            }
        
            event.mediaElement.removeAttribute('src');
            event.mediaElement.removeAttribute('srcObject');
            event.mediaElement.muted = true;
            event.mediaElement.volume = 0;
        
            var video = document.createElement('video');
        
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }
        
            if(event.type === 'local') {
              video.volume = 0;
              try {
                  video.setAttributeNode(document.createAttribute('muted'));
              } catch (e) {
                  video.setAttribute('muted', true);
              }
            }
            video.srcObject = event.stream;
        
            var width =  window.innerWidth - 80;
            var mediaElement = window.getHTMLMediaElement(video, {
                title: event.userid,
                buttons: ['full-screen'],
                width: width,
                showOnMouseEnter: false
            });
        
            connection.videosContainer.appendChild(mediaElement);
        
            setTimeout(function() {
                mediaElement.media.play();
            }, 5000);
        
            mediaElement.id = event.streamid;
        };
        
        connection.onstreamended = function(event) {

            console.log('onstream ended : ', event);

            self.onConnectionStateUpdate(false);

            var mediaElement = document.getElementById(event.streamid);
            if (mediaElement) {
                mediaElement.parentNode.removeChild(mediaElement);
        
                if(event.userid === connection.sessionid && !connection.isInitiator) {
                  alert('Broadcast is ended. We will reload this page to clear the cache.');
                  window.location.reload();
                }
            }
        };
        
        connection.onMediaError = function(e) {
            if (e.message === 'Concurrent mic process limit.') {
                if (DetectRTC.audioInputDevices.length <= 1) {
                    alert('Please select external microphone. Check github issue number 483.');
                    return;
                }
        
                var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
                connection.mediaConstraints.audio = {
                    deviceId: secondaryMic
                };
        
                connection.join(connection.sessionid);
            }
        };

    }

}

