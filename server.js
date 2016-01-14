'use strict'
const koa = require('koa')
const app = koa()
const serve = require('koa-static')
const request = require('superagent')
const R = require('ramda')

const dotenv = require('dotenv')
dotenv.load()

const Firebase = require('firebase')
const FirebaseTokenGenerator = require("firebase-token-generator")
const firebasePromisified = require('firebase-promisified')
const dataRoot = new Firebase('https://grumble.firebaseio.com/')
firebasePromisified(Firebase, Promise)
const userData = new Firebase('https://grumble.firebaseio.com/users/')
const tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET)

const port =  process.env.PORT || 5000
const server = require('http').createServer(app.callback()).listen(port)
const io = require('socket.io')(server)




app.use(serve(__dirname + '/client'))


io.on('connection', (socket) => {
  socket.on('userLogin', (data) => {
    socket.localUser = data
    console.log(data)
    const token = tokenGenerator.createToken({uid: socket.localUser.user, provider: 'github'})
    userData.promiseAuthWithCustomToken(token)
  })
  socket.on('loadProjects', (data) => {
    request.get("https://api.github.com/users/" + socket.localUser.username + "/repos?client_id=" +
            process.env.GITHUB_CLIENT_ID + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET).end((err, res) => {
              if (err) {
                console.log('Error')
              } else {
                let currentData
                userData.child(socket.localUser.user).child('projects').on('value', (snapshot) => {
                  const dataKeys = R.keys(snapshot.val())
                  for(let i in res.body) {
                    let dupe = false
                    for(let x in dataKeys) {
                      if (snapshot.val()[dataKeys[x]].name === res.body[i].name) {
                        dupe = true
                      }
                    }
                    console.log(dupe)
                    if (!dupe) {
                      userData.child(socket.localUser.user).child('projects').push({
                        'name': res.body[i].name,
                        'url': res.body[i].html_url,
                        'time': 0
                      })
                    }
                  }
                })
                userData.child(socket.localUser.user).child('projects').on('value', (snapshot) => {
                  socket.emit('projectsLoaded', snapshot.val())
                })
              }
            })
          })

  })






console.log('Listening on ' + port)
