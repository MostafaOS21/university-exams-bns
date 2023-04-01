const { Schema, model } = require("mongoose");

const instructorSchema = new Schema({
  name: String,
  isAdmin: Boolean,
  examCommitteeNumber: Number,
  nationalID: {
    type: String,
    unique: true
  },
  password: String
});


module.exports = model("instructor", instructorSchema);