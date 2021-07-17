const express = require('express')
const routes = express.Router()
const multer = require('./app/middleware/multer')
const recipes = require('./app/controllers/recipes')
const user = require('./app/controllers/user')
const chefs = require('./app/controllers/chefs')


routes.get("/admin/recipes", recipes.index) 
routes.get("/admin/recipes/create", recipes.create)
routes.get("/admin/recipes/:id", recipes.show)
routes.get("/admin/recipes/:id/edit", recipes.edit)
routes.post("/admin/recipes", multer.array('photos', 5), recipes.post)
routes.put("/admin/recipes", multer.array('photos', 5), recipes.put)
routes.delete("/admin/recipes", recipes.delete)

routes.get("/admin/chefs", chefs.index) 
routes.get("/admin/chefs/create", chefs.create)
routes.get("/admin/chefs/:id", chefs.show)
routes.get("/admin/chefs/:id/edit", chefs.edit)
routes.post("/admin/chefs", multer.single('avatar', 1), chefs.post)
routes.put("/admin/chefs", multer.single('avatar', 1), chefs.put)
routes.delete("/admin/chefs", chefs.delete)

routes.get('/', user.index)
routes.get("/about", user.about)
routes.get("/recipes", user.recipes)
routes.get("/chefs", user.chefs)
routes.get("/recipes/search", user.search)
routes.get("/recipes/:id", user.show)
routes.get("/chef/:id", user.showChef)

module.exports = routes