const Recipes = require ('../models/Recipes')
const Chefs = require('../models/Chefs')
const File = require('../models/File')
const RecipeAndFiles = require('../models/RecipeAndFiles')

module.exports = {
  async index (req, res) {
    let files = []
    let chefs = []
    let results = await Recipes.all()
    const recipes = results.rows
    
    results = recipes.map(recipe => Chefs.find(recipe.chef_id))
    const promiseChefs = await Promise.all(results)

    promiseChefs.map(chef => chef.rows.map(infoOfChef => chefs.push(infoOfChef)))

    results = recipes.map(recipe => RecipeAndFiles.findRecipeId(recipe.id))
    const promiseRecipeAndFiles = await Promise.all(results)

    for (file of promiseRecipeAndFiles) {
      results = await File.findFileForId(file.rows[0].file_id)
      files.push(results.rows[0])
    }
    
    files.map(file => file.src = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
    
    let newRecipes = []
    for (i=0; i<=5; i++) {
      if(files[i]){
        recipes[i] = {
          ...recipes[i],
          path: files[i].path,
          src: files[i].src,
          chef_name: chefs[i].name
        }
        newRecipes.push(recipes[i])
      }
    }
    
    return res.render("user/index", {recipes: newRecipes})
  },
  about (req, res) {
    return res.render("user/about")
  },
  async recipes (req, res) {

    let files = []
    let chefs = []
    let results = await Recipes.all()
    const recipes = results.rows
    
    results = recipes.map(recipe => Chefs.find(recipe.chef_id))
    const promiseChefs = await Promise.all(results)

    promiseChefs.map(chef => chef.rows.map(infoOfChef => chefs.push(infoOfChef)))

    results = recipes.map(recipe => RecipeAndFiles.findRecipeId(recipe.id))
    const promiseRecipeAndFiles = await Promise.all(results)

    for (file of promiseRecipeAndFiles) {
      results = await File.findFileForId(file.rows[0].file_id)
      files.push(results.rows[0])
    }
    
    files.map(file => file.src = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
    
    for(index in recipes) {
      recipes[index] = {
        ...recipes[index],
        path: files[index].path,
        src: files[index].src,
        chef_name: chefs[index].name
      }
    }
    // let {filter} = req.query
    // if (filter) {
    //   Recipes.findBy(filter, recipes => {
    //     return res.render("user/results", {results})
    //   })
    // } else if(!filter) {
    //   Recipes.all(recipes => {
      //   })
      // }
          return res.render("user/recipes", {recipes})
  },
  chefs(req, res) {
    Chefs.all(chefs => {
        return res.render("user/chefs", {chefs})
    })
  },
  search (req, res) {
    let {filter} = req.query
    if (!filter) {
      return res.render("user/nofound")
    } else {
      Recipes.findBy(filter, recipes => {
        return res.render("user/results", {recipes, filter})
      })
    }
  },
  show (req, res) {
    Recipes.find(req.params.id, recipe => {
      return res.render("user/show", {recipe})
    })
  }
}