const debug = require('debug')('preferences');
const express = require('express');

const User = require('../db/user');
const Prismic = require('../lib/prismic');
const ensureLoggedIn = require('../lib/ensureLoggedIn');

const router = new express.Router();
const p = new Prismic();
const user = new User();

router
  .use(ensureLoggedIn())
  .get('/', getCategories)
  .post('/', setCategories);

async function getCategories(req, res) {
  res.render('pages/preferences', {
    categories: await p.allCategories()
  });
}

function setCategories(req, res) {
  const updatedUser = user.update(req.user._id, req.body);

  if (updatedUser instanceof Error) {
    req.flash('error', 'Something went wrong, please try again');
    return res.redirect('/preferences');
  }

  res.redirect('/menu');
}

module.exports = router;
