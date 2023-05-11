const express = require("express");
const route = express.Router();

const userControllers = require("../controllers/user");

// Routes Protector
const routeProtect = require("../middlewares/routes-protector");

// Instructor Protector
const instrProtector = require("../middlewares/instr-protector");

// Admin Protector
const isAdminProtect = require("../middlewares/is-admin-protector");

// Student Protector
const isStudentProtect = require("../middlewares/student-protector");

// Express Validtor
const {body} = require("express-validator");

route.get("/", userControllers.getIndex);

route.get("/exams-table/:userId", routeProtect, userControllers.getExamsTable);

route.get("/students-absense/:userId", userControllers.getStudentAbsense);

route.get("/course-absense/:courseId", instrProtector, userControllers.getCourseAbs);

route.get("/take-came-students/:courseId", isAdminProtect, userControllers.getTakeCameStudents);

route.post("/get-all-came/:courseId", isAdminProtect, userControllers.postAllCameStudents);

route.get("/take-went-students/:courseId", isAdminProtect, userControllers.getTakeWentStudents);

route.post("/take-went-students/:courseId", isAdminProtect, userControllers.postTakeWentStudents);

route.get("/fraud-report/:courseId", userControllers.getFraudReport);

route.post("/reporting-student/:studentId", userControllers.postReportingStudent);

route.post("/set-reporting-student/:studentId", 
[
  body("student__report").isLength({min: 10, max: 50})
  .withMessage("يجب أن يكون المحضر بين 10 و 50 كلمة")
]
,userControllers.setReportStudent);

route.get("/see-instructors-reports", isStudentProtect, userControllers.seeInstrReports);

route.post("/delete-reporting-student/:studentId", instrProtector, userControllers.deleteStudentReport);

route.get("/student-res-report/:courseId", isStudentProtect, userControllers.getStudentRes);

route.post("/send-response/:courseId", isStudentProtect, userControllers.postStudentRes);

module.exports = route;