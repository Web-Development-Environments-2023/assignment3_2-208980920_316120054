var express = require("express");
const cookie = require("cookie");

var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("I'm here"));


/**
 * This path returns a full details of a recipe by its id
 */

router.get("/Random", async (req, res, next) => {
  try {
    let recipes = await recipes_utils.getRecipeRandom();
    let user_id = req.session.user_id;
    recipes = recipes.data.recipes;
    const recipes_ids = recipes.map((recipe) => {
      return {
        id: recipe.id,
      };
    });
    let recipes_ans = [];
    for(const recipe of recipes_ids){
      const rec = await recipes_utils.getRecipesPreview(recipe.id, user_id);
      recipes_ans.push(rec);
    }
    res.status(200).send(recipes_ans);
    
  } catch (error) {
    next(error);
  }
});




/**
 * This path returns the last search of the logged-in user
 */
router.get("/last-search", (req, res) => {
  try{
  // Retrieve the list from cookies
  const lastSearch = JSON.parse(req.cookies.lastSearch || "[]");

  // Send the list to the client
  res.send(lastSearch);
  }
  catch{
    res.send("[]");
  }
});
/**
 * This path returns the recipes that match the search query according to the filters and update the last search.
 */
router.get("/search", async (req, res, next) => {
  try { 
    const query = req.body.query;
    const diet = req.body.diet;
    const cuisine = req.body.cuisine;
    const intolerances = req.body.intolerances;
   
    // Update the list of last searches
    recipes_utils.updateLastSearches(query, res);
    let recipes = await recipes_utils.searchRecipes(query, diet, cuisine, intolerances);
    recipes = recipes.data.results;
    const user_id = req.session.user_id;
    const recipes_ids = recipes.map((recipe) => {
      return {
        id: recipe.id,
      };
    });
    let recipes_ans = [];
    for(const recipe of recipes_ids){
      recipes_ans.push(await recipes_utils.getRecipeDetails(recipe.id,user_id));
    }
    res.status(200).send(recipes_ans);
    
  } catch (error) {
    next(error);
  }
});
/**
 * This path returns the recipe details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const id = req.params.recipeId 
    const user_id = req.session.user_id;
    const recipe = await recipes_utils.getRecipeDetails(id,user_id);
    res.send(recipe);
    
  } catch (error) {
    next(error);
  }

});
module.exports = router;
