exports.get404 = (req, res) => {
  res.render("errors/404.ejs", {
    pageTitle: "Page not found",
    path: ''
  })
}