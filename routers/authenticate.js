const debug = require('debug')('auth-router');
const express = require('express');

const User = require('../db/user');
const passport = require('../lib/authenticate');

const router = new express.Router();
const user = new User();

router
  .get('/login', getLogin)
  .get('/register', getRegister)
  .post('/login/local', passport.authenticate('local', {
    successRedirect: '/categories',
    failureRedirect: '/auth/login',
    failureFlash: true
  }))
  .post('/register', passport.authenticate('register', {
    successRedirect: '/categories',
    failureRedirect: '/auth/register',
    failureFlash: true
  }));

function getRegister(req, res) {
  res.render('register');
}

function getLogin(req, res) {
  res.render('login');
}

module.exports = router;
