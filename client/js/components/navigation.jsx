import React, { Component } from 'react'
import Signin from './signin.jsx'

class Navigation extends Component {
  constructor(props){
    super(props)
  }
  render(){
    const { user, username, data } = this.props
    return(
      <nav className="navbar navbar-default">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand">
              Grumble
            </a>
            <div className="sign-in">
              <Signin updateUser={this.props.updateUser} user={user} username={username} data={data}/>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

export default Navigation
