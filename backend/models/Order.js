const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Restaurant = require("./Restaurant");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  restaurantId: { type: DataTypes.INTEGER, allowNull: false },
  customerName: { type: DataTypes.STRING },
  tableNumber: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  items: { type: DataTypes.JSON, allowNull: false },
}, { timestamps: true });

Order.belongsTo(Restaurant, { foreignKey: "restaurantId" });
Restaurant.hasMany(Order, { foreignKey: "restaurantId" });

module.exports = Order;
