const Recipes = require('../models/Recipes')
const File = require('../models/File')
const Chefs = require('../models/Chefs')
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
    
    for(index in recipes) {
      recipes[index] = {
        ...recipes[index],
        path: files[index].path,
        src: files[index].src,
        chef_name: chefs[index].name
      }
    }

    return res.render('admin/recipes/index', {recipes})
    
  },
  async create (req, res) {
    let result = await Recipes.selectChefs()
    const chefOptions = result.rows
    return res.render('admin/recipes/create', { chefOptions })
  },
  async post (req, res) {
    if (req.body.title == "") {
      return res.send('Você precisa dar um nome para receita!')
    }

    if(req.files.length == 0)
      return res.send("Enviar ao menos uma imagem!")

    let result = await Recipes.create(req.body)
    const recipeId = result.rows[0].id
    
    let filesPromise = req.files.map(file => File.create({ ...file, recipe_id: recipeId }))
    await Promise.all(filesPromise)

    return res.redirect(`/admin/recipes/${recipeId}`)
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
    
    return res.render('admin/recipes/show', { recipe, files })
  },
  async edit (req, res) {
    let results = await Recipes.find(req.params.id)
    const recipe = results.rows[0]
    
    results = await Chefs.all()
    const chefOptions = results.rows

    results = await RecipeAndFiles.findRecipeId(recipe.id)
    const filesId = results.rows.map(file => {
      return File.findFileForId(file.file_id)
    })
    await Promise.all(filesId)
    
    const filesPromise = await Promise.all(filesId)
    const files = filesPromise.map(file => ({
      ...file.rows['0'],
      src: `${req.protocol}://${req.headers.host}${file.rows['0'].path.replace("public", "")}`
    }))
    return res.render('admin/recipes/edit', { recipe, chefOptions, files })
  },
  async put (req, res) {
    const keys = Object.keys(req.body)
    for(key of keys) {
      if (req.body.title == "" && key != "removed_files") {
        return res.send('Você precisa dar um nome e enviar ao menos uma imagem.')
      }
    }

    const oldFiles = await RecipeAndFiles.findRecipeId(req.body.id)

    if (
      (req.body.removed_files.length/4) >= oldFiles.rows.length 
      &&
      req.files == ""
    ){
      return res.send("Enviar ao menos uma imagem!")
    }

    if(req.body.removed_files) {
      const removedFiles = req.body.removed_files.split(',')
      
      const lastIndex = removedFiles.length - 1
      removedFiles.splice(lastIndex, 1)
      
      const removedFilesPromisse = removedFiles.map(id => File.delete(id))
      await Promise.all(removedFilesPromisse)
    }
      
    if(req.files.length != 0) {
      const totalFiles = oldFiles.rows.length + req.files.length
      

      if (totalFiles <= 5) {
        const newFilesPromese = req.files.map(file => {
          File.create({...file, recipe_id: req.body.id})
        })
        await Promise.all(newFilesPromese)
      }
    }

    await Recipes.update(req.body)

    return res.redirect(`/admin/recipes/${req.body.id}`)
  },
  delete (req, res) {
    Recipes.delete(req.body.id, () => {
      return res.redirect ('/admin/recipes')
    })
  }
}