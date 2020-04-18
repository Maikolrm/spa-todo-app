const express = require('express')
const router = require('./router')
const dotenv = require('dotenv').config()
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const app = express()

let sessions = session({
  secret: process.env.SESSIONSSECRET,
  store: new MongoStore({ client: require('./db') }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended : false }))
app.use(express.json())
app.use(sessions)
app.use(function(req, res, next) {
  if (req.session.user) {
    res.locals.user = req.session.user
  }
  next()
})
app.use('/', router)

module.exports = app
