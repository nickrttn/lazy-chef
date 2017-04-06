const h = require('virtual-dom/h');

module.exports = function (head, body) {
	const html = h('html', {lang: 'en'}, [head, body]);
	return html;
};
