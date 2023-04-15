const express = require("express");
const requestRouter = express.Router();
const controller = require("../controllers/adminController.js");
const db = require("../db/db.js").connection;
const passport = require("passport");
const userAuth= require("../configuration/passport");


userAuth(passport);

const protectUserRoutes = (req, res, next) => {
  passport.authenticate(["jwt"], { session: false })(
    req,
    res,
    next
  );
};

// requestRouter.get("/", protectUserRoutes ,(req, res) => {
//   const sql = "select RID, R.title, R.year from request R inner join user U on R.AID=U.AID where R.UID=1;";
//   db.query(sql, (error, requestedMoives, fields) => {
//     if (error) {
//       return res.status(500).json({ error: "Could not fetch data" });
//     }
//     return res.status(200).json(requestedMoives);
//   });
// });

// requesting a movie
requestRouter.post("/", protectUserRoutes ,(req, res) => {
    // const sql = "select RID, R.title, R.year from request R inner join user U on R.AID=U.AID where R.UID=1;";
    // db.query(sql, (error, requestedMoives, fields) => {
    //   if (error) {
    //     return res.status(500).json({ error: "Could not fetch data" });
    //   }
    //   return res.status(200).json(requestedMoives);
    // });
    const sql = "SELECT COUNT(*) as count FROM request ;";
    const { title, year } = req.body;
    // console.log("title and year", title, year)
    const  UID=req.user[0].UID;
    console.log("UID is", UID);
  db.query(sql, (error, results, fields) => {
    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ succcess: false, error: "Could not register user." });
    } else  {
      let lastId= results[0].count+1;
      console.log("last RID is", lastId);
      db.query(
        "insert into request values(?, ?, ?, 1,?);", [lastId, title, year,UID],
        (err, resultsID) => {
          if (err) {
            return res
              .status(500)
              .json({ succcess: false, error: "problem while inserting." });
          }
       
          return res.status(201).json({succcess:true, message:"Request for the movie has been sent."});
        }
      );
    } 
  });

});

  // adminRouter.post("/movies", (req, res) => {

//     const {id, title, release_date, poster, synopsis}= req.body;
//   const sql =
//     "insert into movies (31,"somet" , "2022-12-01", 1, "sefesga","good") select movies.id, movies.title, movies.release_date,movies.AID, movies.poster, movies.synopsis ";
//   db.query(sql, [req.params.id], (error, users, fields) => {
//     if (error) {
//       res.status(500).json({ error: "Could not retrieve data." });
//     }
//     return res.status(200).json(users);
//   });
// });

//Get user details -checked
// adminRouter.get("/users/:id", (req, res) => {
//   const sql =
//     "select UID,u.fname, u.lname, u.email from user u inner join admin a on u.AID=a.AID;";
//   db.query(sql, [req.params.id], (error, users, fields) => {
//     if (error) {
//       res.status(500).json({ error: "Could not retrieve data." });
//     }
//     return res.status(200).json(users);
//   });
// });

//Delete a user
// adminRouter.delete("users/:id", (req, res) => {
//   const sql =
//     "delete u from user u inner join admin a on u.AID=a.AID where UID=?";
//   db.query(sql, [req.params.id], (error, adminInfo, fields) => {
//     if (error) {
//       res.status(500).json({ error: "Could not delete user." });
//     }
//     return res
//       .status(200)
//       .json({
//         message: "user with id " + req.params.id + " has been deleted.",
//       });
//   });
// });

module.exports = { requestRouter };