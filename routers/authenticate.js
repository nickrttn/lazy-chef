const debug = require('debug')('auth-router');
const express = require('express');
const passport = require('../lib/authenticate');

const router = new express.Router();

router
  .get('/login', getLogin)
  .get('/logout', getLogout)
  .get('/register', getRegister)
  .post(
    '/login/local',
    passport.authenticate('local', {
      successRedirect: '/preferences',
      failureRedirect: '/auth/login',
      failureFlash: true
    })
  )
  .post(
    '/register',
    passport.authenticate('register', {
      failureRedirect: '/auth/register',
      failureFlash: true
    }),
    postRegister
  );

function getLogin(req, res) {
  res.render('login');
}

function getLogout(req, res) {
  req.logout();
  req.flash('info', "You've been logged out");
  res.redirect('/');
}

function getRegister(req, res) {
  res.render('register');
}

function postRegister(req, res) {
  if (req.user.initialSetupComplete) {
    return res.redirect('/menu');
  }

  res.redirect('/preferences');
}

module.exports = router;
