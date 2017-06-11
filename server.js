require('dotenv').config();

const path = require('path');
const debug = require('debug')('app');
const logger = require('morgan');
const express = require('express');
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
	.use(session({
		store: new RedisStore({client: redis.createClient()}),
		secret: process.env.LC_SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {}
	}))
	.use(passport.initialize())
	.use(passport.session())
	.use('/assets', express.static(path.join(__dirname, 'client/build')))
	.use('/auth', require('./routers/authenticate'))
	.use('/recipe', require('./routers/recipe'))
	.get('/', onindex)
	.listen(process.env.LC_PORT, onlisten);

function onindex(req, res) {
	res.render('index', {stylesheet: 'index'});
}

function onlisten(err) {
	if (err) return debug(err); // eslint-disable-line curly
	debug(`Application listening on http://localhost:${process.env.LC_PORT}`);
}
