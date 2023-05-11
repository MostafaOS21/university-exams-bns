const Student= require("../models/student");
const Instructor = require("../models/instructor");
const Course = require("../models/course");
const student = require("../models/student");
const { validationResult } = require("express-validator");
const { report } = require("../routes/user");

exports.getIndex = (req, res) => {
  const error = req.flash("error");

  res.render("user/index.ejs", {
    pageTitle: "الصفحة الرئيسية",
    path: "/",
    errorMsg: error ? error[0] : null
  })
}

exports.getExamsTable = (req, res, next) => {

  const userId = req.params.userId;


  Course.find().then(courses => {
    let copyCourses = [];

    courses.map((course) => {
      if(course.numberOfStudents === 0) {
        Student.find({courses: {$in: [course.name]}}).then(result => {
          course.numberOfStudents = result.length;

          course.save();
        });
        
      }

      const examStart = course.examStart.toLocaleString();
      const examEnd = course.examEnd.toLocaleString();

      const start = examStart.replace(/:[0-9][0-9]\s/g, " ").split(', ');
      const end = examEnd.replace(/:[0-9][0-9]\s/g, " ").split(', ');


      let tmpCourse = {
        ...course._doc,
        start,
        end
      };

      copyCourses.push(tmpCourse);
    });


    if(req.session.user__type === "instructor") {

      return Instructor.findById(userId).then(instr => {

        if(!instr) {
          req.flash("error", "عذرا المستخدم غير موجود!");
          return res.redirect("/");
        }

        const secondInstructor = Instructor.findOne(
          {examCommitteeNumber: instr.examCommitteeNumber, isAdmin: !instr.isAdmin}
        ).then(secInstr => {

          const user = [];

          if(instr.isAdmin) {
            user.push(instr);
            user.push(secInstr);
          } else {
            user.push(secInstr);
            user.push(instr);
          }

          return res.render("user/exams-table.ejs", {
            pageTitle: "جدول الامتحانات",
            path: "/exams-table",
            user: [instr, secInstr],
            courses: copyCourses
          })
        })

        
      })

    } else if(req.session.user__type === "student") {
      

      

      return Student.findById(userId).then(student => {
        if(!student) {
          req.flash("error", "عذرا المستخدم غير موجود!");
          return res.redirect("/");
        } 

        return res.render("user/exams-table.ejs", {
          pageTitle: "جدول الامتحانات",
          path: "/exams-table",
          user: student,
          courses: copyCourses
        })
        
      })

    }
  }).catch(() => next("خطأ أثناء معاينة الجدول"))
}

exports.getStudentAbsense = (req, res) => {
  const userId = req.params.userId;
  const mongoose = require("mongoose");

  Instructor.findById(userId).then(instr => {
    if(!instr) {
      req.flash("error", "خطأ أثناء الحصول على البيانات!");
      return res.redirect("/");
    }

    Course.find().then(courses => {
      return res.render("user/students-absense.ejs", {
        pageTitle: "تسجيل الطلاب",
        path: "/students-absense",
        courses
      })
    })

    

  }).catch(err => {
    next("خطأ أثناء الحصول على البيانات!");
  })
}

exports.getCourseAbs = (req, res, next) => {
  const courseId = req.params.courseId;

  Course.findById(courseId).then(course => {

    if(!course) {
      req.flash("error", 'لم يتم العثور على المقرر!');
      return res.redirect("/");
    }

    Instructor.findOne({examCommitteeNumber: req.user.examCommitteeNumber,
      isAdmin: !req.user.isAdmin}).then(instr => {
        

        Student.find(
          {
            examCommitteeNumber: req.user.examCommitteeNumber,
            courses: {$in: [course.name]}
          }
        ).then(students => {
          const url = `${req.protocol}://${req.headers.host}/images/`;

          let totalComers = 0;
          let totalCheating = 0;

          students.map(student => {
            student.courseAttend.map(course => {
              if(course.courseId.toString() === courseId) {
                if(course.attend) {
                  totalComers++;
                }
                if(course.report.text) {
                  totalCheating++;
                  console.log("cheating: ", totalCheating)
                }
              }
            })
          })

          return res.render("user/course-abs.ejs", {
            pageTitle: course.name,
            path: "/students-absense",
            course,
            secInstr: instr,
            students,
            totalComers,
            totalCheating,
            url
          })
        })

    })

    

  })
  .catch((err) => {
    req.flash("error", 'لم يتم العثور على المقرر!');
    return res.redirect("/");
  })
}

