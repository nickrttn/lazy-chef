/* eslint curly: 0, space-before-function-paren: 0 */
const MongoClient = require('mongodb').MongoClient;

module.exports = function(collection, callback) {
  MongoClient.connect(process.env.LC_DB_URL, onconnect);

  function onconnect(err, db) {
    if (err) return callback(err, null);

    callback(null, db.collection(collection));
  }
};
