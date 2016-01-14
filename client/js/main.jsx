'use strict'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Firebase from 'firebase'
import io from 'socket.io-client'

const socket = io.connect()
socket.once('connect', function () {
})
const mountNode = document.getElementById('app')
const dataRoot = new Firebase('https://grumble.firebaseio.com/')

const Main = React.createClass({
  getInitialState: function() {
    return {
      user : ''
    }
  },
  updateUser: function (user, username) {
    this.setState({
      user: user,
      username: username
    })
  },
  render: function () {
    return (
      <div>
        <Navigation updateUser={this.updateUser} user={this.state.user} />
        <Projects user={this.state.user} username={this.state.username} />
      </div>

    )
  }
})

const Navigation = React.createClass({
  render: function () {
    return (<nav className="navbar navbar-default">
      <div className="container">
        <div className="navbar-header">
          <a className="navbar-brand">
            Grumble
          </a>
        </div>
        <div className="navbar-collapse">
          <ul className="nav navbar-nav">
            <li></li>
          </ul>
          <div className="navbar-right">
            <Signin updateUser={this.props.updateUser} user={this.props.user}/>
          </div>
        </div>
      </div>

    </nav>
    )
  }
})

const Signin = React.createClass({
  getInitialState: function() {
    return {
      displaySignin: 'inline-block',
      displaySignout: 'none'
    }
  },
  login: function(e) {
    e.preventDefault()
    dataRoot.authWithOAuthPopup('github', (error, authData) => {
        if (error) {
          console.log("Login Failed!", error)
      } else {
        this.props.updateUser(authData.uid, authData.github.username)
      }
    })
    this.setState({displaySignin: 'none', displaySignout:'inline-block'})
  },
  logout: function(e) {
    e.preventDefault()
    dataRoot.unauth()
    this.props.updateUser('none')
    this.setState({displaySignout: 'none', displaySignin: 'inline-block'})
  },
  render: function () {
    return (
      <div>
        <button onClick={this.login} className="btn btn-success" style={{ display: this.state.displaySignin }}>Sign In</button>
        <button onClick={this.logout} className="btn btn-default" style={{ display: this.state.displaySignout }}>Sign Out</button>
      </div>
    )
  }
})

const Projects = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
      repos: []
    }
  },
  componentDidMount: function() {
    socket.on('projectsLoaded', (data) => {
      console.log(data)
    })
  },
  componentDidUpdate: function(){
    if(this.props.user && !this.state.loggedIn){
      socket.emit('userLogin', this.props)
      this.setState({loggedIn: true})
    }
  },
  requestRepos: function(){
    socket.emit('loadProjects', this.state.loggedIn)
  },
  addRepo: function(repos) {
    // for (let i in repos) {
    //   this.setState({repos: this.state.repos.concat(repos[i])})
    // }
  },
  render: function() {

    return (
      <div className="container">
        <button className="btn btn-success" onClick={this.requestRepos}>Load Projects</button>
      </div>
    )
  }
})
ReactDOM.render(<Main />, mountNode)
