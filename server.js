require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const stateRoutes = require("./routes/state");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Copy .env.example to .env and set it.");
  process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", stateRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notepad.html"));
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Wallet Notepad running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
