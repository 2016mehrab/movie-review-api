const JwtStrategy = require("passport-jwt").Strategy;
const Passport = require("passport");
const jwt = require("jsonwebtoken");
const db = require("../db/db.js").connection;
const secretToken = "ohmystrongsecret";
const jwtFromRequest = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    console.log("getting called");
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const strategy = new JwtStrategy(
  {
    secretOrKey: secretToken,
    algorithms: ["HS256"],
    jwtFromRequest: jwtFromRequest,
  },
  (jwtPayload, done) => {
    // This function is called when the JWT is verified
    // Check if the user exists in the database
    db.query(
      "select * from admin where AID = 1",
      [jwtPayload.id],
      (error, user, fields) => {
        if (error) {
          return done(error);
        }
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      }
    );
  },"jwt-admin"
);

module.exports =function adminAuth(passport) {
  passport.use("jwt-admin", strategy);
};
