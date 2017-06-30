/* eslint curly: 0 */
const debug = require('debug')('upload');
const express = require('express');

const user = require('../db/user');
const ensureLoggedIn = require('../lib/ensureLoggedIn');
const prismic = require('../lib/prismic');

const router = new express.Router();

router
  .use(ensureLoggedIn())
  .get('/', getProfile)
  .post('/', postProfile);

function getProfile(req, res) {
  prismic.allOfType('category', onresponse);

  function onresponse(err, categories) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/preferences');
    }

    res.render('pages/profile', {
      user: req.user,
      categories
    });
  }
}

function postProfile(req, res) {
  user.update(
    req.user._id,
    {
      categories: req.body.categories,
      frequency: parseInt(req.body.frequency, 10),
      servings: parseInt(req.body.servings, 10)
    },
    onupdate
  );

  function onupdate(err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/menu');
    }

    res.redirect('/profile');
  }
}

module.exports = router;
