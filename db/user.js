const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;

class User {
	constructor() {
		this.saltRounds = 10;
		this.db = undefined;
		this.collection = undefined;
	}

	async _connect() {
		if (!this.db) {
			this.db = await MongoClient.connect(process.env.LC_DB_URL);
			this.collection = await this.db.collection('users');
		}
	}

	async create(user) {
		this._connect();
		user.hash = await bcrypt.hash(user.password, this.saltRounds);

		this.collection.insertOne({
			username: user.username,
			hash: user.hash,
			firstName: user.firstName,
			lastName: user.lastName,
			fullName: `${user.firstName} ${user.lastName}`
		});

		return {
			username: user.username,
			firstName: user.firstName,
			hash: user.hash
		};
	}

	async read(userId) {
		this._connect();

	}

	async update(userId, user) {

	}

	async delete(userId) {

	}
}

module.exports = User;