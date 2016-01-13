const koa = require('koa')
const koaBody = require('koa-better-body')
const Firebase = require('firebase')
const router = require('koa-router')()
const serve = require('koa-static')
const thunkify = require('thunkify-wrap')
const app = koa()
const dataRoot = new Firebase('https://grumble.firebaseio.com/')
const port =  process.env.PORT || 5000
const server = require('http').createServer(app.callback()).listen(port)
const dotenv = require('dotenv')
const userData = new Firebase('https://grumble.firebaseio.com/users/')
dotenv.load()

app.use(koaBody({
  extendTypes: {
    // will parse application/x-javascript type body as a JSON string
    json: ['application/x-javascript'],
    multipart: ['multipart/mixed']
  }
}))

app.use(serve(__dirname + '/client'))

router.get('/users/:id', function *(next) {
  userData.child(this.params.id).on('value', (snapshot) => {
    this.status = 200
    this.body = snapshot.val()
  }, (errorObject) => {

  })
})
router.post('', function *(next) {

})
router.patch('', function *(next) {

})
router.delete('', function *(next) {

})

app.use(router.routes())
console.log('Listening on ' + port)
