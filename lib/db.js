const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));

// Load environment variables
require('dotenv').config();

const db = new PouchDB(process.env.DB_HOST, {
	auth: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD
	}
});

module.exports = db;
