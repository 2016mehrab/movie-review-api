const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");
const db = require("../db/db.js").connection;
const { Buffer } = require("buffer");

// get all movies
router.get("/", (req, res) => {
  const page = req.query.page;
  const size = req.query.size;
  const offset = (page - 1) * size;
  const limit = size;
  if (req.query.hasOwnProperty("page") && req.query.hasOwnProperty("size")) {
    const sql = `Select * from movies order by release_date desc limit ${limit} offset ${offset};`;
    db.query(sql, (error, movies, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // poster formatting
      movies.forEach((element) => {
        element.poster = element.poster.toString("utf8");
      });
      return res.status(200).json({ success: true, movies: movies });
    });
  } else {
    const sql = `Select * from movies order by release_date desc;`;
    db.query(sql, (error, movies, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: "server error" });
      }
      movies.forEach((element) => {
        element.poster = element.poster.toString("utf8");
      });
      return res.status(200).json({ success: true, movies: movies });
    });
  }
});

// get movies and rating joined. Every insert in the rating table have to be 0 otherwise only movies with rating would show up
router.get("/home", (req, res) => {
  const page = req.query.page;
  const size = req.query.size;
  const offset = (page - 1) * size;
  const limit = size;
  if (req.query.hasOwnProperty("page") && req.query.hasOwnProperty("size")) {
    const sql = `Select M.id,M.title,M.poster, M.synopsis, M.release_date, R.rating from rating R inner JOIN movies M on M.id=R.MID order by M.release_date desc limit ${limit} offset ${offset};`;
    db.query(sql, (error, movies, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // poster formatting
      movies.forEach((element) => {
        element.poster = element.poster.toString("utf8");
      });
      return res.status(200).json({ success: true, movies: movies });
    });
  } else {
    const sql = `Select M.id,M.title,M.poster, M.synopsis, M.release_date, R.rating from rating R inner JOIN movies M on M.id=R.MID order by release_date desc;`;
    db.query(sql, (error, movies, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: "server error" });
      }
      movies.forEach((element) => {
        element.poster = element.poster.toString("utf8");
        // element.poster= btoa(element.poster);

        // console.log(element.poster);
      });
      return res.status(200).json({ success: true, movies: movies });
    });
  }
});

