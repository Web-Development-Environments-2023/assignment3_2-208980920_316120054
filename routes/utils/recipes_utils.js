const axios = require("axios");
const e = require("express");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");





/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */

/**
 * Get recipes list from Spooncular respone according to the search query and the filters.
 */
async function searchRecipes(query,diet,cuisine,intolerances) {
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query,
            number: 1, //  in client side will decide if it is 5/10/15 recipes according to his choice
            cuisine:cuisine,
            diet:diet,
            intolerances:intolerances,
            apiKey: process.env.spooncular_apiKey
        }
    });
}
/**
 * Get recipe information from Spooncular respone according to the recipe id.
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}
/**
 * 
 * @returns 3 random recipes from spooncular
 */
async function getRecipeRandom() {
    return await axios.get(`${api_domain}/random`,{
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    
}


/**
    * Get recipe information from Spooncular respone according to the recipe id.
 */
async function getRecipesPreview(recipe_id,user_id) {
    
    try{
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
        let existbool;
        let favorite_bool;
        if (user_id == undefined){
             existbool = false;
             favorite_bool = false;
        }
        else{
            const exist = await DButils.execQuery(
                `SELECT EXISTS (
                    SELECT 1
                    FROM viewed_recipes
                    WHERE recipeId = ${recipe_id} AND user_id = ${user_id}
                );`
            );
            const favorite = await DButils.execQuery(
                `SELECT EXISTS (
                    SELECT 1
                    FROM favoriterecipes
                    WHERE recipeId = ${recipe_id} AND user_id = ${user_id}
                );`
            );
             existbool = Object.values(exist[0])[0] === 1;
             favorite_bool = Object.values(favorite[0])[0] === 1;
        }
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            viewed: existbool,
            favorite: favorite_bool
        }
    }
    catch(error){
        return error;
    }

}
async function getRecipeDetails(recipe_id,user_id) {
    
    try{
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, servings, instructions,extendedIngredients } = recipe_info.data;
        let existbool;
        let favorite_bool;
        let ingredients = {};
        for (let i = 0; i < extendedIngredients.length; i++) {
            ingredients[extendedIngredients[i].name] = extendedIngredients[i].amount + " " + extendedIngredients[i].unit;
        }
        if (user_id == undefined){
             existbool = false;
             favorite_bool = false;
        }
        else{
            const exist = await DButils.execQuery(
                `SELECT EXISTS (
                    SELECT 1
                    FROM viewed_recipes
                    WHERE recipeId = ${recipe_id} AND user_id = ${user_id}
                );`
            );
            const favorite = await DButils.execQuery(
                `SELECT EXISTS (
                    SELECT 1
                    FROM favoriterecipes
                    WHERE recipeId = ${recipe_id} AND user_id = ${user_id}
                );`
            );
             existbool = Object.values(exist[0])[0] === 1;
             favorite_bool = Object.values(favorite[0])[0] === 1;
        }
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            viewed: existbool,
            favorite: favorite_bool,
            servings: servings,
            instructions: instructions,
            ingredients: ingredients
        }
    }
    catch(error){
        return error;
    }

}
/**
 * Update the last search of the logged-in user
 */
function updateLastSearches(searchTerm, res) {
    // Retrieve the existing list from cookies
    let lastSearches = [];
    try{
    if (res.cookies.lastSearch) {
      lastSearches = JSON.parse(res.cookies.lastSearch);
    }
  }
  catch{
    res.cookie("lastSearch", JSON.stringify(searchTerm), { maxAge: 86400000 }); // Set cookie expiry to 1 day
  }
    // Add the latest search to the list
    lastSearches.push(searchTerm);
  
    // Limit the list to a certain number of entries
    const maxEntries = 1;
    if (lastSearches.length > maxEntries) {
      lastSearches = lastSearches.slice(-maxEntries);
    }
  
    // Save the updated list back to cookies
    res.cookie("lastSearch", JSON.stringify(lastSearches), { maxAge: 86400000 }); // Set cookie expiry to 1 day
  } 
/**
   * Get the recipes information that the user created from the DB
*/
async function getMyRecipesDetails(recipe_id) {
    try{
        const recipe = await DButils.execQuery(
        `SELECT * FROM recipes WHERE recipeId = ${recipe_id}`
      );
        if (recipe) {
            return recipe;
          }
          
        }
    catch(error){
        return error;
    }
}
    





exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeRandom = getRecipeRandom;
exports.searchRecipes = searchRecipes;
exports.getMyRecipesDetails = getMyRecipesDetails;
exports.updateLastSearches = updateLastSearches;
exports.getRecipesPreview = getRecipesPreview;


