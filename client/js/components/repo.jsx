import React, { Component } from 'react'
import $ from 'jquery'

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
    const { user, name, url, hash } = this.props
    const { time } = this.state
    $.ajax({
      url: "http://localhost:5000/users/" + user + "/" + hash,
      type: 'PATCH',
      data: {   name: name,
          time: time,
          url: url
        }
      })

  }
  toggleTime() {
    if(this.state.toggle) {
      this.setState({
        toggle: false
      })
      clearInterval(this.interval)
      this.updateDatabase()
    } else {
       this.setState({
         toggle: true,
       })
       this.props.lastUsed(this.props.hash)
       this.interval = setInterval(this.tick.bind(this), 1000);
     }
  }
  render() {
    const { toggle } = this.state
    const timerClasses = toggle ? 'active timer' : 'inactive timer'
    return(
      <div className="repo col-md-6 col-md-offset-3">
        <div className="col-md-9 info">

          <a href={this.props.url}><h3>{this.props.name}</h3></a>
        </div>
        <div className="col-md-3 toggle">
          <div className={timerClasses} onClick={this.toggleTime.bind(this)}><span>{this.state.time}</span></div>
        </div>
      </div>
    )
  }
}

export default Repo
