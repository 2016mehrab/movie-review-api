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
    db.query(
      "select * from user where UID = ?",
      [jwtPayload.id],
      (error, user, fields) => {
        if (error) {
          return done(error);
        }
        if (!user) {
          return done(null, false);
        }
        console.log("what is this", jwtPayload)
        return done(null, user);
      }
    );
  },"jwt"
);

module.exports = function userAuth(passport)  {
  passport.use(strategy);
};
