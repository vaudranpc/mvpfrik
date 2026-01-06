const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const Form = require("./models/Form");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
const uri =
  "mongodb+srv://vaudranxgroup_db_user:jyOqziCKZJJ6oxpY@mvpfoot.87dxzzn.mongodb.net/?appName=mindset";
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Sauvegarder un formulaire
app.post("/api/forms", async (req, res) => {
  try {
    const nouveau = new Form({
      titre: req.body.titre,
      categorie: req.body.categorie,
      message: req.body.message,
      datePublication: req.body.datePublication,
    });

    await nouveau.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Récupérer tous les formulaires
app.get("/api/forms", async (req, res) => {
  try {
    const forms = await Form.find();

    res.json(forms);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Archiver = supprimer
app.delete("/api/forms/:id", async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
