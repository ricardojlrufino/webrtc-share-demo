import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import NavHeader from "./ui/NavHeader"
import ConferenceList from "./ui/ConferenceList"

import ConferenceService from "./ConferenceService"


  class SubmitForm extends React.Component {
    state = { term: '' };
  
    handleSubmit = (e) => {
      e.preventDefault();
      if(this.state.term === '') return;

      var participant = {
        id : this.state.term,
        name : this.state.term,
        presenter: false,
        online : true
    };

      this.props.onFormSubmit(participant);
      this.setState({ term: '' });
    }
  
    render() {
      return(
        <form onSubmit={this.handleSubmit}>
          <input 
            type='text'
            className='input'
            placeholder='Enter Item'
            value={this.state.term}
            onChange={(e) => this.setState({term: e.target.value})}
          />
          <button className='button'>Submit</button>
        </form>
      );
    }
  }

  function App() {

      const [participants, setParticipants] = React.useState([
        // { id: '1', name: "You" , presenter: true, online: true},
        // { id: '2', name: "Bob" , presenter: false, online: false},
        // { id: '3', name: "Milla" , presenter: false, online: true}
      ]);

      const [roomID, setRoomID] = React.useState("conf-01");
      const [currentParticipant, updateParticipant] = React.useState({});

      var conferenceService;

      console.log("APPPPPPPPPPPPPPPPPPPP NEWWWWWWWWWWWWWWW");

     useEffect(() => {
        
      console.log("inicilize app");

      conferenceService  = new ConferenceService({
        'onParticipantUpdate' : (value) => {
          onParticipantUpdate(value);
        }
      });

      }, []); 
      

      const newParticipant = (newData) => {
        console.log('Adding new Participan - total: ' + participants.length);
        setParticipants([...participants, newData]);
      };
     
      const testNewParticipant = (newData) => {
        conferenceService._testOnNewConnection(newData.name);
      };


      const connect = (join) => {
        if(join){
          conferenceService.joinRoom(roomID);
        }else{
          conferenceService.newRoom(roomID, onConnected);
        }
      };

      const requestShare = () => {
          conferenceService.requestShare();
      };

      const onConnected = (connection) => {
        // TODO: MOSTRAR ALERTA DE COMO COMPARTILHAR A CONEXAO
        // alert('conexão pronta...' + connection.sessionid);
      };

      /** On New or update status */
      function onParticipantUpdate (participantUpdate) {
        // var participants = this.participants;

        var found = false;
        participants.forEach((current) => {
          
          // update 
          if(current.id === participantUpdate.id){
            found = true;
            current.online = participantUpdate.online;
            current.presenter = participantUpdate.presenter;
            current.name = participantUpdate.name;
          }

        });

        if(found){
          console.log("onParticipantUpdate update", participantUpdate);
          setParticipants(participants);
        }else{
          console.log("onParticipantUpdate new", participantUpdate);
          participants.push(participantUpdate);
          newParticipant(participantUpdate);
        }

      }

      return (
        
        <div>
          <NavHeader />
          <div id="wrapper" className="toggled">
            <ConferenceList list={participants} />
            <div id="page-content-wrapper">
              <div className="container-fluid">
                <input 
                  type='text'
                  className='input'
                  placeholder='Room ID'
                  value={roomID}
                  onChange={(e) => setRoomID(e.target.value)}
                />

                <span>Name: {currentParticipant.name}</span>
                
                <button id="open-room" className="btn btn-success" onClick={() => connect(false)} size="10">Open Room</button>
                <button id="join-room" className="btn btn-danger" onClick={() => connect(true)}>Join Room {roomID}</button>

                <div id="videos-container"></div>

                <button className="btn btn-info" onClick={() => requestShare()}>SHARE</button>
                
                
                <SubmitForm onFormSubmit={testNewParticipant} />
              </div>
            </div>
          </div>
        </div>
      );
  }
  
  // ========================================
  
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  