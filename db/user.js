const debug = require('debug')('user');
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

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
    const {username, password, firstName, lastName} = user;
    const hash = await bcrypt.hash(password, this.saltRounds);
    const existingUser = await this.find(username);

    if (!existingUser) {
      try {
        const newUser = await this.collection.insertOne({
          username, hash, firstName, lastName,
          fullName: `${firstName} ${lastName}`,
          initialSetupComplete: false
        });

        return await this.read(newUser.insertedId);
      } catch (err) {
        return new Error(err);
      }
    }

    return new Error('That username is already taken.');
  }

  async read(userId) {
    try {
      await this._connect();

      const user = await this.collection.findOne({
        _id: {$eq: new ObjectId(userId)}
      });

      return user;
    } catch (err) {
      return err;
    }
  }

  async find(username) {
    try {
      await this._connect();

      const user = await this.collection.findOne({
        username: {$eq: username}
      });

      return user;
    } catch (err) {
      return err;
    }
  }

  async update(userId, preferences) {
    if (this._isValidUpdate(preferences)) {
      try {
        await this._connect();

        const updatedUser = await this.collection.findOneAndUpdate(
          {_id: {$eq: new ObjectId(userId)}},
          {$set: {preferences}},
          {returnOriginal: false}
        );

        return updatedUser;
      } catch (err) {
        return err;
      }
    }
  }

  _isValidUpdate(obj) {
    const keys = Object.keys(obj);
    const validKeys = ['categories', 'frequency'];

    return keys.reduce((acc, key) => {
      return acc || validKeys.includes(key);
    }, false);
  }

  async delete(userId) {

  }
}

module.exports = User;
