const debug = require('debug')('recipes');
const express = require('express');

const prismic = require('../lib/prismic');

const router = new express.Router();

router.get('/all', all).get('/:slug', single);

function all(req, res) {
  prismic.allOfType('recipe', onrecipes);

  function onrecipes(err, recipes) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/menu');
    }

    res.render('recipes', {recipes});
  }
}

function single(req, res) {
  prismic.getByUID('recipe', req.params.slug, onrecipe);

  function onrecipe(err, recipe) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/menu');
    }

    res.render('recipe-full', {recipe});
  }
}

module.exports = router;
