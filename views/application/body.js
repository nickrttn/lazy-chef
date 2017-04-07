const h = require('virtual-dom/h');

module.exports = function (content) {
	const body = h('body', content);
	return body;
};
