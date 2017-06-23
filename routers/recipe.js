const debug = require('debug')('recipes');
const express = require('express');

const Prismic = require('../lib/prismic');

const p = new Prismic();

const router = new express.Router();

router
	.get('/all', all)
	.get('/:slug', single);

async function all(req, res) {
	try {
		const recipes = await p.allRecipes();
		res.render('recipes', {recipes});
	} catch (err) {
		debug(err);
	}
}

async function single(req, res) {
	try {
		const recipe = await p.recipe(req.params.slug);
		const category = await p.category(recipe.getLink('recipe.categories').id);
		res.render('recipe-full', {recipe, category});
	} catch (err) {
		debug(err);
	}
}

module.exports = router;
