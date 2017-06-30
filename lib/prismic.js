/* eslint curly: 0, space-before-function-paren: 0 */
const debug = require('debug')('prismic');
const Prismic = require('prismic.io');

const prismic = {
  endpoint: `${process.env.LC_PRISMIC_ENDPOINT}?access_token=${process.env
    .LC_PRISMIC_ACCESS_TOKEN}`,
  options: {
    lang: 'en-us',
    pageSize: 50
  }
};

prismic.connect = function(callback) {
  Prismic.api(this.endpoint, onresponse);

  function onresponse(err, api) {
    if (err) return callback(err, null);
    callback(null, api);
  }
};

prismic.allOfType = function(type, callback) {
  const self = this;
  self.connect(onconnect);

  function onconnect(err, api) {
    if (err) return callback(err, null);

    api.query(
      Prismic.Predicates.at('document.type', type),
      self.options,
      onresponse
    );
  }

  function onresponse(err, response) {
    if (err) return callback(err, null);
    callback(null, response.results);
  }
};

prismic.getByIds = function(ids, callback) {
  if (!ids) {
    callback(new Error('ids is undefined.'), null);
  }

  const self = this;
  self.connect(onconnect);

  function onconnect(err, api) {
    if (err) return callback(err, null);

    api.query(
      Prismic.Predicates.in('document.id', ids),
      self.options,
      onresponse
    );
  }

  function onresponse(err, response) {
    if (err) return callback(err, null);
    callback(null, response.results);
  }
};

prismic.getByUID = function(docType, uid, callback) {
  const self = this;
  self.connect(onconnect);

  function onconnect(err, api) {
    if (err) return callback(err, null);
    api.query(
      Prismic.Predicates.at(`my.${docType}.uid`, uid),
      self.options,
      ondoc
    );
  }

  function ondoc(err, doc) {
    if (err) return callback(err, null);
    callback(null, doc.results[0]);
  }
};

module.exports = prismic;
