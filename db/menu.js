/* eslint curly: 0, space-before-function-paren: 0 */
const debug = require('debug')('menu-db');
const sampleSize = require('lodash/sampleSize');
const ObjectId = require('mongodb').ObjectId;
const Cursor = require('mongodb').Cursor;
const isSameWeek = require('date-fns').isSameWeek;

const prismic = require('../lib/prismic');
const connect = require('./connect');

const menu = {
  collection: 'menus'
};

menu.create = function(user, callback) {
  const {frequency: freq, categories, userServings} = user.preferences;
  const self = this;

  prismic.allOfType('recipe', onresponse);

  function onresponse(err, res) {
    if (err) return callback(err, null);

    const recipes = sampleSize(res.filter(filterByCategory, []), freq);
    const ids = recipes.map(recipe => recipe.id);

    connect(self.collection, onconnect);

    function onconnect(err, col) {
      if (err) return callback(err, null);

      const doc = {
        created: Date.now(),
        belongsTo: new ObjectId(user._id),
        recipes: ids
      };

      col.insertOne(doc, oninsert);

      function oninsert(err, res) {
        if (err) return callback(err, null);
        callback(null, Object.assign(doc, {recipes}));
      }
    }

    function filterByCategory(rec) {
      const cat = rec.getLink('recipe.categories');
      return categories.includes(cat.slug);
    }
  }
};

menu.read = function(user, callback) {
  const self = this;
  connect(this.collection, onconnect);

  function onconnect(err, col) {
    if (err) return callback(err, null);
    col.find({belongsTo: user._id}).sort({created: -1}).toArray(onfind);
  }

  function onfind(err, docs) {
    if (err) return callback(err, null);

    // Create the first menu
    if (!docs[0]) {
      return self.create(user, onresponse);
    }

    // Create a new menu if the created date is not in this week
    const userStartOfWeek = user.preferences.startOfWeek;
    const isMenuCurrent = isSameWeek(new Date(docs[0].created), new Date(), {
      weekStartsOn: userStartOfWeek
    });

    if (!isMenuCurrent) {
      return self.create(user, onresponse);
    }

    prismic.getByIds(docs[0].recipes, onresponse);

    function onresponse(err, doc) {
      if (err) return callback(err, null);
      callback(null, Object.assign(docs[0] || {}, doc.recipes ? doc : {recipes: doc}));
    }
  }
};

menu.update = function(user, groceries, callback) {
  const self = this;
  connect(this.collection, onconnect);

  function onconnect(err, col) {
    if (err) return callback(err, null);
    col.find({belongsTo: user._id}).sort({created: -1}).limit(1).next(onfind);

    function onfind(err, doc) {
      if (err) return callback(err, null);
      col.updateOne({_id: doc._id}, {$set: {groceries}}, onresult);
    }

    function onresult(err, result) {
      if (err) return callback(err, null);
      col.find({belongsTo: user._id}).sort({created: -1}).limit(1).next(callback);
    }
  }
};

module.exports = menu;
