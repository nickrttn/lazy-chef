/* eslint method-shorthand: 0 */
const debug = require('debug')('prismic');
const prismic = require('prismic.io');

class Prismic {
  constructor() {
    this.options = {lang: 'en-us', pageSize: 50};
    this.api = undefined;
  }

  async _connect() {
    if (!this.api) {
      this.api = await prismic.api(process.env.LC_API_ENDPOINT, {accessToken: process.env.LC_API_ACCESS_TOKEN});
    }
  }

  async allRecipes() {
    await this._connect();

    const response = await this.api.query(
      prismic.Predicates.at('document.type', 'recipe'),
      this.options
    );

    return response.results;
  }

  async recipes(categories) {
    await this._connect();

    const response = await this.api.query([
      prismic.Predicates.at('document.type', 'recipe')
    ],
      this.options
    );

    return response.results;
  }

  async recipe(slug) {
    await this._connect();

    const response = await this.api.query(
      prismic.Predicates.at('my.recipe.uid', slug),
      this.options
    );

    return response.results[0];
  }

  async allCategories() {
    await this._connect();

    const response = await this.api.query(
      prismic.Predicates.at('document.type', 'category'),
      this.options
    );

    return response.results;
  }

  async category(id) {
    await this._connect();

    const response = await this.api.getByID(id);
    return response;
  }
}

module.exports = Prismic;