exports.getTakeCameStudents = (req, res, next) => {
  const courseId = req.params.courseId;


  Course.findById(courseId).then(course => {
    
    return Instructor.findOne({
      examCommitteeNumber: req.user.examCommitteeNumber,
      isAdmin: !req.user.isAdmin
    }).then(instr => {
      

      return Student.find({
        examCommitteeNumber: req.user.examCommitteeNumber,
        courses: {$in: [course.name]}
      }).then(students => {

        return res.render("user/take-came-or-went-students.ejs", {
          pageTitle: "تسجيل الحضور: " + course.name,
          path: "/students-absense",
          students,
          secInstr: instr,
          course,
          attendence: true
        })
      })

    })
    .catch(err => {
      req.flash("error", "خطأ أثناء المعاينة!");
      return res.redirect("/");
    })

  })
  .catch(err => next("خطأ ما!"))
}

exports.postAllCameStudents = (req, res) => {
  const courseId = req.params.courseId;
  const studentsAttendence = req.body;

  if(Object.keys(studentsAttendence).length === 0) {
    return res.redirect("/course-absense/" + courseId);
  }

  Course.findById(courseId).then(course => {
    if(!course) {
      req.flash("error", "خطأ عند الوصول للكورس");
      return res.redirect("/");
    }

    return Student.find().then(students => {
      return students.map(student => {


        if(studentsAttendence[student._id.toString()]) {
          student.courseAttend.map(course => {
            if(course.courseId.toString() === courseId ) {
              course.attend = true;
            }
          })
        } else {
          student.courseAttend.map(course => {
            if(course.courseId.toString() === courseId ) {
              course.attend = false;
            }
          })
        }
        student.save();
      });

    })

  }).then(() => res.redirect("/course-absense/" + courseId))
  .catch(() => {
    req.flash("error", "خطأ عند الوصول للكورس");
    return res.redirect("/");
  })

}

exports.getTakeWentStudents = (req, res) => {
  const courseId = req.params.courseId;


  Course.findById(courseId).then(course => {
    
    return Instructor.findOne({
      examCommitteeNumber: req.user.examCommitteeNumber,
      isAdmin: !req.user.isAdmin
    }).then(instr => {
      

      return Student.find({
        examCommitteeNumber: req.user.examCommitteeNumber,
        courses: {$in: [course.name]}
      }).then(students => {
        return res.render("user/take-came-or-went-students.ejs", {
          pageTitle: "تسجيل الحضور: " + course.name,
          path: "/students-absense",
          students,
          secInstr: instr,
          course,
          attendence: false
        })
      })

    })
    .catch(err => {
      req.flash("error", "خطأ أثناء المعاينة!");
      return res.redirect("/");
    })

  })
}

exports.postTakeWentStudents = (req, res) => {
  const courseId = req.params.courseId;
  const studentsDepr = req.body;

  if(Object.keys(studentsDepr).length === 0) {
    return res.redirect("/course-absense/" + courseId);
  }

  Course.findById(courseId).then(course => {
    if(!course) {
      req.flash("error", "خطأ عند الوصول للكورس");
      return res.redirect("/");
    }

    return Student.find().then(students => {
      return students.map(student => {


        if(studentsDepr[student._id.toString()]) {
          student.courseAttend.map(course => {
            if(course.courseId.toString() === courseId ) {
              course.depr = true;
            }
          })
        } else {
          student.courseAttend.map(course => {
            if(course.courseId.toString() === courseId ) {
              course.depr = false;
            }
          })
        }
        student.save();
      });

    })

  }).then(() => res.redirect("/course-absense/" + courseId))
  .catch(() => {
    req.flash("error", "خطأ عند الوصول للكورس");
    return res.redirect("/");
  })
}

