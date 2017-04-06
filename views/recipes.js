const h = require('virtual-dom/h');
const db = require('../lib/db');

function recipes() {
	let node;

	db.allDocs({include_docs: true}, (err, docs) => { // eslint-disable-line
		node = h('ul', {data: {type: 'recipes'}}, docs.rows.map(row => {
			return row.doc.type === 'recipe' ? h('li', row.doc.name) : null;
		}));
	});

	return node;
}

function render(node) {
	return node;
}

module.exports = recipes;
