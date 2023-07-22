const DButils = require("./DButils");

/**
 * Insert the recipe to the favorite recipes table in the DB
 */
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}
/**
 * Returns all the favorits recipes of the user
 
 */
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getViewedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from viewed_recipes where user_id='${user_id}'`);
    return recipes_id;
}
/**
 * Adds the recipe to the viewed recipes table in the DB
 */
async function add_to_viewed(user_id, recipe_id) {
    const query = `SELECT * FROM viewed_recipes WHERE recipeId=${recipe_id} AND user_id = ${user_id}`;
    try{
    const existingRecord = await DButils.execQuery(query);
    if (existingRecord.length === 0) {
        await DButils.execQuery(`INSERT INTO viewed_recipes VALUES (${recipe_id},${user_id},default)`);
    }
    else{
        await DButils.execQuery(`Update viewed_recipes SET date=NOW() WHERE recipeId=${recipe_id} AND user_id = ${user_id}`)

    }
  }
    catch(error){
        console.log("error in add_to_viewed");
    }
}
  
/**
 * 
    * Returns the last 3 recipes that were saved as last viewed of the logged-in user
 */
async function get_last_viewed(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from viewed_recipes where user_id='${user_id}' ORDER BY date DESC LIMIT 3`);
    return recipes_id;
}
/**
 *  Returns the family recipes of the logged-in user
 */
async function family_recipes(user_id){
    const familyRecipes = await DButils.execQuery(`select * from family_recipes where user_id='${user_id}'`);

    return familyRecipes;
}


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.add_to_viewed = add_to_viewed;
exports.get_last_viewed = get_last_viewed;
exports.family_recipes = family_recipes;
exports.getViewedRecipes = getViewedRecipes;
