const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const { Op } = require("sequelize");

// Get menu items
router.get("/", async (req, res) => {
  const { restaurantId, showAll } = req.query;
  if (!restaurantId) return res.status(400).json({ error: "restaurantId is required" });

  try {
    const where = { restaurantId };
    if (showAll !== "true") {
      where.isAvailable = { [Op.ne]: false };
    }
    const items = await MenuItem.findAll({ where });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// Add menu item
router.post("/", async (req, res) => {
  let { name, description, price, restaurantId } = req.body;
  let { category } = req.body;
  if (!restaurantId) return res.status(400).json({ error: "restaurantId is required" });

  if (category && category.trim() !== "") {
    category = category.trim().toLowerCase().split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  } else {
    category = "Uncategorized";
  }

  try {
    const item = await MenuItem.create({ name, description, price, category, restaurantId });
    res.status(201).json(item);
  } catch (err) {
    console.error("Failed to add menu item:", err);
    res.status(500).json({ error: "Failed to add menu item", detail: err.message });
  }
});

// Delete menu item
router.delete("/:id", async (req, res) => {
  try {
    await MenuItem.destroy({ where: { id: req.params.id } });
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// Toggle availability
router.patch("/:id/availability", async (req, res) => {
  try {
    const { isAvailable } = req.body;
    await MenuItem.update({ isAvailable }, { where: { id: req.params.id } });
    const updated = await MenuItem.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item availability" });
  }
});

module.exports = router;
