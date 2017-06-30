require('dotenv').config();

const path = require('path');
const debug = require('debug')('app');
const logger = require('morgan');
const express = require('express');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const passport = require('./lib/authenticate');

express()
  .set('port', process.env.LC_PORT)
  .set('view engine', 'ejs')
  .set('x-powered-by', false)
  .use(logger('dev'))
  .use(bodyParser.urlencoded({extended: false}))
  .use(
    session({
      store: new RedisStore({client: redis.createClient()}),
      secret: process.env.LC_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {secure: !(process.env.NODE_ENV === 'development')}
    })
  )
  .use(flash())
  .use(passport.initialize())
  .use(passport.session())
  .use('/assets', express.static(path.join(__dirname, 'client/build')))
  .use('/uploads', express.static(path.join(__dirname, 'uploads')))
  .use(getMessages)
  .use(activePage)
  .use('/auth', require('./routers/authenticate'))
  .use('/preferences', require('./routers/preferences'))
  .use('/menu', require('./routers/menu'))
  .use('/profile', require('./routers/profile'))
  .use('/recipe', require('./routers/recipe'))
  .use('/upload', require('./routers/upload'))
  .get('/', onindex)
  .listen(process.env.LC_PORT, onlisten);

function getMessages(req, res, next) {
  res.locals.messages = [...req.flash('error'), ...req.flash('info')];
  next();
}

function activePage(req, res, next) {
  res.locals.page = req.url;
  res.locals.nav = {
    'Shopping list': '/menu/groceries',
    Menu: '/menu',
    Settings: '/profile',
    'Log out': '/auth/logout'
  };

  next();
}

function onindex(req, res) {
  res.render('index');
}

function onlisten(err) {
  if (err) return debug(err); // eslint-disable-line curly
  debug(`Application listening on http://localhost:${process.env.LC_PORT}`);
}
