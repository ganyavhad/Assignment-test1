const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobile: Number,
  email: String,
  profilePic: String,
  adhaarPic: []
});
module.exports = mongoose.model("User", schema);
