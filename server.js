'use strict'
const koa = require('koa')
const koaBody = require('koa-better-body')
const Firenext = require('firenext')
const FirebaseTokenGenerator = require("firebase-token-generator")
const router = require('koa-router')()
const serve = require('koa-static')
const app = koa()
const port =  process.env.PORT || 5000
const server = require('http').createServer(app.callback()).listen(port)
const dotenv = require('dotenv')
const request = require('superagent')
const R = require('ramda')
dotenv.load()



const userData = new Firenext('https://grumble.firebaseio.com/users/')
const tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET)

console.log('Sup')

app.use(koaBody({
  extendTypes: {
    // will parse application/x-javascript type body as a JSON string
    json: ['application/x-javascript'],
    multipart: ['multipart/mixed']
  }
}))

app.use(serve(__dirname + '/client'))

router.get('/users/:id/:username', function *(next) {
  let userId = this.params.id
  let username = this.params.username
  const token = tokenGenerator.createToken({uid: this.params.id, provider: 'github'})
  userData.authWithCustomToken(token)
  let userInformation = yield checkRepos(username, userId)
  this.status = 200
  this.body = userInformation

})

router.patch('/users/:id/:hash', function *(next) {
  const project = this.request.body.fields
  const id = this.params.id
  const hash = this.params.hash
  const token = tokenGenerator.createToken({uid: id, provider: 'github'})
  userData.authWithCustomToken(token)

  yield setData(id, hash, project)
  this.status = 200
  this.body = "Success"
})

router.post('', function *(next) {

})

router.delete('', function *(next) {

})


function *checkRepos(username, userId) {
  let userInformation = yield getUser(userId)
  if (userInformation === null) {
    let res = yield getRepos(username)
    let repos = res.body
    let repo
    for (let i in repos) {
      repo = {
        name: repos[i].name,
        time: 0,
        url: repos[i].html_url
      }
      yield updateRepos(userId, repo)
    }
    userInformation = yield getUser(userId)
  }
  return userInformation
}


function getUser(userId) {
  return userData.child(userId).exec().then(function(snapshot){
    return snapshot.val()
  })
}

function setData(userId, hash, project) {
  const now = new Date().getTime()
  return userData.child(userId).child('projects').child(hash).set({
    name: project.name,
    time: parseInt(project.time),
    url: project.url,
    updatedAt: now
  })
}

function getRepos(username) {
  return request.get("https://api.github.com/users/" + username + "/repos?client_id=" +
          process.env.GITHUB_CLIENT_ID + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET)
}

function *updateRepos(userId, data) {
  const now = new Date().getTime()
  yield userData.child(userId).child('projects').push({
    name: data.name,
    time: data.time,
    url: data.url,
    updatedAt: now
  }).exec()
}

app.use(cors(['GET', 'POST', 'PATCH']))

app.use(router.routes())

console.log('Listening on ' + port)
