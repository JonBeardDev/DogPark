const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const store = new session.MemoryStore();

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");

const usersRouter = require("./users/users.router");
// const dogsRouter = require("./dogs/dogs.router");
// const parksRouter = require("./parks/parks.router");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use("/users", usersRouter);
// app.use("/dogs", dogsRouter);
// app.use("/parks", parksRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
