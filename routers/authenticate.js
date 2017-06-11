const debug = require('debug')('auth-router');
const express = require('express');

const User = require('../db/user');
const passport = require('../lib/authenticate');

const router = new express.Router();
const user = new User();

router.get('/register', (req, res) => {
	res.render('register', {stylesheet: 'index'});
});

router.post('/register', async (req, res) => {
	const newUser = await user.create(req.body);

	debug(newUser);

	req.login(newUser, err => {
		if (err) {
			return debug(err);
		}

		res.redirect('/categories');
	});
});

router.get('/login', (req, res) => {
	res.render('login', {stylesheet: 'index'});
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/categories',
	failureRedirect: '/auth/login',
	failureFlash: true
}));

module.exports = router;
