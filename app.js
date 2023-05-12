const express = require("express");
const app = express();
const {join} = require("path");

const MONGO_URI = process.env.MONGO_URI;

// body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// set view engine => ejs
app.set("view engine", "ejs");

// Serving images
app.use("/images",express.static(join(__dirname, "images")));

// use public static folder
app.use(express.static(join(__dirname, "views", "public")));

// Cookie Parser
const cookieParser = require("cookie-parser")
app.use(cookieParser());

// express sessions
const session = require("express-session");
const mongodbSessionStore = require("connect-mongodb-session")(session);

const store = new mongodbSessionStore({uri: MONGO_URI});

app.use(session({
  saveUninitialized: false,
  secret: "my-session-secret",
  resave: false,
  store
}));

// Flash Messages
const flash = require("express-flash");

app.use(flash());


// Auth Middleware
app.use((req, res, next) => {
  if(req.session.user) {
    req.user = req.session.user;
    res.locals.isAuthed = true;
    res.locals.user = req.user;

    res.locals.userId = req.user._id.toString();

    if(req.session.user__type === 'instructor') {
      res.locals.isInstr = true;
      req.isIntr = true;

      if(req.session.user.isAdmin) {
        res.locals.isAdmin = true;
      } else {
        res.locals.isAdmin = false;
      }
    } else {
      res.locals.isInstr = false;
    }
  } else {
    res.locals.isAuthed = false;
  }

  next();
})


// Handle Routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const errorHandler = require("./routes/error");


app.use(authRoute);
app.use(userRoute);
app.use(errorHandler);


// Mongoose connect
const {connect} = require("mongoose");

connect(MONGO_URI).then(() => {
  app.listen(3000);
})
.catch(err => {
  console.log(err);
})