exports.getFraudReport = (req, res) => {
  const courseId = req.params.courseId;
  const examCommittee = req.user.examCommitteeNumber;

  Course.findById(courseId).then(course => {
    const courseCondition = course.examStart < Date.now() && Date.now() < course.examEnd;

    if(!course) {
      return res.redirect("/");
    }

    if(!courseCondition) {
      req.flash("error", "لا يمكن عمل محضر في غير الموعد!")
      return res.redirect("/");
    }

    Student.find({
      examCommitteeNumber: examCommittee,
      courses: {$in: [course.name]}
    }).then(students => {
      return res.render("user/fraud-report-student.ejs", {
        pageTitle: "عمل محضر " + course.name,
        path: "",
        students,
        course
      })

    })

  });
}

exports.postReportingStudent = (req, res, next) => {
  const courseId = req.body.courseId;
  const studentId = req.params.studentId;

  Course.findById(courseId).then(course => {


    Student.findById(studentId).then(student => {
      if(!student) {
        req.flash("error", 'الطالب الذي تبحث عنه غير موجود!');
        return res.redirect("/");
      }

      return res.render("user/reporting-student.ejs", {
        pageTitle: "عمل محضر: " + student.name,
        path: "",
        student,
        course,
        errorMsg: req.flash("error") ? req.flash("error")[0] : null
      })

    })
    .catch(err => next("خطأ في الحصول على الطالب!"))


  })


}

exports.setReportStudent = (req, res, next) => {
  const studentId = req.params.studentId;
  const courseId = req.body.courseId;
  
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/")
  }

  const report = req.body.student__report


  Student.findById(studentId).then(student => {

    return student.courseAttend.map((course) => {

      if(course.courseId.toString() === courseId.toString()) {
        if(course.report.text) {
          return res.redirect("/course-absense/"+courseId);
        }
        course.report.text = report;
        return student.save();
      }
    })

  }).then(() => res.redirect("/course-absense/"+courseId))
  .catch(err => next("خطأ في النظام!"));

}

exports.deleteStudentReport = (req, res, next) => {
  const courseId = req.body.courseId;
  const studentId = req.params.studentId;
  
  // console.log(studentId, courseId);

  Student.findById(studentId).then(student => {
    return student.courseAttend.map(course => {
      if(course.courseId.toString() === courseId.toString() && course.report.text) {
        course.report.text = null;
        return student.save()
      }
    })
  }).then(() => res.redirect("/fraud-report/"+courseId))
  .catch(err => next("الطالب غير موجود!"));
}

exports.seeInstrReports = (req, res) => {
  Student.findById(req.user._id).populate("courseAttend.courseId").then(student => {
    const allReports = [];
    if(!student) {
      return res.redirect("/");
    }
    student.courseAttend.map(course => {
      if(course.report.text) {
        allReports.push({...course.report, courseName: course.courseId.name, courseId: course.courseId._id});
      }
    })
    return res.render("user/student-see-reports.ejs", {
      pageTitle: "الرد على الشكاوى",
      path: "/see-instructors-reports",
      allReports,
      student
    })
  })
}

exports.getStudentRes = (req, res) => {
  const courseId = req.params.courseId;


  Student.findById(req.user._id).then(student => {
    if(!student) {
      return res.redirect("/");
    }

    student.courseAttend.map(course => {
      if(course.courseId.toString() === courseId) {

        Course.findById(course.courseId).then(specCourse => {
          return res.render("user/student-response.ejs", {
            pageTitle: "رد الطالب: " + specCourse.name,
            path: "/see-instructors-reports",
            report: course.report,
            course: specCourse
          })
        })
      }
    })
  });

}

exports.postStudentRes = (req, res) => {
  const courseId = req.params.courseId;

  Student.findById(req.user._id).then(student => {
    if(!student) {
      return res.redirect("/");
    }

    return student.courseAttend.map(course => {
      if(course.courseId.toString() === courseId) {
        console.log(req.body);
        course.report.studentReport = req.body.student__response;

        return student.save();
      }
    })
  })
  .then(() => res.redirect("/see-instructors-reports"));

  console.log(courseId);
}