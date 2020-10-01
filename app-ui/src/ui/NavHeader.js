import React from 'react';

class NavHeader extends React.Component {
  render() {

    var buttons;
    
    if(this.props.isConnected){
      buttons = (
        <div class="form-inline">
          <button class="btn btn-sm btn-info btn-outline mr-1" onClick={this.props.onRequestShare} >Compartilhar Tela <i className="fa fa-share"></i></button>
          <button class="btn btn-sm btn-danger" onClick={this.props.onDisconnect}>Sair <i className="fa fa-close"></i></button>
        </div>
      )
    }
    
    return (
      <nav className="navbar navbar-expand navbar-dark bg-primary"> 
        <a href="#" className="navbar-brand">Web Conference</a> 

        <div className="collapse navbar-collapse" id="navbarsExample02">
          {buttons}
        </div>

        <a href="#menu-toggle" id="menu-toggle" className="navbar-brand">
            <span className="navbar-toggler-icon"></span>
        </a> 
      </nav>
    );
  }
}

export default NavHeader; 