const db = require('../../config/db')
const {date} = require('../lib/utils')

module.exports = {
  all () {
    return db.query(`
      SELECT * FROM recipes
      ORDER BY recipes.created_at DESC
      `)
  },
  filter(filter) {
    try {
      return db.query(`
        SELECT recipes.*,
        chefs.name AS chef_name FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        WHERE recipes.title ILIKE '%${filter}%'`  
      )
    } catch (err) {
      console.error(err)
    }
  },
  find(id) {
    return db.query(`
      SELECT recipes.*, chefs.name AS chef_name FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      WHERE recipes.id = $1
    `, [id]
    )
  },
  findRecipeForChef(id) {
    try {
      return db.query(`SELECT * FROM recipes WHERE recipes.chef_id = $1`, [id])

    } catch (error) {
      console.log(error)
    }
  },
  create(data) {
    const query = `
      INSERT INTO recipes (
        title,
        ingredients,
        preparation,
        information,
        chef_id,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`
    const values = [
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.chef,
      date(Date.now()).iso
    ]
    return db.query(query, values)
  },
  selectChefs () {
    return db.query(`SELECT name, id FROM chefs`)
  },
  update (data) {
    try {
      const query = `
      UPDATE recipes SET 
        title=($1),
        ingredients=($2),
        preparation=($3),
        information=($4),
        chef_id=($5)
      WHERE id=$6
      `
  
      const values = [
        data.title,
        data.ingredients,
        data.preparation,
        data.information,
        data.chef,
        data.id
      ]
  
      return db.query (query, values)

    } catch (err) {
      console.error(err)     
    }

  },
  delete (id) {
    
    let query = `DELETE FROM recipes WHERE id=$1`
    let value = [id]


    return db.query (query, value)
  }
}