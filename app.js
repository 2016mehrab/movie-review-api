const express = require("express");
const app = express();
const movieRouter = require("./routes/movieroutes.js").router;
const db = require("./db/db.js").connection;
const passport = require("passport");
 const JwtStrategy = require("passport-jwt").Strategy;
const jwt = require("jsonwebtoken");
const secretToken = "bullshit";
const adminRouter = require("./routes/adminroutes").adminRouter;
const requestRouter = require("./routes/requestRoutes").requestRouter;
const userRouter = require("./routes/userRoutes").userRouter;
const cors = require("cors");

// Required middlewares
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Application routes
app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/user/requested",requestRouter );
app.use("/movies", movieRouter);


const server = app.listen(3000, () => {
  // Connect to the database
  db.connect(() => {
    console.log("connected to database!");
  });

  // Log the server address and port
  console.log(`API server listening at port 3000`);
});

// Close the database connection when the server shuts down
server.on("close", () => {
  db.end();
});
