const express = require("express");
const route = express.Router();

const errorControllers = require("../controllers/error");

route.use(errorControllers.get404);

module.exports = route;