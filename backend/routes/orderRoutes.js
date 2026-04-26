const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { Op } = require("sequelize");

// Helper: calculate and emit today's stats
const getAndEmitStats = async (io, restaurantId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.findAll({
      where: { restaurantId, createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });

    let totalSales = 0;
    orders.forEach(order => {
      order.items.forEach(item => { totalSales += item.price * item.quantity; });
    });
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    io.emit("stats_updated", { totalSales, totalOrders, averageOrderValue });
  } catch (error) {
    console.error("Error calculating stats:", error);
  }
};

// Create order
router.post("/", async (req, res) => {
  try {
    const { restaurantId, items, customerName, tableNumber } = req.body;
    const newOrder = await Order.create({ restaurantId, items, customerName, tableNumber });

    const connectedClientCount = req.io.engine.clientsCount;
    console.log(`--- DIAGNOSTIC: Emitting new_order. ${connectedClientCount} clients connected. ---`);

    req.io.emit("new_order", newOrder);
    getAndEmitStats(req.io, restaurantId);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// Get today's stats -- MUST be before /:restaurantId
router.get("/stats/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.findAll({
      where: { restaurantId, createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });

    let totalSales = 0;
    orders.forEach(order => {
      order.items.forEach(item => { totalSales += item.price * item.quantity; });
    });
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    res.json({ totalSales, totalOrders, averageOrderValue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
});

// Get orders for a restaurant
router.get("/:restaurantId", async (req, res) => {
  try {
    const where = { restaurantId: req.params.restaurantId };
    if (req.query.view === "active") {
      where.status = { [Op.ne]: "served" };
    }
    const orders = await Order.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

// Update order status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await Order.update({ status }, { where: { id: req.params.id } });
    const updatedOrder = await Order.findByPk(req.params.id);
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    req.io.emit("order_status_updated", updatedOrder);
    if (updatedOrder.tableNumber) {
      req.io.to(`table_${updatedOrder.tableNumber}`).emit("order_status_updated", updatedOrder);
    }
    getAndEmitStats(req.io, updatedOrder.restaurantId);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
});

module.exports = router;
