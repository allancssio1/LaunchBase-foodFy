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

    return res.render("user/recipes", {recipes})
  },
  async chefs(req, res) {
    let files = []
    let result = await Chefs.all()
    const chefs = result.rows

    result = chefs.map(async chef => await File.findFileForId(chef.file_id))
    
    let file = await Promise.all(result)
    file.map(newFile => newFile.rows.map(rows => files.push(rows)))
    files.map(file => file.src = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
    
    for (chef in chefs) {
      chefs[chef] = {
        ...chefs[chef],
        path: files[chef].path,
        src: files[chef].src
      }
    }

    return res.render("user/chefs", {chefs, files})
  },
  async search (req, res) {
    let {filter} = req.query

    if(!filter) {
      return res.render("user/nofound")
    }

    if(filter) {
      
      let results = await Recipes.filter(filter)
      const recipes = await Promise.all(results.rows) 

      if(recipes == "") {
        return res.render('user/nofound')
      }

      results = recipes.map(recipe => RecipeAndFiles.findRecipeId(recipe.id))
      const filesPromise = await Promise.all(results)
      const tableRecipeAndFiles = filesPromise.map(filePromise => filePromise.rows[0])

      results = tableRecipeAndFiles.map(unicRecipeAndFile => File.findFileForId(unicRecipeAndFile.file_id))
      let files = await Promise.all(results)
      files = files.map(file => file.rows[0])
      
      for (index in recipes) {
        recipes[index] ={
          ...recipes[index],
          src: `${req.protocol}://${req.headers.host}${files[index].path.replace("public", "")}`,
          path: files[index].path
        }
      }

      return res.render("user/results", {recipes})
    }
  },
  async show (req, res) {
    let result = await Recipes.find(req.params.id) 
    const recipe = result.rows[0]
      
    if (!recipe) 
      return res.render('user/nofound')

    result = await RecipeAndFiles.findRecipeId(recipe.id)

    const getFilesPromise = result.rows.map(file => {
      return File.findFileForId(file.file_id)
    } )

    const filesPromise = await Promise.all(getFilesPromise)
    const files = filesPromise.map(file => ({
      ...file.rows,
      src: `${req.protocol}://${req.headers.host}${file.rows['0'].path.replace("public", "")}`
    }))

    return res.render('user/show', { recipe, files })
  }
}