const db = require("../db/db.js").connection;

//Getting all movies
const getAllMovies = (req, res) => {
    const sql="";
  db.query("select * from movies", (error, movies, fields) => {
    if (error) {
      res.status(500).json({ error: "server error" });
    }
    res.status(200).json(movies);
  });

  db.end();
};
module.exports = { getAllMovies };
