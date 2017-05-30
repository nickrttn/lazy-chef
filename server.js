require('dotenv').config();

const path = require('path');
const debug = require('debug')('app');
const logger = require('morgan');
const express = require('express');

const app = express();

app
	.set('view engine', 'ejs')
	.use(logger('dev'))
	.use('/assets', express.static(path.join(__dirname, 'client/build')))
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
