import React, { Component } from 'react'
import R from 'ramda'
import Repo from './repo.jsx'
import $ from 'jquery'


class Projects extends Component {
  constructor(props) {
    super(props)
    this.state = {
      repos: []
    }
  }
  componentWillMount(){
    const { user } = this.props
    if(user.length > 0) {
      this.getRepos()
    }
  }
  componentWillReceiveProps(props) {
    if(props.user.length < 1) {
      this.setState({
        repos: []
      })
    }
  }
  getRepos() {
    $.get('https://grumbled.herokuapp.com/users/' + this.props.user + '/' + this.props.username, (data) => {
      this.setState({
        repos: this.orderRepos(this.convertRepos(data.projects))
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
        time: data[i].time,
        updatedAt: data[i].updatedAt
      })
      hash++
    }
    return repos
  }
  orderRepos(repos) {
    const mostRecent = R.sort((a, b) => {
      return b.updatedAt - a.updatedAt
    }, repos)
    return mostRecent
  }
  lastUsed(hash) {
    const { repos } = this.state
    let usedRepo = R.find(R.propEq('key', hash))(repos)
    repos[repos.indexOf(usedRepo)].updatedAt = new Date().getTime()
    this.setState({
      repos: repos
    })
  }
  render() {
    const { user, username } = this.props
    const { repos } = this.state
    const repoCards = []
    if(repos.length > 0){
      repos.map((repo) => {
        repoCards.push(<Repo name={repo.name} url={repo.url} key={repo.key}
          hash={repo.key} time={repo.time} user={user} username={username}
          lastUsed={this.lastUsed.bind(this)}/>)
      })
    }

    let display = user ? 'block' : 'none'
    return (
      <div className="container">
        {repoCards}
        <div className="col-md-6 col-md-offset-3 loader">
          <button className="btn center" style={{ display: display }} onClick={this.getRepos.bind(this)}>Get Repos</button>
        </div>
      </div>
    )
  }
}

export default Projects
