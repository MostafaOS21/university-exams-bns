module.exports = (req, res,next) => {
  if(res.locals.isInstr || !req.user) {
    return res.redirect("/");
  }

  next();
}