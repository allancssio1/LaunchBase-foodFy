const {date} = require('../lib/utils')
const db = require('../../config/db')

module.exports = {
  all() {
    return db.query (`SELECT chefs.*,
      count(recipes) AS total_recipes FROM chefs
      LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
      GROUP BY chefs.id`
    )
  },
  find (id) {
    try {
      return db.query(`SELECT * FROM chefs WHERE id = $1`, [id])

    } catch (error) {
      console.error(error)
    }

    //
    // return db.query (
    //   `SELECT chefs.*,
    //   count(recipes) AS total_recipes FROM chefs
    //   LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
    //   WHERE chefs.id = $1
    //   GROUP BY chefs.id
    //   `, [id]
    // )
  },
  findRecipe(chef_id, callback) {
    db.query (`SELECT recipes.* FROM recipes WHERE recipes.chef_id=$1`, [chef_id.id],
      (err, results) => {
        if (err) throw `Database error ${err}`
        callback(results.rows)
      }
    )
  },
  create ({name, file_id}) {
    const query = `INSERT INTO chefs (name, file_id, created_at) VALUES ($1, $2, $3) RETURNING id`

    const values = [name, file_id, date(Date.now()).iso]
    
    return db.query(query, values)
  },
  update (data, callback) {
    const query = `UPDATE chefs SET name=($1), avatar_url=($2) WHERE id=$3`
    const values = [data.name, data.avatar_url, data.id]
    db.query(query, values,
      (err, results) =>  {
        if (err) throw `Database error ${err}`
        callback()
      }
    )
  },
  delete (id, callback) {
    db.query(`DELETE FROM chefs WHERE id=$1`, [id],
      (err, results) => {
        if (err) throw `Database error ${err}`
        callback()
      }
    )
  }
}