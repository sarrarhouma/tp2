const express = require("express");
const db = require("./database");
const app = express();
const multer = require("multer");

// Configuration de Multer pour stocker les fichiers en mémoire
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
const PORT = 3000;

// Définition des routes

app.get("/", (req, res) => {
  res.json("Registre de personnes! Choisissez le bon routage!");
});

app.get("/personnes", (req, res) => {
  db.all("SELECT * FROM personnes", [], (err, rows) => {
    if (err) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/personnes/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM personnes WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

app.post("/personnes", upload.single("image"), (req, res) => {
  const { nom, adresse } = req.body;
  const image = req.file.buffer;

  db.run(
    `INSERT INTO personnes (nom, adresse, image) VALUES (?, ?, ?)`,
    [nom, adresse, image],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: "success", data: { id: this.lastID } });
    }
  );
});

app.put("/personnes/:id", (req, res) => {
  const id = req.params.id;
  const { nom, adresse } = req.body;
  db.run(
    `UPDATE personnes SET nom = ?, adresse = ? WHERE id = ?`,
    [nom, adresse, id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: "success" });
    }
  );
});

app.delete("/personnes/:id", (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM personnes WHERE id = ?`, id, function (err) {
    if (err) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    res.json({
      message: "success",
    });
  });
});

// Connexion à la base de données SQLite
const sqlite3 = require("sqlite3").verbose();

const dbConnection = new sqlite3.Database(
  "./maBaseDeDonnees.sqlite",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connecté à la base de données SQLite.");
      dbConnection.run(
        `CREATE TABLE IF NOT EXISTS personnes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        adresse TEXT,
        image BLOB
        )`,
        (err) => {
          if (err) {
            console.error(err.message);
          } else {
            // Insertion de données initiales
            const personnes = ["Bob", "Alice", "Charlie"];
            personnes.forEach((nom) => {
              dbConnection.run(`INSERT INTO personnes (nom) VALUES (?)`, [nom]);
            });
          }
        }
      );
    }
  }
);

module.exports = dbConnection;

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
