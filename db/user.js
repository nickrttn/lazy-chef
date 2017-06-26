/* eslint curly: 0, space-before-function-paren: 0 */
const debug = require('debug')('user');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;
const getDay = require('date-fns').getDay;

const connect = require('./connect');

const user = {
  collection: 'users',
  saltRounds: 10,
  validKeys: ['categories', 'frequency']
};

user.create = function(user, callback) {
  const self = this;
  const {username, password, firstName, lastName} = user;

  bcrypt.hash(password, self.saltRounds, onhash);

  function onhash(err, hash) {
    if (err) return callback(err, null);

    connect(self.collection, onconnect);

    function onconnect(err, col) {
      if (err) return callback(err, null);

      col.findOne({username}, onfind);

      function onfind(err, doc) {
        if (err) return callback(err, null);

        if (doc) {
          return callback(new Error('That username is already taken.'), null);
        }

        col.insertOne(
          {
            username,
            hash,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            initialSetupComplete: false
          },
          oninsert
        );
      }

      function oninsert(err, response) {
        if (err) return callback(err, null);

        self.read(response.insertedId, onread);

        function onread(err, user) {
          if (err) return callback(err, null);
          callback(err, user);
        }
      }
    }
  }
};

user.read = function(userId, callback) {
  connect(this.collection, onconnect);

  function onconnect(err, col) {
    if (err) return callback(err, null);

    col.findOne({_id: new ObjectId(userId)}, onfind);

    function onfind(err, doc) {
      if (err) return callback(err, null);
      callback(err, doc);
    }
  }
};

user.update = function(userId, preferences, callback) {
  const self = this;

  if (isValidUpdate(preferences, self.validKeys)) {
    connect(self.collection, onconnect);
  }

  function onconnect(err, col) {
    if (err) return callback(err, null);

    col.findOneAndUpdate(
      {_id: new ObjectId(userId)},
      {
        $set: {
          initialSetupComplete: true,
          preferences: Object.assign(preferences, {
            startOfWeek: getDay(new Date())
          })
        }
      },
      {returnOriginal: false},
      onupdate
    );
  }

  function onupdate(err, doc) {
    if (err) return callback(err, null);
    callback(null, doc);
  }

  function isValidUpdate(obj, validKeys) {
    const keys = Object.keys(obj);
    return keys.reduce((acc, key) => acc || validKeys.includes(key), false);
  }
};

user.find = function(username, callback) {
  connect(this.collection, onconnect);

  function onconnect(err, col) {
    if (err) return callback(err, null);

    col.findOne({username: {$eq: username}}, onfind);

    function onfind(err, doc) {
      if (err) return callback(err, null);

      callback(err, doc);
    }
  }
};

module.exports = user;
