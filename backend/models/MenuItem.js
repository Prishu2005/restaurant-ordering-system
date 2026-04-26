const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Restaurant = require("./Restaurant");

const MenuItem = sequelize.define("MenuItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: "Uncategorized" },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  restaurantId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: false });

MenuItem.belongsTo(Restaurant, { foreignKey: "restaurantId" });
Restaurant.hasMany(MenuItem, { foreignKey: "restaurantId" });

module.exports = MenuItem;
