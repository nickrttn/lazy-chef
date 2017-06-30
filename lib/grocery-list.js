/* eslint curly: 0 */
const debug = require('debug')('shopping');
const request = require('request');
const plur = require('plur');

const menu = require('../db/menu');
const prismic = require('../lib/prismic');
const ingredientData = require('./ingredient-data');

module.exports = function (user, callback) {
  menu.read(user, onmenu);

  const {servings: userServings} = user.preferences;

  function onmenu(err, menu) {
    if (err) return callback(err, null);

    const recipeData = extractRecipeData(menu.recipes);
    prismic.getByIds(getComponentIds(recipeData), oncomponents);

    function oncomponents(err, components) {
      if (err) return callback(err, null);

      const ingredients = extractIngredients(components, recipeData, userServings);
      convertAmounts(ingredients, mergeIngredients);

      function mergeIngredients(ingredients) {
        const key = 'ingredient';
        callback(null, ingredients.reduce((acc, obj) => {
          const idx = acc.findIndex(it => it[key] === obj[key]);

          if (idx === -1) {
            acc.push(obj);
          } else {
            acc[idx].amount += obj.amount;
          }

          return acc;
        }, []));
      }
    }
  }
};

function extractRecipeData(recipes) {
  return recipes.reduce((acc, obj) => {
    return acc.concat({
      serves: Number(obj.getText('recipe.serves')),
      ids: obj.getGroup('recipe.ingredients').toArray().map(list => {
        return list.getLink('component').id;
      })
    });
  }, []);
}

function getComponentIds(arr) {
  return arr.reduce((acc, obj) => {
    return acc.concat(obj.ids);
  }, []);
}

function extractIngredients(components, recipeData, userServings) {
  return components.reduce((acc, obj) => {
    const serves = recipeData.find(d => d.ids.includes(obj.id)).serves;
    return acc.concat(obj.getGroup('ingredients.ingredients').toArray().map(igde => ({
      amount: (Number(igde.getText('amount')) / serves) * Number(userServings),
      unit: igde.getText('unit'),
      ingredient: igde.getText('ingredient')
    })));
  }, []);
}

function convertAmounts(ingredients, callback) {
  const converted = [];
  const options = {
    url: `${process.env.LC_SPOONACULAR_ENDPOINT}/recipes/convert`,
    json: true,
    headers: {
      'X-Mashape-Key': process.env.LC_SPOONACULAR_ACCESS_TOKEN,
      Accept: 'application/json'
    }
  };

  ingredients.forEach(igde => {
    if (igde.unit === 'can') {
      return converted.push(igde);
    }

    request(Object.assign(options, {qs: {
      ingredientName: igde.ingredient,
      sourceAmount: Number(igde.amount),
      sourceUnit: unitToShort(igde.unit),
      targetUnit: convertTo(igde.ingredient)
    }}), (err, res, body) => {
      if (err) return debug(err);
      if (body.type && body.type === 'CONVERSION') {
        converted.push(Object.assign(igde, {
          amount: body.targetAmount,
          unit: body.targetUnit
        }));
      }

      if (converted.length === ingredients.length) {
        callback(converted);
      }
    });
  });
}

function convertTo(igde) {
  const type = Object.keys(ingredientData).reduce((acc, key) => {
    ingredientData[key].forEach(str => {
      if (igde.includes(str)) {
        acc = key;
      }
    });

    return acc;
  }, '');

  switch (type) {
    case 'liquid': return 'ml';
    case 'solid': return 'g';
    case 'piece': return 'piece';
    default: return 'g';
  }
}

function unitToShort(unit) {
  switch (unit) {
    case 'tablespoon': return 'tbsp';
    case 'teaspoon': return 'tsp';
    case 'can': return 'can';
    case 'cup': return 'cup';
    case 'gram': return 'g';
    case 'kilo': return 'kg';
    case 'milliliter': return 'ml';
    case 'liter': return 'l';
    case 'none': return 'piece';
    default: return '';
  }
}
