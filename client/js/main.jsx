'use strict'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Firebase from 'firebase'

const mountNode = document.getElementById('app')
const dataRoot = new Firebase('https://grumble.firebaseio.com/')
let userRoot
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
  render: function () {
    return (
      <Navigation />
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
            <Signin/>
            <Signout/>
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
      status: 'show'
    }
  },
  login: function(e) {
    e.preventDefault()
    dataRoot.authWithOAuthPopup('github', function(error, authData) {
        if (error) {
          console.log("Login Failed!", error)
      } else {
        userRoot = new Firebase('https://grumble.firebaseio.com/users/' + authData.uid)
        console.log(authData.uid)
      }
    })
    this.setState({status: 'hidden'})
  },
  render: function () {
    return (
      <button onClick={this.login} className="btn btn-success">Sign In</button>
    )
  }
})

const Signout = React.createClass({
  getInitialState: function() {
    return {
      status: 'hidden'
    }
  },
  logout: function(e) {
    e.preventDefault()
    dataRoot.unauth()
    this.setState({status: 'hidden'})
  },
  render: function () {
    return (
      <button onClick={this.logout} className="btn btn-default">Signout</button>
    )
  }
})

ReactDOM.render(<Main />, mountNode)
