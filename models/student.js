const { Schema, model } = require("mongoose");

const studentSchema = new Schema({
  name: String,
  examCommitteeNumber: Number,
  imageUrl: String,
  nationalID: {
    type: String,
    unique: true,
  },
  password: String,
  sittingArea: String,
  studentId: String,
  courses: {
    type: [String],
  },
  grade: {
    type: Number,
    enum: [1, 2, 3, 4],
  },
  courseAttend: {
    type: [{
      courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course"
      },
      attend: {
        type: Boolean,
        default: false,
      },
      depr: {
        type: Boolean,
        default: false
      },
      report: {
        text: {
          type: String,
          default: null
        },
        studentReport: {
          type: String,
          default: null
        }
      }
    }]
  }
});

module.exports = model("Student", studentSchema);
