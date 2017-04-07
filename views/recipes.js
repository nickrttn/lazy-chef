const h = require('virtual-dom/h');
const db = require('../lib/db');

function recipes(callback) {
	db.allDocs({include_docs: true}, onresponse); // eslint-disable-line

	function onresponse(err, docs) {
		if (err) throw err; // eslint-disable-line

		callback(h('ul', {dataset: {type: 'recipes'}}, docs.rows.map(row => {
			return row.doc.type === 'recipe' ? h('li', {
				dataset: {}
			}, row.doc.name) : null;
		})));
	}
}

module.exports = recipes;
