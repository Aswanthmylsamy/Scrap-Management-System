const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Sample Route
app.get("/", (req, res) => {
  res.send("Scrap Management Backend Running...");
});

// Scrap Schema
const scrapSchema = new mongoose.Schema({
  materialName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Scrap = mongoose.model("Scrap", scrapSchema);

// Add Scrap
app.post("/add-scrap", async (req, res) => {
  try {
    const newScrap = new Scrap(req.body);
    await newScrap.save();
    res.status(201).json({ message: "Scrap Added Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Scrap
app.get("/get-scrap", async (req, res) => {
  try {
    const scraps = await Scrap.find();
    res.json(scraps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Scrap
app.delete("/delete-scrap/:id", async (req, res) => {
  try {
    await Scrap.findByIdAndDelete(req.params.id);
    res.json({ message: "Scrap Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
