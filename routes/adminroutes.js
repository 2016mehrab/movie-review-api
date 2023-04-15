const express = require("express");
const adminRouter = express.Router();
const controller = require("../controllers/adminController.js");
const db = require("../db/db.js").connection;
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminAuth = require("../configuration/adminAuth");
const saltRounds = 10;
const secretToken = "ohmystrongsecret";
const options = {
  algorithm: "HS256",
  expiresIn: "1h",
};
adminAuth(passport);
const protectAdminRoutes = (req, res, next) => {
  passport.authenticate(["jwt-admin"], { session: false })(req, res, next);
};

// admin login
adminRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM admin WHERE email = ?;", email, (error, user) => {
    if (error)
      return res
        .status(500)
        .json({ succcess: false, error: "Couldnot fetch user." });
    if (user.length > 0) {
      console.log(`Admin with email ${email} has logged in.`);
      if (!bcrypt.compareSync(password, user[0].password)) {
        return res
          .status(400)
          .json({ succcess: false, error: "Incorrect email or password." });
      }
      const payload = {
        id: user[0].AID,
        email: email,
      };
      const token = jwt.sign(payload, secretToken, options);
      return res.status(200).json({
        succcess: true,
        token: "Bearer " + token,
        AID: user[0].AID,
        id: user[0].AID,
      });
    } else {
      return res.status(404).json({ succcess: false, error: "user not found" });
    }
  });
});

// admin password reset
adminRouter.post("/forgot-password", (req, res) => {
  const { email, newPassword } = req.body;
  console.log("body", email, newPassword);
  db.query("SELECT * FROM admin WHERE email = ?;", email, (error, user) => {
    if (error)
      return res
        .status(500)
        .json({ succcess: false, error: "Couldnot fetch user." });
    else if (user.length > 0) {
      console.log(`Admin with email ${email} exists.`);
      const hash = bcrypt.hashSync(newPassword, saltRounds);
      db.query(
        "update admin set password=? where AID=?;",
        [hash, user[0].AID],
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
});

// admin details
adminRouter.get(
  "/profile",
  protectAdminRoutes,
  // passport.authenticate("jwt-admin", { session: false }),
  (req, res) => {
    const sql = "select * from admin where AID=?";
    console.log("req.user[0]", req.user[0]);
    db.query(sql, req.user[0].AID, (error, adminInfo, fields) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, error: "Could not fetch data" });
      }
      return res.status(200).json({ success: true, admin: adminInfo });
    });
  }
);

// requested movies
adminRouter.get(
  "/requests",
  passport.authenticate("jwt-admin", { session: false }),
  (req, res) => {
    const sql =
      "select RID, R.title, R.year, U.lname as username  from request R inner join user U on R.UID=U.UID;";
    db.query(sql, (error, requestedMoives, fields) => {
      if (error) {
        return res.status(500).json({ error: "Could not fetch data" });
      }
      return res.status(200).json(requestedMoives);
    });
  }
);

adminRouter.post("/movies",protectAdminRoutes, (req, res) => {

    const {id, title, release_date, poster, synopsis}= req.body;
  const sql =
    "insert into movies values(?,? , ?, ?, ?,?);";
  db.query(sql, [id,title, release_date, 1, poster, synopsis], (error, users, fields) => {
    if (error) {
      res.status(500).json({ error: "Could not insert movie" });
    }
    return res.status(200).json({succcess:true, message:"Movie inserted to the database."});
  });
});

//Get user details -checked
adminRouter.get(
  "/users",
  protectAdminRoutes,
  // passport.authenticate("jwt-admin", { session: false }),
  (req, res) => {
    const sql =
      "select u.UID,u.fname, u.lname, u.email from user u inner join admin a on u.AID=a.AID;";
    db.query(sql, [req.params.id], (error, users, fields) => {
      if (error) {
        res.status(500).json({ error: "Could not retrieve data." });
      }
      return res.status(200).json(users);
    });
  }
);


adminRouter.delete(
  "/users/:id",
  protectAdminRoutes,
  // passport.authenticate("jwt-admin", { session: false }),
  (req, res) => {
    const sql =
      "delete u from user u inner join admin a on u.AID=a.AID where UID=?";
    db.query(sql, [req.params.id], (error, adminInfo, fields) => {
      if (error) {
        res.status(500).json({ error: "Could not delete user." });
      }
      return res.status(200).json({
        message: "user with id " + req.params.id + " has been deleted.",
      });
    });
  }
);

module.exports = { adminRouter };
