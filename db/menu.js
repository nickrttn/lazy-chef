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
  const {frequency: freq, categories} = user.preferences;
  const self = this;

  prismic.allOfType('recipe', onresponse);

  function onresponse(err, res) {
    if (err) return callback(err, null);

    const recipes = sampleSize(res.filter(filterByCategory, []), freq);
    const ids = recipes.map(recipe => recipe.id);

    connect(self.collection, onconnect);

    function onconnect(err, col) {
      if (err) return callback(err, null);

      col.insertOne(
        {
          created: Date.now(),
          belongsTo: new ObjectId(user._id),
          recipes: ids
        },
        oninsert
      );

      function oninsert(err, res) {
        if (err) return callback(err, null);
        callback(null, recipes);
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

    const latestMenu = docs[0];

    // Create the first menu
    if (!latestMenu) {
      return self.create(user, oncreate);
    }

    const userStartOfWeek = user.preferences.startOfWeek;
    const isMenuCurrent = isSameWeek(new Date(latestMenu.created), new Date(), {
      weekStartsOn: userStartOfWeek
    });

    // Create a new menu if the created date is not in this week
    if (!isMenuCurrent) {
      return self.create(user.oncreate);
    }

    prismic.getByIds(latestMenu.recipes, onresponse);

    function onresponse(err, recipes) {
      if (err) return callback(err, null);
      callback(null, recipes);
    }

    function oncreate(err, recipes) {
      if (err) return callback(err, null);
      callback(null, recipes);
    }
  }
};

// class Menu {
//   constructor() {
//     this.db = undefined;
//     this.collection = undefined;
//   }

//   async _connect() {
//     if (!this.db) {
//       this.db = await MongoClient.connect(process.env.LC_DB_URL);
//       this.collection = await this.db.collection('menus');
//     }
//   }

//   async read(user) {
//     try {
//       this._connect();

//       let userMenus = await this.collection
//         .find({
//           belongsTo: new ObjectId(user._id)
//         })
//         .toArray();

//       debug(user._id, userMenus);

//       // This happens if there are no menu's yet
//       if (!userMenus.length) {
//         debug('nothing yet');
//         userMenus = await this.create(user);
//       }

//       // is created + 7 days < date.now()?
//       // we need to create a new menu

//       return userMenus;
//     } catch (err) {
//       return new Error(err);
//     }
//   }

//   async create(user) {
//     try {
//       this._connect();
//       debug(this.collection);

//       const preferred = user.preferences.categories;
//       const recipes = await p.allRecipes().then(recipes =>
//         recipes.filter(r => {
//           const cat = r.getLink('recipe.categories');
//           return preferred.includes(cat.document.slug);
//         })
//       );

//       debug(user._id);

//       const newMenu = await this.collection.insertOne({
//         created: Date.now(),
//         belongsTo: new ObjectId(user._id),
//         recipes: sampleSize(recipes, user.preferences.frequency)
//       });

//       return this.read(user);
//     } catch (err) {
//       return new Error(err);
//     }
//   }
// }

module.exports = menu;
