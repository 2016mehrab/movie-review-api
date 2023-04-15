const express = require("express");
const userRouter = express.Router();
// const controller = require("../controllers/adminController.js");
const db = require("../db/db.js").connection;
const jwt = require("jsonwebtoken");
const userAuth= require("../configuration/passport");


const bcrypt = require("bcrypt");
const saltRounds = 10;
const secretToken = "ohmystrongsecret";
const passport = require("passport");
const options = {
  algorithm: "HS256",
  expiresIn: "1d",
};


userAuth(passport);
// adminAuth(passport);
const protectUserRoutes = (req, res, next) => {
  passport.authenticate(["jwt"], { session: false })(
    req,
    res,
    next
  );
};
// New user registration
userRouter.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;

  // If user with same email exists
  const sql = "SELECT COUNT(*) as count FROM user WHERE email = ?";
  db.query(sql, [email], (error, results, fields) => {
    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ succcess: false, error: "Could not register user." });
    } else if (results[0].count === 0) {
      let lastId;
      db.query(
        "SELECT UID FROM user ORDER BY UID DESC LIMIT 1;",
        (err, resultsID) => {
          if (err) {
            return res
              .status(500)
              .json({ succcess: false, error: "problem while fetching ID." });
          }
          lastId = resultsID[0].UID;
          console.log(lastId);
          userID = lastId + 1;
          const hash = bcrypt.hashSync(password, saltRounds);
          db.query(
            "insert into user values(?,?,?,?,?,1);",
            [userID, fname, lname, email, hash],
            (err, user) => {
              if (err) {
                return res.status(500).json({ succcess: false, error: err });
              }
              const payload = {
                id: userID,
                email: email,
              };
              const token = jwt.sign(payload, secretToken, options);
              return res.status(200).json({
                succcess: true,
                token: "Bearer " + token,
                name: lname,
                UID: userID,
              });
            }
          );
        }
      );
    } else {
      console.log(results);
      res
        .status(403)
        .json({ succcess: false, error: "Maybe use a different email." });
    }
  });
});

// user login
userRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Login route visited");
  db.query("SELECT * FROM user WHERE email = ?;", email, (error, user) => {
    if (error) return res.status(500).json({ error: "Couldnot fetch user." });
    console.log(user);
    if (user.length > 0) {
      console.log(`User with email ${email} has logged in.`);
      const hash = bcrypt.hashSync(password, saltRounds);
      if (!bcrypt.compareSync(password, user[0].password)) {
        return res
          .status(400)
          .json({ succcess: false, error: "Incorrect email or password." });
      }
      const payload = {
        id: user[0].UID,
        email: email,
      };
      const token = jwt.sign(payload, secretToken, options);
      return res.status(200).json({
        succcess: true,
        token: "Bearer " + token,
        name: user[0].lname,
        UID: user[0].UID,
      });
    } else {
      return res
        .status(404)
        .json({ succcess: false, error: "Incorrect email or password." });
    }
  });
});

// user password reset - HAS MAJOR SECURITY ISSUES
userRouter.patch("/forgot-password", (req, res) => {
  const { email, newPassword } = req.body;
  if (email && newPassword) {
    db.query("SELECT * FROM user WHERE email = ?;", email, (error, user) => {
      if (error)
        return res
          .status(500)
          .json({ succcess: false, error: "Couldnot fetch user." });
      else if (user.length > 0) {
        console.log(`User with email ${email} is trying to reset password.`);
        const hash = bcrypt.hashSync(newPassword, saltRounds);
        db.query(
          "update user set password=? where UID=?;",
          [hash, user[0].UID],
          (err, results) => {
            if (err) {
              return res
                .status(500)
                .json({ succcess: false, error: "Could not change password." });
            }
            return res
              .status(200)
              .json({ succcess: true, message: "Password has been reset." });
          }
        );
      } else {
        return res.status(403).json({ succcess: false, error: "Try again." });
      }
    });
  } else {
    return res
      .status(400)
      .json({ succcess: false, error: "Provide email and newPassword" });
  }
});

// find a username by UID
userRouter.get("/names/:id", (req, res) => {
  const UID = req.params.id;
  console.log("UID is", UID);
  if (req.params.hasOwnProperty("id")) {
    const sql = `select lname from user where UID=${UID};`;
    db.query(sql, (error, names, fields) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log("format", names);
      // poster formatting
      if (names.length > 0) {
        return res.status(200).json({ success: true, lname: names[0].lname });
      }
    });
  } else {
    return res
      .status(400)
      .json({ success: false, error: "Provide movie ID. " + error.message });
    // console.log(element.poster);
  }
});

/* protected routes */

