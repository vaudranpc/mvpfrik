// routes/articlesApi.js
const express = require("express");
const router = express.Router();
const Article = require("../models/Article");

// GET /api/articles - derniers articles
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const articles = await Article.find().sort({ createdAt: -1 }).limit(limit);
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/articles/by-date?jour=YYYY-MM-DD
router.get("/by-date", async (req, res) => {
  try {
    const { jour } = req.query;
    if (!jour) {
      return res
        .status(400)
        .json({ message: "Paramètre jour requis (YYYY-MM-DD)" });
    }

    const dateStart = new Date(jour);
    const dateEnd = new Date(jour);
    dateEnd.setHours(23, 59, 59, 999);

    const articles = await Article.find({
      jour: { $gte: dateStart, $lte: dateEnd },
    }).sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/articles/by-country?pays=Côte d'Ivoire
router.get("/by-country", async (req, res) => {
  try {
    const { pays } = req.query;
    if (!pays) {
      return res.status(400).json({ message: "Paramètre pays requis" });
    }

    const articles = await Article.find({
      pays: { $regex: new RegExp("^" + pays + "$", "i") },
    }).sort({ jour: -1 });

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST /api/articles - créer un article
router.post("/", async (req, res) => {
  try {
    const { titre, contenu, pays, jour, imageBase64 } = req.body;

    if (!titre || !contenu || !pays || !jour) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const article = new Article({
      titre,
      contenu,
      pays,
      jour: new Date(jour),
      imageBase64,
    });

    const saved = await article.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
