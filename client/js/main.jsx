'use strict'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Firebase from 'firebase'
import Navigation from './components/navigation.jsx!'
import Projects from './components/projects.jsx!'


const mountNode = document.getElementById('app')


class Main extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: '',
      username: '',
      data: new Firebase('https://grumble.firebaseio.com/')
    }
  }
  componentWillMount() {
    const { data } = this.state
    const authData = data.getAuth()
    if(authData){
      this.updateUser(authData.uid, authData.github.username)
    }
  }
  updateUser(user, username) {
    this.setState({
      user: user,
      username: username
    })
  }
  render() {
    const { user, username, data } = this.state

    return (
      <div>
        <Navigation updateUser={this.updateUser.bind(this)} user={user}  username={username} data={data}/>
        <Projects user={this.state.user}  username={this.state.username} />
      </div>
    )
  }
}





ReactDOM.render(<Main />, mountNode)
