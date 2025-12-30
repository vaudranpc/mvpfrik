// server.js
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Routes API
const articlesApi = require("./routes/articlesApi");
app.use("/api/articles", articlesApi);

// Catch-all pour le front
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 mvpfrik lancé sur http://localhost:${PORT}`);
});
