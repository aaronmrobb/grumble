import React, { Component } from 'react'
import Firebase from 'firebase'


class Signin extends Component {
  constructor(props) {
    super(props)
  }
  login(e) {
    const { data } = this.props
    e.preventDefault()
    data.authWithOAuthPopup('github', (error, authData) => {
        if (error) {
          console.log("Login Failed!", error)
      } else {
        this.props.updateUser(authData.uid, authData.github.username)
      }
    })
  }
  logout(e) {
    const { data } = this.props
    e.preventDefault()
    data.unauth()
    this.props.updateUser('', '')
  }
  render() {
    const { user } = this.props
    let signIn = user.length  < 1 ? 'inline-block' : 'none'
    let signOut = user.length > 0 ? 'inline-block' : 'none'
    return(
      <div>
        <button onClick={this.login.bind(this)} className="btn btn-success" style={{ display: signIn }}>Sign In</button>
        <button onClick={this.logout.bind(this)} className="btn btn-default" style={{ display: signOut }}>Sign Out</button>
      </div>
    )
  }
}

export default Signin
