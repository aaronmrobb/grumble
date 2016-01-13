'use strict'
const koa = require('koa')
const Firebase = require('firebase')
const FirebaseTokenGenerator = require("firebase-token-generator")
const firebasePromisified = require('firebase-promisified')
const serve = require('koa-static')
const thunkify = require('thunkify-wrap')
const app = koa()
const dataRoot = new Firebase('https://grumble.firebaseio.com/')
const port =  process.env.PORT || 5000
const server = require('http').createServer(app.callback()).listen(port)
const dotenv = require('dotenv')
const io = require('socket.io')(server)
dotenv.load()
firebasePromisified(Firebase, Promise)
const userData = new Firebase('https://grumble.firebaseio.com/users/')
const tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET)

app.use(serve(__dirname + '/client'))


io.on('connection', (socket) => {
  console.log('User connected')
  socket.on('userLogin', (data) => {
    const token = tokenGenerator.createToken({uid: data, provider: 'github'})
    userData.promiseAuthWithCustomToken(token)
    userData.child(data).on('value', (snapshot) =>{
      
    })
  })
})





console.log('Listening on ' + port)
