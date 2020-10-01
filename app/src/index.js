import React from 'react';
import ReactDOM from 'react-dom';

import NavHeader from "./ui/NavHeader"
import ConferenceList from "./ui/ConferenceList"
import ConferenceService from "./ConferenceService"

class App extends React.Component{

  state = {
    participants : [
      // { id: '1', name: "You" , presenter: true, online: true},
      // { id: '2', name: "Bob" , presenter: false, online: false},
      // { id: '3', name: "Milla" , presenter: false, online: true}
    ],
    roomID : 'room123',
    connected : false,
    link : ''
  }


  constructor(){
    super();

    this.conferenceService = new ConferenceService({
      'onParticipantUpdate' : (value) => {
        this.onParticipantUpdate(value);
      },
      'onConnectionStateUpdate' : (value) => {
        this.onConnectionStateUpdate(value);
      }
    });

  }

  componentDidMount(){

    // Auto-JOIN from link.
    if(!this.conferenceService.isNewRoom()){
      var roomID = this.conferenceService.getSharedRoom();
      this.state.roomID = roomID; // fast update to method connect.
      this.connect(true);
    }

  }
    
  setParticipants(participants) {
    this.setState({ 'participants': participants });
  }

  newParticipant = (newData) => {
    console.log('Adding new Participan - total: ' + this.state.participants.length);
    this.setParticipants([...this.state.participants, newData]);
  };

  testNewParticipant = (newData) => {
    this.conferenceService._testOnNewConnection(newData.name);
  };

  connect = (join) => {
    if (join) {
      this.conferenceService.joinRoom(this.state.roomID);
    } else {

      const roomID = this.conferenceService.randomID();
      const link = this.conferenceService.generateLink(roomID);

      this.conferenceService.newRoom(roomID, () => {
        alert("Compartilhe a conferência: " + link);
        // TODO: Adicionar um botão para compartilhameto do link...
        this.setState({'link' : link})
      });
    }
  };

  requestShare = () => {
    this.conferenceService.requestShare();
  };

  disconnect = () => {
    this.conferenceService.disconnect();
  };


  // ------------------------------------------------
  // Calbacks from ConferenceService
  // ------------------------------------------------

  onConnectionStateUpdate(isConnected) {
    this.setState({ 'connected' : isConnected});
  }

  // /** On New or update status */
  onParticipantUpdate(participantUpdate) {
    var participants = this.state.participants;

    var found = false;
    participants.forEach((current) => {

      // update 
      if (current.id === participantUpdate.id) {
        found = true;
        current.online = participantUpdate.online;
        current.presenter = participantUpdate.presenter;
        current.name = participantUpdate.name;
      }

    });

    if (found) {
      console.log("onParticipantUpdate update", participantUpdate);
      this.setParticipants(participants);
    } else {
      console.log("onParticipantUpdate new", participantUpdate);
      // participants.push(participantUpdate);
      this.newParticipant(participantUpdate);
    }

  }

  // ------------------------------------------------
  // render()
  // ------------------------------------------------
  
  render(){

    var participants = this.state.participants;
    var roomID = this.state.roomID;

    return(

    <div>
      
      <NavHeader 
          isConnected={this.state.connected} 
          link={this.state.link} 
          onRequestShare={() => this.requestShare()} 
          onDisconnect={() => this.disconnect()} 
        />

      <div id="wrapper" className="toggled">
        
        <ConferenceList list={participants} />

        <div id="page-content-wrapper" className={!this.state.connected ? 'row justify-content-center align-items-center' : ''}>

          <div className={this.state.connected ? 'd-none': ''}>  

            <div className="shadow p-3 mb-5 bg-white rounded">
              <div className="row justify-content-center">
                  <div className="md-12">
                    <button className="btn btn-success" type="button" onClick={() => this.connect(false)}>Iniciar Conferência</button>
                  </div>
              </div>

              <center>
                <p className="text-muted ">-- ou --</p>
              </center>

              <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Room ID" aria-describedby="basic-addon2"
                  value={roomID}
                  onChange={(e) => this.setState({roomID : e.target.value})}
                />
                <div className="input-group-append">
                  <button className="btn btn-outline-success" type="button" onClick={() => this.connect(true)}>Entrar na Conferência</button>
                </div>
              </div>
            </div>
            
          </div>

          <div id="videos-container"></div>

            {/*  <SubmitForm onFormSubmit={this.testNewParticipant} />  */}

        </div>
      </div>
    </div>
  )};
}
  
// ========================================

ReactDOM.render(
  <App />,
  document.body.appendChild(document.createElement("DIV"))
);
