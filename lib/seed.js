const Trello = require('trello');
const db = require('./db');

// Initialize the Trello API wrapper
const trello = new Trello(process.env.TRELLO_APIKEY, process.env.TRELLO_TOKEN);

function seed() {
	trello.getListsOnBoard(process.env.TRELLO_BOARD, onlists);
	trello.getCardsOnBoard(process.env.TRELLO_BOARD, oncards);

	function onlists(err, lists) {
		if (err) throw err; // eslint-disable-line curly

		lists.forEach(list => {
			db.upsert(list.id, doc => {
				return doc.rev ? {
					_id: list.id,
					_rev: doc.rev,
					name: list.name,
					type: 'category'
				} : {
					_id: list.id,
					name: list.name,
					type: 'category'
				};
			}, err => {
				if (err) throw err; // eslint-disable-line curly
			});
		});
	}

	function oncards(err, cards) {
		if (err) throw err; // eslint-disable-line curly

		cards.forEach(card => {
			db.upsert(card.id, doc => {
				return doc.rev ? {
					_id: card.id,
					_rev: doc.rev,
					name: card.name,
					desc: card.desc,
					idCategory: card.idList,
					type: 'recipe'
				} : {
					_id: card.id,
					name: card.name,
					desc: card.desc,
					idCategory: card.idList,
					type: 'recipe'
				};
			}, err => {
				if (err) throw err; // eslint-disable-line curly
			});
		});
	}
}

module.exports = seed;
