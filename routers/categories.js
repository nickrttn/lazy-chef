const debug = require('debug')('categories');
const express = require('express');

const User = require('../db/user');
const Prismic = require('../lib/prismic');

const router = new express.Router();
const p = new Prismic();
const user = new User();

router
  .use(ensureLoggedIn())
  .get('/', getCategories)
  .post('/', setCategories);

async function getCategories(req, res) {
  res.render('pages/selectCategories', {
    categories: await p.allCategories()
  });
}

function setCategories(req, res) {
  const updatedUser = user.update(req.user._id, req.body);

  if (updatedUser instanceof Error) {
    req.flash('error', 'Something went wrong, please try again');
    return res.redirect('/categories');
  }

  res.redirect('/lazydays');
}

function ensureLoggedIn() {
  return function (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      req.flash('error', 'You need to be logged in to access that page.');
      return res.redirect('/auth/login');
    }

    next();
  };
}

module.exports = router;
