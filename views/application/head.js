const h = require('virtual-dom/h');

module.exports = function (path) {
	const head = h('head', [
		h('meta', {charset: 'utf-8'}),
		h('meta', {name: 'viewport', content: 'width=device-width, initial-scale=1'}),
		h('title', 'Lazy Chef'),
		h('link', {href: 'https://fonts.googleapis.com/css?family=Abril+Fatface', rel: 'stylesheet'}),
		h('link', {href: `assets/${path}.css`, rel: 'stylesheet'})
	]);

	return head;
};
