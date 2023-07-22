var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const e = require("express");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = [];
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe ids into array
    for(const recipe_id of recipes_id_array){
      const recipe = await recipe_utils.getRecipesPreview(recipe_id,user_id);
      favorite_recipes.push(recipe);
    }
    res.status(200).send(favorite_recipes);
  } catch(error){
    next(error); 
  }
});

/**
 * This path get body with paramaterts and create new recipe
 */
router.post("/CreateRecipe", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let recipe_details = {
      user_id: req.session.user_id,
      title: req.body.title,
      instruction: req.body.instruction,
      popularity: 0,
      portion: req.body.portion,
      preparation_time: req.body.preparation_time,
      ingredients: req.body.ingredients,
      vegan: req.body.vegan,
      gluten_free: req.body.gluten_free,
      image: req.body.image,
      vegetarian: req.body.vegetarian,
      favorite: req.body.favorite,
    }
  
    let vegan,gluten_free,vegetarian,favorite;
    if(recipe_details.vegetarian===false){
      vegetarian=0;
    }
    else{ vegetarian=1;}
    if (recipe_details.vegan===false){
      vegan=0;
    }
    else{ vegan=1;}
    if (recipe_details.gluten_free===false){
      gluten_free=0;
    }
    else{ gluten_free=1;}
      
    let recipe_id = 0;
    await DButils.execQuery(
      `INSERT INTO recipes VALUES ('${recipe_id}','${recipe_details.user_id}','${recipe_details.title}', '${recipe_details.instruction}',
      '${recipe_details.popularity}', '${recipe_details.portion}', '${recipe_details.preparation_time}','${recipe_details.ingredients}','${vegan}', '${gluten_free}','${recipe_details.image}','${vegetarian}')`
    );
    if(recipe_details.favorite===true){
      recipe_id = await DButils.execQuery(`SELECT recipeId FROM recipes ORDER BY recipeId DESC LIMIT 1;`);
      const lastRecipeId = recipe_id[0].recipeId;
      user_utils.markAsFavorite(recipe_details.user_id,lastRecipeId);
    }
    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});
/**
 * This path return the last 3 recipes that were saved as last viewed.
 * */
router.get("/get_last_viewed", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.get_last_viewed(user_id);
    let recipes_id_array = [];
  
    recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe ids into array
    const results = [];
    for(const id of recipes_id_array){
      const recipe = await recipe_utils.getRecipesPreview(id,user_id);
      if(recipe instanceof Error){
        next(recipe)
      }
      results.push(recipe);
    }
    
    res.status(200).send(results);
  }
  catch (error) {
    console.log("error in get_last_viewed", error);
    next(error);
  }
    
});
/**
 * This path get body with recipe_id and save this recipe as viewed
 */
router.post("/add_to_viewed", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.body.id;
    await user_utils.add_to_viewed(user_id, recipe_id);
    res.status(200).send("The Recipe successfully saved as viewed");
  } catch (error) {
    next(error);
  }
});
/**
 * This path return the family recipes of the logged-in user
 */
router.get("/get_family_recipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const familyRecipes = await user_utils.family_recipes(user_id);
    
    let unit_recipes = [];
    for(const recipe of familyRecipes){
      let r = await recipe_utils.getRecipeDetails(recipe.recipeId,user_id);
      r.owner = recipe.owner;
      r.appointed_time = recipe.appointed_time;
      unit_recipes.push(r);
    }
    
    res.status(200).send(unit_recipes);
  } catch (error) {
    next(error);
  }
});
/**
 * This path return the recipes of the logged-in user
 */
router.get("/MyRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await DButils.execQuery(
      `SELECT * FROM recipes WHERE user_id = ${user_id}`
    ); 
    
    let fullRecipes = [];
    for(const recipe of recipes ){
      fullRecipes.push(await recipe_utils.getRecipeDetails(recipe.recipeId,user_id));
    }

    console.log("My recipes: ",fullRecipes)
    res.status(200).send(fullRecipes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