// user profile
userRouter.get(
  "/profile",
  protectUserRoutes,
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      succcess: true,
      message: "You are in secret area",
      user: req.user[0],
    });
  }
);

let i = 0;

// user wishlist
userRouter.get(
  "/profile/wishlist",
  protectUserRoutes,
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    i++;
    const sql =
      "select M.title, M.id, M.release_date, M.synopsis, M.poster, M.AID from movies M inner join wishlist W on M.id=W.MID where W.UID=?;";
    console.log("User requested " + i + ". This is user" + req.user[0]);
    db.query(sql, req.user[0].UID, (error, movieList) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ succcess: false, error: "Could not fetch movie list." });
      }
      movieList.forEach((element) => {
        element.poster = element.poster.toString("utf8");
      });
      // console.log("movie list is ", movieList);

      return res.status(200).json({ succcess: true, movieList: movieList });
    });
  }
);

// Adding a movie to wishlist
userRouter.post(
  "/profile/wishlist/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const sql = "insert into wishlist values(?,?);";
    db.query(sql, [req.user[0].UID, req.params.id], (error, movieList) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          succcess: false,
          error: "Could not add movie to the wishlist",
        });
      }
      return res.status(201).json({
        succcess: true,

        message: "Movie has been successfully added to the list",
      });
    });
  }
);

// rating
userRouter.post(
  "/rating/:id",

  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const rating = req.body.rating;
    // console.log(rating + " is rating")
    db.query(
      "SELECT * FROM rating WHERE UID = ? and MID=?",
      [req.user[0].UID, req.params.id],
      (error, results) => {
        if (error) {
          console.error(error);
          return;
        }

        if (results.length > 0) {
          // A record with the specified UID was found
          const sql = "update rating set rating=? where UID=? and MID=?;";

          db.query(
            sql,
            [rating, req.user[0].UID, req.params.id],
            (error, results) => {
              if (error) {
                console.error(error);
                return res.status(500).json({
                  succcess: false,
                  error: "Could not update rating.",
                });
              }
              return res.status(201).json({
                succcess: true,
                message: "Rating updated.",
              });
            }
          );
        } else {
          // No record was found
          const sql = "insert into rating values(?,?,?);";
          db.query(
            sql,
            [req.user[0].UID, req.params.id, rating],
            (error, movieList) => {
              if (error) {
                console.error(error);
                return res.status(500).json({
                  succcess: false,
                  error: "Could not rate.",
                });
              }
              return res.status(201).json({
                succcess: true,
                message: "Movie has been rated.",
              });
            }
          );
        }
      }
    );
  }
);

// adding comment
userRouter.post(
  "/comment/:id",
  protectUserRoutes,
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const comment = req.body.comment;
    const sql = "insert into review (UID, MID, comment) values(?,?,?);";
    db.query(
      sql,
      [req.user[0].UID, req.params.id, comment],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            succcess: false,
            error: "Something went wrong",
          });
        }
        return res.status(201).json({
          succcess: true,
          message: "Commenting successful.",
        });
      }
    );
  }
);

// removing a comment
userRouter.post(
  "/comment/delete/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const commentID = req.body.RID;
    const sql = "delete from review where RID=?;";
    db.query(sql, [commentID], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          succcess: false,
          error: "Something went wrong",
        });
      }
      return res.status(201).json({
        succcess: true,
        message: "Comment deleted.",
      });
    });
  }
);

// Removing a movie from wishlist
userRouter.delete(
  "/profile/wishlist/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const sql = "delete from wishlist where UID=? and MID=?;";
    db.query(sql, [req.user[0].UID, req.params.id], (error, movieList) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          succcess: false,
          error: "Could not remove movie from the wishlist",
        });
      }
      return res.status(200).json({
        succcess: true,
        message: "Movie has been removed from the list",
      });
    });
  }
);

// Requesting for adding a movie to the database
userRouter.post(
  "/profile/request",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { title, year } = req.body;
    const sql = "insert into request values(?, ?, ?, 1, ?);";
    let lastId;
    db.query(
      "select RID from request order by RID desc limit 1;",
      (err, resultsID) => {
        if (err) {
          return res
            .status(500)
            .json({ succcess: false, error: "problem while fetching RID." });
        }
        lastId = resultsID[0].RID;
        insertID = lastId + 1;
        db.query(
          sql,
          [insertID, title, year, req.user[0].UID],
          (error, movieList) => {
            if (error) {
              console.error(error);
              return res.status(500).json({
                succcess: false,
                error: "Could not deliver the request.",
              });
            }
            return res.status(201).json({
              succcess: true,
              message: "Your request has been delivered.",
            });
          }
        );
      }
    );
  }
);

module.exports = { userRouter };
