/* eslint method-shorthand: 0 */
const debug = require('debug')('prismic');
const prismic = require('prismic.io');

class Prismic {
	constructor() {
		this.options = {lang: 'en-us'};
		this.api = null;
	}

	async _connect() {
		return prismic.api(process.env.LC_API_ENDPOINT, {accessToken: process.env.LC_API_ACCESS_TOKEN});
	}

	async allRecipes() {
		if (!this.api) {
			this.api = await this._connect();
		}

		const response = await this.api.query(prismic.Predicates.at('document.type', 'recipe'), this.options);
		return response.results;
	}

	async recipe(slug) {
		if (!this.api) {
			this.api = await this._connect();
		}

		const response = await this.api.query(prismic.Predicates.at('my.recipe.uid', slug), this.options);
		return response.results[0];
	}

	async category(id) {
		if (!this.api) {
			this.api = await this._connect();
		}

		const response = await this.api.getByID(id);
		return response;
	}
}

module.exports = Prismic;
