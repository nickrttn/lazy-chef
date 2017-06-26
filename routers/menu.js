const debug = require('debug')('menu');
const express = require('express');

const menu = require('../db/menu');
const ensureLoggedIn = require('../lib/ensureLoggedIn');

const router = new express.Router();

router
  .use(ensureLoggedIn())
  .get('/', weeklyMenu)
  .get('/ingredients', getIngredients);

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

function getIngredients(req, res) {
  menu.read(req.user, onmenu);

  function onmenu(err, menu) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/menu');
    }

    // let ingredientIds = [];

    menu.forEach(recipe => {
      debug(recipe);
      // recipe.getGroup('recipe.ingredients').toArray().forEach(list => {
      //   debug(list.getLink('component'));
      //   ingredientIds.push(list.getLink('component').id);
      // });
    });

    // debug(ingredientIds);

    res.render('pages/menu', {recipes: menu});
  }
}

module.exports = router;
