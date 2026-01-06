const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  titre: String,
  categorie: String,
  message: String,
  datePublication: String,
});

module.exports = mongoose.model("Form", FormSchema);
