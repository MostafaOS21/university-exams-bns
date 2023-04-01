module.exports = (req, res,next) => {
  if(!res.locals.isInstr) {
    return res.redirect("/");
  }

  next();
}