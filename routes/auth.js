const express = require("express");
const route = express.Router();

const authControllers = require("../controllers/auth");

// Express validatior
const {body} = require("express-validator");

// Is already authed
const isAlreadyAuthed = require("../middlewares/is-already-auth");

// Routes protector
const routesProtect = require("../middlewares/routes-protector");

route.get("/login", isAlreadyAuthed, authControllers.getLogin);

route.post("/login", 
[
  body("nationalId").isLength({min: 10, max: 10}).withMessage("الرقم القومي يجب أن يحتوي على 10 أرقام!"),
  body("password").custom((value, {req}) => {
    if(!req.body.password) {
      throw new Error("يجب ادخال الرمز السري!");
    }

    return true
  }),
  body("user__type").custom((value, {req}) => {
    if(!req.body.user__type) {
      throw new Error("عذرًا يجب أن يتم الاختيار نوع المسجل!")
    }

    return true;
  })
]
,authControllers.postLogin)

route.get("/logout", routesProtect, authControllers.getLogout);

module.exports = route;