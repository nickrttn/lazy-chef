const debug = require('debug')('menu');
const express = require('express');

const User = require('../db/user');
const Prismic = require('../lib/prismic');
const ensureLoggedIn = require('../lib/ensureLoggedIn');

const router = new express.Router();
const p = new Prismic();
const user = new User();

router
  .use(ensureLoggedIn())
  .get('/', menu);

async function menu(req, res) {
  'check if we have recipes for the user for this week'
  'this week starts at a certain day, save that day'
  'if not, create a new list of recipes'
  'needs weighted randomization'

  res.render('pages/preferences', {
    recipes: await user.getRecipes()
  });
}

module.exports = router;
