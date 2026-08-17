const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    day: { type: String, default: "" },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    enum: ["income", "poly", "monthly"]
  },
  budget: { type: Number, default: 0 },
  items: { type: [itemSchema], default: [] }
});

module.exports = mongoose.model("Section", sectionSchema);
