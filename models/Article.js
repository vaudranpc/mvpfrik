// models/Article.js
const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  contenu: {
    type: String,
    required: true,
  },
  pays: {
    type: String,
    required: true,
    trim: true,
  },

  // ⚠️ TTL : l'article sera automatiquement supprimé
  // 10 jours après cette date "jour"
  jour: {
    type: Date,
    required: true,
    expires: 60 * 60 * 24 * 10, // 10 jours après "jour"
  },

  imageBase64: {
    type: String, // data:image/...;base64,...
  },

  // juste pour info / tri, sans TTL
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose va créer un index TTL sur "jour"
module.exports = mongoose.model("Article", ArticleSchema);
