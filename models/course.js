const { Schema, model } = require("mongoose");

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  numberOfStudents: {
    type: Number,
    default: 0,
  },
  attendenceWasTaken: {
    type: Boolean,
    default: false,
  },
  attendenceWasTaken: {
    type: Boolean,
    default: false,
  },
  departureWasTaken: {
    type: Boolean,
    default: false,
  },
  examStart: {
    type: Date,
  },
  examEnd: {
    type: Date,
  },
});

module.exports = model("Course", courseSchema);
