const debug = require('debug')('menu-db');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const Prismic = require('../lib/prismic');

const p = new Prismic();

class Menu {
  constructor() {
    this.db = undefined;
    this.collection = undefined;
  }

  async _connect() {
    if (!this.db) {
      this.db = await MongoClient.connect(process.env.LC_DB_URL);
      this.collection = await this.db.collection('users');
    }
  }

  async get(userId) {

    try {
      await this._connect();
      const userMenus = await this.collection.find({user: userId});
      return userMenus;
    } catch (err) {
      return new Error(err);
    }
  }
}

module.exports = new Menu();
