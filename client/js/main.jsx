'use strict'
import $ from 'jquery'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Firebase from 'firebase'
import R from 'ramda'

const mountNode = document.getElementById('app')
const dataRoot = new Firebase('https://grumble.firebaseio.com/')

class Main extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: '',
      username: ''
    }
  }
  updateUser(user, username) {
    this.setState({
      user: user,
      username: username
    })
    console.log(this.state)
  }
  render() {
    return (
      <div>
        <Navigation updateUser={this.updateUser.bind(this)} user={this.state.user}  username={this.state.username}/>
        <Projects user={this.state.user}  username={this.state.username} />
      </div>
    )
  }
}

class Navigation extends Component {
  constructor(props){
    super(props)
  }
  render(){
    return(
      <nav className="navbar navbar-default">
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
}

class Signin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displaySignin: 'inline-block',
      displaySignout: 'none'
    }
  }
  login(e) {
    e.preventDefault()
    dataRoot.authWithOAuthPopup('github', (error, authData) => {
        if (error) {
          console.log("Login Failed!", error)
      } else {
        this.props.updateUser(authData.uid, authData.github.username)
      }
    })
    this.setState({
      displaySignin: 'none',
      displaySignout:'inline-block'
    })
  }
  logout(e) {
    e.preventDefault()
    dataRoot.unauth()
    this.props.updateUser('none')
    this.setState({
      displaySignout: 'none',
      displaySignin: 'inline-block'
    })
  }
  render() {
    return(
      <div>
        <button onClick={this.login.bind(this)} className="btn btn-success" style={{ display: this.state.displaySignin }}>Sign In</button>
        <button onClick={this.logout.bind(this)} className="btn btn-default" style={{ display: this.state.displaySignout }}>Sign Out</button>
      </div>
    )
  }
}

class Projects extends Component {
  constructor(props) {
    super(props)
    this.state = {
      repos: []
    }
  }
  getRepos(e) {
    e.preventDefault()
    $.get('http://localhost:5000/users/' + this.props.user + '/' + this.props.username, (data) => {
      this.setState({
        repos: this.convertRepos(data.projects)
      })
    })
  }
  convertRepos(data) {
    const repos = []
    const keys = R.keys(data)
    let hash = 0
    for (let i in data) {
      repos.push({
        key: keys[hash],
        name: data[i].name,
        url: data[i].url,
        time: data[i].time
      })
      hash++
    }
    return repos
  }
  render() {
    const { user } = this.props
    const repoCards = []
    if(this.state.repos.length > 0){
      const { repos } = this.state
      repos.map((repo) => {
        repoCards.push(<Repo name={repo.name} url={repo.url} key={repo.key} time={repo.time}/>)
      })
    }

    let display = user ? 'block' : 'none'
    return (
      <div className="container">
        {repoCards}
        <div className="col-md-6 col-md-offset-3 loader">
          <button className="btn btn-success btn-lg center" style={{ display: display }} onClick={this.getRepos.bind(this)}>Get Repos</button>
        </div>
      </div>
    )
  }
}

class Repo extends Component {
  constructor(props){
    super(props)
    this.state = {
      toggle: false,
      time: props.time
    }
  }
  tick() {
    this.setState({
      time: this.state.time + 1
    })
  }
  updateDatabase() {

  }
  toggleTime() {
    if(this.state.toggle) {
      this.setState({
        toggle: false
      })
      clearInterval(this.interval);
    } else {
       this.setState({
         toggle: true,
       })
       this.interval = setInterval(this.tick.bind(this), 1000);
     }
  }
  render() {
    return(
      <div className="repo col-md-8 col-md-offset-2">
        <h3>{this.props.name}</h3>
        <a href={this.props.url}>Link</a>
        <div className="timer">{this.state.time}</div>
        <button className="btn btn-success" onClick={this.toggleTime.bind(this)}>
          Turn {this.state.toggle === 'on' ? 'off' : 'on'}
        </button>
      </div>
    )
  }
}

ReactDOM.render(<Main />, mountNode)
