const Chefs = require('../models/Chefs')
const File = require('../models/File')
const RecipeAndFiles = require('../models/RecipeAndFiles')
const Recipes = require('../models/Recipes')

module.exports = {
  async index (req, res) {
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

    return res.render("admin/chefs/index", {chefs, files})
  },
  create (req, res) {
    return res.render("admin/chefs/create")
  },
  async post (req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body.name == "") {
        return res.send("Preencha todos os dados")
      }
    }

    if(!req.file) {
      return res.send("Enviar ao menos uma imagem!")
    }

    let result = await File.create({
      ...req.file,
      path: req.file.path.replace(/\\/g, "/")
    })
    const idFile = result
    
    result = await Chefs.create({...req.body, file_id: idFile })
    const chef = result.rows[0].id
    
    return res.redirect(`/admin/chefs/${chef}`)
  },
  async show (req, res) {
    let result = await Chefs.find(req.params.id)
    const chef = result.rows[0]
    
    if(!chef) {
      return res.send("Chefe não encontrado!")
    }
    
    result = await File.findFileForId(chef.file_id)
    let fileChef = result.rows[0]
    fileChef.src = `${req.protocol}://${req.headers.host}${fileChef.path.replace("public", "")}`
    
    result = await Recipes.findRecipeForChef(chef.id)
    let recipes = result.rows
    
    if(recipes.length == 0) {
      return res.render("admin/chefs/details", { chef, fileChef, recipes })
    }

    if(recipes) {
      result = await RecipeAndFiles.findRecipeId(recipes[0].id)
      let fileIdFromRecipe = result.rows[0].file_id

      result = await File.findFileForId(fileIdFromRecipe)
      let fileRecipe = result.rows[0]
      fileRecipe.src = `${req.protocol}://${req.headers.host}${fileRecipe.path.replace("public", "")}`
      
      return res.render("admin/chefs/details", { chef, recipes, fileChef, fileRecipe})
    }

  },
  async edit (req, res) {
    let result = await Chefs.find(req.params.id)
    const chef = result.rows[0]

    result = await File.findFileForId(chef.file_id)
    const files = result.rows

    return res.render("admin/chefs/edit", {chef, files})
  },
  async put (req, res) {
    if (req.body.name == ""){
      res.send('Preencha todos os dados')
    }
    
    let result = await Chefs.find(req.body.id)
    const chef = result.rows[0]

    if(!req.file) {
      await Chefs.update(chef)
      
      return res.redirect(`/admin/chefs/${req.body.id}`)
    }
    
    result = await File.create({
      ...req.file,
      path: req.file.path.replace(/\\/g, "/")
    })
    const idFile = result
    
    await Chefs.update({...req.body, file_id: idFile})
    
    await File.delete(chef.file_id)

    return res.redirect(`/admin/chefs/${req.body.id}`)
  },
  async delete (req, res) {
    return res.send("deletar")

    // return res.redirect(`/admin/chefs`)
  }
}