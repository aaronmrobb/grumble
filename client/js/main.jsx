'use strict'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Firebase from 'firebase'
import io from 'socket.io-client'
import R from 'ramda'

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
        <Navigation updateUser={this.updateUser} user={this.state.user} username={this.state.username} />
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
            <Signin updateUser={this.props.updateUser} user={this.props.user} username={this.props.username}/>
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
        <span className="username"> {this.props.username? this.props.username : ''}</span>
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
      this.addRepos(data)
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
  addRepos: function(repos) {
    var reposToAdd = []
    var repoKeys = R.keys(repos)
    var j = 0
    for (let i in repos) {
      reposToAdd.push({
        key: repoKeys[j],
        name: repos[i].name,
        url: repos[i].url,
        time: repos[i].time
      })
      j++
    }
    this.setState({
      repos: reposToAdd
    })
    console.log(this.state.repos)
  },
  passUp: function(props, state) {
    var updatedIndex
    var j = 0
    var updatedRepos = this.state.repos
    for(let i in updatedRepos){
      if (updatedRepos[i].name === props.name) {
        updatedIndex = j
      }
      j++
    }
    updatedRepos[updatedIndex].time = state
    this.setState({
      repos: updatedRepos
    })
    this.updateDatabase(this.state.repos)
  },
  componentWillUnmount: function(){
  },
  updateDatabase: function(data) {
    socket.emit('updateDb', data)
  },
  render: function() {
    var repos = this.state.repos.map((repo) => {
      return <Repo name={repo.name} url={repo.url} key={repo.key} time={repo.time} passUp={this.passUp}/>
    })
    return (
      <div className="container">
        {repos}
        <button className="btn btn-success" onClick={this.requestRepos}>Load Projects</button>
      </div>
    )
  }
})

const Repo = React.createClass({
  getInitialState: function() {
    return {
      toggle: 'off',
      time: this.props.time
    }
  },
  componentWillUnmount: function() {
    this.props.passUp(this.props, this.state.time)
  },
  tick: function(){
    this.setState({time: this.state.time + 1});
  },
  toggleTime: function(){
    if(this.state.toggle === 'on') {
      this.setState({
        toggle: 'off',
      })
      this.props.passUp(this.props, this.state.time)
      clearInterval(this.interval);
    } else {
      this.setState({
        toggle: 'on',
      })
      this.interval = setInterval(this.tick, 1000);
    }

  },
  render: function() {
    return (
      <div className="repo col-md-6 col-md-offset-3">
        <h3>{this.props.name}</h3>
        <a href={this.props.url}>Link</a>
        <div className="timer">{this.state.time}</div>
        <button className="btn btn-success" onClick={this.toggleTime}>
          Turn {this.state.toggle === 'on' ? 'off' : 'on'}
        </button>
      </div>
    )
  }
})
ReactDOM.render(<Main />, mountNode)
