const express = require('express');
const toString = require('vdom-to-html');

const router = new express.Router();

const html = require('../views/application/html');
const head = require('../views/application/head');
const body = require('../views/application/body');
const render = require('../views/recipes');

router.get('/', recipes);

function recipes(req, res) {
	res.type('html');

	const page = toString(
		html(
			head('recipes'),
			body(render())
		)
	);

	res.end('<!DOCTYPE html>' + page);
}

module.exports = router;
