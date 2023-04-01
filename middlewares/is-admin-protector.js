module.exports = (req, res, next) => {
  if(!res.locals.isAdmin) {
    return res.redirect("/");
  }

  next();
}