const debug = require('debug')('recipes');
const fs = require('fs');
const path = require('path');
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

    res.render('pages/recipes', {recipes});
  }
}

function single(req, res) {
  prismic.getByUID('recipe', req.params.slug, onrecipe);

  function onrecipe(err, recipe) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/menu');
    }

    const componentIds = [...recipe.getGroup('recipe.ingredients').toArray().map(list => {
      return list.getLink('component').id;
    }), recipe.getLink('recipe.categories').id];

    prismic.getByIds(
      [
        ...recipe.getGroup('recipe.ingredients').toArray().map(list => {
          return list.getLink('component').id;
        }),
        recipe.getLink('recipe.categories').id
      ],
      oncomponents
    );

    function oncomponents(err, docs) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/menu');
      }

      fs.readdir(path.join(__dirname, '..', 'uploads'), onread);

      function onread(err, files) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('/menu');
        }

        res.render('pages/recipe', {
          files: files.filter(f => f.includes(req.url.replace(/\//g, ''))),
          preferences: req.user.preferences,
          category: docs.find(doc => doc.type === 'category'),
          components: docs.filter(doc => doc.type === 'ingredients'),
          recipe
        });
      }
    }

  }
}

module.exports = router;
