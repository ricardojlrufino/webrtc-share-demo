import React from 'react';

class Participant extends React.Component {

    render() {
        let status;
        let presenter;
        let participant = this.props.value;

        if(participant.online){
            status = <span className="badge badge-success">ON</span>
        }else{
            status = <span className="badge badge-danger">OFF</span>
        }
        if(participant.presenter){
            presenter = <span className="badge badge-success"><i className="fa fa-share-alt-square" ></i></span>
        }else{
            
        }

        return (
            <li> 
                <a href="#">{participant.name}  {status} {presenter}</a> 
            </li>
        );
    }
}

  
export default class ConferenceList extends React.Component {
  
    render() {
  
      return (
  
        <div id="sidebar-wrapper" className="d-none d-sm-block">
            <ul className="sidebar-nav">
                <li className="sidebar-brand"> Participantes {this.props.list.length}  </li>
  
                {this.props.list.map((current, index) => (
                  <Participant
                      key={index}
                      value={current} />
                ))}
  
            </ul>
            
        </div> 
  
        );
      }
    }