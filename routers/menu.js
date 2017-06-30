/* eslint curly: 0 */
const debug = require('debug')('menu');
const express = require('express');

const menu = require('../db/menu');
const ensureLoggedIn = require('../lib/ensureLoggedIn');
const groceryList = require('../lib/grocery-list');
const prismic = require('../lib/prismic');

const router = new express.Router();

router
  .use(ensureLoggedIn())
  .get('/', weeklyMenu)
  .get('/groceries', groceries);

function weeklyMenu(req, res) {
  menu.read(req.user, onmenu);

  function onmenu(err, menu) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/preferences');
    }

    res.render('pages/menu', {
      recipes: menu.recipes
    });
  }
}

function groceries(req, res) {
  menu.read(req.user, onmenu);

  function onmenu(err, menu) {
    if (err) return handleError(err);

    if (menu.groceries) {
      return res.render('pages/groceries', {
        groceries: menu.groceries
      });
    }

    groceryList(req.user, ongroceries);
  }

  function ongroceries(err, groceries) {
    if (err) return handleError(err);
    menu.update(req.user, groceries, onupdate);
  }

  function onupdate(err, menu) {
    if (err) return handleError(err);
    return res.render('pages/groceries', {
      groceries: menu.groceries,
      nav: req.nav
    });
  }

  function handleError(err) {
    req.flash('error', err.message);
    return res.redirect('/preferences');
  }
}

module.exports = router;
