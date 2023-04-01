// Get DBs
const { validationResult } = require("express-validator");
const Instructor = require("../models/instructor");
const Student = require("../models/student");


exports.getLogin = (req, res) => {
  res.render("auth/login.ejs", {
    pageTitle: "تسجيل الدخول",
    path: "/login",
    errorMsg: null
  })
}

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);


  if(!errors.isEmpty()) {
    return res.render("auth/login.ejs", {
      pageTitle: "تسجيل الدخول",
      path: "/login",
      errorMsg: errors.array()[0].msg
    });
  }

  const user__type = req.body.user__type;
  const nationalID = req.body.nationalId;
  const password = req.body.password;


  if(user__type === 'instructor') {
    return Instructor.findOne({nationalID}).then(instr => {
      if(!instr) {
        return res.render("auth/login.ejs", {
          pageTitle: "تسجيل الدخول",
          path: "/login",
          errorMsg: "المستخدم غير موجود!"
        });
      } else {
        req.session.user = instr;
        req.session.user__type = 'instructor';
        req.session.isLoggedIn = true;
        req.session.save();
        
      }
    }).then(() => res.redirect("/"))
    .catch(err => next("خطأ أثناء تسجيل الدخول!"))
  } else if(user__type === 'student') {
    return Student.findOne({nationalID}).then(student => {
      req.session.user = student;
      req.session.user__type = 'student';
      req.session.isLoggedIn = true;
      return req.session.save();
    })
    .then(() => res.redirect("/"))
    .catch(err => next("خطأ أثناء تسجيل الدخول!"))
  }

  console.log(user__type, nationalID, password);
}

exports.getLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
}