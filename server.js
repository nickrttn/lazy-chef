const express = require('express');

const seed = require('./lib/seed');
const recipes = require('./routers/recipes');
const render = require('./views/index');

// Seed the database
seed();

const app = express()
	.set('port', process.env.port || 3000)
	.use('/assets', express.static('build/assets'))
	.get('/', index)
	.use('/recipes', recipes);

function index(req, res) {
	res.type('.html');
	res.end(render());
}

app.listen(app.get('port'), () => {
	console.log(`Application listening on localhost:${app.get('port')}`);
});
