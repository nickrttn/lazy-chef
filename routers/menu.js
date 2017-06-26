const debug = require('debug')('menu');
const express = require('express');

const menu = require('../db/menu');
const ensureLoggedIn = require('../lib/ensureLoggedIn');

const router = new express.Router();

router.use(ensureLoggedIn()).get('/', weeklyMenu);

function weeklyMenu(req, res) {
  menu.read(req.user, onmenu);

  function onmenu(err, menu) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/preferences');
    }

    res.render('pages/menu', {recipes: menu});
  }
}

module.exports = router;
