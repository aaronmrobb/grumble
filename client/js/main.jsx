'use strict'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Firebase from 'firebase'

const mountNode = document.getElementById('app')
const dataRoot = new Firebase('https://grumble.firebaseio.com/')
//
// $('#signin').on('click', (e) => {
//   e.preventDefault()

// })
//
// $('#signout').on('click', (e) => {
//   e.preventDefault()
//   dataRoot.unauth()
//
// })
//
// $('#add-record').on('submit', (e) => {
//   e.preventDefault()
//   console.log('Something')
//   userRoot.child('record').push($('#record').val())
// })

const Main = React.createClass({
  getInitialState: function() {
    return {
      user : ''
    }
  },
  updateUser: function (user) {
    this.setState({
      user: user
    })
  },
  render: function () {
    return (
      <div>
        <Navigation updateUser={this.updateUser} user={this.state.user}/>
        <Projects user={this.state.user} />
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
        this.props.updateUser(authData.uid)
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
      repos: [],
      loggedIn: 'none'
    }
  },

  getRepos: function(e) {
    e.preventDefault()
    $.get('http://localhost:5000/users/' + this.props.user, (data) => {
      this.setState({
        repos: data.projects
      })
    })
  },
  addRepo: function(repos) {
    for (let i in repos) {
      this.setState({repos: this.state.repos.concat(repos[i])})
    }
  },
  render: function() {
    const { user } = this.props
    let display = user ? 'block' : 'none'
    return (
      <div className="container">
        <button className="btn btn-success btn-lg center" style={{ display: display }} onClick={this.getRepos}>Get Repos</button>
      </div>
    )
  }
})
ReactDOM.render(<Main />, mountNode)
