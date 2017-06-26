const debug = require('debug')('preferences');
const express = require('express');

const user = require('../db/user');
const prismic = require('../lib/prismic');
const ensureLoggedIn = require('../lib/ensureLoggedIn');

const router = new express.Router();

router.use(ensureLoggedIn()).get('/', getPreferences).post('/', setPreferences);

function getPreferences(req, res) {
  prismic.allOfType('category', onresponse);

  function onresponse(err, categories) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/preferences');
    }

    res.render('pages/preferences', {categories});
  }
}

function setPreferences(req, res) {
  user.update(
    req.user._id,
    {
      categories: req.body.categories,
      frequency: parseInt(req.body.frequency, 10)
    },
    onupdate
  );

  function onupdate(err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/preferences');
    }

    res.redirect('/menu');
  }
}

module.exports = router;