// movie profile (without comment, rating, cast, director) by id
router.get("/specific/:id", (req, res) => {
  const movieID = req.params.id;
  console.log("movieId is", movieID);
  if (req.params.hasOwnProperty("id")) {
    const sql = `select * from movies where id=${movieID};`;
    db.query(sql, (error, movie, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      // console.log("format", movie);
      // poster formatting
      if (movie.length > 0 && movie[0].hasOwnProperty("poster")) {
        movie[0].poster = movie[0].poster.toString("utf8");
        return res.status(200).json({ success: true, movie: movie[0] });
      }
      //  else {
      //   db.query(
      //     "select * from movies where id=?",
      //     movieID,
      //     (err, noreviewset) => {
      //       if (err) {
      //         return res
      //           .status(500)
      //           .json({ success: false, error: err.message });
      //       }
      //       if (noreviewset.length > 0) {
      //         noreviewset[0].poster = noreviewset[0].poster.toString("utf8");
      //         return res
      //           .status(200)
      //           .json({ success: true, movie: noreviewset[0] });
      //       } else {
      //         return res
      //           .status(500)
      //           .json({ success: false, error: "movie does not exists." });
      //       }
      //     }
      //   );
      // }
      // movie[0].poster = movie[0].poster.toString("utf8");
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});

// movie casts by id
router.get("/casts/:id", (req, res) => {
  const movieID = req.params.id;
  console.log("movieId is", movieID);
  if (req.params.hasOwnProperty("id")) {
    const sql = `select M.title, A.Actors from movies M inner join actors A on M.id=A.MID where M.id=${movieID};`;
    db.query(sql, (error, casts, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("format", casts);
      // poster formatting
      if (casts.length > 0) {
        let castsArray = [];
        casts.map((cast) => {
          castsArray.push(cast.Actors);
        });
        return res.status(200).json({ success: true, casts: castsArray });
      }
      return res.status(500).json({
        success: false,
        error: "Movie does not exist in our database.",
      });
      // movie[0].poster = movie[0].poster.toString("utf8");
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});

// movie director by id
router.get("/directors/:id", (req, res) => {
  const movieID = req.params.id;
  console.log("movieId is", movieID);
  if (req.params.hasOwnProperty("id")) {
    const sql = `select M.title, D.Directors from directors D inner join movies M on M.id=D.MID where M.id=${movieID};`;
    db.query(sql, (error, directors, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("format", directors);
      // poster formatting
      if (directors.length > 0) {
        let directorsArr = [];
        directors.map((elm) => {
          directorsArr.push(elm.Directors);
        });
        return res.status(200).json({ success: true, directors: directorsArr });
      }
      return res.status(500).json({
        success: false,
        error: "Movie does not exist in our database.",
      });
      // movie[0].poster = movie[0].poster.toString("utf8");
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});

// movie comments of user by id
router.get("/comments/:id", (req, res) => {
  const movieID = req.params.id;
  const username = req.body.user;
  console.log("movieId is", movieID);
  if (req.params.hasOwnProperty("id")) {
    const sql = `SELECT R.RID,M.id, U.UID, U.lname, M.title, M.release_date, R.comment FROM movies M INNER JOIN review R ON R.MID = M.id INNER JOIN user U ON U.UID = R.UID where M.id=${movieID}`;
    db.query(sql, (error, results, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("format", results);
      if (results.length > 0) {
        return res.status(200).json({ success: true, comments: results });
      }
      return res
        .status(404)
        .json({ success: false, error: "Yet to receive a comment." });
      // movie[0].poster = movie[0].poster.toString("utf8");
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});

// movie ratings by id
router.get("/rating/:id", (req, res) => {
  const id = req.params.id;
  console.log("Movie ID is", id);

  if (req.params.hasOwnProperty("id")) {
    const sql = `select M.title, avg(R.rating) as rating from movies M inner join rating R on M.id=R.MID where M.id=${id};`;

    db.query(sql, (error, movies, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("format", movies);
      // poster formatting
      if (movies.length > 0) {
        return res
          .status(200)
          .json({ success: true, rating: Math.floor(movies[0].rating) });
      }
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});
// genres of a movie by id
router.get("/genres/:id", (req, res) => {
  const movieID = req.params.id;
  console.log("movieId is", movieID);
  if (req.params.hasOwnProperty("id")) {
    const sql = `select M.title,G.Genre from genre G inner join movies M on M.id=G.MID where M.id=${movieID};`;
    db.query(sql, (error, genres, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("format", genres);
      // poster formatting
      if (genres.length > 0) {
        let genreArr = [];
        genres.map((el) => {
          genreArr.push(el.Genre);
        });
        return res.status(200).json({ success: true, genres: genreArr });
      }
      return res.status(500).json({
        success: false,
        error: "Movie does not exist in our database.",
      });
      // movie[0].poster = movie[0].poster.toString("utf8");
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});

// show all available genre
router.get("/genres", (req, res) => {
  const sql = "select distinct Genre from genre order by Genre";
  db.query(sql, (error, genres, fields) => {
    if (error) {
      return res.status(500).json({ success: false, error: "server error" });
    }

    return res.status(200).json({ success: true, genres: genres });
  });
});

// sort by genre
router.get("/sort", (req, res) => {
  const requestedSort = req.query.sortby;
  // const page = req.query.page;
  // const size = req.query.size;

  // const offset = (page - 1) * size;
  // const limit = size;
  // ASC LIMIT ${limit} OFFSET ${offset};
  const sql = `SELECT M.title, M.poster,M.release_date, M.id, M.synopsis FROM movies M INNER JOIN genre G ON M.id = G.MID WHERE G.Genre=? ORDER BY G.Genre; `;
  db.query(sql, [requestedSort], (error, sortByGenres, fields) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, error: "server error" + error });
    }
    sortByGenres.forEach((element) => {
      element.poster = element.poster.toString("utf8");
    });

    return res.status(200).json({ success: true, movies: sortByGenres });
  });
});

module.exports = { router };
